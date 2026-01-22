const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

/* =====================
   🔐 ADMIN EMAIL
===================== */
const ADMINS = [
  "ryyxiaoyan@gmail.com",
  "youkaze1@gmail.com"
];

/* =====================
   💬 DATA KOMENTAR
===================== */
let comments = [];

/* =====================
   🏆 AUTO LEVEL
===================== */
function getLevel(count) {
  if (count >= 10000) return "👑 Emperor";
  if (count >= 5000)  return "👑 King";
  if (count >= 3000)  return "🔥 Archduke";
  if (count >= 1000)  return "⚔ Duke";
  if (count >= 500)   return "🎖 Marquess";
  if (count >= 200)   return "🎓 Earl";
  if (count >= 50)    return "🛡 Knight";
  return "👤 NPC";
}

/* =====================
   🔌 SOCKET
===================== */
io.on("connection", socket => {

  // kirim semua komentar saat connect
  socket.emit("init", comments);

  /* ===== TAMBAH KOMENTAR ===== */
  socket.on("comment", data => {
    const totalUserComment =
      comments.filter(c => c.email === data.email).length + 1;

    const comment = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      message: data.message,
      title: ADMINS.includes(data.email)
        ? "👑 Admin"
        : getLevel(totalUserComment)
    };

    comments.push(comment);
    io.emit("comment", comment);
  });

  /* ===== DELETE KOMENTAR (ADMIN ONLY) ===== */
  socket.on("delete", ({ id, adminEmail }) => {
    if (!ADMINS.includes(adminEmail)) return;

    comments = comments.filter(c => c.id !== id);
    io.emit("delete", id);
  });

  /* ===== SET TITLE MANUAL (ADMIN ONLY) ===== */
  socket.on("setTitle", ({ targetEmail, title, adminEmail }) => {
    if (!ADMINS.includes(adminEmail)) return;

    comments.forEach(c => {
      if (c.email === targetEmail) {
        c.title = title;
      }
    });

    io.emit("update", comments);
  });
});

/* =====================
   🚀 RUN SERVER
===================== */
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log("SERVER RUN ON PORT", PORT);
});
