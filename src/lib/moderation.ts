/**
 * Content moderation for chat messages.
 *
 * Blocks personal contact information to keep all communication on-platform:
 *  - Email addresses
 *  - Phone numbers (international and local formats)
 */

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

// Matches any email address
const EMAIL_PATTERN = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/i;

// Covers common phone formats:
//  +44 7911 123456 | +34 612 345 678 | (123) 456-7890 | 07911123456
//  Requires at least 7 digits to avoid false positives on short numbers.
const PHONE_PATTERN =
  /(\+?\d[\s\-.]?){7,15}\d|(\(\d{2,4}\)[\s\-.]?\d{3,4}[\s\-.]?\d{3,4})/;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type ViolationType = "email" | "phone";

export interface ModerationResult {
  blocked: false;
}

export interface ModerationViolation {
  blocked: true;
  type: ViolationType;
  reason: string;
}

export function moderateMessage(content: string): ModerationResult | ModerationViolation {
  if (EMAIL_PATTERN.test(content)) {
    return {
      blocked: true,
      type: "email",
      reason:
        "Sharing email addresses is not allowed. Please keep all communication within the platform.",
    };
  }

  if (PHONE_PATTERN.test(content)) {
    return {
      blocked: true,
      type: "phone",
      reason:
        "Sharing phone numbers is not allowed. Please keep all communication within the platform.",
    };
  }

  return { blocked: false };
}
