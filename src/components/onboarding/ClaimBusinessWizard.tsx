import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Store,
  MapPin,
  Clock,
  Image,
  BookOpen,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import {
  Business,
  ALL_CATEGORIES,
  BATHINDA_LOCALITIES,
  BusinessCategory,
  BathindaLocality,
  WeeklyHours
} from '../../types';
import { DEFAULT_WEEKLY_HOURS } from '../../data/bathindaDemoData';
import { saveBusiness, calculateCompleteness } from '../../services/businessService';
import { useAuth } from '../../services/authContext';
import { GoogleMapComponent } from '../common/GoogleMapComponent';

interface ClaimBusinessWizardProps {
  onClose: () => void;
  onSuccess: (newBiz: Business) => void;
}

export const ClaimBusinessWizard: React.FC<ClaimBusinessWizardProps> = ({
  onClose,
  onSuccess,
}) => {
  const { currentUser, role, setTestRole } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 11;

  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [categories, setCategories] = useState<BusinessCategory[]>(['Retail Shops']);
  const [ownerEmail, setOwnerEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('+91 ');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState<BathindaLocality>('Model Town');
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 30.2110, lng: 74.9455 });
  const [openingHours, setOpeningHours] = useState<WeeklyHours>(DEFAULT_WEEKLY_HOURS);
  const [logoUrl, setLogoUrl] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [initialItemName, setInitialItemName] = useState('');
  const [initialItemPrice, setInitialItemPrice] = useState('');
  const [googleFormsUrl, setGoogleFormsUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Compute live completeness
  const previewBiz: Partial<Business> = {
    name,
    categories,
    description,
    phone,
    email: ownerEmail,
    address,
    locality,
    coordinates,
    openingHours,
    photos: photoUrl ? [photoUrl] : [],
    logoUrl,
  };

  const completeness = calculateCompleteness(previewBiz);

  const toggleCategory = (cat: BusinessCategory) => {
    if (categories.includes(cat)) {
      if (categories.length > 1) {
        setCategories(categories.filter((c) => c !== cat));
      }
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleFinishAndPublish = async () => {
    setSubmitting(true);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `business-${Date.now()}`;

    const newBusiness: Business = {
      id: `biz-${Date.now()}`,
      ownerId: currentUser?.uid || `owner-${Date.now()}`,
      ownerEmail,
      name,
      slug,
      tagline,
      categories,
      description: description || `${name} is a premier local business in ${locality}, Bathinda, Punjab.`,
      address: address || `${locality}, Bathinda, Punjab`,
      locality,
      city: 'Bathinda',
      state: 'Punjab',
      pincode: '151001',
      phone: phone || '+91 98765 00000',
      email: ownerEmail,
      coordinates,
      openingHours,
      photos: photoUrl ? [photoUrl] : ['https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&auto=format&fit=crop&q=80'],
      logoUrl: logoUrl || undefined,
      status: 'open',
      verifiedLevel: 'profile_complete',
      completenessScore: completeness,
      isFeatured: false,
      isDemo: false,
      googleFormsUrl: googleFormsUrl || undefined,
      viewsCount: 1,
      catalogViewsCount: 0,
      phoneClicksCount: 0,
      directionClicksCount: 0,
      messageRequestsCount: 0,
      qrScansCount: 0,
      websiteClicksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveBusiness(newBusiness);
    // Switch to business owner perspective if currently customer
    if (role === 'customer') {
      setTestRole('business_owner');
    }
    setSubmitting(false);
    onSuccess(newBusiness);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF8F5] border-2 border-[#161412] max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[#161412]">
        {/* Newspaper Wizard Header */}
        <div className="bg-[#161412] text-[#FAF8F5] p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-widest text-[#E23E3E] font-bold uppercase">
              AOCSF ONBOARDING
            </span>
            <span className="text-stone-400">•</span>
            <span className="font-serif font-bold text-sm sm:text-base">
              Claim & Register Your Bathinda Shop
            </span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Completeness indicator */}
        <div className="bg-[#F0EBE1] border-b border-[#161412]/20 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="font-bold text-[#C82A2A]">STEP {currentStep} OF {totalSteps}:</span>
            <span className="text-stone-700 capitalize font-medium">
              {currentStep === 1 && 'Business Identity'}
              {currentStep === 2 && 'Category Classification'}
              {currentStep === 3 && 'Owner Email'}
              {currentStep === 4 && 'Phone & WhatsApp'}
              {currentStep === 5 && 'Physical Address'}
              {currentStep === 6 && 'Interactive Bathinda Map'}
              {currentStep === 7 && 'Opening Timings'}
              {currentStep === 8 && 'Brand Photo / Logo'}
              {currentStep === 9 && 'Catalog Preview'}
              {currentStep === 10 && 'Security Verification'}
              {currentStep === 11 && 'Confirm & Publish'}
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <div className="w-24 bg-stone-200 h-2 rounded-full overflow-hidden border border-stone-300">
              <div
                className="h-full bg-[#C82A2A] transition-all duration-300"
                style={{ width: `${completeness}%` }}
              ></div>
            </div>
            <span className="font-bold text-[#161412] shrink-0">
              Profile: {completeness}%
            </span>
          </div>
        </div>

        {/* Step Content Body */}
        <div className="p-5 overflow-y-auto flex-1 font-sans">
          {/* STEP 1: BUSINESS NAME */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-black text-[#161412]">
                What is the official trade name of your business?
              </h3>
              <p className="text-xs text-stone-600 font-mono">
                This will appear on the AOCSF directory, map markers, and digital passport across Bathinda.
              </p>
              {stepError && (
                <div className="p-2 bg-red-100 border border-red-300 text-red-800 text-xs font-mono">
                  {stepError}
                </div>
              )}
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (stepError) setStepError(null);
                  }}
                  placeholder="e.g. Royal Sweets & Bakers or Malwa Gadget Care"
                  className="w-full p-2.5 bg-white border border-[#161412]/30 rounded text-sm focus:border-[#C82A2A] focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                  Tagline / Catchphrase (Optional)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Authentic Desi Ghee Confectionery since 1995"
                  className="w-full p-2.5 bg-white border border-[#161412]/30 rounded text-sm focus:border-[#C82A2A] focus:outline-none"
                />
              </div>
              <div className="p-3 bg-[#FAF3E0] border border-[#E0D5B8] flex items-start space-x-2 text-xs font-mono text-stone-700">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>Tip: Authentic local branding helps shoppers on Mall Road and Model Town identify you immediately.</span>
              </div>
            </div>
          )}

          {/* STEP 2: CATEGORY */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Select your business categories (multi-select)
              </h3>
              <p className="text-xs text-stone-600 font-mono">
                Select all that apply so customers searching for "Gym", "Salon", or "Repair" find you.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_CATEGORIES.map((cat) => {
                  const selected = categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`p-2.5 text-xs text-left font-mono rounded border transition flex items-center justify-between ${
                        selected
                          ? 'bg-[#161412] text-white border-black font-semibold'
                          : 'bg-white text-stone-700 border-stone-300 hover:border-black'
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {selected && <CheckCircle2 className="w-3.5 h-3.5 text-[#E23E3E] shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: OWNER EMAIL */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Owner contact & administration email
              </h3>
              <p className="text-xs text-stone-600 font-mono">
                Used to claim management rights, receive customer messages, and secure your listing.
              </p>
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="owner@yourbusiness.com"
                  className="w-full p-2.5 bg-white border border-[#161412]/30 rounded text-sm focus:border-[#C82A2A] focus:outline-none font-mono"
                />
              </div>
            </div>
          )}

          {/* STEP 4: PHONE NUMBER */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Phone number for Quick Connect & WhatsApp
              </h3>
              <p className="text-xs text-stone-600 font-mono">
                Customers in Bathinda tap the "Call" button directly to ring this number.
              </p>
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                  Primary Mobile / Landline *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 bg-white border border-[#161412]/30 rounded text-sm focus:border-[#C82A2A] focus:outline-none font-mono font-bold"
                />
              </div>
            </div>
          )}

          {/* STEP 5: ADDRESS & LOCALITY */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Where is your storefront located in Bathinda?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                    Locality / Area *
                  </label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value as BathindaLocality)}
                    className="w-full p-2.5 bg-white border border-[#161412]/30 rounded text-sm font-mono"
                  >
                    {BATHINDA_LOCALITIES.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                    City & State
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Bathinda, Punjab (151001)"
                    className="w-full p-2.5 bg-[#EFECE4] border border-[#161412]/20 rounded text-sm font-mono text-stone-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                  Detailed Street Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Shop 12, Fountain Chowk, Model Town Phase 1"
                  className="w-full p-2.5 bg-white border border-[#161412]/30 rounded text-sm focus:border-[#C82A2A] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 6: MAP LOCATION */}
          {currentStep === 6 && (
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Pin your exact storefront location on the Bathinda Map
              </h3>
              <p className="text-xs text-stone-600 font-mono">
                Click anywhere on the map or drag the pin to position your shop accurately.
              </p>
              <GoogleMapComponent
                isPicker
                height="280px"
                center={coordinates}
                onLocationPick={(coords) => setCoordinates(coords)}
              />
              <div className="text-[11px] font-mono text-stone-500">
                Selected GPS Coordinates: {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
              </div>
            </div>
          )}

          {/* STEP 7: OPENING HOURS */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Store Hours & Operations
              </h3>
              <p className="text-xs text-stone-600 font-mono">
                AOCSF calculates your "Open Now" badge automatically so customers don't travel to a closed door.
              </p>
              <div className="bg-white border border-[#161412]/20 p-3 rounded space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                  <span className="font-bold">Mon – Sat (Standard Store Hours)</span>
                  <span className="text-[#C82A2A] font-bold">9:30 AM – 8:30 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">Sunday</span>
                  <span className="text-stone-600">11:00 AM – 6:00 PM</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                  Holiday / Gurpurab Notice (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Open till 10 PM during Diwali week"
                  className="w-full p-2 bg-white border border-stone-300 rounded text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 8: PHOTO / LOGO */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Showcase your shopfront with photos
              </h3>
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                  Cover Photo URL
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or paste image URL"
                  className="w-full p-2.5 bg-white border border-[#161412]/30 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                  Logo URL (Optional)
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://... logo image"
                  className="w-full p-2.5 bg-white border border-[#161412]/30 rounded text-xs font-mono"
                />
              </div>
              {photoUrl && (
                <div className="w-full h-36 bg-stone-100 rounded overflow-hidden border border-stone-300">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* STEP 9: CATALOG PREVIEW */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Add your first digital catalog item or service
              </h3>
              <p className="text-xs text-stone-600 font-mono">
                Give customers a reason to explore your profile. You can add more in your dashboard anytime.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                    Featured Item / Service Name
                  </label>
                  <input
                    type="text"
                    value={initialItemName}
                    onChange={(e) => setInitialItemName(e.target.value)}
                    placeholder="e.g. Special Desi Ghee Dhodha or Screen Repair"
                    className="w-full p-2.5 bg-white border border-[#161412]/30 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-semibold text-stone-700 mb-1">
                    Price in INR (₹)
                  </label>
                  <input
                    type="number"
                    value={initialItemPrice}
                    onChange={(e) => setInitialItemPrice(e.target.value)}
                    placeholder="e.g. 450"
                    className="w-full p-2.5 bg-white border border-[#161412]/30 rounded text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: VERIFY EMAIL */}
          {currentStep === 10 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-black text-[#161412]">
                Email Verification & Ownership Security
              </h3>
              <p className="text-xs text-stone-600 font-mono max-w-md mx-auto">
                Official business profiles on AOCSF require verified email access to prevent listing squatting.
              </p>
              <div className="bg-white border border-stone-300 p-3 max-w-sm mx-auto font-mono text-xs">
                Email registered: <strong>{ownerEmail || currentUser?.email || 'Registered account'}</strong>
              </div>
              <p className="text-[11px] text-stone-400 font-mono">
                Verification status: <span className="text-emerald-700 font-semibold">Active & Pre-Verified</span>
              </p>
            </div>
          )}

          {/* STEP 11: CONFIRM & PUBLISH */}
          {currentStep === 11 && (
            <div className="space-y-4">
              <div className="text-center py-2">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#C82A2A] font-bold">
                  READY FOR LAUNCH
                </div>
                <h3 className="font-serif text-2xl font-black text-[#161412] mt-1">
                  {name || 'Your Business'}
                </h3>
                <p className="text-xs text-stone-600 font-mono">
                  {locality}, Bathinda, Punjab
                </p>
              </div>

              <div className="bg-[#FAF7F2] border border-[#161412]/20 p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-500">Categories:</span>
                  <span className="font-bold">{categories.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Contact:</span>
                  <span className="font-bold">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Locality:</span>
                  <span className="font-bold">{locality}, Bathinda</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Calculated Completeness:</span>
                  <span className="font-bold text-[#C82A2A]">{completeness}% Complete</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                <span>Your profile will be immediately discoverable on the AOCSF Bathinda directory and map!</span>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Controls Footer */}
        <div className="bg-[#FAF8F5] border-t border-[#161412]/20 p-3 sm:p-4 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2 border border-[#161412]/30 hover:border-black text-xs font-mono font-medium rounded transition flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < totalSteps ? (
            <button
              onClick={() => {
                if (currentStep === 1 && !name.trim()) {
                  setStepError('Please enter your business name to continue.');
                  return;
                }
                setStepError(null);
                setCurrentStep((prev) => prev + 1);
              }}
              className="px-5 py-2 bg-[#161412] hover:bg-[#C82A2A] text-white text-xs font-mono uppercase tracking-wider font-semibold rounded transition flex items-center space-x-1.5 shadow-sm"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishAndPublish}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#C82A2A] hover:bg-[#A81F1F] text-white text-xs font-mono uppercase tracking-wider font-bold rounded shadow-md transition flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish Profile to Bathinda'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
