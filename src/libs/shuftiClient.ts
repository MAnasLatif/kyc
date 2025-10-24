import axios from "axios";
import { CONFIG } from "../config.js";

const api = axios.create({
  baseURL: CONFIG.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Get status of a verification session
 */
export async function getStatus(reference: string) {
  try {
    const { data, status } = await api.post(
      "/status",
      { reference },
      {
        auth: {
          username: CONFIG.CLIENT_ID,
          password: CONFIG.SECRET_KEY,
        },
      }
    );
    return { success: status === 200, status_code: status, response: data };
  } catch (error: any) {
    return {
      success: false,
      status_code: error.response?.status ?? 500,
      response: error.response?.data ?? { message: error.message },
    };
  }
}

/**
 * Create verification session with Face + Documents
 * - supported_types: id_card, passport, driving_license
 * - face block enables biometric + document face match
 */
export async function createVerificationSession(params: {
  reference: string;
  email?: string;
  appLocale?: string;
  userCountry?: string;
  callbackUrl: string;
  redirectUrl?: string;
}) {
  try {
    // Append reference to redirect URL
    let finalRedirectUrl = params.redirectUrl;
    if (finalRedirectUrl) {
      const separator = finalRedirectUrl.includes("?") ? "&" : "?";
      finalRedirectUrl = `${finalRedirectUrl}${separator}reference=${params.reference}`;
    }

    const payload = {
      reference: params.reference,
      email: params.email,
      country: params.userCountry, // optional
      language: params.appLocale ?? "en",
      callback_url: params.callbackUrl,
      redirect_url: finalRedirectUrl,
      // Document services
      document: {
        supported_types: ["id_card", "passport", "driving_license"],
        name: "",
        dob: "",
        document_number: "",
        expiry_date: "",
        issue_date: "",
        fetch_enhanced_data: "1",
      },
      // Face (biometric) + doc match
      face: {
        proof: "",
      },
      // Optional UX tuning:
      verification_mode: "any",
      show_consent: 1,
      show_results: 1,
      show_privacy_policy: 1,
    };

    console.log("📤 Sending Shufti Pro request:", {
      url: CONFIG.API_URL,
      reference: params.reference,
      email: params.email,
      country: params.userCountry,
      payload: JSON.stringify(payload, null, 2),
    });

    // Send request with credentials in body (Shufti Pro V2 API format)
    const { data, status } = await api.post("/", payload, {
      auth: {
        username: CONFIG.CLIENT_ID,
        password: CONFIG.SECRET_KEY,
      },
    });

    console.log("📥 Shufti Pro response:", {
      status,
      fullData: data,
    });

    // Check if response indicates an error
    if (data.error || data.message === "INVALID") {
      console.error("❌ Shufti Pro returned error:", data);
      return {
        success: false,
        response: data,
      };
    }

    return { success: status === 200, response: data };
  } catch (error: any) {
    console.error("❌ Shufti Pro error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return {
      success: false,
      response: error.response?.data ?? { message: error.message },
    };
  }
}

/**
 * Extract verification data (PHP parity)
 * Parses name and country from Shufti response
 */
export function extractVerificationData(shuftiResponse: any) {
  const doc = shuftiResponse?.response?.verification_data?.document ?? {};
  const nameData = doc.name ?? {};
  let first_name: string | null = nameData.first_name ?? null;
  let last_name: string | null = nameData.last_name ?? null;
  const full_name: string = nameData.full_name ?? "";

  // Fallback: split full_name if first/last not available
  if (!first_name || !last_name) {
    const cleaned = full_name.replace(/\s+/g, " ").trim();
    const parts = cleaned ? cleaned.split(" ") : [];
    if (parts.length === 1) {
      first_name = first_name ?? parts[0];
      last_name = last_name ?? "";
    } else if (parts.length >= 2) {
      first_name = first_name ?? parts.shift()!;
      last_name = last_name ?? parts.join(" ");
    }
  }

  const verification_country = doc.country ?? "";

  return {
    first_name: first_name ?? "",
    last_name: last_name ?? "",
    full_name,
    country: verification_country,
  };
}
