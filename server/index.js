const express = require('express'); 
const mongoose = require('mongoose'); 
const dotenv = require('dotenv'); 
const helmet = require('helmet'); 
const morgan = require('morgan');
const multer = require("multer");
const path = require("path");
const cors = require('cors');
//kill
const socketio = require('socket.io');
const http = require('http');

// connect routes
const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postRoute = require("./routes/posts");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");

// app config
const app = express();

// kalakaribegin
const server = http.createServer(app);
const corsOptions={
  cors: true,
  origins:["http://localhost:3000"],
}
const io = socketio(server, corsOptions);
let users = [];

const addUser = (userId, socketId) => {
  if(!users.length || !users.some((user) => user.userId === userId)) {
    users.push({ userId, socketId });
    console.log(users);
  }
}

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  // when user connects
  console.log("user connected");

  // take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  })

  // send and get message
  socket.on("sendMessage", ({senderProfile, senderId, receiverId, text}) => {
    const user = getUser(receiverId);
    user && io.to(user.socketId).emit("getMessage", {
      senderProfile,
      senderId,
      text,
    })
  })

  // when user disconnects
  socket.on("disconnect", () => {
    console.log("user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  })
})
// kalakariend

dotenv.config();
const PORT = process.env.PORT || 5000;

// connect to mongodb
mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true, 
	useUnifiedTopology: true,
	useCreateIndex: true,
	useFindAndModify: false
})
.then(console.log('Connected to MongoDB'))
.catch((err) => console.log(err));

// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());

app.use("/images", express.static(path.join(__dirname, "public/images")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploded successfully");
  } catch (error) {
    console.error(error);
  }
});

app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);

app.get("/api", (req, res) => {
  res.send('Hello to Seaborg API')
})

server.listen(PORT, ()=> {
	console.log(`Server is running at http://localhost:${PORT}`);
})
