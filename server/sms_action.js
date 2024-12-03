"use server";
import twilio from 'twilio';

const accountSid = process.env.TWILLIO_ACCOUNT_SID;
const authToken = process.env.TWILLIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const sendSms = async ({ to, message }) => {
    try {
        const res = await client.messages.create({
            to,
            from: process.env.TWILLIO_PHONE_NUMBER,
            body: message
        });
        return { status: 200, sid: res.sid };
    } catch (error) {
        console.error('Error sending SMS: ', error);
        return { status: 500, error: error.message };
    }
};
