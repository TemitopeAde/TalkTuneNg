
import { MailtrapClient } from "mailtrap";

const mailtrap = new MailtrapClient({
  token: process.env.MAILTRAP_API_KEY!,
});

export async function sendOTPEmail(email: string, name: string, otp: number) {
  try {
    const response = await mailtrap.send({
      from: {
        name: "TalkTune",
        email: process.env.MAILTRAP_SENDER_EMAIL || "hello@talktune.org"
      },
      to: [{ email }],
      subject: 'Verify Your Email - TalkTune',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TalkTune!</h1>
            </div>

            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
              <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>

              <p>Thank you for signing up! Please verify your email address to complete your registration.</p>

              <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
                <h1 style="font-size: 36px; margin: 10px 0; color: #667eea; letter-spacing: 5px; font-family: monospace;">${otp}</h1>
                <p style="margin: 0; font-size: 12px; color: #999;">This code expires in 10 minutes</p>
              </div>

              <p>Enter this code in the verification page to activate your account.</p>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If you didn't create an account with us, please ignore this email.
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="font-size: 12px; color: #999; text-align: center;">
                © ${new Date().getFullYear()} TalkTune. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Email sent successfully:', response.message_ids);
    return { success: true, messageId: response.message_ids[0] };
  } catch (error) {
    console.error('Error sending email:', error);
    // throw new Error('Failed to send verification email');
  }
}


export async function sendPasswordResetEmail(email: string, name: string, resetToken: number) {
  const decodedEmail = decodeURIComponent(email);

  try {
    const response = await mailtrap.send({
      from: {
        name: "TalkTune",
        email: process.env.MAILTRAP_SENDER_EMAIL || "hello@talktune.org"
      },
      to: [{ email: decodedEmail }],
      subject: 'Reset Your Password - TalkTune',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
            </div>

            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
              <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>

              <p>You requested to reset your password for your TalkTune account. Use the verification code below to reset your password.</p>

              <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">Your password reset code is:</p>
                <h1 style="font-size: 36px; margin: 10px 0; color: #667eea; letter-spacing: 5px; font-family: monospace;">${resetToken}</h1>
                <p style="margin: 0; font-size: 12px; color: #999;">This code expires in 15 minutes</p>
              </div>

              <p>Enter this code on the password reset page to create a new password.</p>

              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                For security reasons, this link will expire in 15 minutes.
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <p style="font-size: 12px; color: #999; text-align: center;">
                © ${new Date().getFullYear()} TalkTune. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Email sent successfully:', response.message_ids);
    return { success: true, messageId: response.message_ids[0] };
  } catch (error) {
    console.error('Error sending email:', error);
    // throw new Error('Failed to send verification email')
  }
}

export async function sendContactConfirmationEmail(
  email: string,
  name: string,
  message: string
) {
  try {
    const response = await mailtrap.send({
      from: {
        name: "TalkTune",
        email: process.env.MAILTRAP_SENDER_EMAIL || "hello@talktune.org"
      },
      to: [{ email }],
      subject: 'We Received Your Message - TalkTune',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Message Received</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Contacting Us!</h1>
            </div>

            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
              <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>

              <p>We've received your message and will get back to you as soon as possible.</p>


              <p>Our team typically responds within 24-48 hours during business days.</p>

              <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-size: 14px; color: #0066cc;">
                  <strong>💡 In the meantime:</strong><br>
                  Check out our <a href="https://talktune.org/faq" style="color: #667eea; text-decoration: none;">FAQ page</a> for quick answers to common questions.
                </p>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If you need immediate assistance, please call us at <strong>+1 (555) 000-0000</strong>.
              </p>

              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

              <div style="text-align: center;">
                <p style="margin: 0 0 10px 0; color: #666;">Follow us on social media:</p>
                <div style="margin: 15px 0;">
                  <a href="#" style="display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none;">Twitter</a>
                  <a href="#" style="display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none;">LinkedIn</a>
                  <a href="#" style="display: inline-block; margin: 0 10px; color: #667eea; text-decoration: none;">Facebook</a>
                </div>
              </div>

              <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
                © ${new Date().getFullYear()} TalkTune. All rights reserved.<br>
                Use 6 Olaosebikan street, Shomolu
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Contact confirmation email sent:', response.message_ids);
    return { success: true, messageId: response.message_ids[0] };
  } catch (error) {
    console.error('Error sending contact confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
}

export async function sendContactNotificationToAdmin(
  userName: string,
  userEmail: string,
  message: string
) {
  try {
    const response = await mailtrap.send({
      from: {
        name: "TalkTune",
        email: process.env.MAILTRAP_SENDER_EMAIL || "hello@talktune.org"
      },
      to: [{ email: "support@talktune.org" }],
      subject: `New Contact Form Submission from ${userName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #2c3e50; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
            </div>

            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-top: 0; color: #2c3e50;">Contact Information</h3>
                <p style="margin: 10px 0;"><strong>Name:</strong> ${userName}</p>
                <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${userEmail}" style="color: #667eea;">${userEmail}</a></p>
                <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h3 style="margin-top: 0; color: #2c3e50;">Message</h3>
                <p style="color: #333; white-space: pre-wrap;">${message}</p>
              </div>

              <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                  <strong>Action Required:</strong> Please respond to this inquiry within 24-48 hours.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Admin notification email sent:', response.message_ids);
    return { success: true, messageId: response.message_ids[0] };
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw new Error('Failed to send admin notification');
  }
}