export type KycStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "review"
  | "expired";

export interface CreateSessionInput {
  userId: string;
  email?: string;
  locale?: string;
  country?: string;
}

export interface VerificationData {
  first_name: string;
  last_name: string;
  full_name: string;
  country: string;
}
