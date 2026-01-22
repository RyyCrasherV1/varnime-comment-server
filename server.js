const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// ===== DATA MEMORY (NO DB)
const users = {};
const comments = {}; // per episode

// ===== ROLE TOKEN (GANTI SENDIRI)
const OWNER_TOKEN = "OWNER123";
const ADMIN_TOKEN = "ADMIN123";

// ===== LEVEL SYSTEM
const levels = [
  { min: 0, name: "NPC", icon: "🙂" },
  { min: 10, name: "Knight", icon: "⚔️" },
  { min: 50, name: "Earl", icon: "🧙" },
  { min: 150, name: "Duke", icon: "🎩" },
  { min: 500, name: "King", icon: "👑" },
  { min: 1000, name: "Emperor", icon: "🔥👑" }
];

function getLevel(count) {
  return [...levels].reverse().find(l => count >= l.min);
}

io.on("connection", socket => {

  socket.on("login", ({ username, episodeId, token }) => {
    let role = "USER";
    let badge = "";

    if (token === OWNER_TOKEN) {
      role = "OWNER";
      badge = "💀👑";
    } else if (token === ADMIN_TOKEN) {
      role = "ADMIN";
      badge = "🛡️";
    }

    users[socket.id] = {
      username,
      role,
      badge,
      count: 0,
      episodeId
    };

    if (!comments[episodeId]) comments[episodeId] = [];
  });

  socket.on("comment", text => {
    const user = users[socket.id];
    if (!user) return;

    user.count++;

    const level = getLevel(user.count);
    const data = {
      user: user.username,
      role: user.role === "USER" ? level.name : user.role,
      icon: user.role === "USER" ? level.icon : user.badge,
      text
    };

    comments[user.episodeId].push(data);

    io.emit("comment", {
      episodeId: user.episodeId,
      ...data
    });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
  });
});

server.listen(process.env.PORT || 3000);
