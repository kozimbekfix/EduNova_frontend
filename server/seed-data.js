// One-off script to seed the database with sample data.
// Run with: node seed-data.js
// This does not delete existing applications/admin data - it only
// fills in courses, teachers, blogPosts if they're empty, and
// fills in settings fields (only if they're empty).

const { readDb, writeDb } = require("./utils/db");
const { nanoid } = require("nanoid");

const db = readDb();

const courses = [
  {
    id: nanoid(10),
    title: "English (General Course)",
    description:
      "A course that develops spoken and written English from beginner to intermediate level. Covers grammar, vocabulary, and real-life communication practice.",
    duration: "6 months",
    price: "450,000 UZS/month",
    benefits: [
      "Native pronunciation practice",
      "Weekly speaking club",
      "Introduction to IELTS basics",
      "Small groups (8-10 people)",
    ],
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "IELTS Preparation Course",
    description:
      "Intensive preparation covering all 4 sections of the IELTS exam (Listening, Reading, Writing, Speaking). Includes mock tests and individual feedback.",
    duration: "3 months",
    price: "600,000 UZS/month",
    benefits: [
      "Monthly mock exams",
      "Individual writing corrections",
      "Guaranteed score improvement",
    ],
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "Frontend Development (HTML, CSS, JavaScript, React)",
    description:
      "Learn to build modern websites and React applications from scratch. Build a portfolio through hands-on projects.",
    duration: "8 months",
    price: "550,000 UZS/month",
    benefits: [
      "3 real projects for your portfolio",
      "Working with Git/GitHub",
      "Job placement assistance after the course",
    ],
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "Graphic Design (Figma, Photoshop)",
    description:
      "Learn the fundamentals of logo, banner, and social media post design as well as UI/UX in modern design software.",
    duration: "4 months",
    price: "400,000 UZS/month",
    benefits: ["Hands-on assignments", "Building a portfolio", "Preparation for freelancing"],
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "SMM and Digital Marketing",
    description:
      "Learn to promote a business through Instagram, Telegram, and Facebook, set up targeted ads, and build a content plan.",
    duration: "3 months",
    price: "400,000 UZS/month",
    benefits: ["Practice on real projects", "Managing an ad budget", "Analytics fundamentals"],
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "Mathematics (For University Applicants)",
    description:
      "Preparation for university entrance exams. Test-taking strategies and in-depth topics.",
    duration: "10 months",
    price: "350,000 UZS/month",
    benefits: ["Weekly practice tests", "Individual approach", "Strong result guarantee"],
    image: "",
    createdAt: new Date().toISOString(),
  },
];

const teachers = [
  {
    id: nanoid(10),
    name: "Madina Yusupova",
    position: "English Teacher",
    subject: "English / IELTS",
    bio: "8 years of experience, holds an IELTS band score of 8.0. Has prepared over 500 students.",
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    name: "Jasur Rahimov",
    position: "Frontend Development Teacher",
    subject: "JavaScript / React",
    bio: "5 years of professional development experience, has worked in frontend roles at IT companies.",
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    name: "Nilufar Karimova",
    position: "Graphic Design Teacher",
    subject: "Figma / Photoshop / UI-UX",
    bio: "6 years as a designer, has worked with international brands, author of dozens of successful projects.",
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    name: "Sardor Aliyev",
    position: "Mathematics Teacher",
    subject: "Mathematics / University Prep",
    bio: "10 years of teaching experience, over 90% of his students have been admitted to universities.",
    image: "",
    createdAt: new Date().toISOString(),
  },
];

const blogPosts = [
  {
    id: nanoid(10),
    title: "How to Prepare for the IELTS Exam: 7 Practical Tips",
    excerpt:
      "The most effective strategies for scoring high on the IELTS exam, and common mistakes to avoid.",
    content:
      "The most important thing when preparing for the IELTS exam is consistency. Spend at least 1 hour every day with English material: listen to podcasts, read books, and do writing exercises. For the Speaking section, practice speaking in front of a mirror or find a language partner. Don't forget to manage your time in the Writing section - allow 20 minutes for Task 1 and 40 minutes for Task 2. Most importantly, keep track of your level through regular mock tests.",
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "What Do You Need to Know to Become a Frontend Developer?",
    excerpt:
      "A complete roadmap for beginners who have chosen the frontend path in IT.",
    content:
      "Start learning frontend development with HTML and CSS - these form the skeleton and appearance of a website. Then dive deep into JavaScript, since it adds interactivity to the site. After that, it's recommended to learn a modern framework like React. Building a portfolio is very important - complete at least 3-4 real projects and put them on GitHub. Consistent practice and keeping up with the latest developments is the key to finding your place in the market.",
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "Why Should You Start Teaching Your Child a Language at a Young Age?",
    excerpt: "How learning a foreign language early affects brain development.",
    content:
      "Research shows that children acquire a new language much faster and more naturally between the ages of 5-12. During this period, the brain's plasticity is high, making it possible to learn pronunciation and grammar with almost no accent. In addition, learning a language early improves a child's overall cognitive abilities, including memory and concentration.",
    image: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: nanoid(10),
    title: "The Most In-Demand IT Careers in 2026",
    excerpt: "Which IT fields will offer the most income and job opportunities in the coming years?",
    content:
      "Frontend and Backend development remain among the most popular career paths. In addition, artificial intelligence and Data Analysis fields are also developing rapidly. Demand for UI/UX design specialists is also growing, since every product needs a convenient and attractive interface. When choosing a career, it's important to balance your own interests with market demand.",
    image: "",
    createdAt: new Date().toISOString(),
  },
];

let changed = false;

if (!db.courses || db.courses.length === 0) {
  db.courses = courses;
  changed = true;
  console.log(`✅ ${courses.length} courses added`);
} else {
  console.log("ℹ️  Courses already exist, skipped");
}

if (!db.teachers || db.teachers.length === 0) {
  db.teachers = teachers;
  changed = true;
  console.log(`✅ ${teachers.length} teachers added`);
} else {
  console.log("ℹ️  Teachers already exist, skipped");
}

if (!db.blogPosts || db.blogPosts.length === 0) {
  db.blogPosts = blogPosts;
  changed = true;
  console.log(`✅ ${blogPosts.length} blog posts added`);
} else {
  console.log("ℹ️  Blog posts already exist, skipped");
}

// Settings - only fill in empty fields, don't overwrite existing ones
db.settings = db.settings || {};
const defaultSettings = {
  siteName: "EduNova",
  phone: "+998 90 123 45 67",
  telegram: "@edunova_uz",
  email: "info@edunova.uz",
  address: "Tashkent, Chilanzar district, Bunyodkor street, building 1",
  googleMapsUrl: "",
  instagram: "@edunova.uz",
  workHours: "Monday-Saturday: 09:00 - 20:00",
};
for (const key in defaultSettings) {
  if (!db.settings[key]) {
    db.settings[key] = defaultSettings[key];
    changed = true;
  }
}

if (changed) {
  writeDb(db);
  console.log("\n💾 Database updated successfully (data/db.json)");
} else {
  console.log("\nℹ️  Nothing changed - all data already existed.");
}
