import { Router } from "express";
import { z } from "zod";
import {
  getOrCreateSession,
  saveWebhook,
  updateStatus,
  serverValidate,
  pickVerificationData,
  getSessionByReference,
  getUserSessions,
  getWebhookByReference,
} from "../services/kyc.service.js";

const router = Router();

/**
 * POST /kyc/session
 * Create or get existing KYC session
 */
router.post("/session", async (req, res) => {
  try {
    console.log("📥 Received session request:", req.body);

    const schema = z.object({
      userId: z.string(),
      email: z.string().email().optional(),
      locale: z.string().optional(),
      country: z.string().optional(),
    });
    const input = schema.parse(req.body);

    console.log("✅ Validated input:", input);

    const rec = await getOrCreateSession(input);

    console.log("✅ Session created/retrieved:", {
      reference: rec.reference,
      iframeUrl: rec.iframeUrl,
      status: rec.status,
      runsCount: rec.runsCount,
    });

    const response = {
      ok: true,
      reference: rec.reference,
      iframeUrl: rec.iframeUrl,
      status: rec.status,
      runsCount: rec.runsCount,
    };

    console.log("📤 Sending response:", response);

    res.json(response);
  } catch (e: any) {
    console.error("❌ Session creation error:", e);
    res.status(400).json({ ok: false, error: e.message ?? "bad_request" });
  }
});

/**
 * POST /kyc/webhook
 * Receive webhook from Shufti Pro
 * NOTE: Signature verification varies by account; placeholder for now
 */
router.post("/webhook", async (req, res) => {
  try {
    console.log("🔔 Webhook received from Shufti Pro:");
    console.log("Headers:", req.headers);
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const raw = JSON.stringify(req.body);
    const reference =
      req.body?.reference ?? req.body?.reference_id ?? "unknown";

    console.log("📋 Reference ID:", reference);

    // TODO: Implement signature verification based on client's account settings
    const signatureValid = true;

    await saveWebhook({ rawPayload: raw, signatureValid, reference });

    console.log("💾 Webhook saved to database");

    // Parse status
    const result = req.body?.event ?? req.body?.verification_status ?? "";
    let status = "pending";

    if (/accept/i.test(result)) {
      status = "accepted";
    } else if (/declin/i.test(result)) {
      status = "declined";
    } else if (/review/i.test(result)) {
      status = "review";
    } else if (/expired/i.test(result)) {
      status = "expired";
    }

    console.log("📊 Parsed status:", { result, status });

    // Update session if reference is valid
    if (reference !== "unknown") {
      console.log("🔄 Updating session status to:", status);
      await updateStatus(reference, status as any);
      console.log("✅ Session status updated");
    }

    console.log("📤 Webhook response: { ok: true }");
    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("❌ Webhook error:", e);
    res.status(400).json({ ok: false, error: e.message });
  }
});

/**
 * GET /kyc/status/:reference
 * Server-side status validation via Shufti API
 */
router.get("/status/:reference", async (req, res) => {
  try {
    console.log(
      "🔍 Status check requested for reference:",
      req.params.reference
    );
    const out = await serverValidate(req.params.reference);
    console.log("📊 Status check result:", out);
    res.status(out.success ? 200 : 400).json(out);
  } catch (e: any) {
    console.error("❌ Status check error:", e);
    res.status(400).json({ ok: false, error: e.message });
  }
});

/**
 * GET /kyc/session/:reference
 * Get session details from database
 */
router.get("/session/:reference", async (req, res) => {
  try {
    const session = await getSessionByReference(req.params.reference);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }
    res.json({ ok: true, session });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

/**
 * GET /kyc/user/:userId/sessions
 * Get all sessions for a user
 */
router.get("/user/:userId/sessions", async (req, res) => {
  try {
    const sessions = await getUserSessions(req.params.userId);
    res.json({ ok: true, sessions });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

/**
 * POST /kyc/admin/override
 * Admin endpoint to manually override session status
 */
router.post("/admin/override", async (req, res) => {
  try {
    const schema = z.object({
      reference: z.string(),
      status: z.enum(["pending", "accepted", "declined", "review", "expired"]),
    });
    const input = schema.parse(req.body);
    await updateStatus(input.reference, input.status);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

/**
 * POST /kyc/debug/extract
 * Debug endpoint to parse verification data from payload
 */
router.post("/debug/extract", (req, res) => {
  try {
    const data = pickVerificationData(req.body);
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

/**
 * GET /kyc/webhook/:reference
 * Get webhook data for a reference
 */
router.get("/webhook/:reference", async (req, res) => {
  try {
    const webhook = await getWebhookByReference(req.params.reference);
    if (!webhook) {
      return res.status(404).json({ ok: false, error: "Webhook not found" });
    }
    res.json({ ok: true, webhook });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

export default router;
