import "dotenv/config";

export const CONFIG = {
  PORT: Number(process.env.PORT ?? 3000),
  CLIENT_ID: (process.env.SHUFTI_CLIENT_ID ?? "").trim(),
  SECRET_KEY: (process.env.SHUFTI_SECRET_KEY ?? "").trim(),
  API_URL: "https://api.shuftipro.com/",
  CALLBACK_URL: process.env.KYC_WEBHOOK_URL ?? "",
  REDIRECT_URL: process.env.KYC_REDIRECT_URL ?? "",
  MAX_IFRAME_RUNS: Number(process.env.MAX_IFRAME_RUNS ?? 10),
  NODE_ENV: process.env.NODE_ENV ?? "development",
};

// Log credential status on startup (without exposing full values)
if (CONFIG.CLIENT_ID && CONFIG.SECRET_KEY) {
  console.log("✅ Shufti Pro credentials loaded");
  console.log(
    `   Client ID: ${CONFIG.CLIENT_ID.substring(0, 8)}... (${
      CONFIG.CLIENT_ID.length
    } chars)`
  );
  console.log(
    `   Secret Key: ${CONFIG.SECRET_KEY.substring(0, 8)}... (${
      CONFIG.SECRET_KEY.length
    } chars)`
  );
} else {
  console.error("❌ Shufti Pro credentials missing!");
}
