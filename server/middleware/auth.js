const jwt = require("jsonwebtoken");

// Admin panelning himoyalangan endpointlarini tekshiradi.
// Frontend har bir so'rovga "Authorization: Bearer <token>" headerini qo'shishi kerak.
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Avtorizatsiyadan o'tilmagan. Iltimos, tizimga kiring." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { id, username }
    next();
  } catch {
    return res.status(401).json({ message: "Token yaroqsiz yoki muddati tugagan." });
  }
}

module.exports = { requireAuth };
