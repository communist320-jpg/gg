import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Share2, Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { Business } from '../../types';

interface QrModalProps {
  business: Business;
  onClose: () => void;
  defaultAction?: 'profile' | 'call' | 'catalog' | 'directions' | 'feedback';
}

export const QrModal: React.FC<QrModalProps> = ({
  business,
  onClose,
  defaultAction = 'profile',
}) => {
  const [action, setAction] = useState(defaultAction);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const getTargetUrlOrData = () => {
    const origin = window.location.origin;
    switch (action) {
      case 'call':
        return `tel:${business.phone.replace(/\s+/g, '')}`;
      case 'catalog':
        return `${origin}?business=${business.slug}&tab=catalog`;
      case 'directions':
        return `https://www.google.com/maps/dir/?api=1&destination=${business.coordinates.lat},${business.coordinates.lng}`;
      case 'feedback':
        return business.googleFormsUrl || `${origin}?business=${business.slug}&action=feedback`;
      case 'profile':
      default:
        return `${origin}?business=${business.slug}`;
    }
  };

  const payload = getTargetUrlOrData();

  useEffect(() => {
    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#161412',
        light: '#FAF8F5',
      },
    })
      .then(url => setDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [payload, action]);

  const copyLink = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQr = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `AOCSF-${business.slug}-${action}-QR.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] border-2 border-[#161412] max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-stone-500 hover:text-black p-1 hover:bg-stone-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Newspaper Passport Header */}
        <div className="text-center pb-4 border-b border-[#161412]/20">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#C82A2A] font-bold">
            AOCSF BUSINESS PASSPORT • OFFICIAL QR DISCOVERY
          </div>
          <h3 className="font-serif text-xl font-black text-[#161412] mt-1">
            {business.name}
          </h3>
          <p className="text-xs text-stone-600 font-mono">
            {business.locality}, Bathinda, Punjab
          </p>
        </div>

        {/* Action Tabs for QR */}
        <div className="flex justify-center gap-1 my-3 bg-[#F0EBE1] p-1 border border-[#161412]/15 text-xs font-mono">
          {(
            [
              { id: 'profile', label: 'Profile' },
              { id: 'catalog', label: 'Catalog' },
              { id: 'call', label: 'Call' },
              { id: 'directions', label: 'Maps' },
              { id: 'feedback', label: 'Feedback' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAction(tab.id)}
              className={`px-2.5 py-1 text-xs uppercase font-medium rounded transition ${
                action === tab.id
                  ? 'bg-[#161412] text-white font-bold'
                  : 'text-stone-700 hover:text-black hover:bg-black/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* QR Display Frame */}
        <div className="bg-white border-2 border-dashed border-[#161412]/30 p-4 flex flex-col items-center justify-center my-4">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt={`QR for ${business.name}`}
              className="w-52 h-52 object-contain"
            />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-stone-400 font-mono text-xs">
              Generating code...
            </div>
          )}
          <div className="text-[11px] font-mono text-stone-500 mt-2 text-center break-all max-w-xs">
            {action === 'call' ? `Direct dial: ${business.phone}` : payload}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#161412]/20">
          <button
            onClick={copyLink}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-white border border-[#161412]/30 hover:border-black text-xs font-mono font-medium transition"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
          <button
            onClick={downloadQr}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#161412] hover:bg-[#C82A2A] text-white text-xs font-mono font-medium transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
        </div>

        <div className="mt-3 text-[10px] text-center text-stone-400 font-mono">
          Print and place on your counter or billing desk in Bathinda for instant customer scan!
        </div>
      </div>
    </div>
  );
};
