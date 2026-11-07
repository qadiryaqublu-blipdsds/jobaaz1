# Üz Tanıma ilə Davamiyyət Sistemi — Quraşdırma və İstismar Təlimatı

Bu sənəd sistemin həm lokal mühitdə, həm də istehsalat (production) mühitində Docker Compose və standart Linux serverlərində quraşdırılmasını addım-addım izah edir.

---

## 1. Minimal Sistem Tələbləri
* **Əməliyyat Sistemi:** Ubuntu 22.04 LTS / Debian 12 / RHEL 9 və ya Docker dəstəkli istənilən Linux distributivi.
* **Prosessor (CPU):** Ən azı 2 nüvə (Tövsiyə olunan: 4 nüvə 2.4 GHz+).
* **Operativ Yaddaş (RAM):** Ən azı 4 GB (Tövsiyə olunan: 8 GB).
* **Disk Yaddaşı:** 25 GB SSD (verilənlər bazası və audit şəkilləri üçün).
* **Kamera:** PWA mobil tərəfi üçün istənilən smartfonun ön/arxa kamerası (ən azı 720p HD).
* **Şəbəkə:** HTTPS/TLS 1.3 protokolu (kamera və GPS icazələrinin brauzerdə işləməsi üçün məcburidir).

---

## 2. Docker Compose ilə Tez Quraşdırma (Tövsiyə Olunan)

### Addım 1: Layihə qovluğuna keçid
```bash
cd backend_face_attendance
```

### Addım 2: Konfiqurasiya faylını (.env) təyin edin
`.env` faylını yaradın və ya açarın parametrini dəyişin:
```bash
cat << 'EOF' > .env
ENVIRONMENT=production
DEBUG=False
DATABASE_URL=postgresql://jobia_user:secure_face_pass_2025@db:5432/jobia_attendance
AES_MASTER_KEY_HEX=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
JWT_SECRET_KEY=super_secret_jwt_face_attendance_key_2025
SIMILARITY_THRESHOLD_VERIFIED=0.72
SIMILARITY_THRESHOLD_SUSPICIOUS=0.65
DUPLICATE_INTERVAL_MINUTES=2
GEOFENCE_DEFAULT_RADIUS_METERS=200
EOF
```

### Addım 3: Konteynerləri işə salın
```bash
docker compose up -d --build
```

### Addım 4: Xidmətlərin statusunu yoxlayın
```bash
docker compose ps
curl http://localhost:8000/health
```
Cavab: `{"status":"healthy","service":"Jobia Biometric Face Attendance API","similarity_threshold":0.72}`

---

## 3. Lokal Mühitdə (Docker Olmadan) Quraşdırma

### Addım 1: Python 3.11 virtual mühiti yaradın
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Addım 2: PostgreSQL bazasını yaradın
```bash
sudo -u postgres psql -c "CREATE USER jobia_user WITH PASSWORD 'secure_face_pass_2025';"
sudo -u postgres psql -c "CREATE DATABASE jobia_attendance OWNER jobia_user;"
```

### Addım 3: Serveri başladın
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 4. Testlərin İcrası
Avtomatik kriptoqrafiya, liveness, geofence və kosinus oxşarlığı testlərini yoxlamaq üçün:
```bash
pytest tests/ -v
```

---

## 5. PWA-nın İstifadə Qaydası ("Başqasının Telefonu" Ssenarisi)
1. Briqadir və ya Rəhbər istənilən smartfonun brauzerində (Chrome, Safari) tətbiqi açır.
2. Öz korporativ hesabı ilə daxil olur.
3. Kamera və GPS icazəsini təsdiq edir.
4. "Sürətli Növbə Rejimi"ni (Continuous Scan) aktivləşdirir.
5. Növbəyə gələn hər bir işçi növbə ilə kameraya baxır; sistem canlılıq testini aparır və 0.5 saniyə ərzində adı ekrana çıxararaq "Giriş" və ya "Çıxış" qeydini serverə göndərir.
6. Briqadir işini bitirdikdə "Çıxış" düyməsini sıxır: cihazda olan bütün lokal məlumatlar, şifrələnmiş vektorlar və sessiya tokeni avtomatik tam təmizlənir.
