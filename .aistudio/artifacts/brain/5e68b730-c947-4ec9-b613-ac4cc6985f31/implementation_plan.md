# Jobia.az Prototipinə Uyğunlaşdırma və Vahid Ağ-Zümrüd Dizayn Standartı Planı

İstifadəçinin təqdim etdiyi `image_cb4301c5.png` (Başlıq və Hero prototipi), `image_6c47657d.png` (Yeni Footer prototipi) və HTML/CSS spesifikasiyasına əsasən saytın tam vizual və funksional yenilənmə planı.

---

## 1. Məqsəd və Əsas Dəyişikliklər

- **Üz Qabığı (Hero Section):**
  - Təmiz ağ və zərif zümrüd yaşılı arxa fon.
  - Sol tərəf: `● KARYERANDA YENİ SƏHİFƏ` etiketi, böyük **`Doğru iş.`** və zümrüd yaşılı **`Yeni başlanğıc.`** başlığı, alt başlıq, kapsul axtarış inputu (`Vəzifə, peşə və ya şirkət adı`) və `İş axtar ↗` düyməsi, `🛡️ Yeni imkanları bir axtarışla kəşf et` təhlükəsizlik etiketi.
  - Sağ tərəf: Dərin zümrüd-qaranlıq interaktiv kart (`SƏNİN KARYERA XƏRİTƏN: Bacarıqlarından yeni imkanlara.`), mərkəzində `JOBIA` və `CV profili`, `AI analiz`, `Vakansiyalar` düyünlərini birləşdirən canlı konstellasiya radarı, üzərində üzən tövsiyə kartı (`KƏŞF ETMƏYƏ DƏYƏR: Baş aşpaz - Gabala Hospitality Group`) və `12 Aktiv vakansiya | 10 Təsdiqli şirkət` göstəricisi, altda isə `01 / 02` karusel naviqasiyası.

- **Başlıq (Header) & Daimi Alt Alətlər Zolağı (Sub-bar):**
  - Başlıqda mərkəzi kapsul menyu (`Vakansiyalar`, `Peşəkar şəbəkə`, `CV yarat`, `AI analizator`, `Alətlər ⌵`, `Haqqımızda`, `+ Elan yerləşdir`, `🌙`, `🇦🇿 AZ ⌵`).
  - Sağ tərəfdə `👑 Planlar`, bildiriş zəngi və istifadəçi profil kapsulu (`QA Qadir ⌵`).
  - İstifadəçinin seçiminə əsasən başlığın dərhal altında **Daimi Alt Alətlər Zolağı (Sub-bar)**: Üz Tanıma (Face Attendance), Time to Fill HR Analitika, AR Maaş Kalkulyatoru, Məzuniyyət Kalkulyatoru, Xəritədə Vakansiyalar və Google Chat birbaşa keçidləri.

- **Yeni Footer (Tam Prototip Uyğunluğu):**
  - Arxa fonda zərif, şəffaf nəhəng **`JOBIA`** su nişanı (watermark).
  - 4 dəqiq sütun:
    1. Jobia loqosu, qısa açıqlama, `DƏSTƏK LAZIMDIR?` bülleten inputu (içində yaşıl kağız təyyarə düyməsi) və sosial şəbəkə düymələri (`Bizi izləyin`).
    2. `NAMİZƏDLƏR` (Vakansiyalar, Xəritədə vakansiyalar, Maaş kalkulyatoru, Məzuniyyət kalkulyatoru).
    3. `ŞİRKƏTLƏR` (İşəgötürən kabineti, Vakansiya yerləşdir, Namizəd bazası, Planlar və qiymətlər).
    4. `DƏSTƏK` (Platformanı tanı, Tez-tez verilən suallar, Bizimlə əlaqə, Əmək məcəlləsinə uyğunluq).
  - Alt zolaq: `© 2026 Jobia.az. Bütün hüquqlar qorunur.` və hüquqi keçidlər (`Məxfilik | İstifadə qaydaları | Kuki | Təhlükəsizlik`).

- **Daxili Bölmələrin Səliqəyə Salınması:**
  - Vakansiya kartları, filtrlər qrupu, axtarış paneli, namizəd kabineti və açılan pəncərələr (modallar) təmiz ağ kartlar, zümrüd yaşılı (`#00a859`) vurğular və incə haşiyələrlə vahid standartlaşdırılır.
  - Kamera və üz tanıma pəncərəsindəki düymələr və görünüş prototipə uyğunlaşdırılır.

- **Biznes Plan və Sənədləşmə:**
  - `/BUSINESS_PLAN.md` faylında "8. İnkişaf Tarixçəsi və Yol Xəritəsi (Changelog & Roadmap)" bölməsinə yeni vizual korporativ yenilənmə və alətlər sub-barı əlavə edilir (`RULE[AGENTS_md]`).

---

## 2. Dəyişiklik Ediləcək Fayllar və Modullar

1. **`src/components/Header.tsx`**:
   - Mərkəzi kapsul naviqasiya dizaynının prototip ilə tam piksel uyğunluğu.
   - Sağ tərəfdəki `👑 Planlar` yaşıl konturlu kapsul düyməsi, bildiriş nişanı və `QA Qadir ⌵` profil menyusu.
   - Daimi alt alətlər zolağının (Permanent Tools Sub-bar) yerləşdirilməsi.

2. **`src/components/candidate/JobExplorer.tsx`** & **`src/components/candidate/JobiaHero.tsx`**:
   - Mövcud ağır qutu hero hissəsini prototipdəki xüsusi zərif `Doğru iş. Yeni başlanğıc.` hero komponenti ilə əvəzləmək.
   - İnteraktiv konstellasiya radarı, tövsiyə kartı və canlı statistika elementləri.
   - Axtarış panelini prototipdəki təmiz forma və `İş axtar ↗` düyməsinə inteqrasiya etmək.

3. **`src/components/Footer.tsx`**:
   - `image_6c47657d.png` şəklinə əsasən böyük fon su nişanı (`JOBIA`), bülleten qeydiyyat kapsulu və 4 əsas sütunun tam tətbiqi.

4. **`src/components/candidate/` və ümumi kartlar**:
   - Vakansiya kartları, filtrləmə panelləri və modalların vahid rəng sxeminə (`#00a859` Jobia Green, təmiz ağ kartlar) keçirilməsi.

5. **`BUSINESS_PLAN.md`**:
   - Yeni dizayn prototipi və alətlər inteqrasiyası barədə sənədləşmənin tamamlanması.

---

## 3. Doğrulama və Test Mərhələsi

- `lint_applet` ilə sintaksis və tip yoxlanışı.
- `compile_applet` ilə layihənin xətasız qurulmasının təsdiqlənməsi.
- Bütün naviqasiya və alətlərin kliklənə bilən və dərhal açılan olmasının yoxlanması.
