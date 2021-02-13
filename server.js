const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const rooms = {};

io.on("connection", socket => {
  console.log("Connection")
  socket.on("join room", roomID => {
    if (rooms[roomID]) {
      rooms[roomID].push(socket.id);
    } else {
      rooms[roomID] = [socket.id];
    }
    console.log(`${socket.id} joined the room`);
    const otherUser = rooms[roomID].find(id => id !== socket.id);
    if (otherUser) {
      socket.emit("other user", otherUser);
      socket.to(otherUser).emit("user joined", socket.id);
    }
  });

  socket.on("offer", payload => {
    console.log("Offer");
    io.to(payload.target).emit("offer", payload);
  });

  socket.on("answer", payload => {
    console.log("Answer")
    io.to(payload.target).emit("answer", payload);
  });

  socket.on("ice-candidate", incoming => {
    io.to(incoming.target).emit("ice-candidate", incoming.candidate);
  });
  console.log(socket.id)

  socket.on("close", roomId => {

    console.log(`${socket.id} left the room`);

    try {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);

      if (!rooms[roomId].length) {
        rooms[roomId] = undefined;
      }
    } catch (e) {
      console.log("No rooms availables");
    }

  });
});


server.listen(8000,  () => console.log('server is running on port 8000'));