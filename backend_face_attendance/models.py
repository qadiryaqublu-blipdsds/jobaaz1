import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class WorkSite(Base):
    __tablename__ = "work_sites"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_meters = Column(Integer, default=200, nullable=False)
    timezone = Column(String(50), default="Asia/Baku", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    employees = relationship("Employee", back_populates="work_site")
    attendance_records = relationship("AttendanceRecord", back_populates="work_site")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), nullable=False, index=True)
    work_site_id = Column(String(36), ForeignKey("work_sites.id"), nullable=False, index=True)
    
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    patronymic = Column(String(100), nullable=True)
    pin_code = Column(String(7), unique=True, nullable=False, index=True)  # FİN kod
    phone = Column(String(30), nullable=False)
    email = Column(String(120), nullable=True)
    department = Column(String(100), nullable=False, index=True)
    position = Column(String(100), nullable=False)
    avatar_url = Column(Text, nullable=True)
    
    is_enrolled = Column(Boolean, default=False, nullable=False)
    status = Column(String(20), default="active", nullable=False)  # active, suspended, terminated
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    work_site = relationship("WorkSite", back_populates="employees")
    enrollments = relationship("FaceEnrollment", back_populates="employee", cascade="all, delete-orphan")
    consent = relationship("BiometricConsent", back_populates="employee", uselist=False, cascade="all, delete-orphan")
    attendance_records = relationship("AttendanceRecord", back_populates="employee")


class FaceEnrollment(Base):
    __tablename__ = "face_enrollments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    employee_id = Column(String(36), ForeignKey("employees.id"), nullable=False, index=True)
    angle = Column(String(10), nullable=False)  # front, left, right
    
    # AES-256 GCM encrypted binary/hex representation of the 512-dim embedding vector
    encrypted_vector_payload = Column(Text, nullable=False)
    vector_iv = Column(String(64), nullable=False)
    vector_tag = Column(String(64), nullable=False)
    
    quality_score = Column(Float, nullable=False)
    is_eyes_open = Column(Boolean, default=True, nullable=False)
    lighting_score = Column(Float, nullable=False)
    blurriness_score = Column(Float, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    enrolled_by = Column(String(100), nullable=False)

    employee = relationship("Employee", back_populates="enrollments")


class BiometricConsent(Base):
    __tablename__ = "biometric_consents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    employee_id = Column(String(36), ForeignKey("employees.id"), unique=True, nullable=False)
    consent_version = Column(String(30), nullable=False)  # e.g. "v2.1-AR-2025"
    purpose = Column(Text, nullable=False)
    legal_text = Column(Text, nullable=False)
    
    # Electronic signature capture (Base64 SVG or PNG Data URL)
    signature_data_url = Column(Text, nullable=False)
    signed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ip_address = Column(String(45), nullable=False)
    
    employee = relationship("Employee", back_populates="consent")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    employee_id = Column(String(36), ForeignKey("employees.id"), nullable=False, index=True)
    work_site_id = Column(String(36), ForeignKey("work_sites.id"), nullable=False, index=True)
    
    event_type = Column(String(20), nullable=False, index=True)  # CHECK_IN, CHECK_OUT
    server_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    device_timestamp = Column(DateTime, nullable=False)
    
    # Geofence & GPS Accuracy
    gps_latitude = Column(Float, nullable=False)
    gps_longitude = Column(Float, nullable=False)
    gps_accuracy_meters = Column(Float, nullable=False)
    distance_to_site_meters = Column(Integer, nullable=False)
    is_within_geofence = Column(Boolean, nullable=False)
    is_mock_gps = Column(Boolean, default=False, nullable=False)
    supervisor_comment = Column(Text, nullable=True)
    
    # Biometric verification metrics
    similarity_score = Column(Float, nullable=False)
    liveness_score = Column(Float, nullable=False)
    liveness_challenge = Column(String(50), nullable=False)
    is_suspicious = Column(Boolean, default=False, nullable=False, index=True)
    suspicion_reasons = Column(Text, nullable=True)  # JSON-encoded array of reasons
    
    # Device & Security Audit
    recorded_by_user_id = Column(String(50), nullable=False)  # supervisor ID or 'SELF'
    recorded_by_role = Column(String(20), nullable=False)     # supervisor, employee, hr
    device_fingerprint = Column(String(100), nullable=False)
    device_model = Column(String(150), nullable=False)
    
    # Offline sync metadata
    is_offline_synced = Column(Boolean, default=False, nullable=False)
    offline_recorded_at = Column(DateTime, nullable=True)
    
    # Low-res encrypted audit snapshot (retained for 30 days)
    audit_thumbnail_url = Column(Text, nullable=True)

    employee = relationship("Employee", back_populates="attendance_records")
    work_site = relationship("WorkSite", back_populates="attendance_records")
    corrections = relationship("AttendanceCorrection", back_populates="attendance_record")


class AttendanceCorrection(Base):
    __tablename__ = "attendance_corrections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    attendance_record_id = Column(String(36), ForeignKey("attendance_records.id"), nullable=False, index=True)
    employee_id = Column(String(36), nullable=False, index=True)
    
    original_event_type = Column(String(20), nullable=False)
    corrected_event_type = Column(String(20), nullable=False)
    original_time = Column(DateTime, nullable=False)
    corrected_time = Column(DateTime, nullable=False)
    
    reason = Column(Text, nullable=False)  # Compulsory reason
    corrected_by_user_id = Column(String(50), nullable=False)
    corrected_by_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    attendance_record = relationship("AttendanceRecord", back_populates="corrections")


class SecurityAuditLog(Base):
    __tablename__ = "security_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(50), nullable=False)
    actor_name = Column(String(100), nullable=False)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)  # e.g., ENROLL, PURGE_BIOMETRICS, MANUAL_CORRECTION
    target_id = Column(String(50), nullable=False)
    details = Column(Text, nullable=False)
    ip_address = Column(String(45), nullable=True)
    device_info = Column(String(200), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

# Indices for high-frequency queries
Index("idx_att_emp_time", AttendanceRecord.employee_id, AttendanceRecord.server_timestamp)
Index("idx_att_site_time", AttendanceRecord.work_site_id, AttendanceRecord.server_timestamp)
