import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Scale, Star, TrendingUp, TrendingDown, CheckCircle, BarChart3, MapPin, Building } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORY_COLORS = {
  water: '#3b82f6',
  roads: '#f59e0b',
  health: '#ef4444',
  electricity: '#8b5cf6',
  flooding: '#06b6d4',
  pollution: '#84cc16',
  schools: '#f97316',
  farming: '#22c55e',
  transport: '#ec4899',
  garbage: '#a78bfa',
  sewage: '#14b8a6',
  employment: '#fb923c',
  housing: '#60a5fa',
  welfare: '#34d399',
  corruption: '#f43f5e',
  safety: '#94a3b8',
};

const DistrictComparePage = () => {
  const { language } = useLanguage();
  const [districts, setDistricts] = useState([]);
  const [allConstituencies, setAllConstituencies] = useState([]);
  
  const [districtA, setDistrictA] = useState('Chennai');
  const [districtB, setDistrictB] = useState('Coimbatore');
  const [constituencyA, setConstituencyA] = useState('');
  const [constituencyB, setConstituencyB] = useState('');
  const [constituenciesA, setConstituenciesA] = useState([]);
  const [constituenciesB, setConstituenciesB] = useState([]);
  
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compared, setCompared] = useState(false);

  // Fetch districts and all constituencies on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [distRes, constRes] = await Promise.all([
          axios.get(`${API}/constants/districts`),
          axios.get(`${API}/constants/constituencies`)
        ]);
        setDistricts(distRes.data.districts || []);
        setAllConstituencies(constRes.data.constituencies || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch constituencies when district A changes
  useEffect(() => {
    if (districtA) {
      axios.get(`${API}/constants/constituencies?district=${encodeURIComponent(districtA)}`)
        .then(res => {
          setConstituenciesA(res.data.constituencies || []);
          setConstituencyA('');
        })
        .catch(() => setConstituenciesA([]));
    }
  }, [districtA]);

  // Fetch constituencies when district B changes
  useEffect(() => {
    if (districtB) {
      axios.get(`${API}/constants/constituencies?district=${encodeURIComponent(districtB)}`)
        .then(res => {
          setConstituenciesB(res.data.constituencies || []);
          setConstituencyB('');
        })
        .catch(() => setConstituenciesB([]));
    }
  }, [districtB]);

  const handleCompare = async () => {
    setLoading(true);
    setCompared(false);
    try {
      const [resA, resB] = await Promise.all([
        axios.get(`${API}/dashboard/district/${encodeURIComponent(districtA)}`),
        axios.get(`${API}/dashboard/district/${encodeURIComponent(districtB)}`)
      ]);
      setDataA(resA.data);
      setDataB(resB.data);
      setCompared(true);
    } catch (err) {
      console.error('Compare failed:', err);
    }
    setLoading(false);
  };

  const getWinner = (valA, valB, lowerIsBetter = false) => {
    if (valA == null || valB == null) return null;
    if (lowerIsBetter) return valA < valB ? 'A' : valA > valB ? 'B' : 'tie';
    return valA > valB ? 'A' : valA < valB ? 'B' : 'tie';
  };

  const StatRow = ({ label, valA, valB, lowerIsBetter, format }) => {
    const w = getWinner(valA, valB, lowerIsBetter);
    const fmt = format || (v => v?.toLocaleString() ?? '—');
    return (
      <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
        <div className={`flex-1 text-xl flex items-center gap-2 ${w === 'A' ? 'text-green-600 font-bold' : 'text-gray-900'}`}>
          {w === 'A' && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
          {fmt(valA)}
        </div>
        <div className="flex-1 text-center text-sm text-gray-500 font-medium">{label}</div>
        <div className={`flex-1 text-xl text-right flex items-center justify-end gap-2 ${w === 'B' ? 'text-green-600 font-bold' : 'text-gray-900'}`}>
          {fmt(valB)}
          {w === 'B' && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
        </div>
      </div>
    );
  };

  const CategoryBar = ({ category, countA, countB }) => {
    const max = Math.max(countA || 0, countB || 0, 1);
    const color = CATEGORY_COLORS[category] || '#94a3b8';
    return (
      <div className="mb-3">
        <div className="text-xs text-gray-500 font-medium mb-1 capitalize">{category}</div>
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex justify-end">
            <div 
              className="h-3 rounded-l-full transition-all duration-500"
              style={{ 
                width: `${((countA || 0) / max) * 100}%`, 
                backgroundColor: color,
                opacity: 0.8,
                minWidth: countA ? 4 : 0
              }}
            />
          </div>
          <div className="text-xs text-gray-400 w-16 text-center tabular-nums">
            {countA || 0} / {countB || 0}
          </div>
          <div className="flex-1">
            <div 
              className="h-3 rounded-r-full transition-all duration-500"
              style={{ 
                width: `${((countB || 0) / max) * 100}%`, 
                backgroundColor: color,
                minWidth: countB ? 4 : 0
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Merge categories from both districts
  const allCategories = compared && dataA && dataB
    ? [...new Set([
        ...(dataA.category_breakdown?.map(c => c.category) || []),
        ...(dataB.category_breakdown?.map(c => c.category) || [])
      ])]
    : [];

  const getCategoryCount = (data, category) => {
    return data?.category_breakdown?.find(c => c.category === category)?.count || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-gradient-to-r from-red-600 to-yellow-500 text-white border-0">
            <Scale className="w-3 h-3 mr-1" />
            {language === 'ta' ? 'ஒப்பீடு கருவி' : 'Comparison Tool'}
          </Badge>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {language === 'ta' ? 'மாவட்டம் & தொகுதி ஒப்பீடு' : 'District & Constituency Comparison'}
          </h1>
          <p className="text-gray-500">
            {language === 'ta' 
              ? `தமிழ்நாட்டின் 38 மாவட்டங்கள் மற்றும் 234 தொகுதிகளை ஒப்பிடுங்கள்`
              : `Compare across Tamil Nadu's 38 districts and 234 constituencies`}
          </p>
          <div className="flex justify-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary" />
              38 {language === 'ta' ? 'மாவட்டங்கள்' : 'Districts'}
            </span>
            <span className="flex items-center gap-1">
              <Building className="w-4 h-4 text-yellow-500" />
              234 {language === 'ta' ? 'தொகுதிகள்' : 'Constituencies'}
            </span>
          </div>
        </div>

        {/* Selector Card */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4 items-end">
              {/* Side A */}
              <div className="space-y-3">
                <div className="text-center">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {language === 'ta' ? 'பக்கம் A' : 'Side A'}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                    {language === 'ta' ? 'மாவட்டம்' : 'District'}
                  </label>
                  <Select value={districtA} onValueChange={setDistrictA}>
                    <SelectTrigger className="border-2 border-red-200 focus:border-red-400" data-testid="district-a-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                    {language === 'ta' ? 'தொகுதி' : 'Constituency'} <span className="text-gray-400">({constituenciesA.length})</span>
                  </label>
                  <Select value={constituencyA} onValueChange={setConstituencyA}>
                    <SelectTrigger className="border-2 border-red-100" data-testid="constituency-a-select">
                      <SelectValue placeholder={language === 'ta' ? 'அனைத்தும்' : 'All'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">{language === 'ta' ? 'அனைத்து தொகுதிகள்' : 'All Constituencies'}</SelectItem>
                      {constituenciesA.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* VS Button */}
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-yellow-900 font-black text-lg shadow-lg">
                  VS
                </div>
              </div>

              {/* Side B */}
              <div className="space-y-3">
                <div className="text-center">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {language === 'ta' ? 'பக்கம் B' : 'Side B'}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                    {language === 'ta' ? 'மாவட்டம்' : 'District'}
                  </label>
                  <Select value={districtB} onValueChange={setDistrictB}>
                    <SelectTrigger className="border-2 border-blue-200 focus:border-blue-400" data-testid="district-b-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                    {language === 'ta' ? 'தொகுதி' : 'Constituency'} <span className="text-gray-400">({constituenciesB.length})</span>
                  </label>
                  <Select value={constituencyB} onValueChange={setConstituencyB}>
                    <SelectTrigger className="border-2 border-blue-100" data-testid="constituency-b-select">
                      <SelectValue placeholder={language === 'ta' ? 'அனைத்தும்' : 'All'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">{language === 'ta' ? 'அனைத்து தொகுதிகள்' : 'All Constituencies'}</SelectItem>
                      {constituenciesB.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCompare}
              disabled={loading || districtA === districtB}
              className="w-full mt-6 btn-tvk text-base py-6"
              data-testid="compare-btn"
            >
              {loading 
                ? (language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...')
                : (language === 'ta' ? 'ஒப்பிடு →' : 'Compare →')}
            </Button>
            {districtA === districtB && (
              <p className="text-center text-sm text-red-500 mt-2">
                {language === 'ta' ? 'வேறுபட்ட மாவட்டங்களைத் தேர்ந்தெடுக்கவும்' : 'Please select different districts'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {compared && dataA && dataB && (
          <div className="space-y-4 animate-fade-in">
            {/* District Headers */}
            <div className="flex gap-2">
              <div className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl text-center shadow-lg">
                <div className="font-bold text-lg">{districtA}</div>
                {constituencyA && constituencyA.trim() && (
                  <div className="text-xs text-red-200">{constituencyA}</div>
                )}
              </div>
              <div className="w-10 flex-shrink-0" />
              <div className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl text-center shadow-lg">
                <div className="font-bold text-lg">{districtB}</div>
                {constituencyB && constituencyB.trim() && (
                  <div className="text-xs text-blue-200">{constituencyB}</div>
                )}
              </div>
            </div>

            {/* Key Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {language === 'ta' ? 'முக்கிய புள்ளிவிவரங்கள்' : 'Key Statistics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StatRow 
                  label={language === 'ta' ? 'மொத்த பிரச்சனைகள்' : 'Total Issues'}
                  valA={dataA.stats?.total}
                  valB={dataB.stats?.total}
                  lowerIsBetter={true}
                />
                <StatRow 
                  label={language === 'ta' ? 'தீர்க்கப்பட்டவை' : 'Resolved'}
                  valA={dataA.stats?.resolved}
                  valB={dataB.stats?.resolved}
                />
                <StatRow 
                  label={language === 'ta' ? 'தீர்வு விகிதம்' : 'Resolution Rate'}
                  valA={dataA.stats?.resolution_rate}
                  valB={dataB.stats?.resolution_rate}
                  format={v => `${v || 0}%`}
                />
                <StatRow 
                  label={language === 'ta' ? 'நிலுவை' : 'Pending'}
                  valA={dataA.stats?.pending}
                  valB={dataB.stats?.pending}
                  lowerIsBetter={true}
                />
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            {allCategories.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">
                    {language === 'ta' ? 'வகை வாரியான பிரச்சனைகள்' : 'Issues by Category'}
                  </CardTitle>
                  <div className="flex justify-between text-xs font-semibold mt-2">
                    <span className="text-red-600">← {districtA}</span>
                    <span className="text-blue-600">{districtB} →</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {allCategories.map(cat => (
                    <CategoryBar
                      key={cat}
                      category={cat}
                      countA={getCategoryCount(dataA, cat)}
                      countB={getCategoryCount(dataB, cat)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Verdict */}
            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-yellow-800 uppercase tracking-wide flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {language === 'ta' ? 'ஒட்டுமொத்த தீர்ப்பு' : 'Overall Verdict'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const resRateA = dataA.stats?.resolution_rate || 0;
                  const resRateB = dataB.stats?.resolution_rate || 0;
                  const better = resRateA > resRateB ? districtA : resRateB > resRateA ? districtB : null;
                  return (
                    <div className="text-yellow-900">
                      {better ? (
                        <p className="flex items-start gap-2">
                          {resRateA > resRateB ? <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <TrendingDown className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                          <span>
                            <strong>{better}</strong> {language === 'ta' ? 'அதிக தீர்வு விகிதம்' : 'has better resolution rate'} ({better === districtA ? resRateA : resRateB}% vs {better === districtA ? resRateB : resRateA}%)
                          </span>
                        </p>
                      ) : (
                        <p>{language === 'ta' ? 'இரு மாவட்டங்களும் ஒரே மாதிரி.' : 'Both districts have similar rates.'}</p>
                      )}
                      <p className="text-xs text-yellow-700 mt-2">
                        <Star className="w-3 h-3 inline text-yellow-500 fill-yellow-500" /> = {language === 'ta' ? 'சிறந்த செயல்திறன்' : 'Better performance'}
                      </p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistrictComparePage;
