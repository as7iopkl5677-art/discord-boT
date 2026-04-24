# Discord Iraq Style Bot (Arabic)

بوت ديسكورد عربي بسيط بأوامر إدارة ومعلومات، جاهز للتشغيل والتعديل.

## الأوامر
- `!help`
- `!ping`
- `!id [@member]`
- `!avatar [@member]`
- `!server`
- `!say <text>`
- `!clear <1-100>`
- `!kick @member [reason]`
- `!ban @member [reason]`

> تقدر تغيّر البادئة من `.env`.

## التشغيل
1. ثبّت المتطلبات:
   ```bash
   npm install
   ```
2. انسخ ملف الإعدادات:
   ```bash
   cp .env.example .env
   ```
3. عدّل `.env` وحط التوكن الحقيقي:
   ```env
   DISCORD_TOKEN=PUT_YOUR_TOKEN_HERE
   PREFIX=!
   ```
4. شغّل البوت:
   ```bash
   npm start
   ```

## ملاحظات صلاحيات
- `say`, `clear` تحتاج **Manage Messages**.
- `kick` تحتاج **Kick Members**.
- `ban` تحتاج **Ban Members**.
- تأكد رتبة البوت أعلى من رتبة العضو الهدف.
