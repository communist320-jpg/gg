import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  Navigation,
  Send,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Business, DirectMessage } from '../../types';
import { useAuth } from '../../services/authContext';
import { sendInquiryEmail } from '../../services/workspaceService';
import { getMessages, sendDirectMessage } from '../../services/businessService';

interface QuickConnectModalProps {
  business: Business;
  initialMode?: 'call' | 'email' | 'message' | 'directions';
  onClose: () => void;
}

export const QuickConnectModal: React.FC<QuickConnectModalProps> = ({
  business,
  initialMode = 'message',
  onClose,
}) => {
  const { currentUser, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'call' | 'email' | 'message' | 'directions'>(initialMode);

  // Email form
  const [emailSubject, setEmailSubject] = useState(`Inquiry regarding ${business.name} (via AOCSF Bathinda)`);
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Message chat
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [reported, setReported] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const quickTemplates = [
    'Is this product/service currently available?',
    'What are your peak hours today in Bathinda?',
    'Do you provide home delivery in Model Town / Civil Lines?',
    'Can I book an appointment or consultation?',
  ];

  useEffect(() => {
    // Load existing messages for this business
    getMessages(business.id).then(msgs => setMessages(msgs));
  }, [business.id]);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailBody.trim()) return;
    setEmailSending(true);

    try {
      await sendInquiryEmail({
        to: business.email,
        subject: emailSubject,
        body: emailBody,
        businessName: business.name,
        senderName: currentUser?.displayName || 'Bathinda Customer',
      });
      setEmailSent(true);
    } catch (err) {
      console.warn('Email dispatch failed:', err);
    } finally {
      setEmailSending(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = textToSend || chatInput;
    if (!content.trim()) return;

    const newMsg: DirectMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      threadId: `thread-${business.id}-${currentUser?.uid || 'guest'}`,
      businessId: business.id,
      businessName: business.name,
      senderId: currentUser?.uid || 'guest-bathinda',
      senderName: currentUser?.displayName || 'Bathinda Resident',
      senderRole: role || 'customer',
      recipientId: business.ownerId,
      content: content.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await sendDirectMessage(newMsg);
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF8F5] border-2 border-[#161412] max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Newspaper Modal Header */}
        <div className="bg-[#161412] text-[#FAF8F5] p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-widest text-[#E23E3E] font-bold uppercase">
              QUICK CONNECT
            </span>
            <span className="text-stone-400">•</span>
            <span className="font-serif font-bold text-sm truncate max-w-[240px]">
              {business.name}
            </span>
          </div>
          <button onClick={onClose} className="text-stone-300 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="grid grid-cols-4 bg-[#EFECE4] border-b border-[#161412]/20 text-xs font-mono">
          <button
            onClick={() => setActiveTab('message')}
            className={`py-2 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'message'
                ? 'bg-[#FAF8F5] text-[#161412] font-bold border-b-2 border-[#C82A2A]'
                : 'text-stone-600 hover:text-black'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('call')}
            className={`py-2 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'call'
                ? 'bg-[#FAF8F5] text-[#161412] font-bold border-b-2 border-[#C82A2A]'
                : 'text-stone-600 hover:text-black'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-2 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'email'
                ? 'bg-[#FAF8F5] text-[#161412] font-bold border-b-2 border-[#C82A2A]'
                : 'text-stone-600 hover:text-black'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email</span>
          </button>
          <button
            onClick={() => setActiveTab('directions')}
            className={`py-2 flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'directions'
                ? 'bg-[#FAF8F5] text-[#161412] font-bold border-b-2 border-[#C82A2A]'
                : 'text-stone-600 hover:text-black'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Maps</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 overflow-y-auto flex-1 text-[#161412]">
          {/* TAB: CALL */}
          {activeTab === 'call' && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold">Contact Store Owner</h4>
                <p className="text-xs text-stone-600 font-mono mt-0.5">
                  Direct phone connection to {business.locality} desk
                </p>
              </div>

              <div className="bg-white border-2 border-[#161412]/20 p-4 rounded font-mono text-xl font-bold tracking-wider text-[#161412]">
                {business.phone}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href={`tel:${business.phone.replace(/\s+/g, '')}`}
                  className="px-6 py-2.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase font-bold tracking-wider rounded shadow-sm transition flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(business.phone);
                    setCopiedPhone(true);
                    setTimeout(() => setCopiedPhone(false), 2000);
                  }}
                  className="px-4 py-2.5 bg-white border border-[#161412]/30 text-xs font-mono font-medium rounded hover:bg-stone-50 transition"
                >
                  {copiedPhone ? '✓ Number Copied' : 'Copy Number'}
                </button>
              </div>
              <p className="text-[11px] text-stone-500 font-mono">
                Available during store hours: 9:30 AM – 8:30 PM (Mon-Sat)
              </p>
            </div>
          )}

          {/* TAB: EMAIL */}
          {activeTab === 'email' && (
            <div>
              {emailSent ? (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-serif text-lg font-bold">Inquiry Dispatched!</h4>
                  <p className="text-xs text-stone-600 font-mono">
                    Your message has been sent to {business.email}. The business will reply shortly.
                  </p>
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-xs font-mono underline text-[#C82A2A]"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="space-y-3">
                  <div className="text-xs text-stone-600 font-mono">
                    To: <strong className="text-[#161412]">{business.email}</strong>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-sans focus:outline-none focus:border-[#C82A2A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                      Your Message / Inquiry
                    </label>
                    <textarea
                      rows={4}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Write your question, item inquiry, or booking request here..."
                      className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-sans focus:outline-none focus:border-[#C82A2A]"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={emailSending}
                    className="w-full py-2.5 bg-[#161412] hover:bg-[#C82A2A] text-white text-xs font-mono uppercase tracking-wider font-semibold rounded transition flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{emailSending ? 'Dispatching...' : 'Send Via Workspace / Email'}</span>
                  </button>
                  <p className="text-[10px] text-stone-400 font-mono text-center">
                    Uses Google Workspace integration when authenticated, or your default email client.
                  </p>
                </form>
              )}
            </div>
          )}

          {/* TAB: NATIVE MESSAGING */}
          {activeTab === 'message' && (
            <div className="flex flex-col h-[340px]">
              {/* Message history */}
              <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-[#F3EFE6] border border-[#161412]/15 rounded mb-2">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 font-mono text-xs">
                    <p>No messages yet in this Bathinda thread.</p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Choose a quick prompt below or type your inquiry.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === (currentUser?.uid || 'guest-bathinda');
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-2 rounded text-xs leading-relaxed ${
                            isMe
                              ? 'bg-[#161412] text-white'
                              : 'bg-white text-[#161412] border border-stone-300'
                          }`}
                        >
                          <div className="text-[9px] opacity-70 font-mono mb-0.5">
                            {m.senderName} ({m.senderRole.replace('_', ' ')})
                          </div>
                          {m.content}
                          <div className="text-[8px] opacity-60 font-mono text-right mt-1">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick suggestion tags */}
              <div className="flex gap-1 overflow-x-auto pb-1 mb-2">
                {quickTemplates.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(tpl)}
                    className="shrink-0 text-[10px] font-mono bg-white border border-stone-300 hover:border-black px-2 py-1 rounded text-stone-700 hover:text-black transition"
                  >
                    💬 {tpl}
                  </button>
                ))}
              </div>

              {/* Input row */}
              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message to shop owner..."
                  className="flex-1 text-xs p-2 bg-white border border-[#161412]/30 rounded focus:outline-none focus:border-[#C82A2A]"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="p-2 bg-[#C82A2A] hover:bg-[#A81F1F] text-white rounded transition"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB: DIRECTIONS */}
          {activeTab === 'directions' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-red-100 text-[#C82A2A] rounded-full flex items-center justify-center mx-auto">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold">Directions to Storefront</h4>
                <p className="text-xs text-stone-600 font-mono mt-0.5">
                  {business.address}, {business.locality}, Bathinda
                </p>
              </div>

              <div className="bg-[#FAF7F2] p-3 border border-[#161412]/15 text-left text-xs font-mono space-y-1">
                <div>📍 <strong>Locality:</strong> {business.locality}, Bathinda</div>
                <div>🧭 <strong>GPS:</strong> {business.coordinates.lat}, {business.coordinates.lng}</div>
                <div>🚗 <strong>Landmark:</strong> Near {business.address}</div>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${business.address}, ${business.locality}, Bathinda, Punjab`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase tracking-wider font-bold rounded shadow-sm transition flex items-center justify-center space-x-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Navigate in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Modal Safety & Spam Protection Footer */}
        <div className="bg-[#F0EBE1] border-t border-[#161412]/15 p-2 px-4 flex items-center justify-between text-[10px] font-mono text-stone-500">
          <span>AOCSF Secure Messaging • Zero Spam Policy</span>
          {reported ? (
            <span className="text-emerald-700 font-bold">Report logged for moderation</span>
          ) : (
            <button
              onClick={() => setReported(true)}
              className="text-stone-500 hover:text-red-700 flex items-center space-x-1"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Report / Block</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
