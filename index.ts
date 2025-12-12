import type { Request, Response } from "express";
import express from "express";
import cors, { type CorsOptions } from "cors";
import { createServer } from "http";
import { config } from "dotenv";
import { connectDB } from "./DB/connectDB";
import { authRouter } from "./routes/authRouter";
config({ path: "./.env" });

const app = express();
const httpServer = createServer(app);
app.use(express.json({ limit: "500mb" }));
app.set("port", 3000);

const whiteList = ["http://localhost:3000"];
const corsOption: CorsOptions = {
    origin: function (origin, callback) {
        if (!origin || whiteList.indexOf(origin) != -1) {
            callback(null, true);
            return;
        } else {
            callback(new Error("CORS blocked origin " + origin));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}
app.use(cors(corsOption))


app.use("/auth", authRouter);
app.get("/", async (req: Request, res: Response) => {
    res.status(200).json({ message: "Server is running!" })
});

const Port = process.env.PORT;
await connectDB().then(() => {
    httpServer.listen(Port, () => {
        console.log("Server is running");
    })
})
