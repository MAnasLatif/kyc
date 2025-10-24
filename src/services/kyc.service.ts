import { PrismaClient } from "@prisma/client";
import { CONFIG } from "../config.js";
import {
  createVerificationSession,
  getStatus,
  extractVerificationData,
} from "../libs/shuftiClient.js";
import { RunsCounter } from "../utils/rateLimit.js";
import type { KycStatus } from "../types/index.js";

const prisma = new PrismaClient();
const runsCounter = new RunsCounter(CONFIG.MAX_IFRAME_RUNS);

/**
 * Get or create KYC session for user
 * - If accepted session exists, return it
 * - Otherwise create new session (with cost guard)
 */
export async function getOrCreateSession(opts: {
  userId: string;
  email?: string;
  locale?: string;
  country?: string;
}) {
  // 1) Check if user has accepted session
  const latest = await prisma.kycSession.findFirst({
    where: { userId: opts.userId },
    orderBy: { createdAt: "desc" },
  });

  if (latest?.status === "accepted") {
    return latest;
  }

  // 2) Create new session (check runs limit first)
  const currentRuns = runsCounter.get(opts.userId);
  if (currentRuns >= CONFIG.MAX_IFRAME_RUNS) {
    throw new Error(
      `Runs limit (${CONFIG.MAX_IFRAME_RUNS}) reached for user: ${opts.userId}`
    );
  }

  const reference = `ref-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  const { success, response } = await createVerificationSession({
    reference,
    email: opts.email,
    appLocale: opts.locale,
    userCountry: opts.country,
    callbackUrl: CONFIG.CALLBACK_URL,
    redirectUrl: CONFIG.REDIRECT_URL,
  });

  console.log("🔍 Session creation result:", { success, response });

  if (!success) {
    const errorMsg =
      response?.message || response?.error?.message || JSON.stringify(response);
    throw new Error("Failed to create Shufti session: " + errorMsg);
  }

  const iframeUrl: string =
    response?.verification_url ?? response?.redirect_url ?? "";

  console.log("🔗 Extracted verification URL:", iframeUrl);

  if (!iframeUrl) {
    throw new Error(
      "No verification URL returned from Shufti. Response: " +
        JSON.stringify(response)
    );
  }

  // Increment counter
  const newRunCount = runsCounter.inc(opts.userId);

  // Ensure user exists
  await prisma.user.upsert({
    where: { id: opts.userId },
    create: { id: opts.userId, email: opts.email },
    update: { email: opts.email },
  });

  const rec = await prisma.kycSession.create({
    data: {
      userId: opts.userId,
      reference,
      status: "pending",
      iframeUrl,
      allowedTypes: "id_card,passport,driving_license,face",
      runsCount: newRunCount,
      ttlSeconds: 300,
    },
  });

  return rec;
}

/**
 * Save webhook payload to database
 */
export async function saveWebhook(opts: {
  rawPayload: string;
  signatureValid: boolean;
  reference: string;
}) {
  await prisma.kycWebhook.create({
    data: {
      rawPayload: opts.rawPayload,
      signatureValid: opts.signatureValid,
      reference: opts.reference,
    },
  });
}

/**
 * Update KYC session status
 */
export async function updateStatus(reference: string, status: KycStatus) {
  await prisma.kycSession.update({
    where: { reference },
    data: { status },
  });
}

/**
 * Server-side status validation via Shufti API
 */
export async function serverValidate(reference: string) {
  return await getStatus(reference);
}

/**
 * Parse verification data from webhook/response
 */
export function pickVerificationData(body: any) {
  return extractVerificationData(body);
}

/**
 * Get session by reference
 */
export async function getSessionByReference(reference: string) {
  return await prisma.kycSession.findUnique({
    where: { reference },
    include: { user: true },
  });
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(userId: string) {
  return await prisma.kycSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get webhook by reference
 */
export async function getWebhookByReference(reference: string) {
  return await prisma.kycWebhook.findFirst({
    where: { reference },
    orderBy: { receivedAt: "desc" },
  });
}
