import React, { useState } from 'react';
import { X, Star, Send, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Business, CustomerFeedback } from '../../types';
import { submitFeedback } from '../../services/businessService';
import { useAuth } from '../../services/authContext';

interface FeedbackModalProps {
  business: Business;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ business, onClose }) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [experience, setExperience] = useState<'Excellent' | 'Good' | 'Average' | 'Needs Improvement'>('Excellent');
  const [category, setCategory] = useState<string>(business.categories[0] || 'General Service');
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState(currentUser?.displayName || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    const feedbackData: CustomerFeedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      businessId: business.id,
      customerName: customerName.trim() || 'Bathinda Verified Shopper',
      customerEmail: customerEmail.trim() || undefined,
      experience,
      rating,
      category,
      comment: comment.trim(),
      isPublished: true, // published by default or for owner review
      source: 'aocsf_native',
      createdAt: new Date().toISOString(),
    };

    await submitFeedback(feedbackData);
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF8F5] border-2 border-[#161412] max-w-md w-full shadow-2xl relative p-5">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-stone-500 hover:text-black p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-[#161412]/20 pb-3 mb-4">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#C82A2A] font-bold">
            COMMUNITY APPRAISAL
          </div>
          <h3 className="font-serif text-lg font-black text-[#161412]">
            Feedback for {business.name}
          </h3>
          <p className="text-xs text-stone-600 font-mono">
            {business.locality}, Bathinda
          </p>
        </div>

        {/* Optional Google Form Link integration */}
        {business.googleFormsUrl && (
          <div className="mb-4 p-3 bg-[#FAF3E0] border border-[#E0D5B8] flex items-center justify-between">
            <div className="text-xs font-mono text-stone-800">
              This store has an official Google Feedback Form.
            </div>
            <a
              href={business.googleFormsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#161412] text-white text-[11px] font-mono rounded hover:bg-[#C82A2A] transition"
            >
              <span>Google Form</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-serif text-lg font-bold">Thank You!</h4>
            <p className="text-xs text-stone-600 font-mono">
              Your feedback has been logged securely for {business.name}. Honest community reviews empower local businesses in Bathinda!
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-4 py-2 bg-[#161412] text-white text-xs font-mono font-medium rounded"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Star Rating */}
            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                Rating
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-stone-300 hover:text-amber-500 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono font-bold text-stone-600 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Experience Pill selector */}
            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                Overall Experience
              </label>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                {(['Excellent', 'Good', 'Average', 'Needs Improvement'] as const).map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setExperience(exp)}
                    className={`py-1.5 px-2 border text-center transition rounded-xs ${
                      experience === exp
                        ? 'bg-[#161412] text-white border-black font-semibold'
                        : 'bg-white text-stone-700 border-stone-300 hover:border-black'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            {/* Category / Service */}
            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                Service / Department
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-sans"
              >
                {business.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="General Customer Service">General Customer Service</option>
                <option value="Pricing & Value">Pricing & Value</option>
                <option value="Timeliness & Cleanliness">Timeliness & Cleanliness</option>
              </select>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                Your Review / Experience
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this Bathinda store..."
                className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-sans focus:outline-none focus:border-[#C82A2A]"
                required
              />
            </div>

            {/* Optional Customer info */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-stone-500 mb-0.5">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Jaspreet Singh"
                  className="w-full text-xs p-1.5 bg-white border border-stone-300 rounded font-sans"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-stone-500 mb-0.5">
                  Your Email (Private)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="For owner reply"
                  className="w-full text-xs p-1.5 bg-white border border-stone-300 rounded font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase tracking-wider font-semibold rounded shadow-sm transition flex items-center justify-center space-x-1.5 mt-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Community Feedback'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
