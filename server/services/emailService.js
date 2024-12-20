'use server';
// server/services/emailService.js
import sgMail from '@sendgrid/mail';

export async function sendVerificationEmail(email, verificationToken, userId) {
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}&userId=${userId}`;

        const msg = {
            to: email,
            from: {
                email: process.env.FROM_EMAIL,
                name: process.env.FROM_NAME
            },
            subject: 'Verify Your Email',
            text: `Please verify your email by clicking this link: ${verificationUrl}`,
            html: `
                <div style="padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2>Email Verification</h2>
                    <p>Please click the button below to verify your email address:</p>
                    <a href="${verificationUrl}" 
                       style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                        Verify Email
                    </a>
                    <p>Or copy and paste this link in your browser:</p>
                    <p>${verificationUrl}</p>
                    <p>This link will expire in 24 hours.</p>
                </div>
            `
        };

        const [response] = await sgMail.send(msg);

        if (response.statusCode !== 202) {
            throw new Error(`SendGrid API error: ${response.statusCode}`);
        }

        return {
            success: true,
            message: 'Verification email sent successfully'
        };

    } catch (error) {
        console.error('Error sending verification email:', error);
        return {
            success: false,
            error: 'Failed to send verification email',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        };
    }
}