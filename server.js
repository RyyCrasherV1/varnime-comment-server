const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const users = {}; // RAM STORAGE

const LEVELS = [
  { min: 0, title: "NPC" },
  { min: 50, title: "Knight ⚔️" },
  { min: 200, title: "Earl 🧙" },
  { min: 500, title: "Marquess 🧑‍💼" },
  { min: 1000, title: "Duke 🏹" },
  { min: 3000, title: "Archduke ⚔️⚔️" },
  { min: 5000, title: "King 👑" },
  { min: 10000, title: "Emperor 👑🔥" }
];

const ADMINS = ["admin"];
const OWNERS = ["owner"];

function getAutoTitle(count) {
  let title = "NPC";
  for (const lvl of LEVELS) {
    if (count >= lvl.min) title = lvl.title;
  }
  return title;
}

io.on("connection", (socket) => {
  socket.on("comment", (data) => {
    const name = data.user.toLowerCase();

    if (!users[name]) {
      users[name] = {
        count: 0,
        manualTitle: null
      };
    }

    users[name].count++;

    let role = "User";
    if (OWNERS.includes(name)) role = "Owner 👑";
    else if (ADMINS.includes(name)) role = "Admin 🛡️";

    const autoTitle = getAutoTitle(users[name].count);
    const title = users[name].manualTitle || autoTitle;

    io.emit("comment", {
      user: data.user,
      text: data.text,
      title,
      role
    });
  });

  // ADMIN / OWNER SET TITLE
  socket.on("setTitle", (data) => {
    if (!OWNERS.includes(data.by)) return;

    const target = data.target.toLowerCase();
    if (!users[target]) users[target] = { count: 0 };

    users[target].manualTitle = data.title;

    socket.emit("system", {
      msg: `Title ${data.title} diberikan ke ${data.target}`
    });
  });
});

server.listen(process.env.PORT || 8080);
