import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const SLA_DAYS = {
  1: 7,   // VAO
  2: 14,  // BDO
  3: 30,  // District Collector
  4: 45,  // Department Secretary
  5: 60,  // Minister
  6: 75,  // Chief Secretary
  7: 90,  // Chief Minister
};

const LEVEL_NAMES = {
  1: { en: 'Village Administrative Officer', ta: 'கிராம நிர்வாக அலுவலர்' },
  2: { en: 'Block Development Officer', ta: 'வட்டார வளர்ச்சி அலுவலர்' },
  3: { en: 'District Collector', ta: 'மாவட்ட ஆட்சியர்' },
  4: { en: 'Department Secretary', ta: 'துறை செயலாளர்' },
  5: { en: 'Concerned Minister', ta: 'சம்பந்தப்பட்ட அமைச்சர்' },
  6: { en: 'Chief Secretary', ta: 'தலைமை செயலாளர்' },
  7: { en: 'Chief Minister', ta: 'முதலமைச்சர்' },
};

const LEVEL_SHORT = {
  1: 'VAO', 2: 'BDO', 3: 'DC', 4: 'SEC', 5: 'MIN', 6: 'CS', 7: 'CM'
};

const SLACountdown = ({ issue }) => {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    if (!issue || issue.status === 'resolved') return;

    const currentLevelEntry = issue.escalation_history
      ?.slice()
      .reverse()
      .find(e => e.level === issue.current_level);

    const escalatedAt = currentLevelEntry?.reached_at
      ? new Date(currentLevelEntry.reached_at)
      : new Date(issue.created_at);

    const slaMs = (SLA_DAYS[issue.current_level] || 30) * 24 * 60 * 60 * 1000;
    const deadline = new Date(escalatedAt.getTime() + slaMs);

    const tick = () => {
      const now = new Date();
      const diff = deadline - now;
      if (diff <= 0) {
        setIsOverdue(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, totalDays: SLA_DAYS[issue.current_level] || 30, elapsed: SLA_DAYS[issue.current_level] || 30 });
      } else {
        setIsOverdue(false);
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          totalDays: SLA_DAYS[issue.current_level] || 30,
          elapsed: Math.floor((now - escalatedAt) / (1000 * 60 * 60 * 24)),
        });
      }
    };

    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [issue]);

  if (!issue) return null;

  if (issue.status === 'resolved') {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-4" data-testid="sla-resolved">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <span className="text-green-700 font-semibold">
          {language === 'ta' ? 'பிரச்சனை தீர்க்கப்பட்டது' : 'Issue Resolved'}
        </span>
      </div>
    );
  }

  if (!timeLeft) return null;

  const progressPct = timeLeft.totalDays > 0
    ? Math.min(100, Math.round((timeLeft.elapsed / timeLeft.totalDays) * 100))
    : 100;

  const getUrgencyColor = () => {
    if (isOverdue) return 'text-red-600';
    if (progressPct > 75) return 'text-orange-500';
    if (progressPct > 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUrgencyBg = () => {
    if (isOverdue) return 'bg-red-500';
    if (progressPct > 75) return 'bg-orange-500';
    if (progressPct > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm" data-testid="sla-countdown">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs text-gray-500 font-medium mb-1">
            {language === 'ta' ? 'தற்போது' : 'CURRENTLY WITH'}
          </div>
          <div className="text-base font-bold text-gray-900 flex items-center gap-2 flex-wrap">
            {LEVEL_NAMES[issue.current_level]?.[language === 'ta' ? 'ta' : 'en']}
            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
              Level {issue.current_level}/7
            </span>
          </div>
        </div>
        {isOverdue && (
          <div className="flex items-center gap-1 text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            OVERDUE
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${getUrgencyBg()}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Countdown */}
      {isOverdue ? (
        <div className="text-red-600 font-semibold mb-4">
          <p>{language === 'ta' ? 'காலக்கெடு முடிந்தது — தானியங்கி உயர்வு நிலுவையில்' : 'Deadline passed — auto-escalation pending'}</p>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'ta' 
              ? `இந்த பிரச்சனை ${LEVEL_SHORT[(issue.current_level || 1) + 1] || 'உயர் அதிகாரி'}க்கு உயர்த்தப்பட வேண்டும்`
              : `This issue should escalate to ${LEVEL_SHORT[(issue.current_level || 1) + 1] || 'higher authority'}`}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-4 mb-4">
          <TimeBox value={timeLeft.days} label={language === 'ta' ? 'நாட்கள்' : 'Days'} color={getUrgencyColor()} />
          <span className="text-2xl font-bold text-gray-300">:</span>
          <TimeBox value={timeLeft.hours} label={language === 'ta' ? 'மணி' : 'Hours'} color={getUrgencyColor()} />
          <span className="text-2xl font-bold text-gray-300">:</span>
          <TimeBox value={timeLeft.minutes} label={language === 'ta' ? 'நிமிடங்கள்' : 'Min'} color={getUrgencyColor()} />
          <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            {language === 'ta' ? 'பதில் அளிக்க மீதம்' : 'left to respond'}
          </div>
        </div>
      )}

      {/* Escalation path */}
      <div className="flex justify-center gap-1.5 mb-2">
        {[1, 2, 3, 4, 5, 6, 7].map(level => (
          <div 
            key={level}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
              level < issue.current_level
                ? 'bg-green-500 text-white'
                : level === issue.current_level
                ? `${getUrgencyBg()} text-white ring-2 ring-offset-1 ring-gray-300`
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            {LEVEL_SHORT[level]}
          </div>
        ))}
      </div>
      <div className="text-center text-xs text-gray-400">
        🟢 {language === 'ta' ? 'முடிந்தது' : 'Done'} &nbsp;|&nbsp; 
        🔴 {language === 'ta' ? 'செயலில்' : 'Active'} &nbsp;|&nbsp; 
        ⚪ {language === 'ta' ? 'நிலுவை' : 'Pending'}
      </div>
    </div>
  );
};

const TimeBox = ({ value, label, color }) => (
  <div className="text-center">
    <div className={`text-3xl font-black tabular-nums ${color}`}>
      {String(value).padStart(2, '0')}
    </div>
    <div className="text-[10px] text-gray-400 font-medium">{label}</div>
  </div>
);

export default SLACountdown;
