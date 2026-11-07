from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
import models
import schemas
import security

router = APIRouter(prefix="/api/v1/enrollment", tags=["Biometric Enrollment"])

@router.post("/register", response_model=schemas.EmployeeResponse, status_code=status.HTTP_201_CREATED)
def register_employee_with_biometrics(
    req: schemas.EmployeeEnrollmentRequest,
    db: Session = Depends(get_db)
):
    # 1. Check if employee with same PIN already exists
    existing = db.query(models.Employee).filter(models.Employee.pin_code == req.pin_code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"FİN '{req.pin_code}' ilə qeydiyyatdan keçmiş işçi artıq mövcuddur."
        )

    # 2. Check work site
    site = db.query(models.WorkSite).filter(models.WorkSite.id == req.work_site_id).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="İş obyekti tapılmadı.")

    # 3. Create Employee entity
    employee = models.Employee(
        company_id=req.company_id,
        work_site_id=req.work_site_id,
        first_name=req.first_name,
        last_name=req.last_name,
        patronymic=req.patronymic,
        pin_code=req.pin_code.upper(),
        phone=req.phone,
        email=req.email,
        department=req.department,
        position=req.position,
        avatar_url=req.avatar_url,
        is_enrolled=True,
        status="active"
    )
    db.add(employee)
    db.flush()

    # 4. Save AES-256 encrypted biometric face enrollments
    for enr in req.enrollments:
        enc_payload, iv_hex, tag_hex = security.encrypt_vector_embedding(enr.embedding_vector)
        face_rec = models.FaceEnrollment(
            employee_id=employee.id,
            angle=enr.angle,
            encrypted_vector_payload=enc_payload,
            vector_iv=iv_hex,
            vector_tag=tag_hex,
            quality_score=enr.quality_score,
            is_eyes_open=enr.is_eyes_open,
            lighting_score=enr.lighting_score,
            blurriness_score=enr.blurriness_score,
            enrolled_by="HR Admin"
        )
        db.add(face_rec)

    # 5. Save Biometric Consent form (AR Personal Data Law)
    consent = models.BiometricConsent(
        employee_id=employee.id,
        consent_version=req.consent.consent_version,
        purpose=req.consent.purpose,
        legal_text=req.consent.legal_text,
        signature_data_url=req.consent.signature_data_url,
        ip_address=req.consent.ip_address
    )
    db.add(consent)

    # 6. Immutable Security Audit Log
    audit = models.SecurityAuditLog(
        actor_id="hr-admin-01",
        actor_name="HR Administrator",
        actor_role="hr",
        action="ENROLL_BIOMETRICS_3_ANGLES",
        target_id=employee.id,
        details=f"İşçi {employee.first_name} {employee.last_name} üçün 3 bucaqlı biometrik üz şablonu şifrələnərək qeydə alındı.",
        ip_address=req.consent.ip_address
    )
    db.add(audit)

    db.commit()
    db.refresh(employee)
    return employee

@router.delete("/{employee_id}/biometrics", status_code=status.HTTP_200_OK)
def purge_employee_biometrics(
    employee_id: str,
    req: schemas.PurgeBiometricsRequest,
    db: Session = Depends(get_db)
):
    """
    AR 'Fərdi məlumatlar haqqında' Qanununun tələbi üzrə biometrik məlumatların ləğvi (Right to be forgotten).
    """
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="İşçi tapılmadı.")

    # Delete all encrypted face enrollments
    db.query(models.FaceEnrollment).filter(models.FaceEnrollment.employee_id == employee_id).delete()
    employee.is_enrolled = False

    # Update consent record with revocation notice
    consent = db.query(models.BiometricConsent).filter(models.BiometricConsent.employee_id == employee_id).first()
    if consent:
        consent.legal_text += f" [LƏĞV EDİLDİ - {datetime.utcnow().isoformat()}: {req.reason}]"

    # Write audit log
    audit = models.SecurityAuditLog(
        actor_id=req.authorized_admin_id,
        actor_name="Səlahiyyətli Admin",
        actor_role="admin",
        action="PURGE_BIOMETRICS_GDPR_RIGHT_TO_FORGET",
        target_id=employee_id,
        details=f"Biometrik məlumatların qanuni ləğvi. Səbəb: {req.reason}"
    )
    db.add(audit)

    db.commit()
    return {"message": "İşçinin biometrik üz şablonları tamamilə silindi və arxiv ləğv edildi."}

@router.get("/employees", response_model=List[schemas.EmployeeResponse])
def get_company_employees(
    company_id: str,
    db: Session = Depends(get_db)
):
    employees = db.query(models.Employee).filter(models.Employee.company_id == company_id).all()
    return employees
