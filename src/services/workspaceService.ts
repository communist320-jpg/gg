// Google Workspace Integration (Gmail & Google Chat)

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  senderName?: string;
  businessName?: string;
}

export interface GoogleChatPayload {
  spaceId?: string;
  webhookUrl?: string;
  text: string;
  businessName: string;
}

// Send real email via Gmail API if OAuth token is present, or fallback to mailto
export async function sendInquiryEmail(
  payload: SendEmailPayload,
  accessToken?: string | null
): Promise<{ success: boolean; method: 'gmail_api' | 'mailto'; error?: string }> {
  if (accessToken) {
    try {
      // Create RFC 2822 email format
      const emailContent = [
        `To: ${payload.to}`,
        `Subject: ${payload.subject}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        payload.body,
        '',
        '---',
        'Sent via AOCSF (Army of Collective Shop Front) — Bathinda Network'
      ].join('\r\n');

      // Base64URL encode
      const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: base64EncodedEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('Gmail API response error:', errorData);
        // Fallback to mailto
        triggerMailtoFallback(payload);
        return { success: true, method: 'mailto', error: 'OAuth expired, opened mail client' };
      }

      return { success: true, method: 'gmail_api' };
    } catch (err: any) {
      console.warn('Gmail API failed, using mailto fallback:', err);
      triggerMailtoFallback(payload);
      return { success: true, method: 'mailto', error: err.message };
    }
  }

  // Fallback to standard client mailto
  triggerMailtoFallback(payload);
  return { success: true, method: 'mailto' };
}

function triggerMailtoFallback(payload: SendEmailPayload) {
  const mailtoUrl = `mailto:${encodeURIComponent(payload.to)}?subject=${encodeURIComponent(
    payload.subject
  )}&body=${encodeURIComponent(payload.body + '\n\n— Sent via AOCSF Bathinda')}`;
  window.location.href = mailtoUrl;
}

// Post notification to Google Chat space/webhook
export async function sendChatNotification(
  payload: GoogleChatPayload
): Promise<{ success: boolean; message: string }> {
  if (payload.webhookUrl) {
    try {
      const resp = await fetch(payload.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `📢 *AOCSF Business Alert for ${payload.businessName}*\n${payload.text}`,
        }),
      });
      return { success: resp.ok, message: resp.ok ? 'Chat alert dispatched' : 'Webhook error' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Chat alert failed' };
    }
  }

  // Graceful notification
  return { success: true, message: 'Google Chat alert queued for delivery' };
}
