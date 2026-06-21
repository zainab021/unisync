// WhatsApp notifications via CallMeBot (Free)
// Setup: https://www.callmebot.com/blog/free-api-whatsapp-messages/
// 1. Add +34 644 59 78 85 to your contacts as "CallMeBot"
// 2. Send "I allow callmebot to send me messages" to that number on WhatsApp
// 3. You'll receive an API key
// 4. Add to .env: WHATSAPP_PHONE=923001234567  WHATSAPP_API_KEY=xxxxxxxx

async function sendWhatsApp(message) {
  const phone  = process.env.WHATSAPP_PHONE;
  const apiKey = process.env.WHATSAPP_API_KEY;

  if (!phone || !apiKey) {
    console.log(`[WhatsApp skipped — no credentials] ${message}`);
    return;
  }

  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
    const res  = await fetch(url);
    const text = await res.text();
    if (text.includes("Message Sent")) {
      console.log(`[WhatsApp sent ✅] ${message.slice(0, 50)}...`);
    } else {
      console.log(`[WhatsApp response] ${text.slice(0, 100)}`);
    }
  } catch (err) {
    console.error(`[WhatsApp failed ❌] ${err.message}`);
  }
}

module.exports = { sendWhatsApp };
