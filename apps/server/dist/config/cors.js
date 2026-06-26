"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = exports.allowedOrigins = void 0;
const DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    process.env.CLIENT_URL || "",
];
const parseOrigins = (value) => value
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
exports.allowedOrigins = Array.from(new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...parseOrigins(process.env.CLIENT_URL),
    ...parseOrigins(process.env.CLIENT_URLS),
]));
exports.corsOptions = {
    origin(origin, callback) {
        if (!origin || exports.allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
};
