import React, { useState } from 'react';
import { X, LogIn, UserPlus, AlertCircle, ShieldCheck, Mail, Lock, User, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../services/authContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signInWithGithub, signInWithEmail, signUpWithEmail, sendVerificationEmail, reloadUser, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('business_owner');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Email verification screen state
  const [verificationPending, setVerificationPending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);

  const handleGithubSignIn = async () => {
    setLoading(true);
    setLocalError(null);
    try {
      await signInWithGithub();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'GitHub Sign-In failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setLocalError('Please enter your full name');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName, role);
        setVerificationPending(true);
      } else {
        await signInWithEmail(email, password);
        onClose();
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendVerificationEmail();
      setResendStatus('Verification link re-sent! Please check your inbox.');
      setTimeout(() => setResendStatus(null), 4000);
    } catch (err: any) {
      setResendStatus('Failed to resend. Please try again shortly.');
    }
  };

  const handleCheckVerified = async () => {
    setCheckingVerification(true);
    const verified = await reloadUser();
    setCheckingVerification(false);
    if (verified) {
      onClose();
    } else {
      setResendStatus('Email not yet marked as verified. Please click the link in your email and tap Check again.');
      setTimeout(() => setResendStatus(null), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] border-2 border-[#161412] max-w-md w-full shadow-2xl relative p-6 text-[#161412]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-stone-500 hover:text-black p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {verificationPending ? (
          /* Email Verification Step */
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
              <Mail className="w-6 h-6" />
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#C82A2A] font-bold">
                EMAIL VERIFICATION REQUIRED
              </div>
              <h3 className="font-serif text-xl font-black text-[#161412] mt-1">
                Verify Your Email Address
              </h3>
              <p className="text-xs text-stone-600 font-mono mt-1">
                We've dispatched a confirmation link to:
              </p>
              <div className="text-sm font-mono font-bold text-[#161412] mt-1 bg-white p-2 border border-stone-300 rounded inline-block max-w-full truncate">
                {email}
              </div>
            </div>

            <p className="text-xs text-stone-600 font-sans leading-relaxed text-left bg-[#FFFDF9] border border-stone-200 p-3 rounded">
              To ensure authentic Bathinda merchant & customer identity, please open your inbox and click the verification link before proceeding.
            </p>

            {resendStatus && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 text-xs font-mono text-blue-800">
                {resendStatus}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={handleCheckVerified}
                disabled={checkingVerification}
                className="w-full py-2.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase font-bold tracking-wider rounded shadow-xs transition flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{checkingVerification ? 'Checking Status...' : "I've Verified My Email"}</span>
              </button>

              <div className="flex justify-between gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="flex-1 py-2 bg-white border border-[#161412]/30 hover:border-black text-stone-700 font-medium rounded transition"
                >
                  Resend Email
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 bg-white border border-[#161412]/30 hover:border-black text-stone-700 font-medium rounded transition"
                >
                  Continue for Now
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Main Authentication Screen (GitHub + Email) */
          <>
            <div className="border-b border-[#161412]/20 pb-3 mb-4 text-center">
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#C82A2A] font-bold">
                AOCSF SECURE ACCESS
              </div>
              <h3 className="font-serif text-xl font-black text-[#161412] mt-1">
                {isSignUp ? 'Create an Account' : 'Sign in to AOCSF'}
              </h3>
              <p className="text-xs text-stone-600 font-mono mt-0.5">
                Bathinda Local Business Ecosystem
              </p>
            </div>

            {(localError || error) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs font-mono text-red-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            {/* GitHub One-Click Auth */}
            <button
              onClick={handleGithubSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#24292e] hover:bg-[#181a1b] text-white text-xs font-mono font-semibold rounded flex items-center justify-center space-x-2 shadow-xs transition mb-4"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Continue with GitHub</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#161412]/15"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-mono uppercase">
                <span className="bg-[#FAF8F5] px-2 text-stone-500">Or with verified email</span>
              </div>
            </div>

            {/* Email & Password Form with Verification */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Harpreet Singh"
                      className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-sans"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                      I am registering as:
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setRole('business_owner')}
                        className={`py-1.5 px-2 border rounded text-center transition ${
                          role === 'business_owner'
                            ? 'bg-[#161412] text-white border-black font-bold'
                            : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        Business Owner
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('customer')}
                        className={`py-1.5 px-2 border rounded text-center transition ${
                          role === 'customer'
                            ? 'bg-[#161412] text-white border-black font-bold'
                            : 'bg-white text-stone-700 border-stone-300'
                        }`}
                      >
                        Customer
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-stone-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2 bg-white border border-[#161412]/30 rounded font-mono"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase tracking-wider font-bold rounded shadow-xs transition flex items-center justify-center space-x-1.5 mt-2"
              >
                {isSignUp ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}
                <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Account & Send Verification' : 'Sign In'}</span>
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-[#161412]/15 text-center text-xs font-mono text-stone-600">
              {isSignUp ? (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-[#C82A2A] font-bold underline"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Own a local Bathinda business?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-[#C82A2A] font-bold underline"
                  >
                    Register Here
                  </button>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
