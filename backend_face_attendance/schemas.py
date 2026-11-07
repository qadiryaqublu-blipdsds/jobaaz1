from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class BiometricConsentCreate(BaseModel):
    consent_version: str = "v2.1-AR-2025"
    purpose: str
    legal_text: str
    signature_data_url: str
    ip_address: str

class FaceEnrollmentInput(BaseModel):
    angle: str  # front, left, right
    embedding_vector: List[float]
    quality_score: float
    is_eyes_open: bool = True
    lighting_score: float
    blurriness_score: float

class EmployeeEnrollmentRequest(BaseModel):
    company_id: str
    work_site_id: str
    first_name: str
    last_name: str
    patronymic: Optional[str] = None
    pin_code: str = Field(..., min_length=7, max_length=7)
    phone: str
    email: Optional[str] = None
    department: str
    position: str
    avatar_url: Optional[str] = None
    enrollments: List[FaceEnrollmentInput]
    consent: BiometricConsentCreate

class EmployeeResponse(BaseModel):
    id: str
    company_id: str
    work_site_id: str
    first_name: str
    last_name: str
    patronymic: Optional[str] = None
    pin_code: str
    phone: str
    email: Optional[str] = None
    department: str
    position: str
    avatar_url: Optional[str] = None
    is_enrolled: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class AttendanceVerifyRequest(BaseModel):
    work_site_id: str
    scanned_vector: List[float]
    event_type: str = "CHECK_IN"  # CHECK_IN or CHECK_OUT
    device_timestamp: datetime
    gps_latitude: float
    gps_longitude: float
    gps_accuracy_meters: float
    is_mock_detected: bool = False
    mock_reason: Optional[str] = None
    liveness_challenge: str = "BLINK_EYES"
    liveness_action_completed: bool = True
    liveness_response_seconds: float = 2.5
    recorded_by_user_id: str
    recorded_by_role: str = "supervisor"
    device_fingerprint: str
    device_model: str
    supervisor_comment: Optional[str] = None
    audit_thumbnail_url: Optional[str] = None

class AttendanceRecordResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    employee_department: str
    work_site_id: str
    work_site_name: str
    event_type: str
    server_timestamp: datetime
    device_timestamp: datetime
    similarity_score: float
    liveness_score: float
    is_within_geofence: bool
    distance_to_site_meters: int
    is_suspicious: bool
    suspicion_reasons: Optional[str] = None
    supervisor_comment: Optional[str] = None

    class Config:
        from_attributes = True

class AttendanceCorrectionRequest(BaseModel):
    attendance_record_id: str
    corrected_event_type: str
    reason: str
    corrected_by_user_id: str
    corrected_by_name: str

class PurgeBiometricsRequest(BaseModel):
    reason: str
    authorized_admin_id: str
