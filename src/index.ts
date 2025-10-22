import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { CONFIG } from "./config.js";
import kycRoutes from "./routes/kyc.js";

const app = express();

// Security & logging middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ type: "*/*", limit: "2mb" }));
app.use(morgan("tiny"));

// Routes
app.use("/kyc", kycRoutes);

// Health check
app.get("/health", (_, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    env: CONFIG.NODE_ENV,
  });
});

// 404 handler
app.use((_, res) => {
  res.status(404).json({ ok: false, error: "Not found" });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
);

// Start server
app.listen(CONFIG.PORT, () => {
  console.log("=================================");
  console.log(`🚀 KYC Server running on port ${CONFIG.PORT}`);
  console.log(`📍 Environment: ${CONFIG.NODE_ENV}`);
  console.log(`🔗 Webhook URL: ${CONFIG.CALLBACK_URL}`);
  console.log(`🛡️  Max runs per user: ${CONFIG.MAX_IFRAME_RUNS}`);
  console.log("=================================");
});
