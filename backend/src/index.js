// Packages
import express from "express";
import "dotenv/config";

// Files
import authRoutes from "./routes/auth.routes.js";

const PORT = process.env.PORT || 3000;
const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`Server is Running on Port: ${PORT}`));
