import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "FashionsDen <noreply@fashionsden.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const APP_NAME = "FashionsDen";

// ─── Verification Email ─────────────────────────────────────────────
export async function sendVerificationEmail(to: string, token: string, locale: string = "es") {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  const subjects: Record<string, string> = {
    es: "Confirma tu cuenta en FashionsDen",
    en: "Confirm your FashionsDen account",
    fr: "Confirmez votre compte FashionsDen",
  };

  const resend = getResend();
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: subjects[locale] || subjects.es,
    html: verificationEmailHtml(verifyUrl, locale),
  });
}

// ─── Password Reset Email ───────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, token: string, locale: string = "es") {
  const resetUrl = `${APP_URL}/${locale}/reset-password?token=${token}`;

  const subjects: Record<string, string> = {
    es: "Restablece tu contraseña — FashionsDen",
    en: "Reset your password — FashionsDen",
    fr: "Réinitialisez votre mot de passe — FashionsDen",
  };

  const resend = getResend();
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: subjects[locale] || subjects.es,
    html: passwordResetEmailHtml(resetUrl, locale),
  });
}

// ─── HTML Templates ─────────────────────────────────────────────────

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
        <tr><td style="background:#1a1a2e;padding:24px 32px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700">${APP_NAME}</h1>
        </td></tr>
        <tr><td style="padding:32px">${content}</td></tr>
        <tr><td style="padding:16px 32px 24px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:12px;color:#9ca3af">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function verificationEmailHtml(verifyUrl: string, locale: string): string {
  const i18n: Record<string, { title: string; body: string; cta: string; expire: string; ignore: string }> = {
    es: {
      title: "Confirma tu correo electrónico",
      body: "Gracias por registrarte en FashionsDen. Haz clic en el botón para verificar tu cuenta:",
      cta: "Verificar mi cuenta",
      expire: "Este enlace expira en 24 horas.",
      ignore: "Si no creaste esta cuenta, puedes ignorar este correo.",
    },
    en: {
      title: "Confirm your email",
      body: "Thanks for signing up at FashionsDen. Click the button below to verify your account:",
      cta: "Verify my account",
      expire: "This link expires in 24 hours.",
      ignore: "If you didn't create this account, you can ignore this email.",
    },
    fr: {
      title: "Confirmez votre adresse e-mail",
      body: "Merci de vous être inscrit sur FashionsDen. Cliquez sur le bouton pour vérifier votre compte :",
      cta: "Vérifier mon compte",
      expire: "Ce lien expire dans 24 heures.",
      ignore: "Si vous n'avez pas créé ce compte, ignorez cet e-mail.",
    },
  };
  const t = i18n[locale] || i18n.es;

  return baseLayout(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a2e">${t.title}</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6">${t.body}</p>
    <div style="text-align:center;margin:0 0 24px">
      <a href="${verifyUrl}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none">${t.cta}</a>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#9ca3af">${t.expire}</p>
    <p style="margin:0;font-size:13px;color:#9ca3af">${t.ignore}</p>
  `);
}

function passwordResetEmailHtml(resetUrl: string, locale: string): string {
  const i18n: Record<string, { title: string; body: string; cta: string; expire: string; ignore: string }> = {
    es: {
      title: "Restablece tu contraseña",
      body: "Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para crear una nueva:",
      cta: "Restablecer contraseña",
      expire: "Este enlace expira en 1 hora.",
      ignore: "Si no solicitaste esto, puedes ignorar este correo. Tu contraseña no cambiará.",
    },
    en: {
      title: "Reset your password",
      body: "We received a request to reset your password. Click the button below to create a new one:",
      cta: "Reset password",
      expire: "This link expires in 1 hour.",
      ignore: "If you didn't request this, you can ignore this email. Your password won't change.",
    },
    fr: {
      title: "Réinitialisez votre mot de passe",
      body: "Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton pour en créer un nouveau :",
      cta: "Réinitialiser le mot de passe",
      expire: "Ce lien expire dans 1 heure.",
      ignore: "Si vous n'avez pas demandé cela, ignorez cet e-mail. Votre mot de passe ne changera pas.",
    },
  };
  const t = i18n[locale] || i18n.es;

  return baseLayout(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a2e">${t.title}</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6">${t.body}</p>
    <div style="text-align:center;margin:0 0 24px">
      <a href="${resetUrl}" style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none">${t.cta}</a>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#9ca3af">${t.expire}</p>
    <p style="margin:0;font-size:13px;color:#9ca3af">${t.ignore}</p>
  `);
}
