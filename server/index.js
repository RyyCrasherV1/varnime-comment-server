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

  socket.emit("init", comments);

  socket.on("comment", data => {
    const c = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      message: data.message,
      level: data.level || "User"
    };
    comments.push(c);
    io.emit("comment", c);
  });

  socket.on("delete", id => {
    comments = comments.filter(c => c.id !== id);
    io.emit("delete", id);
  });

  socket.on("setLevel", ({ email, level }) => {
    comments.forEach(c => {
      if (c.email === email) c.level = level;
    });
    io.emit("update", comments);
  });

});

server.listen(8080, () => console.log("SERVER RUN 8080"));
