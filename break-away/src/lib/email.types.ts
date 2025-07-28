export interface EmailRecipient {
  name: string;
  address: string;
}

export interface EmailPayload {
  /** From address + name */
  from: { email: string; name: string };
  /** One or more recipients */
  to: EmailRecipient[];
  /** (Mailjet-only) Optional custom headers */
  headers?: Record<string, unknown>;
  /** (Mailjet-only) Cc recipients */
  cc?: EmailRecipient[];
  /** (Mailjet-only) Bcc recipients */
  bcc?: EmailRecipient[];
  /** Subject line */
  subject: string;
  /** Plain‐text body */
  text: string;
  /** HTML body */
  html?: string;
  /** (Mailjet-only) CustomID field */
  customID?: string;
}