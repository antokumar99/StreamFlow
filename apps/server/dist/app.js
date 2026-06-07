"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const meeting_routes_1 = __importDefault(require("./routes/meeting.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({
    limit: "15mb",
}));
app.use(express_1.default.urlencoded({
    extended: true,
    limit: "15mb",
}));
app.get("/", (req, res) => {
    res.send("Hello from the server!");
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/chats", chat_routes_1.default);
app.use("/api/meetings", meeting_routes_1.default);
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});
exports.default = app;
