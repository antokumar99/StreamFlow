import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { corsOptions } from "./config/cors";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.routes";
import meetingRoutes from "./routes/meeting.routes";
import notificationRoutes from "./routes/notification.routes";

const app = express();
app.use(cors(corsOptions));
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
app.use("/api/notifications", notificationRoutes);

app.use((err: any, req: express.Request, res: express.Response) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

export default app;
