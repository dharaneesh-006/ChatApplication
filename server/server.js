import express from "express";
import "dotenv/config"
import cors from "cors"
import http from "http"
import { connectDB } from "./lib/db.js ";
import userRouter from "./routes/userRoutes.js"
import messageRouter from "./routes/mesageRoutes.js";
import { Server } from "socket.io";


// Express and http setup

const app = express();
const server = http.createServer(app);

//initialize socket
export const io = new Server(server,{
    cors:{origin:"*"}
});

//Store Online Users

export const userSocketMap = {}; //{userId : socketId}

// Socket.io connection handle

io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId)
        userSocketMap[userId] = socket.id;

    //Emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User Disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})


// Middleware setup

app.use(express.json({limit:"4mb"}));
app.use(cors());

//Route Setup
app.use("/api/status",(req,res)=> res.send("Server is live") )
app.use("/api/auth", userRouter);
app.use("/api/messages",messageRouter)


//connection to MongoDb

await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, ()=>console.log("Server is running on PORT :" + PORT));