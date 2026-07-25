// Namuna ma'lumotlar bilan bazani to'ldirish uchun bir martalik skript.
// Ishga tushirish: node seed-data.js
// Bu mavjud arizalar/admin ma'lumotlarini o'chirmaydi - faqat
// courses, teachers, blogPosts bo'sh bo'lsa, ularni to'ldiradi va
// settings maydonlarini (agar bo'sh bo'lsa) to'ldiradi.

const { readDb, writeDb } = require("./utils/db");
const { nanoid } = require("nanoid");

const db = readDb();

const courses = [
  {
    id: nanoid(10),
    title: "Ingliz tili (Umumiy kurs)",
    description:
      "Boshlang'ich darajadan Intermediate darajagacha ingliz tilini og'zaki va yozma nutqni rivojlantirish orqali o'rgatuvchi kurs. Grammatika, so'z boyligi va real muloqot amaliyoti.",
    duration: "6 oy",
    price: "450 000 so'm/oy",
    benefits: [
      "Native talaffuz bo'yicha amaliyot",
      "Har hafta speaking club",
      "IELTS asoslari bilan tanishtirish",
      "Kichik guruhlar (8-10 kishi)",
    ],
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "IELTS tayyorlov kursi",
    description:
      "IELTS imtihonining barcha 4 ta bo'limi (Listening, Reading, Writing, Speaking) bo'yicha intensiv tayyorgarlik. Mock testlar va individual feedback.",
    duration: "3 oy",
    price: "600 000 so'm/oy",
    benefits: [
      "Har oy mock imtihon",
      "Writing uchun individual tuzatish",
      "Kafolatlangan ball oshishi",
    ],
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "Frontend dasturlash (HTML, CSS, JavaScript, React)",
    description:
      "Noldan boshlab zamonaviy veb-saytlar va React ilovalarini yaratishni o'rganing. Amaliy loyihalar orqali portfolio yig'asiz.",
    duration: "8 oy",
    price: "550 000 so'm/oy",
    benefits: [
      "3 ta real loyiha portfolio uchun",
      "Git/GitHub bilan ishlash",
      "Kurs oxirida ish topishga yordam",
    ],
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "Grafik dizayn (Figma, Photoshop)",
    description:
      "Zamonaviy dizayn dasturlarida logotip, banner, ijtimoiy tarmoq posti va UI/UX dizayn asoslarini o'rganing.",
    duration: "4 oy",
    price: "400 000 so'm/oy",
    benefits: ["Amaliy topshiriqlar", "Portfolio yaratish", "Freelance uchun tayyorgarlik"],
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "SMM va Raqamli marketing",
    description:
      "Instagram, Telegram va Facebook orqali biznesni targ'ib qilish, target reklama sozlash va kontent-plan tuzishni o'rganasiz.",
    duration: "3 oy",
    price: "400 000 so'm/oy",
    benefits: ["Real loyihalarda amaliyot", "Reklama byudjetini boshqarish", "Analitika asoslari"],
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "Matematika (Abituriyentlar uchun)",
    description:
      "OTM (oliy ta'lim muassasalari)ga kirish imtihonlariga tayyorgarlik. Test topshirish strategiyalari va chuqurlashtirilgan mavzular.",
    duration: "10 oy",
    price: "350 000 so'm/oy",
    benefits: ["Har hafta nazorat test", "Individual yondashuv", "Kuchli natija kafolati"],
    image: "",
    createdAt: new Date().toISOString(),
  },
];

const teachers = [
  {
    id: nanoid(10),
    name: "Madina Yusupova",
    position: "Ingliz tili o'qituvchisi",
    subject: "Ingliz tili / IELTS",
    bio: "8 yillik tajribaga ega, IELTS 8.0 band egasi. 500 dan ortiq talaba tayyorlagan.",
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    name: "Jasur Rahimov",
    position: "Frontend dasturlash o'qituvchisi",
    subject: "JavaScript / React",
    bio: "5 yillik professional dasturchi, IT kompaniyalarida frontend yo'nalishida ishlagan tajribaga ega.",
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    name: "Nilufar Karimova",
    position: "Grafik dizayn o'qituvchisi",
    subject: "Figma / Photoshop / UI-UX",
    bio: "6 yillik dizayner, xalqaro brendlar bilan ishlagan, o'nlab muvaffaqiyatli loyihalar muallifi.",
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    name: "Sardor Aliyev",
    position: "Matematika o'qituvchisi",
    subject: "Matematika / Abituriyentlar tayyorlash",
    bio: "10 yillik pedagogik tajriba, o'quvchilarining 90%dan ortig'i OTMga kirgan.",
    image: "",
    createdAt: new Date().toISOString(),
  },
];

const blogPosts = [
  {
    id: nanoid(10),
    title: "IELTS imtihoniga qanday tayyorlanish kerak: 7 ta amaliy maslahat",
    excerpt:
      "IELTS imtihonida yuqori ball olish uchun eng samarali strategiyalar va ko'p uchraydigan xatolar haqida.",
    content:
      "IELTS imtihoniga tayyorgarlik ko'rishda eng muhimi - muntazamlik. Har kuni kamida 1 soat inglizcha material bilan shug'ullaning: podcast tinglang, kitob o'qing, yozish mashqlarini bajaring. Speaking bo'limi uchun oyna oldida gapirish mashqini qiling yoki til sherigi toping. Writing bo'limida vaqtni nazorat qilishni unutmang - Task 1 uchun 20 daqiqa, Task 2 uchun 40 daqiqa ajrating. Eng muhimi, doimiy mock testlar orqali o'z darajangizni kuzatib boring.",
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "Frontend dasturchi bo'lish uchun nimalarni bilish kerak?",
    excerpt:
      "IT sohasida frontend yo'nalishini tanlagan boshlang'ichlar uchun to'liq yo'l xaritasi.",
    content:
      "Frontend dasturlashni o'rganishni HTML va CSS'dan boshlang - bu veb-saytning skeleti va tashqi ko'rinishi. Keyin JavaScript'ni chuqur o'rganing, chunki u saytga interaktivlik qo'shadi. Undan keyin React kabi zamonaviy freymvorklarni o'rganish tavsiya etiladi. Portfolio yig'ish juda muhim - kamida 3-4 ta real loyiha qiling va GitHub'da joylashtiring. Bozorda o'z o'rningizni topish uchun doimiy amaliyot va yangiliklarni kuzatib borish kalit hisoblanadi.",
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "Nima uchun bolangizni yosh vaqtidan tilga o'rgatish kerak?",
    excerpt: "Erta yoshdan chet tili o'rganishning miya rivojlanishiga ta'siri haqida.",
    content:
      "Tadqiqotlar shuni ko'rsatadiki, bolalar 5-12 yosh oralig'ida yangi tilni ancha tez va tabiiy o'zlashtiradilar. Bu davrda miya moslashuvchanligi yuqori bo'lib, talaffuz va grammatikani deyarli aksentsiz o'rganish imkoniyati mavjud. Bundan tashqari, erta yoshda til o'rganish bolaning umumiy kognitiv qobiliyatlarini, jumladan xotira va diqqatni jamlashni ham yaxshilaydi.",
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "2026-yilda eng talab qilinadigan IT kasblar",
    excerpt: "Kelgusi yillarda qaysi IT yo'nalishlari ko'proq daromad va ish o'rni beradi?",
    content:
      "Frontend va Backend dasturlash hamon eng ommabop yo'nalishlardan biri bo'lib qolmoqda. Bundan tashqari, sun'iy intellekt va ma'lumotlar tahlili (Data Analysis) sohalari ham tez sur'atlar bilan rivojlanmoqda. UI/UX dizayn mutaxassislariga bo'lgan talab ham ortib bormoqda, chunki har qanday mahsulot uchun qulay va chiroyli interfeys zarur. Kasb tanlashda o'z qiziqishingiz va bozor talabini muvozanatlashtirish muhim.",
    image: "",
    createdAt: new Date().toISOString(),
  },
];

let changed = false;

if (!db.courses || db.courses.length === 0) {
  db.courses = courses;
  changed = true;
  console.log(`✅ ${courses.length} ta kurs qo'shildi`);
} else {
  console.log("ℹ️  Kurslar allaqachon mavjud, o'tkazib yuborildi");
}

if (!db.teachers || db.teachers.length === 0) {
  db.teachers = teachers;
  changed = true;
  console.log(`✅ ${teachers.length} ta o'qituvchi qo'shildi`);
} else {
  console.log("ℹ️  O'qituvchilar allaqachon mavjud, o'tkazib yuborildi");
}

if (!db.blogPosts || db.blogPosts.length === 0) {
  db.blogPosts = blogPosts;
  changed = true;
  console.log(`✅ ${blogPosts.length} ta blog post qo'shildi`);
} else {
  console.log("ℹ️  Blog postlar allaqachon mavjud, o'tkazib yuborildi");
}

// Settings - faqat bo'sh maydonlarni to'ldiramiz, mavjudlarini bosib o'tmaymiz
db.settings = db.settings || {};
const defaultSettings = {
  siteName: "EduNova",
  phone: "+998 90 123 45 67",
  telegram: "@edunova_uz",
  email: "info@edunova.uz",
  address: "Toshkent sh., Chilonzor tumani, Bunyodkor ko'chasi 1-uy",
  googleMapsUrl: "",
  instagram: "@edunova.uz",
  workHours: "Dushanba-Shanba: 09:00 - 20:00",
};
for (const key in defaultSettings) {
  if (!db.settings[key]) {
    db.settings[key] = defaultSettings[key];
    changed = true;
  }
}

if (changed) {
  writeDb(db);
  console.log("\n💾 Baza muvaffaqiyatli yangilandi (data/db.json)");
} else {
  console.log("\nℹ️  Hech narsa o'zgarmadi - barcha ma'lumotlar allaqachon mavjud edi.");
}
