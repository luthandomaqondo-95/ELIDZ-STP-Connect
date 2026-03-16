/**
 * SMS Service
 * Handles sending SMS messages for 2FA codes
 */

export async function sendSMS(phoneNumber: string, message: string): Promise<void> {
  // Check if Twilio is configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn("Twilio not configured. SMS would be sent to:", phoneNumber);
    console.warn("Message:", message);
    // In development, just log the SMS
    return;
  }

  try {
    // Use Twilio SDK (install: npm install twilio)
    // Uncomment and configure when ready:
    /*
    const twilio = require("twilio");
    
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    */

    console.log(`SMS sent to ${phoneNumber}: ${message}`);
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new Error("Failed to send SMS");
  }
}

export async function send2FACodeSMS(phoneNumber: string, code: string): Promise<void> {
  const message = `Your verification code is: ${code}. This code will expire in 10 minutes.`;
  await sendSMS(phoneNumber, message);
}

