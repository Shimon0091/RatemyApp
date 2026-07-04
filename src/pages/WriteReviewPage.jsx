import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { createReview } from '../lib/database';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RatingInput from '../components/RatingInput';
import { logger } from '../utils/logger';
import {
  LinePin, LineBuilding, LineStarSolid, LineDoc, LineCheck, LineX,
  LineArrowLeft, LineArrowRight, LineAlert, LineSearch, LineLock,
  LineBadgeCheck,
} from '../components/icons/line';

// Google Places API Key from environment
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';

const inputClass =
  'w-full rounded-xl bg-canvas border border-black/10 px-4 py-3 text-[15px] text-ink ' +
  'placeholder:text-muted/70 outline-none transition-colors focus:border-petrol focus:ring-2 focus:ring-petrol/20';

// DRY yes / no toggle used across step 3.
function YesNo({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink mb-3">{label}</label>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`btn flex-1 px-4 py-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
            value === true
              ? 'border-petrol bg-petrol-50 text-petrol'
              : 'border-black/10 text-muted hover:border-petrol/40 hover:bg-canvas'
          }`}
        >
          <LineCheck width="18" height="18" /> כן
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`btn flex-1 px-4 py-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
            value === false
              ? 'border-red-400 bg-red-50 text-red-600'
              : 'border-black/10 text-muted hover:border-red-300 hover:bg-canvas'
          }`}
        >
          <LineX width="18" height="18" /> לא
        </button>
      </div>
    </div>
  );
}

// sessionStorage key for a review-in-progress. Survives the login round-trip
// (including a full-page OAuth redirect), so a user who fills the form while
// logged out doesn't lose their work when we bounce them through /login.
const DRAFT_KEY = 'diragon_review_draft';

export default function WriteReviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  // Prefill source, resolved once on mount:
  //  1. A draft persisted before a login round-trip (highest priority), or
  //  2. Router state passed from PropertyPage / SearchResultsPage (address context).
  const [initial] = useState(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) return { ...JSON.parse(raw), fromDraft: true };
    } catch {
      /* ignore malformed draft */
    }
    const s = location.state || {};
    return {
      propertyId: s.propertyId || null,
      street: s.street || '',
      buildingNumber: s.buildingNumber || '',
      floor: s.floor || '',
      apartment: s.apartment || '',
      city: s.city || '',
    };
  });

  // Address is locked (read-only) when we arrived with a concrete existing
  // property. Prefilling the exact stored address prevents getOrCreateProperty
  // from spawning a duplicate property row for the same building.
  const lockedAddress = Boolean(initial.propertyId);

  // Step 1: Property Info
  const [step, setStep] = useState(initial.step || (initial.propertyId ? 2 : 1));
  const [street, setStreet] = useState(initial.street || '');
  const [buildingNumber, setBuildingNumber] = useState(initial.buildingNumber || '');
  const [floor, setFloor] = useState(initial.floor || '');
  const [apartment, setApartment] = useState(initial.apartment || '');
  const [city, setCity] = useState(initial.city || '');

  // Google Places Autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const autocompleteRef = useRef(null);

  // Step 2: Ratings
  const [overallRating, setOverallRating] = useState(initial.overallRating || 0);
  const [maintenanceQuality, setMaintenanceQuality] = useState(initial.maintenanceQuality || 0);
  const [landlordCommunication, setLandlordCommunication] = useState(initial.landlordCommunication || 0);
  const [contractCompliance, setContractCompliance] = useState(initial.contractCompliance || 0);
  const [timelyRepairs, setTimelyRepairs] = useState(initial.timelyRepairs || 0);
  const [valueRating, setValueRating] = useState(initial.valueRating || 0);

  // Step 3: Additional Details
  const [reviewText, setReviewText] = useState(initial.reviewText || '');
  const [depositReturned, setDepositReturned] = useState(initial.depositReturned ?? null);
  const [contractRespected, setContractRespected] = useState(initial.contractRespected ?? null);
  const [repairsTimely, setRepairsTimely] = useState(initial.repairsTimely ?? null);
  const [parkingAvailable, setParkingAvailable] = useState(initial.parkingAvailable ?? null);
  const [niceNeighbors, setNiceNeighbors] = useState(initial.niceNeighbors ?? null);
  const [nearbyAmenities, setNearbyAmenities] = useState(initial.nearbyAmenities ?? null);
  const [rentAmount, setRentAmount] = useState(initial.rentAmount || '');
  const [moveInDate, setMoveInDate] = useState(initial.moveInDate || '');
  const [moveOutDate, setMoveOutDate] = useState(initial.moveOutDate || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // A restored draft has done its job — drop it so a later fresh visit starts clean.
  useEffect(() => {
    if (initial.fromDraft) {
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    }
  }, [initial.fromDraft]);

  // Load Google Maps SDK
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY.includes('XXX')) return;

    const loadGoogleMaps = () => {
      return new Promise((resolve) => {
        if (window.google?.maps?.places?.AutocompleteSuggestion) {
          resolve();
          return;
        }
        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
          const check = setInterval(() => {
            if (window.google?.maps?.places?.AutocompleteSuggestion) {
              clearInterval(check);
              resolve();
            }
          }, 100);
          return;
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&language=he&loading=async`;
        script.async = true;
        script.onload = () => {
          const check = setInterval(() => {
            if (window.google?.maps?.places?.AutocompleteSuggestion) {
              clearInterval(check);
              resolve();
            }
          }, 50);
        };
        document.head.appendChild(script);
      });
    };

    loadGoogleMaps().then(() => setMapsReady(true));
  }, []);

  // Google Places Autocomplete using new API
  useEffect(() => {
    if (lockedAddress || !street || street.length < 3 || !mapsReady) {
      setSuggestions([]);
      return;
    }
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY.includes('XXX')) {
      setSuggestions([]);
      return;
    }

    setIsLoadingPlaces(true);
    let cancelled = false;

    const timeoutId = setTimeout(async () => {
      try {
        const { suggestions: results } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: street,
          includedRegionCodes: ['il'],
          language: 'he',
        });

        if (!cancelled && results && results.length > 0) {
          setSuggestions(results);
          setShowSuggestions(true);
        } else if (!cancelled) {
          setSuggestions([]);
        }
      } catch (err) {
        logger.error('Places API error:', err);
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setIsLoadingPlaces(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [street, mapsReady, lockedAddress]);

  const handleSelectPlace = async (placeId, description) => {
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY.includes('XXX')) {
      const parts = description.split(',');
      if (parts.length > 0) setStreet(parts[0].trim());
      if (parts.length > 1) setCity(parts[1].trim());
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const place = new window.google.maps.places.Place({ id: placeId });
      await place.fetchFields({ fields: ['addressComponents'] });

      const addressComponents = place.addressComponents || [];

      let streetName = '';
      let streetNumber = '';
      let cityName = '';

      for (const component of addressComponents) {
        if (component.types.includes('route')) {
          streetName = component.longText;
        }
        if (component.types.includes('street_number')) {
          streetNumber = component.longText;
        }
        if (component.types.includes('locality')) {
          cityName = component.longText;
        }
      }

      setStreet(streetName);
      setBuildingNumber(streetNumber);
      setCity(cityName);
    } catch (err) {
      logger.error('Error getting place details:', err);
      const parts = description.split(',');
      if (parts.length > 0) setStreet(parts[0].trim());
      if (parts.length > 1) setCity(parts[1].trim());
    }

    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!street || !buildingNumber || !city) {
      setError('יש למלא רחוב, מספר בניין ועיר');
      return;
    }
    setError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    if (overallRating === 0) {
      setError('יש לתת דירוג כללי');
      return;
    }
    if (!maintenanceQuality || !landlordCommunication || !contractCompliance || !timelyRepairs || !valueRating) {
      setError('יש למלא את כל הדירוגים');
      return;
    }
    setError('');
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Snapshot the whole in-progress review so it survives a login redirect.
  const persistDraft = () => {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          propertyId: initial.propertyId,
          step,
          street, buildingNumber, floor, apartment, city,
          overallRating, maintenanceQuality, landlordCommunication,
          contractCompliance, timelyRepairs, valueRating,
          reviewText, depositReturned, contractRespected, repairsTimely,
          parkingAvailable, niceNeighbors, nearbyAmenities,
          rentAmount, moveInDate, moveOutDate,
        })
      );
    } catch {
      /* storage unavailable — the user simply re-enters after login */
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    if (!reviewText || reviewText.length < 20) {
      setError('הביקורת חייבת להכיל לפחות 20 תווים');
      return;
    }

    // Deferred login gate: anyone may fill the form; we only require auth here,
    // at the final submit. Save progress and bounce through /login, then resume.
    if (!user) {
      persistDraft();
      navigate('/login', { state: { from: '/write-review' } });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const tags = {};
      if (depositReturned !== null) tags.depositReturned = depositReturned;
      if (contractRespected !== null) tags.contractRespected = contractRespected;
      if (repairsTimely !== null) tags.maintenanceTimely = repairsTimely;
      if (parkingAvailable !== null) tags.parkingAvailable = parkingAvailable;
      if (niceNeighbors !== null) tags.niceNeighbors = niceNeighbors;
      if (nearbyAmenities !== null) tags.nearbyAmenities = nearbyAmenities;

      const reviewData = {
        addressData: {
          street,
          buildingNumber,
          floor: floor || null,
          apartment: apartment || null,
          city: city || 'תל אביב'
        },
        userId: user.id,
        ratings: {
          overall: overallRating,
          maintenance: maintenanceQuality || null,
          communication: landlordCommunication || null,
          value: valueRating || null
        },
        reviewText,
        rentalPeriod: {
          start: moveInDate || null,
          end: moveOutDate || null
        },
        monthlyRent: rentAmount ? parseFloat(rentAmount) : null,
        tags
      };

      const { error } = await createReview(reviewData);
      if (error) throw error;

      // Clear any lingering draft and land on the profile with a clear
      // "received, pending approval" confirmation (ProfilePage renders state.message).
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      navigate('/profile', {
        state: { message: 'הביקורת התקבלה וממתינה לאישור. נעדכן אתכם ברגע שתאושר ותפורסם.' },
      });
    } catch (err) {
      logger.error('Error submitting review:', err);
      setError('שגיאה בשליחת הביקורת. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading auth
  if (authLoading) {
    return (
      <div className="bg-canvas text-ink font-body min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 grid place-items-center py-24">
          <div className="text-center">
            <span className="mx-auto grid place-items-center w-14 h-14 rounded-2xl bg-petrol-50 text-petrol animate-pulse">
              <LineBadgeCheck width="28" height="28" />
            </span>
            <div className="mt-4 text-muted">בודק הרשאות…</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'פרטי הדירה', Icon: LineBuilding },
    { number: 2, title: 'דירוגים', Icon: LineStarSolid },
    { number: 3, title: 'פרטים נוספים', Icon: LineDoc },
  ];

  return (
    <div className="bg-canvas text-ink font-body min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <main id="main-content" className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-10 lg:py-12">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((s, index) => {
                const isActive = step === s.number;
                const isCompleted = step > s.number;
                return (
                  <div key={s.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-2xl grid place-items-center mb-2 transition-all ${
                          isCompleted
                            ? 'bg-petrol text-white'
                            : isActive
                            ? 'bg-amber-cta text-white shadow-lift'
                            : 'bg-white border border-black/10 text-muted'
                        }`}
                      >
                        {isCompleted ? <LineCheck width="22" height="22" /> : <s.Icon width="22" height="22" />}
                      </div>
                      <span className={`text-sm font-semibold ${isActive ? 'text-ink' : 'text-muted'}`}>
                        {s.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-1 flex-1 mx-2 rounded-full transition-all ${step > s.number ? 'bg-petrol' : 'bg-black/10'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-medium text-muted">שלב {step} מתוך 3</span>
              <span className="text-sm font-bold text-petrol">{Math.round((step / 3) * 100)}%</span>
            </div>
          </div>

          {/* Logged-out notice: fill freely now, sign in only at the end. */}
          {!user && (
            <div className="mb-6 rounded-2xl bg-petrol-50 border border-petrol/15 p-4 flex items-start gap-3">
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-petrol text-white shrink-0">
                <LineLock width="18" height="18" />
              </span>
              <div className="text-sm">
                <div className="font-semibold text-ink">אפשר להתחיל למלא כבר עכשיו</div>
                <div className="text-muted">נבקש להתחבר רק בסוף, לפני השליחה — כדי למנוע ספאם. הפרטים שתמלאו יישמרו.</div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6 sm:p-8 animate-scale-in">
            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-petrol-50 text-petrol">
                    <LineBuilding width="22" height="22" />
                  </span>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">פרטי הדירה</h2>
                </div>

                <div className="space-y-5">
                  {lockedAddress && (
                    <div className="rounded-xl bg-petrol-50 border border-petrol/15 p-3 flex items-start gap-2">
                      <LineLock className="text-petrol shrink-0 mt-0.5" width="16" height="16" />
                      <p className="text-sm text-petrol">הכתובת נטענה מדף הדירה — אין צורך להזין שוב.</p>
                    </div>
                  )}
                  <div className="relative" ref={autocompleteRef}>
                    <label className="block text-sm font-semibold text-ink mb-2">{t('property.street')} <span className="text-red-500">*</span></label>
                    <input
                      value={street}
                      onChange={(e) => { setStreet(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="התחילו להקליד כתובת…"
                      required
                      readOnly={lockedAddress}
                      className={`${inputClass}${lockedAddress ? ' bg-black/5 text-muted cursor-not-allowed' : ''}`}
                    />

                    {isLoadingPlaces && (
                      <div className="absolute left-3 top-[42px]">
                        <span className="block w-4 h-4 rounded-full border-2 border-petrol/30 border-t-petrol animate-spin" />
                      </div>
                    )}

                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-black/10 rounded-xl shadow-card max-h-60 overflow-y-auto animate-slide-down">
                        {suggestions.map((suggestion, index) => {
                          const prediction = suggestion.placePrediction;
                          const text = prediction?.text?.text || '';
                          const mainText = prediction?.mainText?.text || text;
                          const secondaryText = prediction?.secondaryText?.text || '';
                          return (
                            <button
                              key={prediction?.placeId || index}
                              type="button"
                              onClick={() => handleSelectPlace(prediction?.placeId, text)}
                              className="w-full px-4 py-3 text-right hover:bg-petrol-50 transition-colors border-b border-black/5 last:border-b-0"
                            >
                              <div className="flex items-start gap-2">
                                <LinePin className="text-petrol shrink-0 mt-0.5" width="16" height="16" />
                                <div className="flex-1">
                                  <div className="font-semibold text-ink">{mainText}</div>
                                  {secondaryText && <div className="text-sm text-muted">{secondaryText}</div>}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {lockedAddress ? null : (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY.includes('XXX')) ? (
                      <div className="mt-2 p-3 rounded-xl bg-amber-100 border border-amber/20 flex items-start gap-2">
                        <LineAlert className="text-amber-600 shrink-0 mt-0.5" width="16" height="16" />
                        <div className="text-sm text-amber-600">
                          <p className="font-semibold">השלמה אוטומטית של כתובות אינה זמינה</p>
                          <p className="text-xs mt-0.5">יש להזין את הכתובת ידנית</p>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted flex items-center gap-2">
                        <LineSearch width="15" height="15" /> התחילו להקליד והמערכת תציע כתובות
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">{t('property.building')} <span className="text-red-500">*</span></label>
                    <input value={buildingNumber} onChange={(e) => setBuildingNumber(e.target.value)} placeholder="למשל: 123" required readOnly={lockedAddress} className={`${inputClass}${lockedAddress ? ' bg-black/5 text-muted cursor-not-allowed' : ''}`} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-2">{t('property.floor')}</label>
                      <input value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="למשל: 3" readOnly={lockedAddress} className={`${inputClass}${lockedAddress ? ' bg-black/5 text-muted cursor-not-allowed' : ''}`} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-2">{t('property.apartment')}</label>
                      <input value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="למשל: 12" readOnly={lockedAddress} className={`${inputClass}${lockedAddress ? ' bg-black/5 text-muted cursor-not-allowed' : ''}`} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">{t('property.city')} <span className="text-red-500">*</span></label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="למשל: תל אביב" required readOnly={lockedAddress} className={`${inputClass}${lockedAddress ? ' bg-black/5 text-muted cursor-not-allowed' : ''}`} />
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                    <LineAlert className="text-red-600 shrink-0 mt-0.5" width="18" height="18" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button type="submit" className="btn w-full mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-petrol text-white px-6 py-3.5 font-bold hover:bg-petrol-700">
                  המשך לדירוגים
                  <LineArrowLeft width="18" height="18" />
                </button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-amber-100 text-amber-600">
                    <LineStarSolid width="22" height="22" />
                  </span>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">דרגו את הדירה</h2>
                </div>

                <div className="space-y-5">
                  {[
                    { label: t('rating.overall'), value: overallRating, onChange: setOverallRating },
                    { label: t('rating.maintenance'), value: maintenanceQuality, onChange: setMaintenanceQuality },
                    { label: t('rating.communication'), value: landlordCommunication, onChange: setLandlordCommunication },
                    { label: t('rating.contractCompliance'), value: contractCompliance, onChange: setContractCompliance },
                    { label: t('rating.timelyRepairs'), value: timelyRepairs, onChange: setTimelyRepairs },
                    { label: t('rating.value'), value: valueRating, onChange: setValueRating },
                  ].map((r) => (
                    <div key={r.label} className="rounded-xl bg-canvas border border-black/5 p-4">
                      <label className="block text-sm font-semibold text-ink mb-2">
                        {r.label} <span className="text-red-500">*</span>
                      </label>
                      <RatingInput value={r.value} onChange={r.onChange} />
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                    <LineAlert className="text-red-600 shrink-0 mt-0.5" width="18" height="18" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 text-ink px-6 py-3.5 font-bold hover:bg-canvas">
                    <LineArrowRight width="18" height="18" />
                    חזרה
                  </button>
                  <button type="submit" className="btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-petrol text-white px-6 py-3.5 font-bold hover:bg-petrol-700">
                    המשך לפרטים
                    <LineArrowLeft width="18" height="18" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <form onSubmit={handleFinalSubmit}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-petrol-50 text-petrol">
                    <LineDoc width="22" height="22" />
                  </span>
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink">ספרו לנו יותר</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">
                      {t('review.reviewText')} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="שתפו את החוויה שלכם… (לפחות 20 תווים)"
                      rows={6}
                      className={`${inputClass} resize-none`}
                      required
                    />
                    <p className="mt-2 text-sm text-muted">
                      {reviewText.length}/20 תווים מינימום
                    </p>
                  </div>

                  <div className="space-y-4">
                    <YesNo label={t('writeReview.q.deposit')} value={depositReturned} onChange={setDepositReturned} />
                    <YesNo label={t('writeReview.q.contract')} value={contractRespected} onChange={setContractRespected} />
                    <YesNo label={t('writeReview.q.repairs')} value={repairsTimely} onChange={setRepairsTimely} />
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="font-heading font-bold text-lg text-ink">על השכונה</h3>
                    <YesNo label={t('writeReview.q.parking')} value={parkingAvailable} onChange={setParkingAvailable} />
                    <YesNo label={t('writeReview.q.neighbors')} value={niceNeighbors} onChange={setNiceNeighbors} />
                    <YesNo label={t('writeReview.q.amenities')} value={nearbyAmenities} onChange={setNearbyAmenities} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-2">תאריך כניסה</label>
                      <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-2">תאריך יציאה</label>
                      <input type="date" value={moveOutDate} onChange={(e) => setMoveOutDate(e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ink mb-2">שכר דירה חודשי (אופציונלי)</label>
                    <input type="number" value={rentAmount} onChange={(e) => setRentAmount(e.target.value)} placeholder="₪" className={inputClass} />
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                    <LineAlert className="text-red-600 shrink-0 mt-0.5" width="18" height="18" />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={isSubmitting} className="btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 text-ink px-6 py-3.5 font-bold hover:bg-canvas disabled:opacity-50">
                    <LineArrowRight width="18" height="18" />
                    חזרה
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-cta text-white px-6 py-3.5 font-bold shadow-[0_10px_24px_-10px_rgba(224,152,46,0.8)] hover:bg-amber-600 disabled:opacity-50 disabled:shadow-none">
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        שולח…
                      </>
                    ) : (
                      <>
                        <LineCheck width="18" height="18" />
                        שלח ביקורת
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
