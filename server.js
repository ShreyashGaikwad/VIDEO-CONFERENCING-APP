const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();
const http = require("http");
const server = http.createServer(app);

const cors = require("cors");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.use(cors());

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("message", ({ user, text }) => {
      io.to(roomId).emit("createMessage", { user, text });
    });
  });
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
