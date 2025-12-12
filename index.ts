import type { Request, Response } from "express";
import express from "express";
import cors, { type CorsOptions } from "cors";
import { createServer } from "http";
import { config } from "dotenv";
import { connectDB } from "./DB/connectDB";
import { authRouter } from "./routes/authRouter";
import { authMiddleware } from "./middleware/auth";
import { helpRequestRouter } from "./routes/helpRouter";
import { documentRouter } from "./routes/documentRouter";
import { sessionRouter } from "./routes/sessionRouter";
import { Server } from "socket.io";

config({ path: "./.env" });

const app = express();
const httpServer = createServer(app);

app.use(express.json({ limit: "500mb" }));

// CORS
const whiteList = ["http://localhost:3000", "https://martins100-tmd.github.io"];
const corsOption: CorsOptions = {
    origin(origin, callback) {
        if (!origin || whiteList.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS blocked origin " + origin));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOption));

// Routers
app.use("/auth", authRouter);
app.use("/help", authMiddleware, helpRequestRouter);
app.use("/doc", authMiddleware, documentRouter);
app.use("/session", authMiddleware, sessionRouter);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Server is running with Socket.io!" });
});

// SOCKET.IO
const io = new Server(httpServer, {
    cors: { origin: "*" },
});

io.on("connection", (socket) => {
    console.log("connected:", socket.id);

    socket.on("join-room", (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit("peer-joined", { socketId: socket.id });
    });

    socket.on("signal", ({ roomId, to, data }) => {
        if (to) io.to(to).emit("signal", { from: socket.id, data });
        else socket.to(roomId).emit("signal", { from: socket.id, data });
    });

    socket.on("draw", ({ roomId, data }) => {
        socket.to(roomId).emit("draw", data);
    });

    socket.on("clear-board", (roomId) => {
        socket.to(roomId).emit("clear-board");
    });

    socket.on("disconnect", () => {
        console.log("disconnected:", socket.id);
    });
});

// SERVER START
const PORT = process.env.PORT || 3000;

await connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log("Server + Socket.io running on", PORT);
    });
});
