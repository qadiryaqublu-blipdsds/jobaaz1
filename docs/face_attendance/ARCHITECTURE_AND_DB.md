# Üz Tanıma ilə Davamiyyət (Face Attendance) — Arxitektura və Verilənlər Bazası Sənədi

## 1. Sistemin Arxitektura Sxemi

```
+-----------------------------------------------------------------------------------+
|                        MÜŞTƏRİ TƏRƏFİ (CLIENT / PWA & WEB)                        |
|                                                                                   |
|   +----------------------------------+     +----------------------------------+   |
|   |   Rəhbər / Briqadir Smartfonu    |     |    HR / Menecer Veb Paneli       |   |
|   |  - Kamera axını & üz aşkarlanması|     |  - Gündəlik/aylıq tabel cədvəli  |   |
|   |  - Aktiv Liveness (göz qırp, baş)|     |  - Şübhəli qeydlər auditi        |   |
|   |  - HTML5 GPS & Mock aşkarlanması |     |  - 3 bucaqlı enrollment modulu   |   |
|   |  - AES şifrələnmiş IndexedDB növb|     |  - Əl ilə düzəliş & Excel ixrac  |   |
|   +-----------------+----------------+     +-----------------+----------------+   |
+---------------------|----------------------------------------|--------------------+
                      | HTTPS / TLS 1.3 (WSS / REST JSON API)  |
                      v                                        v
+-----------------------------------------------------------------------------------+
|                           BACKEND SİSTEMİ (FASTAPI)                               |
|                                                                                   |
|  +------------------------+  +------------------------+  +---------------------+  |
|  |  Routers (Giriş nöqtəsi|  | Face Engine            |  | Security Core       |  |
|  |  - /enrollment/*       |  | - MobileFaceNet / Arc  |  | - AES-256 GCM       |  |
|  |  - /attendance/*       |  | - Kosinus oxşarlığı    |  | - JWT + RBAC Auth   |  |
|  |  - /admin/*            |  | - Liveness verifier    |  | - Device Fingerprint|  |
|  +-----------+------------+  +-----------+------------+  +----------+----------+  |
|              |                           |                          |             |
|              +---------------------------+--------------------------+             |
|                                          |                                        |
|                                          v                                        |
|                          +-------------------------------+                        |
|                          |    SQLAlchemy ORM + Alembic   |                        |
|                          +---------------+---------------+                        |
+------------------------------------------|----------------------------------------+
                                           v
+-----------------------------------------------------------------------------------+
|                   VERİLƏNLƏR BAZASI VƏ KRİPTO SAXLANC (POSTGRESQL)                |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | work_sites         |  | employees            |  | face_enrollments          |  |
|  | - GPS & Radius     |  | - FİN, Şöbə, Vəzifə  |  | - Encrypted Vector (GCM)  |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  | attendance_records |  | attendance_corrections| | security_audit_logs       |  |
|  | - Vaxt, GPS, Ballar|  | - Düzəliş səbəbi     |  | - Dəyişməz audit jurnalı  |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Açıq Mənbəli Model və Lisenziya
* **Seçilmiş Model Standartı:** MobileFaceNet / ArcFace ONNX Runtime.
* **Lisenziya:** Apache License 2.0 / MIT.
* **Kommersiya hüququ:** Bəli, heç bir royalti və ya məhdudiyyət olmadan istənilən kommersiya məqsədli SaaS layihəsində tam istifadə oluna bilər.
* **İşləmə mexanizmi:** Müştəri tərəfdə (brauzerdə) üz aşkarlanır və ilkin kəsim aparılır; dəqiq 512-ölçülü normalizə olunmuş vektor çıxarışı və kosinus oxşarlığı müqayisəsi serverdə (və ya oflayn rejimdə şifrələnmiş lokal sessiyada) icra olunur.

---

## 3. Verilənlər Bazası Sxemi (PostgreSQL DDL)

```sql
-- 1. İş Obyektləri (Geofence Nəzarəti)
CREATE TABLE work_sites (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER DEFAULT 200 NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Asia/Baku' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL
);
CREATE INDEX idx_work_sites_company ON work_sites(company_id);

-- 2. İşçilər Reyestri
CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    company_id VARCHAR(36) NOT NULL,
    work_site_id VARCHAR(36) NOT NULL REFERENCES work_sites(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    patronymic VARCHAR(100),
    pin_code VARCHAR(7) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(120),
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    is_enrolled BOOLEAN DEFAULT FALSE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL
);
CREATE INDEX idx_employees_pin ON employees(pin_code);
CREATE INDEX idx_employees_dept ON employees(department);

-- 3. Biometrik Üz Şablonları (AES-256 GCM ilə Şifrələnmiş)
CREATE TABLE face_enrollments (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    angle VARCHAR(10) NOT NULL, -- 'front', 'left', 'right'
    encrypted_vector_payload TEXT NOT NULL,
    vector_iv VARCHAR(64) NOT NULL,
    vector_tag VARCHAR(64) NOT NULL,
    quality_score REAL NOT NULL,
    is_eyes_open BOOLEAN DEFAULT TRUE NOT NULL,
    lighting_score REAL NOT NULL,
    blurriness_score REAL NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL,
    enrolled_by VARCHAR(100) NOT NULL
);
CREATE INDEX idx_enrollments_employee ON face_enrollments(employee_id);

-- 4. Biometrik Razılıq Ərizələri (AR Qanunvericiliyi)
CREATE TABLE biometric_consents (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    consent_version VARCHAR(30) NOT NULL,
    purpose TEXT NOT NULL,
    legal_text TEXT NOT NULL,
    signature_data_url TEXT NOT NULL,
    signed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL,
    ip_address VARCHAR(45) NOT NULL
);

-- 5. Davamiyyət Qeydləri (Giriş/Çıxış Hadisələri)
CREATE TABLE attendance_records (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL REFERENCES employees(id),
    work_site_id VARCHAR(36) NOT NULL REFERENCES work_sites(id),
    event_type VARCHAR(20) NOT NULL, -- 'CHECK_IN', 'CHECK_OUT'
    server_timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL,
    device_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    gps_latitude DOUBLE PRECISION NOT NULL,
    gps_longitude DOUBLE PRECISION NOT NULL,
    gps_accuracy_meters REAL NOT NULL,
    distance_to_site_meters INTEGER NOT NULL,
    is_within_geofence BOOLEAN NOT NULL,
    is_mock_gps BOOLEAN DEFAULT FALSE NOT NULL,
    supervisor_comment TEXT,
    similarity_score REAL NOT NULL,
    liveness_score REAL NOT NULL,
    liveness_challenge VARCHAR(50) NOT NULL,
    is_suspicious BOOLEAN DEFAULT FALSE NOT NULL,
    suspicion_reasons TEXT,
    recorded_by_user_id VARCHAR(50) NOT NULL,
    recorded_by_role VARCHAR(20) NOT NULL,
    device_fingerprint VARCHAR(100) NOT NULL,
    device_model VARCHAR(150) NOT NULL,
    is_offline_synced BOOLEAN DEFAULT FALSE NOT NULL,
    offline_recorded_at TIMESTAMP WITHOUT TIME ZONE,
    audit_thumbnail_url TEXT
);
CREATE INDEX idx_att_emp_time ON attendance_records(employee_id, server_timestamp);
CREATE INDEX idx_att_site_time ON attendance_records(work_site_id, server_timestamp);
CREATE INDEX idx_att_suspicious ON attendance_records(is_suspicious);

-- 6. Əl ilə Düzəlişlər Jurnalı
CREATE TABLE attendance_corrections (
    id VARCHAR(36) PRIMARY KEY,
    attendance_record_id VARCHAR(36) NOT NULL REFERENCES attendance_records(id),
    employee_id VARCHAR(36) NOT NULL,
    original_event_type VARCHAR(20) NOT NULL,
    corrected_event_type VARCHAR(20) NOT NULL,
    original_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    corrected_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    reason TEXT NOT NULL,
    corrected_by_user_id VARCHAR(50) NOT NULL,
    corrected_by_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL
);

-- 7. Təhlükəsizlik və Audit Jurnalı (Dəyişməz / Immutable)
CREATE TABLE security_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    actor_id VARCHAR(50) NOT NULL,
    actor_name VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45),
    device_info VARCHAR(200),
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc') NOT NULL
);
CREATE INDEX idx_audit_time ON security_audit_logs(timestamp);
```
