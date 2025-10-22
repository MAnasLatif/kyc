import "dotenv/config";

export const CONFIG = {
  PORT: Number(process.env.PORT ?? 3000),
  CLIENT_ID: process.env.SHUFTI_CLIENT_ID ?? "",
  SECRET_KEY: process.env.SHUFTI_SECRET_KEY ?? "",
  API_URL: "https://api.shuftipro.com/",
  CALLBACK_URL: process.env.KYC_WEBHOOK_URL ?? "",
  REDIRECT_URL: process.env.KYC_REDIRECT_URL ?? "",
  MAX_IFRAME_RUNS: Number(process.env.MAX_IFRAME_RUNS ?? 10),
  NODE_ENV: process.env.NODE_ENV ?? "development",
};
