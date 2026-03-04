interface VerificationEmailProps {
    userName: string
    verificationUrl: string
}

export function VerificationEmail({
    userName,
    verificationUrl,
}: VerificationEmailProps) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f6f9fc;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e6ebf1;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Verify Your Email Address</h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #525f7f;">
                                Hi ${userName || "there"},
                            </p>
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #525f7f;">
                                Thanks for signing up! Please verify your email address by clicking the button below. This link will expire in 24 hours.
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 0 0 24px;">
                                        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0070f3; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; text-align: center;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 16px; font-size: 14px; line-height: 20px; color: #6b7c93;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 24px; font-size: 14px; line-height: 20px; color: #0070f3; word-break: break-all;">
                                ${verificationUrl}
                            </p>

                            <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7c93;">
                                If you didn't create an account, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; border-top: 1px solid: #e6ebf1; text-align: center;">
                            <p style="margin: 0; font-size: 12px; line-height: 18px; color: #8898aa;">
                                This email was sent to verify your account. If you have any questions, please contact our support team.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`
}
