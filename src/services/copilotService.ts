import { Business } from '../types';

export interface CopilotRequest {
  mode: 'customer_qa' | 'owner_tools';
  prompt: string;
  businessInfo: Partial<Business>;
  toolType?: 'desc' | 'faqs' | 'audit' | 'social' | 'summary';
}

export async function askBusinessCopilot(req: CopilotRequest): Promise<{ text: string; isFallback?: boolean }> {
  try {
    const res = await fetch('/api/copilot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      text: data.text || 'No response generated.',
      isFallback: Boolean(data.isFallback),
    };
  } catch (error) {
    console.warn('Copilot API call failed, generating contextual client advice:', error);
    return {
      text: getContextualClientAdvice(req),
      isFallback: true,
    };
  }
}

function getContextualClientAdvice(req: CopilotRequest): string {
  const b = req.businessInfo;
  const name = b.name || 'this Bathinda business';

  if (req.mode === 'customer_qa') {
    const p = req.prompt.toLowerCase();
    if (p.includes('hours') || p.includes('timing') || p.includes('open')) {
      return `${name} operates standard business hours in ${b.locality || 'Bathinda'}. You can check live status on the profile or call ${b.phone || 'the listed number'} directly.`;
    }
    if (p.includes('where') || p.includes('address') || p.includes('location')) {
      return `${name} is located at: ${b.address || b.locality || 'Bathinda, Punjab'}. Click "Directions" to open Google Maps navigation!`;
    }
    return `Hello! ${name} is a verified ${b.categories?.[0] || 'local business'} in ${b.locality || 'Bathinda'}. Feel free to contact ${b.phone || 'us'} or view our full digital catalog.`;
  }

  // Owner tools
  if (req.toolType === 'desc') {
    return `[AOCSF Editorial Headline & Copy]
"${name} — Redefining ${b.categories?.[0] || 'Quality'} on ${b.locality || 'Bathinda'}'s High Street"
Situated prominently in ${b.locality || 'Bathinda'}, ${name} brings authentic craftsmanship, transparent service, and a community-first commitment to Punjab's premier trading hub.
(AI-generated response — verify before publishing)`;
  }

  if (req.toolType === 'social') {
    return `[Suggested Social & Festival Posts]
1. 🪔 "Proudly rooted in ${b.locality || 'Bathinda'}. Visit ${name} this week for special community savings!"
2. 📍 "Discover us on AOCSF — Bathinda's connected business network. Tap link in bio to explore our live catalog."
(AI-generated response — verify before publishing)`;
  }

  return `[AOCSF Profile Recommendations]
• Add 2 more high-resolution shopfront photos.
• Complete your holiday hours for upcoming Gurpurab and festival dates.
• Connect with at least 3 nearby businesses in ${b.locality || 'Bathinda'} to exchange referral traffic.
(AI-generated response — verify before publishing)`;
}
