const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 🔐 ADMIN EMAIL (UBAH SESUAI KAMU)
const ADMINS = [
  "admin@gmail.com",
  "owner@gmail.com"
];

let comments = [];

function getLevel(count) {
  if (count >= 10000) return "👑 Emperor";
  if (count >= 5000) return "👑 King";
  if (count >= 3000) return "⚔️ Archduke";
  if (count >= 1000) return "🗡️ Duke";
  if (count >= 500) return "🎩 Marquess";
  if (count >= 200) return "🧙 Earl";
  if (count >= 50) return "🗡️ Knight";
  return "🙂 NPC";
}

io.on("connection", socket => {
  socket.emit("init", comments);

  socket.on("comment", data => {
    const userComments = comments.filter(c => c.email === data.email).length + 1;

    const c = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      message: data.message,
      level: ADMINS.includes(data.email)
        ? "🛡️ Admin"
        : getLevel(userComments)
    };

    comments.push(c);
    io.emit("comment", c);
  });

  // ❌ DELETE COMMENT (ADMIN ONLY)
  socket.on("delete", ({ id, email }) => {
    if (!ADMINS.includes(email)) return;
    comments = comments.filter(c => c.id !== id);
    io.emit("delete", id);
  });

  // 🏷️ SET TITLE MANUAL (ADMIN ONLY)
  socket.on("setLevel", ({ targetEmail, level, adminEmail }) => {
    if (!ADMINS.includes(adminEmail)) return;
    comments.forEach(c => {
      if (c.email === targetEmail) c.level = level;
    });
    io.emit("update", comments);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log("SERVER RUN", PORT));
