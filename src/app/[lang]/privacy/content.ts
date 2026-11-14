import type { Locale } from "@/lib/i18n";

// The privacy policy text. Korean is the version that counts; the others are translations of it.
// {name} and {email} are filled from OPERATOR (site-footer.tsx).
export type Policy = { title: string; intro: string; effective: string; note?: string; sections: { h: string; p: string[] }[] };

export const EFFECTIVE = "2026-11-21";

export const POLICY: Record<Locale, Policy> = {
  ko: {
    title: "개인정보처리방침",
    intro: "WeLocation(이하 '서비스')은 이용자의 개인정보를 소중히 다루며 「개인정보 보호법」을 지킵니다. 이 방침은 서비스가 어떤 정보를 왜 처리하는지, 얼마나 보관하는지 알려 드립니다.",
    effective: "시행일",
    sections: [
      { h: "1. 처리하는 개인정보", p: [
        "회원가입: 이메일 주소, 비밀번호, 닉네임. 비밀번호는 복원할 수 없는 방식(BCrypt)으로 바꾸어 저장하며 원문은 저장하지 않습니다.",
        "Google 또는 카카오로 가입·로그인: 해당 서비스가 주는 회원 고유 번호, 이름(닉네임), 이메일 주소(해당 서비스가 확인한 주소이고 제공에 동의한 경우에만). 이 경우 비밀번호는 받지도 저장하지도 않습니다.",
        "서비스 이용 중: 작성한 리뷰(별점, 내용), 좋아요, 저장한 장소.",
        "자동 수집: 로그인 상태를 유지하는 쿠키(__Host-wl_session), 선택한 언어를 기억하는 쿠키(wl_lang), 웹 서버 접속 기록(IP 주소, 접속 시각, 요청한 주소).",
        "'내 주변' 기능의 위치 정보는 그 검색에만 쓰이며 저장하거나 기록하지 않습니다.",
      ] },
      { h: "2. 처리 목적", p: ["회원 식별과 로그인, 리뷰·좋아요·저장 기능 제공, 부정 이용 방지와 보안."] },
      { h: "3. 보유 기간", p: [
        "회원 정보와 리뷰·좋아요·저장 기록: 회원 탈퇴 시까지. 탈퇴를 요청하시면 10일 안에 지체 없이 삭제합니다.",
        "웹 서버 접속 기록: 최대 14일 보관 후 자동 삭제.",
      ] },
      { h: "4. 제3자 제공", p: ["이용자의 개인정보를 제3자에게 제공하지 않습니다. 법령에 따른 요청이 있는 경우는 예외입니다."] },
      { h: "5. 처리 위탁 및 국외 이전", p: [
        "DigitalOcean, LLC: 서버 운영(데이터 보관). 보관 위치: 싱가포르 데이터센터. 이전되는 항목: 1항의 모든 정보. 이전 시점과 방법: 서비스 이용 시 네트워크를 통해 전송. 보유 기간: 3항과 같음.",
        "Google LLC(Gemini API): AI 가이드 답변 생성. 이전되는 항목: AI 가이드에 입력한 질문 문장. 서비스는 질문 문장을 저장하지 않습니다. 질문에 개인정보를 쓰지 말아 주세요.",
        "OpenFreeMap(지도 이미지): '내 주변' 페이지의 지도. 브라우저가 지도 조각을 직접 받아 오므로 이용자의 IP 주소와 보고 있는 지도 범위가 이 서버에 전달됩니다. 쿠키는 쓰지 않으며, 위치 좌표나 회원 정보는 보내지 않습니다.",
        "국외 이전을 원하지 않으시면 회원가입과 AI 가이드를 이용하지 않을 수 있으며, 이 경우에도 장소 검색과 보기는 이용할 수 있습니다.",
      ] },
      { h: "6. 이용자의 권리", p: ["언제든지 자신의 개인정보 열람, 정정, 삭제, 처리 정지를 요구할 수 있습니다. 아래 이메일로 요청하시면 지체 없이 처리합니다."] },
      { h: "7. 만 14세 미만 아동", p: ["서비스는 만 14세 미만 아동의 회원가입을 받지 않습니다."] },
      { h: "8. 안전성 확보 조치", p: ["HTTPS 암호화 전송, 비밀번호 일방향 암호화, 관리자 접근 제한, 서버 접근 키 관리."] },
      { h: "9. 개인정보 보호책임자", p: ["성명: {name}", "이메일: {email}"] },
      { h: "10. 방침의 변경", p: ["이 방침이 바뀌면 시행 7일 전부터 이 페이지에 알립니다."] },
    ],
  },
  en: {
    title: "Privacy policy",
    intro: "WeLocation (the 'Service') takes care of your personal information and follows Korea's Personal Information Protection Act. This policy explains what the Service processes, why, and for how long.",
    effective: "Effective date",
    note: "This is a translation. The Korean version is the one that applies.",
    sections: [
      { h: "1. What we process", p: [
        "Sign-up: email address, password and nickname. The password is stored only as a one-way hash (BCrypt), never as the text you typed.",
        "Sign-up or sign-in with Google or Kakao: the account id that service gives us, your name (nickname), and your email address only if that service has verified it and you agreed to share it. No password is received or stored then.",
        "While you use the Service: your reviews (rating and text), likes and saved places.",
        "Automatically: a cookie that keeps you signed in (__Host-wl_session), a cookie that remembers your language (wl_lang), and web server access records (IP address, time, requested address).",
        "Your location in 'Nearby' is used for that search only and is never stored or logged.",
      ] },
      { h: "2. Why", p: ["To identify members and sign them in, to provide reviews, likes and saved places, and to keep the Service secure."] },
      { h: "3. How long", p: [
        "Account, reviews, likes and saved places: until you close your account. Ask by email and we delete them within 10 days.",
        "Web server access records: up to 14 days, then deleted automatically.",
      ] },
      { h: "4. Sharing with third parties", p: ["We do not give your personal information to third parties, except when the law requires it."] },
      { h: "5. Service providers and transfer abroad", p: [
        "DigitalOcean, LLC: runs the server and stores the data, in a data centre in Singapore. Transferred: everything in section 1, over the network as you use the Service. Kept: as in section 3.",
        "Google LLC (Gemini API): writes the AI guide's answers. Transferred: the question you type into the AI guide. The Service does not store your questions. Please don't put personal information in them.",
        "OpenFreeMap (map images): the map on the Nearby page. Your browser loads the map tiles directly, so your IP address and the map area you look at reach that server. It uses no cookies, and no location or account data is sent.",
        "If you don't want your data transferred abroad, you can skip signing up and the AI guide; searching and viewing places still work.",
      ] },
      { h: "6. Your rights", p: ["You can ask at any time to see, correct or delete your personal information, or to stop its processing. Email us and we will act without delay."] },
      { h: "7. Children under 14", p: ["Children under 14 may not sign up."] },
      { h: "8. Security", p: ["HTTPS for every connection, one-way hashed passwords, limited admin access, managed server access keys."] },
      { h: "9. Privacy officer", p: ["Name: {name}", "Email: {email}"] },
      { h: "10. Changes", p: ["When this policy changes, we post the new version on this page at least 7 days before it takes effect."] },
    ],
  },
  ru: {
    title: "Политика конфиденциальности",
    intro: "WeLocation (далее «Сервис») бережно относится к вашим персональным данным и соблюдает корейский Закон о защите персональной информации. Здесь сказано, какие данные Сервис обрабатывает, зачем и как долго хранит.",
    effective: "Дата вступления в силу",
    note: "Это перевод. Действует корейская версия.",
    sections: [
      { h: "1. Какие данные мы обрабатываем", p: [
        "Регистрация: адрес эл. почты, пароль и никнейм. Пароль хранится только в виде необратимого хеша (BCrypt), исходный текст не хранится.",
        "Регистрация или вход через Google или Kakao: идентификатор аккаунта от этого сервиса, имя (никнейм) и адрес эл. почты, только если сервис его подтвердил и вы согласились им поделиться. Пароль в этом случае не передаётся и не хранится.",
        "При использовании: ваши отзывы (оценка и текст), лайки и сохранённые места.",
        "Автоматически: cookie для входа (__Host-wl_session), cookie с выбранным языком (wl_lang) и журнал доступа веб-сервера (IP-адрес, время, запрошенный адрес).",
        "Местоположение в разделе «Рядом» используется только для этого поиска и не сохраняется.",
      ] },
      { h: "2. Зачем", p: ["Чтобы узнавать пользователей и выполнять вход, давать писать отзывы, ставить лайки и сохранять места, а также для безопасности Сервиса."] },
      { h: "3. Как долго", p: [
        "Аккаунт, отзывы, лайки и сохранённые места: до удаления аккаунта. Напишите нам, и мы удалим их в течение 10 дней.",
        "Журнал доступа веб-сервера: до 14 дней, затем удаляется автоматически.",
      ] },
      { h: "4. Передача третьим лицам", p: ["Мы не передаём ваши данные третьим лицам, кроме случаев, предусмотренных законом."] },
      { h: "5. Подрядчики и передача за рубеж", p: [
        "DigitalOcean, LLC: работа сервера и хранение данных в дата-центре в Сингапуре. Передаётся: всё из раздела 1, по сети во время использования Сервиса. Срок: как в разделе 3.",
        "Google LLC (Gemini API): ответы AI-гида. Передаётся: вопрос, который вы пишете AI-гиду. Сервис не хранит ваши вопросы. Не указывайте в них персональные данные.",
        "OpenFreeMap (изображения карты): карта на странице «Рядом». Браузер загружает фрагменты карты напрямую, поэтому ваш IP-адрес и просматриваемая область карты попадают на этот сервер. Cookie не используются, координаты и данные аккаунта не передаются.",
        "Если вы не хотите передачи данных за рубеж, можно не регистрироваться и не пользоваться AI-гидом; поиск и просмотр мест работают и так.",
      ] },
      { h: "6. Ваши права", p: ["Вы можете в любой момент запросить просмотр, исправление или удаление своих данных либо прекращение их обработки. Напишите нам, и мы выполним запрос без промедления."] },
      { h: "7. Дети до 14 лет", p: ["Дети до 14 лет не могут регистрироваться."] },
      { h: "8. Защита данных", p: ["HTTPS для всех соединений, необратимое хеширование паролей, ограниченный доступ администраторов, контроль ключей доступа к серверу."] },
      { h: "9. Ответственный за персональные данные", p: ["Имя: {name}", "Эл. почта: {email}"] },
      { h: "10. Изменения", p: ["Новая версия политики публикуется на этой странице не позднее чем за 7 дней до вступления в силу."] },
    ],
  },
  uz: {
    title: "Shaxsiy ma'lumotlar siyosati",
    intro: "WeLocation (keyingi o'rinlarda 'Xizmat') shaxsiy ma'lumotlaringizni ehtiyot qiladi va Koreyaning Shaxsiy ma'lumotlarni himoya qilish qonuniga amal qiladi. Bu yerda Xizmat qanday ma'lumotlarni, nima uchun va qancha muddat saqlashi yozilgan.",
    effective: "Kuchga kirish sanasi",
    note: "Bu tarjima. Koreyscha matn amal qiladi.",
    sections: [
      { h: "1. Qanday ma'lumotlar", p: [
        "Ro'yxatdan o'tishda: email manzil, parol va taxallus. Parol faqat qaytarib bo'lmaydigan xesh (BCrypt) ko'rinishida saqlanadi, asl matni saqlanmaydi.",
        "Google yoki Kakao bilan ro'yxatdan o'tish yoki kirishda: o'sha xizmat beradigan akkaunt ID raqami, ism (taxallus) va email manzil (faqat xizmat uni tasdiqlagan va siz ulashishga rozi bo'lgan bo'lsangiz). Bu holda parol olinmaydi va saqlanmaydi.",
        "Foydalanish davomida: sharhlaringiz (baho va matn), yoqtirishlar va saqlangan joylar.",
        "Avtomatik: kirgan holatni saqlovchi cookie (__Host-wl_session), tanlangan tilni eslab qoluvchi cookie (wl_lang) va veb-server kirish yozuvlari (IP manzil, vaqt, so'ralgan manzil).",
        "'Atrofda' bo'limidagi joylashuvingiz faqat o'sha qidiruv uchun ishlatiladi, saqlanmaydi va yozib qo'yilmaydi.",
      ] },
      { h: "2. Nima uchun", p: ["A'zolarni tanish va tizimga kiritish, sharh, yoqtirish va saqlash imkoniyatlarini berish, Xizmat xavfsizligini ta'minlash."] },
      { h: "3. Qancha muddat", p: [
        "Akkaunt, sharhlar, yoqtirishlar va saqlangan joylar: akkauntni yopguningizcha. Email orqali so'rasangiz, 10 kun ichida o'chiramiz.",
        "Veb-server kirish yozuvlari: 14 kungacha, keyin avtomatik o'chadi.",
      ] },
      { h: "4. Uchinchi shaxslarga berish", p: ["Ma'lumotlaringizni uchinchi shaxslarga bermaymiz, qonun talab qilgan holatlar bundan mustasno."] },
      { h: "5. Xizmat ko'rsatuvchilar va chet elga uzatish", p: [
        "DigitalOcean, LLC: serverni yuritadi va ma'lumotlarni Singapurdagi ma'lumot markazida saqlaydi. Uzatiladi: 1-banddagi hamma ma'lumot, Xizmatdan foydalanganda tarmoq orqali. Muddat: 3-banddagidek.",
        "Google LLC (Gemini API): AI gid javoblarini yozadi. Uzatiladi: AI gidga yozgan savolingiz. Xizmat savollaringizni saqlamaydi. Savolga shaxsiy ma'lumot yozmang.",
        "OpenFreeMap (xarita rasmlari): “Yaqindagi joylar” sahifasidagi xarita. Brauzer xarita bo'laklarini to'g'ridan-to'g'ri yuklaydi, shuning uchun IP manzilingiz va ko'rayotgan xarita hududi o'sha serverga boradi. Cookie ishlatilmaydi, joylashuv koordinatalari va akkaunt ma'lumoti yuborilmaydi.",
        "Ma'lumotlaringiz chet elga uzatilishini istamasangiz, ro'yxatdan o'tmasdan va AI giddan foydalanmasdan ham joylarni qidirish va ko'rish mumkin.",
      ] },
      { h: "6. Huquqlaringiz", p: ["Istalgan vaqtda ma'lumotlaringizni ko'rish, tuzatish, o'chirish yoki ularga ishlov berishni to'xtatishni so'rashingiz mumkin. Emailga yozing, kechiktirmay bajaramiz."] },
      { h: "7. 14 yoshgacha bolalar", p: ["14 yoshga to'lmagan bolalar ro'yxatdan o'ta olmaydi."] },
      { h: "8. Xavfsizlik", p: ["Barcha ulanishlarda HTTPS, parollar qaytarib bo'lmaydigan xesh bilan, administrator kirishi cheklangan, server kalitlari nazorat ostida."] },
      { h: "9. Shaxsiy ma'lumotlar uchun mas'ul shaxs", p: ["Ism: {name}", "Email: {email}"] },
      { h: "10. O'zgarishlar", p: ["Siyosat o'zgarsa, yangi matn kuchga kirishidan kamida 7 kun oldin shu sahifada e'lon qilinadi."] },
    ],
  },
};
