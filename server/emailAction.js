'use server';

import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';

const prisma = new PrismaClient();

function validateEnvironmentVariables() {
    const required = [
        'SENDGRID_API_KEY',
        'NEXT_PUBLIC_APP_URL',
        'FROM_EMAIL',
        'FROM_NAME',
        'SENDGRID_BOOKING_TEMPLATE_ID',
        'NEXT_PUBLIC_LOGO_URL'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate URL format
    try {
        new URL(process.env.NEXT_PUBLIC_APP_URL);
        new URL(process.env.NEXT_PUBLIC_LOGO_URL);
    } catch (error) {
        throw new Error('Invalid URL format in environment variables');
    }

    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.FROM_EMAIL)) {
        throw new Error('Invalid email format in FROM_EMAIL');
    }
}

function formatTicketsList(tickets) {
    return tickets.map(ticket => {
        const formattedPrice = new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(ticket.price * ticket.quantity);

        return `
            <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
                    <table width="100%">
                        <tr>
                            <td style="color: #666;">
                                ${ticket.packageType.name} - ${ticket.packageType.type} 
                                ${ticket.packageType.isBoothType ? `(Booth ${ticket.packageType.boothNumber})` : ''}
                                ${ticket.packageType.floor ? `- Floor ${ticket.packageType.floor}` : ''}
                                (x${ticket.quantity})
                            </td>
                            <td align="right" style="color: #333;">
                                <strong>${formattedPrice}</strong>
                            </td>
                        </tr>
                        ${ticket.metadata?.isVIPPartyTicket ? `
                            <tr>
                                <td colspan="2" style="color: #8B0000; font-size: 12px; padding-top: 4px;">
                                    Includes VIP Party Access
                                </td>
                            </tr>
                        ` : ''}
                    </table>
                </td>
            </tr>
        `;
    }).join('');
}

export async function sendBookingConfirmation(bookingId) {
    console.log('Starting booking confirmation process for booking:', bookingId);

    try {
        validateEnvironmentVariables();
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                event: {
                    include: {
                        venue: true,
                    }
                },
                tickets: {
                    include: {
                        packageType: true
                    }
                }
            }
        });

        if (!booking) {
            throw new Error(`Booking not found: ${bookingId}`);
        }

        const { event, user, tickets } = booking;

        if (!event || !user) {
            throw new Error('Invalid booking data: missing event or user information');
        }

        const templateData = {
            customerName: user.name || 'Valued Customer',
            eventName: "Championship Boxing Night",
            eventDate: "December 8, 2024",
            eventTime: "First Bout: 5:30 PM | Main Event: 8:00 PM ",
            venueName: event.venue?.name || 'Rebel Toronto',
            venueAddress: event.venue?.address || '11 Polson Street',
            bookingReference: booking.id,
            ticketsList: formatTicketsList(tickets),
            totalAmount: new Intl.NumberFormat('en-CA', {
                style: 'currency',
                currency: 'CAD'
            }).format(booking.totalAmount),
            isVIPPartyEnabled: booking.metadata?.hasVIPParty || false,
            logoUrl: process.env.NEXT_PUBLIC_LOGO_URL,
            viewTicketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.id}`,
            termsUrl: `${process.env.NEXT_PUBLIC_APP_URL}`,
            privacyUrl: `${process.env.NEXT_PUBLIC_APP_URL}`,
            contactUrl: `${process.env.NEXT_PUBLIC_APP_URL}`,
            supportEmail: process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL
        };

        const msg = {
            to: user.email,
            from: {
                email: process.env.FROM_EMAIL,
                name: process.env.FROM_NAME
            },
            templateId: process.env.SENDGRID_BOOKING_TEMPLATE_ID,
            dynamic_template_data: templateData
        };

        console.log('Sending email with template data:', {
            to: msg.to,
            template: msg.templateId,
            data: templateData
        });

        const [response] = await sgMail.send(msg);

        if (response.statusCode !== 202) {
            throw new Error(`SendGrid API error: ${response.statusCode}`);
        }

        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                metadata: {
                    ...booking.metadata,
                    confirmationEmailSent: true,
                    confirmationEmailSentAt: new Date().toISOString()
                }
            }
        });

        return {
            success: true,
            message: 'Booking confirmation email sent successfully',
            details: {
                bookingId,
                recipientEmail: user.email,
                sentAt: new Date().toISOString()
            }
        };

    } catch (error) {
        console.error('Error in sendBookingConfirmation:', error);

        if (error.response?.body) {
            console.error('SendGrid API Error Response:', error.response.body);
            return {
                success: false,
                error: 'Email service error',
                details: error.response.body
            };
        }

        return {
            success: false,
            error: error.message || 'Unknown error occurred',
            details: {
                timestamp: new Date().toISOString(),
                bookingId,
                errorType: error.name || 'UnknownError'
            }
        };
    }
}

// Helper function to test the email template data
export async function testEmailTemplate(bookingId) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                event: {
                    include: {
                        venue: true,
                    }
                },
                tickets: {
                    include: {
                        packageType: true
                    }
                }
            }
        });

        if (!booking) return null;

        const templateData = {
            customerName: booking.user.name || 'Valued Customer',
            eventName: "Championship Boxing Night",
            eventDate: "December 8, 2024",
            eventTime: "First Bout: 5:30 PM | Main Event: 8:00 PM ",
            venueName: booking.event.venue?.name || 'Rebel Toronto',
            venueAddress: booking.event.venue?.address || '11 Polson Street',
            bookingReference: booking.id,
            ticketsList: formatTicketsList(booking.tickets),
            totalAmount: new Intl.NumberFormat('en-CA', {
                style: 'currency',
                currency: 'CAD'
            }).format(booking.totalAmount),
            isVIPPartyEnabled: booking.metadata?.hasVIPParty || false,
            logoUrl: process.env.NEXT_PUBLIC_LOGO_URL,
            viewTicketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.id}`,
            termsUrl: `${process.env.NEXT_PUBLIC_APP_URL}`,
            privacyUrl: `${process.env.NEXT_PUBLIC_APP_URL}`,
            contactUrl: `${process.env.NEXT_PUBLIC_APP_URL}`,
            supportEmail: process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL
        };

        return templateData;
    } catch (error) {
        console.error('Error in testEmailTemplate:', error);
        return null;
    }
}