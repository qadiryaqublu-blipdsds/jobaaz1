from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import csv
import io

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/v1/admin", tags=["Admin & HR Reporting"])

@router.get("/records", response_model=List[schemas.AttendanceRecordResponse])
def get_attendance_records(
    work_site_id: Optional[str] = None,
    department: Optional[str] = None,
    only_suspicious: bool = False,
    limit: int = Query(50, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(models.AttendanceRecord)
    if work_site_id:
        query = query.filter(models.AttendanceRecord.work_site_id == work_site_id)
    if only_suspicious:
        query = query.filter(models.AttendanceRecord.is_suspicious == True)
    
    records = query.order_by(models.AttendanceRecord.server_timestamp.desc()).limit(limit).all()

    results = []
    for r in records:
        results.append(schemas.AttendanceRecordResponse(
            id=r.id,
            employee_id=r.employee_id,
            employee_name=f"{r.employee.first_name} {r.employee.last_name}" if r.employee else "Naməlum",
            employee_department=r.employee.department if r.employee else "",
            work_site_id=r.work_site_id,
            work_site_name=r.work_site.name if r.work_site else "",
            event_type=r.event_type,
            server_timestamp=r.server_timestamp,
            device_timestamp=r.device_timestamp,
            similarity_score=r.similarity_score,
            liveness_score=r.liveness_score,
            is_within_geofence=r.is_within_geofence,
            distance_to_site_meters=r.distance_to_site_meters,
            is_suspicious=r.is_suspicious,
            suspicion_reasons=r.suspicion_reasons,
            supervisor_comment=r.supervisor_comment
        ))
    return results

@router.post("/corrections", status_code=status.HTTP_201_CREATED)
def submit_manual_correction(
    req: schemas.AttendanceCorrectionRequest,
    db: Session = Depends(get_db)
):
    record = db.query(models.AttendanceRecord).filter(models.AttendanceRecord.id == req.attendance_record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Davamiyyət qeydi tapılmadı.")

    original_type = record.event_type

    # 1. Create correction record
    correction = models.AttendanceCorrection(
        attendance_record_id=record.id,
        employee_id=record.employee_id,
        original_event_type=original_type,
        corrected_event_type=req.corrected_event_type,
        original_time=record.server_timestamp,
        corrected_time=datetime.utcnow(),
        reason=req.reason,
        corrected_by_user_id=req.corrected_by_user_id,
        corrected_by_name=req.corrected_by_name
    )
    db.add(correction)

    # 2. Update actual record
    record.event_type = req.corrected_event_type
    record.supervisor_comment = f"Əl ilə düzəliş ({req.corrected_by_name}): {req.reason}"

    # 3. Add to immutable security audit log
    audit = models.SecurityAuditLog(
        actor_id=req.corrected_by_user_id,
        actor_name=req.corrected_by_name,
        actor_role="hr",
        action="MANUAL_ATTENDANCE_CORRECTION",
        target_id=record.id,
        details=f"Hadisə {original_type} -> {req.corrected_event_type} dəyişdirildi. Səbəb: {req.reason}"
    )
    db.add(audit)

    db.commit()
    return {"message": "Düzəliş qeydə alındı və audit jurnalına yazıldı."}

@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db)
):
    records = db.query(models.AttendanceRecord).order_by(models.AttendanceRecord.server_timestamp.desc()).limit(1000).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Tarix və Saat", "İşçi", "Şöbə", "Hadisə", "İş Obyekti",
        "Oxşarlıq %", "Liveness %", "Geofence Status", "Məsafə (m)", "Şübhəli", "Qeyd"
    ])

    for r in records:
        writer.writerow([
            r.id,
            r.server_timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            f"{r.employee.first_name} {r.employee.last_name}" if r.employee else "",
            r.employee.department if r.employee else "",
            "Giriş" if r.event_type == "CHECK_IN" else "Çıxış",
            r.work_site.name if r.work_site else "",
            f"{int(r.similarity_score * 100)}%",
            f"{int(r.liveness_score * 100)}%",
            "Daxildə" if r.is_within_geofence else "Kənarda",
            r.distance_to_site_meters,
            "BƏLİ" if r.is_suspicious else "Xeyr",
            r.supervisor_comment or ""
        ])

    csv_data = "\ufeff" + output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=Davamiyyet_Tabel_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )
