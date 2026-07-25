# Email Troubleshooting Report

## 1. Environment Variable Expected
Our backend code expects the email service API key to be in either of these environment variables:
- `RESEND_API_KEY`
- `VITE_RESEND_API_KEY`

If the standard SMTP configuration is preferred, the backend will check for:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS` (or `SMTP_PASSWORD`)
- `SMTP_FROM` (or `EMAIL_FROM`)

## 2. Invocation During OTP / Password Reset
The email sending function `sendEmail(to, subject, text, html)` is correctly invoked during:
- Account Registration: (`/api/auth/register`) for the Account Verification Code (OTP).
- Password Reset: (`/api/auth/request-password-reset`) for the Password Reset Code.

The invocation in the codebase is implemented using a "fire-and-forget" approach using `.catch()`, which handles error logging gracefully.

## 3. Sender Email Configuration Requirements
Yes, this is the most likely cause for emails not being sent despite the API key being set!
Our email provider configuration in `server.ts` defaults the `fromAddress` to:
`process.env.RESEND_FROM || smtpFrom || '"Sof Umer" <noreply@sofumerapp.com>'`

**Important Note regarding Resend (our provider):**
If you use an unverified sender domain, Resend will reject the email sending request.
To send emails to your users, you must:
1. Verify your own custom domain in the Resend dashboard.
2. Set the `RESEND_FROM` (or `SMTP_FROM`) environment variable in Render to match that verified domain (e.g., `noreply@yourverifieddomain.com`).

Otherwise, Resend will reject the email sending request for external recipients with a 403 Forbidden or 401 Unauthorized API error.
