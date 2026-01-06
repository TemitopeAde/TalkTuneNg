// Quick test script for Mailtrap email sending
// Run with: node test-email.js

require('dotenv').config({ path: '.env.local' });
const { MailtrapClient } = require('mailtrap');

async function testEmail() {
  console.log('Testing Mailtrap email sending...\n');
  console.log('API Key:', process.env.MAILTRAP_API_KEY ? '✓ Found' : '✗ Missing');
  console.log('Sender Email:', process.env.MAILTRAP_SENDER_EMAIL || 'hello@talktune.org');
  console.log('');

  const mailtrap = new MailtrapClient({
    token: process.env.MAILTRAP_API_KEY,
  });

  try {
    const response = await mailtrap.send({
      from: {
        name: "TalkTune Test",
        email: process.env.MAILTRAP_SENDER_EMAIL || "hello@talktune.org"
      },
      to: [{ email: "test@example.com" }], // Change this to your email
      subject: 'Test Email - TalkTune',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from TalkTune.</p>
        <p>If you're seeing this, your Mailtrap configuration is working correctly!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    });

    console.log('✓ Email sent successfully!');
    console.log('Message ID:', response.message_ids[0]);
    console.log('\nMailtrap is configured correctly! 🎉');
  } catch (error) {
    console.error('✗ Error sending email:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);

    if (error.response?.status === 401) {
      console.log('\n⚠️  Authorization failed. Please check:');
      console.log('1. Your MAILTRAP_API_KEY is correct');
      console.log('2. You\'re using an API token from "Sending Domains" (not Email Testing)');
      console.log('3. The API token has sending permissions');
    }
  }
}

testEmail();
