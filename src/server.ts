import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import testRoutes from "./routes/test.routes";
import resultRoutes from "./routes/result.routes";
import userRoutes from "./routes/user.routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
