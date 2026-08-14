// A simple file-based "database". As the project grows, this file
// can be replaced with MongoDB (mongoose) or PostgreSQL - the code
// inside routes/ will barely change, only these functions get
// swapped out for real DB queries.

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

const DEFAULT_DATA = {
  admins: [],
  courses: [],
  teachers: [],
  branches: [],
  blogPosts: [],
  applications: [], // sign-up / application requests
  reviews: [],
  settings: {
    siteName: "Learning Center",
    phone: "",
    telegram: "",
    address: "",
    googleMapsUrl: "", // Google Maps location link (shown on the Contact page)
  },
};

function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Creates a default admin user on server startup if none exists
function ensureDefaultAdmin() {
  const db = readDb();
  if (db.admins.length === 0) {
    const isProd = process.env.NODE_ENV === "production";

    if (isProd && (!process.env.DEFAULT_ADMIN_USERNAME || !process.env.DEFAULT_ADMIN_PASSWORD)) {
      console.error(
        "\n🚨 ERROR: in production mode, DEFAULT_ADMIN_USERNAME and DEFAULT_ADMIN_PASSWORD must be set in the .env file.\n" +
        "Starting production with the default admin/admin123 credentials is not allowed.\n"
      );
      process.exit(1);
    }

    const username = process.env.DEFAULT_ADMIN_USERNAME || "admin";
    const password = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
    const hashed = bcrypt.hashSync(password, 10);
    db.admins.push({
      id: "admin_1",
      username,
      password: hashed,
      createdAt: new Date().toISOString(),
    });
    writeDb(db);
    console.log(`✅ Default admin created -> login: ${username} | password: ${password}`);

    if (username === "admin" && password === "admin123") {
      console.log("\n🚨🚨🚨 SECURITY WARNING 🚨🚨🚨");
      console.log("You're still using the default login/password (admin / admin123)!");
      console.log("This is the first combination anyone would try — right now, in the .env file,");
      console.log("change DEFAULT_ADMIN_USERNAME and DEFAULT_ADMIN_PASSWORD,");
      console.log("then clear the \"admins\" list in data/db.json and restart the server.");
      console.log("🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨\n");
    } else {
      console.log("⚠️  Be sure to keep this password secure in production!");
    }
  }
}

module.exports = { readDb, writeDb, ensureDefaultAdmin, DB_PATH };
