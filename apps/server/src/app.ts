import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import meetingRoutes from "./routes/meeting.routes";

const app = express();
app.use(cors(
    {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    }
));
app.use(cookieParser());
app.use(
  express.json({
    limit: "15mb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "15mb",
  })
);

app.get("/", (req, res) => {
    res.send("Hello from the server!");
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/meetings", meetingRoutes);

app.use((err: any, req: express.Request, res: express.Response) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

export default app;
