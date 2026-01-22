const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

let comments = [];

io.on("connection", socket => {

  // kirim komentar awal
  socket.emit("init", comments);

  // komentar baru
  socket.on("comment", data => {
    const c = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      message: data.message,
      level: data.level || "NPC"
    };
    comments.push(c);
    io.emit("comment", c);
  });

  // hapus komentar (admin)
  socket.on("delete", id => {
    comments = comments.filter(c => c.id !== id);
    io.emit("delete", id);
  });

  // set level / badge
  socket.on("setLevel", ({ email, level }) => {
    comments.forEach(c => {
      if (c.email === email) c.level = level;
    });
    io.emit("update", comments);
  });

});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log("SERVER RUN", PORT));
