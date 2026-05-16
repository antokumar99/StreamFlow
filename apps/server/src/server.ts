import dotenv from "dotenv";
// import User from "./models/User.model";
dotenv.config();


// import app from "./app";
import { connectDB } from "./config/db";
import server from "./config/socket";

const startServer = async () =>
{
    await connectDB();
    // app.listen(process.env.PORT, () => {
    //     console.log(`Server is running on port ${process.env.PORT}`);
    // });
    server.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
};

startServer();

