import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";

const app = express();
app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true,
    }
));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello from the server!");
});

app.use("/api/auth", authRoutes);

app.use((err: any, req: express.Request, res: express.Response) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

export default app;