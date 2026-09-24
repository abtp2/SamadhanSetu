const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass && user.trim() !== '' && pass.trim() !== '') {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user.trim(),
          pass: pass.trim(),
        },
      });
    }
    return transporter;
  }
  return null;
}

/**
 * Send 6-digit OTP email to user via Gmail SMTP
 * @param {string} toEmail 
 * @param {string} otp 
 * @returns {Promise<{success: boolean, mode: string, message: string}>}
 */
async function sendVerificationOTP(toEmail, otp) {
  const mailer = getTransporter();

  if (mailer) {
    try {
      const info = await mailer.sendMail({
        from: `"SamadhanSetu Jharkhand" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `SamadhanSetu Verification Code: ${otp}`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 540px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
            <div style="background: #0f2c59; padding: 24px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 0.5px;">SamadhanSetu</h1>
              <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 12px;">Govt. of Jharkhand • Department of Higher & Technical Education</p>
            </div>
            <div style="padding: 28px 24px; color: #1e293b;">
              <h2 style="font-size: 18px; margin-top: 0; color: #0f2c59;">Email Verification Code</h2>
              <p style="font-size: 14px; line-height: 22px; color: #475569;">
                Johar! Please use the following 6-digit verification code to activate your account on <strong>SamadhanSetu</strong>:
              </p>
              <div style="margin: 24px 0; text-align: center;">
                <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f2c59; background: #eff6ff; padding: 12px 28px; border-radius: 8px; border: 1.5px dashed #3b82f6;">
                  ${otp}
                </span>
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 20px;">
                ⏱️ This verification code is valid for <strong>10 minutes</strong>. If you did not request this verification, please safely disregard this email.
              </p>
            </div>
            <div style="background: #f8fafc; padding: 14px 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              State Civic Innovation & Grassroots Problem Solving Platform • Govt. of Jharkhand
            </div>
          </div>
        `,
      });

      console.log(`[SMTP] Verification email sent to ${toEmail} (MessageId: ${info.messageId})`);
      return { success: true, mode: 'smtp', message: 'Verification email sent.' };
    } catch (smtpErr) {
      console.warn(`[SMTP Warning] Failed to deliver via Gmail: ${smtpErr.message}. Falling back to dev console.`);
    }
  }

  // Fallback Dev Mode (prints to console so testing is completely unblocked)
  console.log(`\n======================================================`);
  console.log(`[Email Service - DEV MODE] Gmail SMTP not configured or failed.`);
  console.log(`[Email Service - DEV MODE] Verification Code for ${toEmail}: >>> ${otp} <<<`);
  console.log(`======================================================\n`);

  return {
    success: true,
    mode: 'dev',
    message: 'Verification code generated (check server console in dev mode).',
  };
}

module.exports = {
  sendVerificationOTP,
};
