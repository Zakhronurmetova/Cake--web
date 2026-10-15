# Shirin Dunyo — tort va shirinliklarga buyurtma sayti

React + Tailwind (frontend), Node API, Postgres (doimiy baza). Vercel'da ishlaydi.
Qo'shilgan shirinliklar, buyurtmalar, rasmlar va akkauntlar bazada saqlanadi — sahifani yangilasangiz ham, saytni qayta joylashtirsangiz ham yo'qolmaydi.

## Vercel'ga joylash (qadamma-qadam)

1. **Kodni GitHub'ga yuklang.** Zipni oching. `package.json` turgan papkaning ICHIDAGI fayllarni yuklang
   (repozitoriya ildizida `package.json`, `api/`, `server/`, `src/` bo'lsin).
2. **Vercel → Add New → Project** → shu repozitoriyani tanlang. Framework: **Vite** (o'zi aniqlaydi). Deploy qilmasdan oldin 3–4-qadamni bajaring yoki keyin Redeploy qiling.
3. **Baza ulang:** Vercel loyihangiz → **Storage** → **Create Database** → **Neon (Postgres)** → Create. Vercel `DATABASE_URL` ni o'zi qo'shadi.
   (Supabase ishlatsangiz: Project Settings → Database → *Connection pooling* manzilini `DATABASE_URL` nomi bilan qo'shing.)
4. **Maxfiy kod qo'shing:** Settings → **Environment Variables** → `BAKER_CODE` = o'zingiz o'ylab topgan uzun kod → Save.
5. **Deployments → Redeploy.** Tayyor.

## Birinchi kirish
- Sayt ochilgach **"Ro'yxatdan o'tish"** → rol: **Qandolatchi** → 4-qadamdagi `BAKER_CODE` ni kiriting. Bu — sizning admin akkauntingiz.
- Mijozlar rolini "Tort buyurtmachisi" qilib o'zlari ro'yxatdan o'tadi.
- Qandolatchi kodini hech kimga bermang: kod bor odam qandolatchi bo'la oladi.

## Qandolatchi imkoniyatlari
Mahsulot qo'shish/tahrirlash/yashirish (bayramlarni belgilab, rasm yuklab), kunlik limit, buyurtmalarni qabul qilish/rad etish va holatini yuritish.

## Mahalliy ishga tushirish (ixtiyoriy)
```bash
npm install
npm run dev        # http://localhost:5173
```
`DATABASE_URL` bo'lmasa ma'lumotlar `server/data.json` da saqlanadi va mahalliy qandolatchi kodi `qandolat2026` (terminalda ko'rsatiladi).
Mahalliyda ham Postgres ishlatmoqchi bo'lsangiz, `.env.example` ni `.env` ga nusxalab to'ldiring.

## Xavfsizlik va qoidalar (serverda)
- Parollar `scrypt` + tuz bilan saqlanadi; ketma-ket noto'g'ri urinishlar vaqtincha bloklanadi.
- Narx serverda hisoblanadi; buyurtmadagi narx keyin o'zgarmaydi.
- Mijoz faqat o'z buyurtmasini ko'radi; faqat qandolatchi holatni yuritadi; holatlarni tashlab o'tib bo'lmaydi.
- Kunlik limit bazada atomik tekshiriladi (bir vaqtda kelgan buyurtmalar limitdan oshirmaydi).
- Takroriy yuborish ikkita buyurtma yaratmaydi.
