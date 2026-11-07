# İnformasiya Təhlükəsizliyi Siyasəti və Biometrik Məlumatların Emalı Razılıq Forması

Bu sənəd Azərbaycan Respublikasının "Fərdi məlumatlar haqqında" 11 may 2010-cu il tarixli 998-IIIQ nömrəli Qanununa, Əmək Məcəlləsinə və beynəlxalq ISO/IEC 27001, ISO/IEC 27701 standartlarına tam uyğundur.

---

## BÖLMƏ I: ŞİRKƏTİN İNFORMASİYA TƏHLÜKƏSİZLİYİ SİYASƏTİ

### 1. Prinsiplər və Qanunilik
1.1. Biometrik məlumatlar (üz təsvirinin riyazi vektorları) xüsusi kateqoriyalı fərdi məlumat hesab olunur və yalnız işçinin əvvəlcədən rəsmi yazılı və ya elektron imzalı razılığı əsasında emal edilir.
1.2. Məqsədin Məhdudluğu: Biometrik emal yalnız və yalnız iş yerində faktiki iş vaxtının və əmək intizamının uçotunun (davamiyyət qeydinin) aparılması ilə məhdudlaşır. Məlumatlar heç bir kommersiya, marketinq və ya kənar təşkilatlara ötürülə bilməz.

### 2. Kriptoqrafik Qorunma və Şifrələmə
2.1. Heç bir xam üz şəkli verilənlər bazasında saxlanılmır. Şəkildən çıxarılmış 512-ölçülü normalizə olunmuş embedding vektorları AES-256 GCM (Galois/Counter Mode) alqoritmi ilə şifrələnir.
2.2. Açar idarəetməsi (KMS/HSM): Şifrələmə açarları məlumat bazasından ayrı təcrid olunmuş təhlükəsiz açar idarəetmə modulunda saxlanılır.
2.3. Tranzitdəki Təhlükəsizlik: Cihaz ilə server arasındakı bütün əlaqələr TLS 1.3 protokolu üzərindən icra edilir.

### 3. Başqasının Telefonunda İşləmə və İzlənmə Qadağası
3.1. Rəhbərin və ya briqadirin istifadə etdiyi telefonda heç bir biometrik məlumat daimi yaddaşda saxlanılmır. Sessiya başa çatdıqda və ya "Çıxış" edildikdə bütün müvəqqəti keşlər təmizlənir.
3.2. Geolokasiya YALNIZ və YALNIZ giriş/çıxış qeydi anında (təqribən 1 saniyəlik) götürülür. İşçinin daimi GPS izlənməsi qəti qadağandır və texniki olaraq proqramda bloklanmışdır.

### 4. Unudulma Hüququ (Right to be Forgotten)
4.1. İşçi ilə əmək müqaviləsinə xitam verildikdə və ya işçi qanuni əsaslarla razılığı geri çağırdıqda, onun bütün biometrik vektorları verilənlər bazasından birdəfəlik silinir (purge).
4.2. Silinmə hadisəsi dəyişməz təhlükəsizlik audit jurnalına qeyd olunur.

---

## BÖLMƏ II: İŞÇİNİN BİOMETRİK MƏLUMATLARININ EMALINA ELEKTRON RAZILIQ ƏRİZƏSİ (NÜMUNƏ)

```
                            BİOMETRİK FƏRDİ MƏLUMATLARIN EMALINA
                                     YAZILI RAZILIQ ƏRİZƏSİ

1. İŞÇİ BARƏDƏ MƏLUMAT:
   Adı, Soyadı, Ata adı: __________________________________________________
   FİN Kodu:              [_______]
   Vəzifəsi:              __________________________________________________
   Struktur Bölmə:        __________________________________________________
   İş Yeri / Obyekt:      __________________________________________________

2. RAZILIĞIN MƏQSƏDİ:
   İşəgötürən ("Müəssisə") tərəfindən Azərbaycan Respublikasının Əmək Məcəlləsinin 
   tələblərinə uyğun olaraq, iş vaxtının dəqiq uçotunun təmin edilməsi, işə giriş və 
   işdən çıxış vaxtlarının avtomatlaşdırılmış qeydiyyatının aparılması məqsədilə.

3. EMAL EDİLƏN MƏLUMATLARIN TƏRKİBİ:
   - Şəxsin üzünün həndəsi parametrlərini əks etdirən 512-ölçülü riyazi şablon 
     (rəqəmsal vektor embedding);
   - Giriş və çıxış anında qeydə alınan zaman damğası və iş obyektinin GPS koordinatları;
   - Mübahisəli halların araşdırılması üçün aşağı keyfiyyətli, 30 gün müddətində 
     saxlanılan audit miniatürü.

4. İŞÇİNİN HÜQUQLARI:
   Mənə məlumdur ki, AR "Fərdi məlumatlar haqqında" Qanununun 7-ci və 13-cü maddələrinə əsasən:
   a) İstənilən vaxt bu razılığı yazılı müraciətlə geri çağırmaq hüququna malikəm;
   b) Şəxsi biometrik profilimin silinməsini və emalın dayandırılmasını tələb edə bilərəm;
   c) Giriş-çıxış davamiyyət tarixçəmlə sərbəst tanış ola bilərəm.

5. RAZILIQ BƏYANNAMƏSİ:
   Yuxarıda göstərilən şərtlərlə tam tanış oldum. Şəxsi biometrik üz şablonumun müasir 
   şifrələmə alqoritmləri (AES-256) vasitəsilə qorunmaq şərtilə emalına könüllü razılıq verirəm.

   İşçinin E-İmzası:       [RƏQƏMSAL İMZA ŞABLONU]
   Tarix və Saat:         2025-02-15 09:15:22 UTC
   Cihaz IP Ünvanı:       194.135.150.12
   Sistem Sənəd Nömrəsi:  BIO-CONSENT-v2.1-AR-2025
```
