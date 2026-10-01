import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini SDK if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'AOCSF — Army of Collective Shop Front',
    city: 'Bathinda, Punjab',
    hasGeminiKey: Boolean(geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY'),
    hasMapsKey: Boolean(process.env.VITE_GOOGLE_MAPS_API_KEY)
  });
});

// AI Business Copilot Endpoint
app.post('/api/copilot', async (req, res) => {
  try {
    const { mode, prompt, businessInfo, history } = req.body;

    if (!aiClient) {
      // Graceful rule-based fallback if no Gemini API key configured
      return res.json({
        success: true,
        isFallback: true,
        text: generateLocalFallbackResponse(mode, prompt, businessInfo)
      });
    }

    let systemInstruction = `You are "AOCSF Business Copilot", the dedicated AI assistant for local businesses in Bathinda, Punjab on the AOCSF platform (Army of Collective Shop Front).
Product Philosophy: Old newspaper tone combined with sharp, modern digital business insight.

RULES:
1. Ground your answers strictly in the provided business information.
2. DO NOT fabricate prices, hours, product guarantees, or locations not specified in the business details.
3. If information is missing, advise the user to contact the business directly via phone or visit the store in Bathinda.
4. Keep answers concise, polite, helpful, and community-minded.`;

    if (mode === 'customer_qa') {
      systemInstruction += `\nYou are answering a customer inquiry on behalf of the business: "${businessInfo?.name || 'Local Business'}".
Business Context:
Category: ${businessInfo?.categories?.join(', ') || 'Local Store'}
Address: ${businessInfo?.address || 'Bathinda'}, Locality: ${businessInfo?.locality || 'Bathinda'}
Phone: ${businessInfo?.phone || 'Available on profile'}
Hours: ${JSON.stringify(businessInfo?.openingHours || {})}
Description: ${businessInfo?.description || 'Bathinda verified business'}
Catalog Items: ${JSON.stringify(businessInfo?.catalog || [])}

Answer the customer directly, warmly, and concisely. Mention Punjabi/Bathinda context if relevant. If you don't know a detail, state clearly that the owner can confirm by phone.`;
    } else if (mode === 'owner_tools') {
      systemInstruction += `\nYou are helping the business owner optimize their AOCSF presence, write catalog copy, suggest social posts, or analyze performance. Always append: "AI-generated response — verify before publishing".`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt || 'How can I assist this business today?',
      config: {
        systemInstruction,
        temperature: 0.3,
      }
    });

    res.json({
      success: true,
      text: response.text || 'Unable to generate response at this time.'
    });
  } catch (error: any) {
    console.error('Gemini Copilot Error:', error);
    // Graceful fallback on API error
    const fallbackText = generateLocalFallbackResponse(req.body?.mode, req.body?.prompt, req.body?.businessInfo);
    res.json({
      success: true,
      isFallback: true,
      text: fallbackText,
      warning: 'Copilot running in fallback mode'
    });
  }
});

function generateLocalFallbackResponse(mode: string, query: string, info: any): string {
  const name = info?.name || 'this Bathinda business';
  const phone = info?.phone || 'the listed number';
  const locality = info?.locality || 'Bathinda';

  if (mode === 'customer_qa') {
    const qLower = (query || '').toLowerCase();
    if (qLower.includes('hour') || qLower.includes('open') || qLower.includes('timing') || qLower.includes('close')) {
      return `Welcome to ${name}! Our standard operational hours in ${locality} are 9:30 AM to 8:30 PM (Mon-Sat). Please check our live status or call ${phone} for immediate confirmation.`;
    }
    if (qLower.includes('location') || qLower.includes('where') || qLower.includes('address') || qLower.includes('direction')) {
      return `${name} is located at ${info?.address || locality + ', Bathinda, Punjab'}. You can tap "Get Directions" above to navigate directly on Google Maps.`;
    }
    if (qLower.includes('price') || qLower.includes('cost') || qLower.includes('catalog')) {
      return `You can explore our verified digital catalog items and current offers in the Catalog tab. For custom orders or wholesale inquiries, please call ${phone}.`;
    }
    return `Thank you for connecting with ${name} on AOCSF Bathinda. We are happy to help you with ${info?.categories?.[0] || 'our services'}. For immediate queries, call us at ${phone} or visit us in ${locality}!`;
  }

  // Owner tools fallback
  return `[AOCSF Business Copilot Recommendation]
• Keep your Bathinda catalog updated with 3-5 high quality photos.
• Ensure your locality (${locality}) is highlighted to rank higher on "Near Me" searches.
• Send a connection request to 2 complementary local businesses this week to grow your B2B referral network.
\n(AI-generated response — verify before publishing)`;
}

// Dev & Production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`AOCSF Server running at http://localhost:${PORT}`);
  });
}

startServer();
