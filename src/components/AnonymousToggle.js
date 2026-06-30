import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { EyeOff, User, AlertTriangle } from 'lucide-react';

const AnonymousToggle = ({ isAnonymous, onChange }) => {
  const { language } = useLanguage();
  const [showWarning, setShowWarning] = useState(false);

  const handleToggle = () => {
    const newVal = !isAnonymous;
    onChange(newVal);
    if (newVal) setShowWarning(true);
    else setShowWarning(false);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50" data-testid="anonymous-toggle">
      {/* Toggle Row */}
      <div 
        className="flex items-center justify-between cursor-pointer gap-3"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
            {isAnonymous ? <EyeOff className="w-6 h-6 text-red-600" /> : <User className="w-6 h-6 text-gray-600" />}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">
              {isAnonymous 
                ? (language === 'ta' ? 'அநாமதேய சமர்ப்பிப்பு' : 'Anonymous Submission')
                : (language === 'ta' ? 'உங்கள் பெயருடன் சமர்ப்பி' : 'Submit with your name')}
            </div>
            <div className="text-xs text-gray-500">
              {isAnonymous
                ? (language === 'ta' ? 'உங்கள் அடையாளம் பொதுவில் மறைக்கப்படும்' : 'Your identity will be hidden from public')
                : (language === 'ta' ? 'உங்கள் பெயர் இந்த பிரச்சனையில் தோன்றும்' : 'Your name will appear on this issue')}
            </div>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <div 
          className={`w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0 ${
            isAnonymous ? 'bg-red-600' : 'bg-gray-300'
          }`}
        >
          <div 
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              isAnonymous ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </div>
      </div>

      {/* Warning box when anonymous is ON */}
      {isAnonymous && showWarning && (
        <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-orange-800 font-semibold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            {language === 'ta' ? 'அநாமதேய பயன்முறை செயலில்' : 'Anonymous Mode Active'}
          </div>
          <ul className="text-xs text-orange-700 space-y-1 ml-6 list-disc">
            <li>{language === 'ta' ? 'உங்கள் பெயர் "Anonymous Citizen" என்று பொதுவில் காட்டப்படும்' : 'Your name will show as "Anonymous Citizen" publicly'}</li>
            <li>{language === 'ta' ? 'உங்கள் அடையாளம் பாதுகாப்பாக சேமிக்கப்பட்டு நிர்வாகிகளுக்கு மட்டுமே தெரியும்' : 'Your identity is stored securely and only visible to platform admins'}</li>
            <li>{language === 'ta' ? 'ஊழல், பாதுகாப்பு கவலைகள், உணர்திறன் மிக்க பிரச்சனைகளுக்கு ஏற்றது' : 'Suitable for: corruption reports, safety concerns, sensitive issues'}</li>
          </ul>
          <div className="mt-2 pt-2 border-t border-orange-200 text-xs text-orange-600 italic">
            {language === 'ta' 
              ? 'உங்கள் பெயர் பொதுவில் காட்டப்படாது. ஆனால் தளத்தில் பதிவு செய்யப்படும்.'
              : 'Your name won\'t be shown publicly, but will be recorded on the platform.'}
          </div>
        </div>
      )}

      {/* Recommendation hints */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-xs text-gray-400 font-medium">
          {language === 'ta' ? 'பரிந்துரைக்கப்படுவது:' : 'Recommended for:'}
        </span>
        {[
          { en: 'Corruption', ta: 'ஊழல்' },
          { en: 'Public Safety', ta: 'பொது பாதுகாப்பு' },
          { en: 'Housing', ta: 'வீட்டுவசதி' }
        ].map(tag => (
          <span 
            key={tag.en}
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold transition-colors ${
              isAnonymous 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {language === 'ta' ? tag.ta : tag.en}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnonymousToggle;
