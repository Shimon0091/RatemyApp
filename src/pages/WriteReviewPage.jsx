import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { createReview } from '../lib/database';
import RatingInput from '../components/RatingInput';
import { logger } from '../utils/logger';
import Icon from '../components/icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';

// Google Places API Key from environment
const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';

export default function WriteReviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // Step 1: Property Info
  const [step, setStep] = useState(1);
  const [street, setStreet] = useState('');
  const [buildingNumber, setBuildingNumber] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');

  // Google Places Autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const autocompleteRef = useRef(null);

  // Step 2: Ratings
  const [overallRating, setOverallRating] = useState(0);
  const [maintenanceQuality, setMaintenanceQuality] = useState(0);
  const [landlordCommunication, setLandlordCommunication] = useState(0);
  const [contractCompliance, setContractCompliance] = useState(0);
  const [timelyRepairs, setTimelyRepairs] = useState(0);
  const [valueRating, setValueRating] = useState(0);

  // Step 3: Additional Details
  const [reviewText, setReviewText] = useState('');
  const [depositReturned, setDepositReturned] = useState(null);
  const [contractRespected, setContractRespected] = useState(null);
  const [repairsTimely, setRepairsTimely] = useState(null);
  const [rentAmount, setRentAmount] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [moveOutDate, setMoveOutDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Google Places Autocomplete
  useEffect(() => {
    const searchPlaces = async () => {
      if (!street || street.length < 3) {
        setSuggestions([]);
        return;
      }
      if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY.includes('XXX')) {
        setSuggestions([]);
        return;
      }

      setIsLoadingPlaces(true);

      try {
        const query = `${street}, ישראל`;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&components=country:il&language=he`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch places');
        }

        const data = await response.json();

        if (data.status === 'OK' && data.predictions) {
          setSuggestions(data.predictions);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        logger.error('Places API error:', err);
        setSuggestions([]);
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    const timeoutId = setTimeout(searchPlaces, 300);
    return () => clearTimeout(timeoutId);
  }, [street]);

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
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}&language=he`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const place = data.result;
        const addressComponents = place.address_components || [];

        let streetName = '';
        let streetNumber = '';
        let cityName = '';

        for (const component of addressComponents) {
          if (component.types.includes('route')) {
            streetName = component.long_name;
          }
          if (component.types.includes('street_number')) {
            streetNumber = component.long_name;
          }
          if (component.types.includes('locality')) {
            cityName = component.long_name;
          }
        }

        setStreet(streetName);
        setBuildingNumber(streetNumber);
        setCity(cityName);
      } else {
        const parts = description.split(',');
        if (parts.length > 0) setStreet(parts[0].trim());
        if (parts.length > 1) setCity(parts[1].trim());
      }
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
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();

    if (!reviewText || reviewText.length < 20) {
      setError('הביקורת חייבת להכיל לפחות 20 תווים');
      return;
    }

    if (!user) {
      setError('חובה להיות מחובר כדי לכתוב ביקורת');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const tags = {};
      if (depositReturned !== null) {
        tags.depositReturned = depositReturned;
      }
      if (contractRespected !== null) {
        tags.contractRespected = contractRespected;
      }
      if (repairsTimely !== null) {
        tags.maintenanceTimely = repairsTimely;
      }

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

      const { data, error } = await createReview(reviewData);

      if (error) {
        throw error;
      }

      navigate('/');
    } catch (err) {
      logger.error('Error submitting review:', err);
      setError('שגיאה בשליחת הביקורת. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="בודק הרשאות..." />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <Icon.Lock className="w-16 h-16 mx-auto mb-4 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t('auth.required')}
          </h2>
          <p className="text-gray-600 mb-6">
            כדי לכתוב ביקורת, עליך להיות מחובר למערכת
          </p>
          <Button
            onClick={() => navigate('/login', { state: { from: '/write-review' } })}
            className="w-full"
          >
            {t('auth.loginNow')}
          </Button>
        </Card>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'פרטי הדירה', icon: Icon.Building },
    { number: 2, title: 'דירוגים', icon: Icon.Star },
    { number: 3, title: 'פרטים נוספים', icon: Icon.FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Visual Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, index) => {
              const StepIcon = s.icon;
              const isActive = step === s.number;
              const isCompleted = step > s.number;

              return (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isCompleted
                          ? 'bg-accent-500 text-white'
                          : isActive
                          ? 'bg-primary-500 text-white shadow-medium'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Icon.Check className="w-6 h-6" />
                      ) : (
                        <StepIcon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive ? 'text-primary-600' : 'text-gray-500'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded transition-all ${
                        step > s.number ? 'bg-accent-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm font-medium text-gray-600">שלב {step} מתוך 3</span>
            <span className="text-sm font-medium text-primary-600">{Math.round((step / 3) * 100)}%</span>
          </div>
        </div>

        <Card className="p-8 animate-scale-in">
          {/* Step 1: Property Info */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <div className="flex items-center gap-3 mb-6">
                <Icon.Building className="w-8 h-8 text-primary-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  פרטי הדירה
                </h2>
              </div>

              <div className="space-y-6">
                {/* Street with Autocomplete */}
                <div className="relative" ref={autocompleteRef}>
                  <Input
                    label={t('property.street')}
                    value={street}
                    onChange={(e) => {
                      setStreet(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="התחל להקליד כתובת..."
                    required
                  />

                  {/* Loading indicator */}
                  {isLoadingPlaces && (
                    <div className="absolute left-3 top-10">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}

                  {/* Suggestions dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-medium max-h-60 overflow-y-auto animate-slide-down">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.place_id}
                          type="button"
                          onClick={() => handleSelectPlace(suggestion.place_id, suggestion.description)}
                          className="w-full px-4 py-3 text-right hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start gap-2">
                            <Icon.MapPin className="text-primary-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {suggestion.structured_formatting?.main_text || suggestion.description}
                              </div>
                              {suggestion.structured_formatting?.secondary_text && (
                                <div className="text-sm text-gray-500">
                                  {suggestion.structured_formatting.secondary_text}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {(!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY.includes('XXX')) ? (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <Icon.Alert className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-700">
                        <p className="font-medium">השלמה אוטומטית של כתובות אינה זמינה</p>
                        <p className="text-xs mt-1">יש להזין את הכתובת ידנית</p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                      <Icon.Search className="w-4 h-4" />
                      התחל להקליד והמערכת תציע כתובות
                    </p>
                  )}
                </div>

                <Input
                  label={t('property.building')}
                  value={buildingNumber}
                  onChange={(e) => setBuildingNumber(e.target.value)}
                  placeholder="למשל: 123"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t('property.floor')}
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="למשל: 3"
                  />
                  <Input
                    label={t('property.apartment')}
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    placeholder="למשל: 12"
                  />
                </div>

                <Input
                  label={t('property.city')}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="למשל: תל אביב"
                  required
                />
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <Icon.Alert className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full mt-8" size="lg">
                המשך לדירוגים
                <Icon.ArrowLeft className="mr-2" />
              </Button>
            </form>
          )}

          {/* Step 2: Ratings */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              <div className="flex items-center gap-3 mb-6">
                <Icon.Star className="w-8 h-8 text-primary-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  דרג את הדירה
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rating.overall')} <span className="text-red-500">*</span>
                  </label>
                  <RatingInput value={overallRating} onChange={setOverallRating} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rating.maintenance')} <span className="text-red-500">*</span>
                  </label>
                  <RatingInput value={maintenanceQuality} onChange={setMaintenanceQuality} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rating.communication')} <span className="text-red-500">*</span>
                  </label>
                  <RatingInput value={landlordCommunication} onChange={setLandlordCommunication} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rating.contractCompliance')} <span className="text-red-500">*</span>
                  </label>
                  <RatingInput value={contractCompliance} onChange={setContractCompliance} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rating.timelyRepairs')} <span className="text-red-500">*</span>
                  </label>
                  <RatingInput value={timelyRepairs} onChange={setTimelyRepairs} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('rating.value')} <span className="text-red-500">*</span>
                  </label>
                  <RatingInput value={valueRating} onChange={setValueRating} />
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <Icon.Alert className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="ghost"
                  className="flex-1"
                  size="lg"
                >
                  <Icon.ArrowRight className="ml-2" />
                  חזור
                </Button>
                <Button type="submit" className="flex-1" size="lg">
                  המשך לפרטים
                  <Icon.ArrowLeft className="mr-2" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Additional Details */}
          {step === 3 && (
            <form onSubmit={handleFinalSubmit}>
              <div className="flex items-center gap-3 mb-6">
                <Icon.FileText className="w-8 h-8 text-primary-500" />
                <h2 className="text-3xl font-bold text-gray-900">
                  ספר לנו יותר
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('review.reviewText')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="שתף את החוויה שלך... (לפחות 20 תווים)"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {reviewText.length}/20 תווים מינימום
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      האם הפיקדון הוחזר במלואו?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setDepositReturned(true)}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          depositReturned === true
                            ? 'border-accent-500 bg-accent-50 text-accent-700 shadow-soft'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon.Check className="w-5 h-5" />
                        {t('review.yes')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDepositReturned(false)}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          depositReturned === false
                            ? 'border-red-500 bg-red-50 text-red-700 shadow-soft'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon.XMark className="w-5 h-5" />
                        {t('review.no')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      האם בעל הבית עמד בתנאי החוזה?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setContractRespected(true)}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          contractRespected === true
                            ? 'border-accent-500 bg-accent-50 text-accent-700 shadow-soft'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon.Check className="w-5 h-5" />
                        {t('review.yes')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setContractRespected(false)}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          contractRespected === false
                            ? 'border-red-500 bg-red-50 text-red-700 shadow-soft'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon.XMark className="w-5 h-5" />
                        {t('review.no')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      האם תיקונים בוצעו בזמן סביר?
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setRepairsTimely(true)}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          repairsTimely === true
                            ? 'border-accent-500 bg-accent-50 text-accent-700 shadow-soft'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon.Check className="w-5 h-5" />
                        {t('review.yes')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRepairsTimely(false)}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          repairsTimely === false
                            ? 'border-red-500 bg-red-50 text-red-700 shadow-soft'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon.XMark className="w-5 h-5" />
                        {t('review.no')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="תאריך כניסה"
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                  />
                  <Input
                    label="תאריך יציאה"
                    type="date"
                    value={moveOutDate}
                    onChange={(e) => setMoveOutDate(e.target.value)}
                  />
                </div>

                <Input
                  label="שכר דירה (אופציונלי)"
                  type="number"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  placeholder="₪"
                />
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <Icon.Alert className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  variant="ghost"
                  className="flex-1"
                  size="lg"
                  disabled={isSubmitting}
                >
                  <Icon.ArrowRight className="ml-2" />
                  חזור
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  className="flex-1"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      שולח...
                    </>
                  ) : (
                    <>
                      <Icon.Dragon className="ml-2" />
                      שלח ביקורת
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
