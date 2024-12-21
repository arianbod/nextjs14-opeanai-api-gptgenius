'use server';
// server/services/emailService.js
import sgMail from '@sendgrid/mail';

export async function sendVerificationEmail(email, verificationToken, userId) {
    console.log('Starting email verification process...', {
        email,
        userId,
        tokenLength: verificationToken?.length
    });

    try {
        // Check required environment variables
        const requiredEnvVars = ['SENDGRID_API_KEY', 'FROM_EMAIL', 'FROM_NAME', 'NEXT_PUBLIC_APP_URL'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

        if (missingVars.length > 0) {
            console.error('Missing required environment variables:', missingVars);
            throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
        }

        console.log('Setting SendGrid API key...');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const defaultLang = process.env.DEFAULT_LANGUAGE || 'en';
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${defaultLang}/verify-email?token=${verificationToken}&userId=${userId}`;

        console.log('Generated verification URL:', {
            baseUrl: process.env.NEXT_PUBLIC_APP_URL,
            language: defaultLang,
            fullUrl: verificationUrl
        });

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

        console.log('Preparing to send email with config:', {
            to: msg.to,
            from: msg.from,
            subject: msg.subject,
            hasText: !!msg.text,
            hasHtml: !!msg.html
        });

        try {
            const [response] = await sgMail.send(msg);
            console.log('SendGrid API Response:', {
                statusCode: response.statusCode,
                headers: response.headers,
                body: response.body
            });

            if (response.statusCode !== 202) {
                throw new Error(`SendGrid API error: ${response.statusCode}`);
    
            }

            console.log('Email sent successfully!');
            return {
                success: true,
                message: 'Verification email sent successfully',
                details: {
                    statusCode: response.statusCode,
                    messageId: response.headers['x-message-id']
                }
            };

        } catch (sendError) {
            console.error('SendGrid send error:', {
                error: sendError.message,
                code: sendError.code,
                response: sendError.response?.body
            });
            throw sendError;
        }

    } catch (error) {
        console.error('Error in sendVerificationEmail:', {
            error: error.message,
            stack: error.stack,
            name: error.name
        });

        return {
            success: false,
            error: 'Failed to send verification email',
            details: process.env.NODE_ENV === 'development' ? {
                message: error.message,
                code: error.code,
                response: error.response?.body,
                stack: error.stack
            } : undefined
        };
    }
}