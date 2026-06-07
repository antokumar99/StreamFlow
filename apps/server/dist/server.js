"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// import User from "./models/User.model";
dotenv_1.default.config();
// import app from "./app";
const db_1 = require("./config/db");
const socket_1 = __importDefault(require("./config/socket"));
const startServer = async () => {
    await (0, db_1.connectDB)();
    // app.listen(process.env.PORT, () => {
    //     console.log(`Server is running on port ${process.env.PORT}`);
    // });
    socket_1.default.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
};
startServer();
