import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  AlertTriangle, Droplets, Building2, Zap, Heart, Truck, 
  Trash2, MapPin, TrendingUp, TrendingDown, Info, HelpCircle,
  BarChart3, PieChart, Activity, Map, ChevronRight
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PFIPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [pfiData, setPfiData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [constituencies, setConstituencies] = useState([]);
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [constituencyDetail, setConstituencyDetail] = useState(null);
  const [districtDetail, setDistrictDetail] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  const categoryIcons = {
    water: Droplets,
    flooding: AlertTriangle,
    health: Heart,
    roads: Building2,
    electricity: Zap,
    sewage: Trash2,
    garbage: Trash2,
    pollution: AlertTriangle
  };

  const categoryColors = {
    water: '#3b82f6',
    flooding: '#06b6d4',
    health: '#ef4444',
    roads: '#f59e0b',
    electricity: '#8b5cf6',
    sewage: '#14b8a6',
    garbage: '#a78bfa',
    pollution: '#84cc16'
  };

  useEffect(() => {
    fetchPFIData();
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      fetchDistrictDetail(selectedDistrict);
      fetchConstituencies(selectedDistrict);
    } else {
      setConstituencies([]);
      setSelectedConstituency('');
      setConstituencyDetail(null);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedDistrict && selectedConstituency) {
      fetchConstituencyDetail(selectedDistrict, selectedConstituency);
    } else {
      setConstituencyDetail(null);
    }
  }, [selectedDistrict, selectedConstituency]);

  const fetchConstituencies = async (district) => {
    try {
      const res = await axios.get(`${API}/constants/constituencies`, { params: { district } });
      setConstituencies(res.data.constituencies || []);
      setSelectedConstituency('');
    } catch {
      setConstituencies([]);
    }
  };

  const fetchConstituencyDetail = async (district, constituency) => {
    try {
      const res = await axios.get(`${API}/pfi/constituency`, {
        params: { district, constituency }
      });
      setConstituencyDetail(res.data);
    } catch {
      setConstituencyDetail(null);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await axios.get(`${API}/constants/districts`);
      setDistricts(res.data.districts || []);
    } catch (err) {
      console.error('Failed to fetch districts');
    }
  };

  const fetchPFIData = async () => {
    try {
      const response = await axios.get(`${API}/pfi/districts`);
      if (response.data.success) {
        const sorted = response.data.districts?.sort((a, b) => b.total_score - a.total_score) || [];
        setPfiData(sorted);
        
        // Generate mock trend data
        const trends = sorted.slice(0, 10).map(d => ({
          name: d.district,
          current: d.total_score,
          previous: Math.max(0, d.total_score + Math.floor(Math.random() * 40) - 20),
          change: Math.floor(Math.random() * 30) - 15
        }));
        setTrendData(trends);
      }
    } catch (error) {
      // Generate mock data for demo
      const mockDistricts = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 
                            'Tirunelveli', 'Erode', 'Tiruppur', 'Vellore', 'Thanjavur'];
      const mockData = mockDistricts.map(d => ({
        district: d,
        total_score: Math.floor(Math.random() * 100),
        categories: {
          water: { score: Math.floor(Math.random() * 30), issues: Math.floor(Math.random() * 50) },
          roads: { score: Math.floor(Math.random() * 25), issues: Math.floor(Math.random() * 40) },
          health: { score: Math.floor(Math.random() * 20), issues: Math.floor(Math.random() * 30) },
          flooding: { score: Math.floor(Math.random() * 15), issues: Math.floor(Math.random() * 25) },
          garbage: { score: Math.floor(Math.random() * 10), issues: Math.floor(Math.random() * 20) }
        }
      }));
      setPfiData(mockData.sort((a, b) => b.total_score - a.total_score));
      
      setTrendData(mockData.slice(0, 10).map(d => ({
        name: d.district,
        current: d.total_score,
        previous: Math.max(0, d.total_score + Math.floor(Math.random() * 40) - 20),
        change: Math.floor(Math.random() * 30) - 15
      })));
    }
    setLoading(false);
  };

  const fetchDistrictDetail = async (district) => {
    try {
      const response = await axios.get(`${API}/pfi/district/${encodeURIComponent(district)}`);
      setDistrictDetail(response.data);
    } catch (error) {
      // Mock detail data
      const found = pfiData.find(d => d.district === district);
      if (found) {
        setDistrictDetail({
          district,
          ...found,
          trend: Array(6).fill(0).map((_, i) => ({
            month: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            score: Math.floor(Math.random() * 100)
          }))
        });
      }
    }
  };

  const getScoreLevel = (score) => {
    if (score >= 70) return { level: 'critical', color: 'red', label_en: 'Critical', label_ta: 'மிக மோசம்' };
    if (score >= 40) return { level: 'warning', color: 'orange', label_en: 'Warning', label_ta: 'எச்சரிக்கை' };
    return { level: 'normal', color: 'green', label_en: 'Normal', label_ta: 'சாதாரணம்' };
  };

  const maxScore = Math.max(...pfiData.map(d => d.total_score || 0), 100);

  // Calculate category totals for pie chart
  const categoryTotals = pfiData.reduce((acc, d) => {
    if (d.categories) {
      Object.entries(d.categories).forEach(([cat, data]) => {
        acc[cat] = (acc[cat] || 0) + (data.issues || 0);
      });
    }
    return acc;
  }, {});

  const totalIssues = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-gradient-to-r from-red-600 to-orange-500 text-white border-0">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {language === 'ta' ? 'பொது தோல்வி குறியீடு' : 'Public Failure Index'}
          </Badge>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {language === 'ta' ? 'PFI டாஷ்போர்டு' : 'PFI Dashboard'}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {language === 'ta' 
              ? 'மாவட்டம் வாரியாக அரசு சேவைகளின் தோல்வி அளவை கண்காணிக்கவும்'
              : 'Track government service failures across districts with data-driven insights'}
          </p>
        </div>

        {/* District + Constituency Filter (Batch 2: granular drill-down) */}
        <Card className="mb-6 border-yellow-200 bg-gradient-to-r from-amber-50 to-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 shrink-0">
                <MapPin className="w-4 h-4" />
                {language === 'ta' ? 'வடிகட்டி:' : 'Filter:'}
              </div>
              <Select value={selectedDistrict || 'all'} onValueChange={v => setSelectedDistrict(v === 'all' ? '' : v)}>
                <SelectTrigger className="flex-1 bg-white" data-testid="pfi-district-select">
                  <SelectValue placeholder={language === 'ta' ? 'மாவட்டம் தேர்வு' : 'Select District'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ta' ? 'அனைத்து மாவட்டங்கள்' : 'All Districts'}</SelectItem>
                  {districts.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedConstituency || 'all'}
                onValueChange={v => setSelectedConstituency(v === 'all' ? '' : v)}
                disabled={!selectedDistrict || constituencies.length === 0}
              >
                <SelectTrigger className="flex-1 bg-white" data-testid="pfi-constituency-select">
                  <SelectValue placeholder={
                    !selectedDistrict
                      ? (language === 'ta' ? 'முதலில் மாவட்டம் தேர்வு' : 'Select district first')
                      : (language === 'ta' ? 'தொகுதி தேர்வு' : 'Select Constituency')
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ta' ? 'அனைத்து தொகுதிகள்' : 'All Constituencies'}</SelectItem>
                  {constituencies.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(selectedDistrict || selectedConstituency) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSelectedDistrict(''); setSelectedConstituency(''); }}
                  data-testid="pfi-clear-filter"
                  className="shrink-0"
                >
                  {language === 'ta' ? 'அழி' : 'Clear'}
                </Button>
              )}
            </div>

            {/* Inline constituency PFI summary */}
            {constituencyDetail && (
              <div className="mt-4 pt-4 border-t border-amber-200" data-testid="constituency-pfi-summary">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-amber-700 font-medium uppercase tracking-wide">
                      {language === 'ta' ? 'தொகுதி PFI' : 'Constituency PFI'}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {constituencyDetail.constituency}, {constituencyDetail.district}
                    </div>
                  </div>
                  <Badge className={`text-base px-3 py-1 ${
                    constituencyDetail.overall_score >= 70 ? 'bg-red-500' :
                    constituencyDetail.overall_score >= 40 ? 'bg-orange-500' : 'bg-green-500'
                  }`}>
                    {constituencyDetail.overall_score}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(constituencyDetail.categories || {})
                    .sort((a, b) => b[1].score - a[1].score)
                    .slice(0, 4)
                    .map(([cat, data]) => {
                      const Icon = categoryIcons[cat] || AlertTriangle;
                      return (
                        <div key={cat} className="bg-white rounded-lg p-2 border border-amber-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon className="w-3.5 h-3.5" style={{ color: categoryColors[cat] || '#94a3b8' }} />
                            <span className="text-xs font-medium capitalize truncate">{cat}</span>
                          </div>
                          <div className="text-base font-bold" style={{
                            color: data.level === 'critical' ? '#dc2626' :
                                   data.level === 'warning' ? '#ea580c' : '#16a34a'
                          }}>
                            {data.score}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Tabs */}
        <Tabs value={activeView} onValueChange={setActiveView} className="mb-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl mx-auto">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              {language === 'ta' ? 'மேலோட்டம்' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="ranking" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              {language === 'ta' ? 'தரவரிசை' : 'Ranking'}
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <PieChart className="w-4 h-4" />
              {language === 'ta' ? 'வகைகள்' : 'Categories'}
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <Activity className="w-4 h-4" />
              {language === 'ta' ? 'போக்குகள்' : 'Trends'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Top Critical Districts */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    {language === 'ta' ? 'மிக மோசமான மாவட்டங்கள்' : 'Most Critical Districts'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pfiData.slice(0, 5).map((district, idx) => {
                      const scoreInfo = getScoreLevel(district.total_score);
                      return (
                        <div key={district.district} className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-500' : idx === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium">{district.district}</span>
                              <Badge className={`bg-${scoreInfo.color}-100 text-${scoreInfo.color}-700`}>
                                {district.total_score}
                              </Badge>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  scoreInfo.level === 'critical' ? 'bg-red-500' :
                                  scoreInfo.level === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${(district.total_score / maxScore) * 100}%` }}
                              />
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedDistrict(district.district);
                              setActiveView('ranking');
                            }}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-10 h-10 text-red-500" />
                      <div>
                        <p className="text-red-600 text-sm font-medium">
                          {language === 'ta' ? 'மிக மோசம்' : 'Critical'}
                        </p>
                        <p className="text-2xl font-bold text-red-700">
                          {pfiData.filter(d => d.total_score >= 70).length}
                        </p>
                        <p className="text-xs text-red-500">{language === 'ta' ? 'மாவட்டங்கள்' : 'districts'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-10 h-10 text-orange-500" />
                      <div>
                        <p className="text-orange-600 text-sm font-medium">
                          {language === 'ta' ? 'எச்சரிக்கை' : 'Warning'}
                        </p>
                        <p className="text-2xl font-bold text-orange-700">
                          {pfiData.filter(d => d.total_score >= 40 && d.total_score < 70).length}
                        </p>
                        <p className="text-xs text-orange-500">{language === 'ta' ? 'மாவட்டங்கள்' : 'districts'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="w-10 h-10 text-green-500" />
                      <div>
                        <p className="text-green-600 text-sm font-medium">
                          {language === 'ta' ? 'சாதாரணம்' : 'Normal'}
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          {pfiData.filter(d => d.total_score < 40).length}
                        </p>
                        <p className="text-xs text-green-500">{language === 'ta' ? 'மாவட்டங்கள்' : 'districts'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Ranking Tab - Bar Chart */}
          <TabsContent value="ranking">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {language === 'ta' ? 'மாவட்ட தரவரிசை' : 'District Ranking'}
                  </CardTitle>
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger className="w-[200px]">
                      <MapPin className="w-4 h-4 mr-2" />
                      <SelectValue placeholder={language === 'ta' ? 'மாவட்டம்' : 'Select District'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">{language === 'ta' ? 'அனைத்தும்' : 'All'}</SelectItem>
                      {districts.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {/* Horizontal Bar Chart */}
                <div className="space-y-3">
                  {pfiData.slice(0, 15).map((district, idx) => {
                    const scoreInfo = getScoreLevel(district.total_score);
                    const isSelected = selectedDistrict === district.district;
                    return (
                      <div 
                        key={district.district} 
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          isSelected ? 'bg-yellow-50 border border-yellow-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedDistrict(district.district)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="w-6 text-sm font-bold text-gray-400">#{idx + 1}</div>
                        <div className="w-32 font-medium truncate">{district.district}</div>
                        <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                          <div 
                            className={`h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2 ${
                              scoreInfo.level === 'critical' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                              scoreInfo.level === 'warning' ? 'bg-gradient-to-r from-orange-400 to-orange-600' : 
                              'bg-gradient-to-r from-green-400 to-green-600'
                            }`}
                            style={{ width: `${Math.max(10, (district.total_score / maxScore) * 100)}%` }}
                          >
                            <span className="text-white text-xs font-bold">{district.total_score}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className={`w-20 justify-center ${
                          scoreInfo.level === 'critical' ? 'border-red-300 text-red-600' :
                          scoreInfo.level === 'warning' ? 'border-orange-300 text-orange-600' :
                          'border-green-300 text-green-600'
                        }`}>
                          {language === 'ta' ? scoreInfo.label_ta : scoreInfo.label_en}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab - Pie Chart */}
          <TabsContent value="categories">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pie Chart Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    {language === 'ta' ? 'வகை வாரியான பிரச்சனைகள்' : 'Issues by Category'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Simple CSS Pie Chart */}
                  <div className="relative w-64 h-64 mx-auto mb-6">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {(() => {
                        let cumulative = 0;
                        return Object.entries(categoryTotals).map(([cat, count]) => {
                          const pct = totalIssues > 0 ? (count / totalIssues) * 100 : 0;
                          const start = cumulative;
                          cumulative += pct;
                          const largeArc = pct > 50 ? 1 : 0;
                          const startAngle = (start / 100) * 2 * Math.PI;
                          const endAngle = (cumulative / 100) * 2 * Math.PI;
                          const x1 = 50 + 40 * Math.cos(startAngle);
                          const y1 = 50 + 40 * Math.sin(startAngle);
                          const x2 = 50 + 40 * Math.cos(endAngle);
                          const y2 = 50 + 40 * Math.sin(endAngle);
                          
                          if (pct < 1) return null;
                          
                          return (
                            <path
                              key={cat}
                              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={categoryColors[cat] || '#94a3b8'}
                              stroke="white"
                              strokeWidth="1"
                            />
                          );
                        });
                      })()}
                      <circle cx="50" cy="50" r="20" fill="white" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{totalIssues}</div>
                        <div className="text-xs text-gray-500">{language === 'ta' ? 'மொத்தம்' : 'Total'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                      const Icon = categoryIcons[cat] || AlertTriangle;
                      const pct = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0;
                      return (
                        <div key={cat} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: categoryColors[cat] || '#94a3b8' }}
                          />
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm capitalize flex-1">{cat}</span>
                          <span className="text-sm font-bold">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Category Details */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'ta' ? 'வகை விவரங்கள்' : 'Category Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                    const Icon = categoryIcons[cat] || AlertTriangle;
                    const pct = totalIssues > 0 ? (count / totalIssues) * 100 : 0;
                    return (
                      <div key={cat} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5" style={{ color: categoryColors[cat] }} />
                            <span className="font-medium capitalize">{cat}</span>
                          </div>
                          <span className="text-sm text-gray-500">{count} issues</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${pct}%`,
                              backgroundColor: categoryColors[cat] || '#94a3b8'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab - Line Chart */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  {language === 'ta' ? 'மாற்றப் போக்குகள்' : 'Change Trends'}
                </CardTitle>
                <CardDescription>
                  {language === 'ta' ? 'கடந்த மாதத்துடன் ஒப்பிடுகையில்' : 'Compared to last month'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendData.map(item => {
                    const isImproving = item.change < 0;
                    const changeAbs = Math.abs(item.change);
                    return (
                      <div key={item.name} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                        <div className="w-32 font-medium">{item.name}</div>
                        
                        {/* Mini trend line */}
                        <div className="flex-1 flex items-center gap-2">
                          <div className="text-sm text-gray-500 w-16">{item.previous}</div>
                          <div className="flex-1 h-1 bg-gray-200 rounded relative">
                            <div 
                              className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                                isImproving ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ left: `${(item.previous / 100) * 100}%` }}
                            />
                            <div 
                              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow ${
                                isImproving ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ left: `${(item.current / 100) * 100}%` }}
                            />
                          </div>
                          <div className="text-sm font-bold w-16">{item.current}</div>
                        </div>

                        {/* Change indicator */}
                        <Badge className={`w-20 justify-center ${
                          isImproving 
                            ? 'bg-green-100 text-green-700' 
                            : item.change === 0 
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {isImproving ? <TrendingDown className="w-3 h-3 mr-1" /> : item.change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : null}
                          {isImproving ? '-' : item.change > 0 ? '+' : ''}{changeAbs}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-around text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {trendData.filter(t => t.change < 0).length}
                      </div>
                      <div className="text-xs text-gray-500">
                        {language === 'ta' ? 'முன்னேற்றம்' : 'Improving'}
                      </div>
                    </div>
                    <div className="border-l border-gray-200" />
                    <div>
                      <div className="text-2xl font-bold text-gray-600">
                        {trendData.filter(t => t.change === 0).length}
                      </div>
                      <div className="text-xs text-gray-500">
                        {language === 'ta' ? 'மாற்றமில்லை' : 'No Change'}
                      </div>
                    </div>
                    <div className="border-l border-gray-200" />
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {trendData.filter(t => t.change > 0).length}
                      </div>
                      <div className="text-xs text-gray-500">
                        {language === 'ta' ? 'மோசமானது' : 'Worsening'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* How PFI Works */}
        <Card className="mt-8 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-slate-600" />
              {language === 'ta' ? 'PFI எப்படி கணக்கிடப்படுகிறது?' : 'How is PFI Calculated?'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-white rounded-lg">
                <div className="font-semibold text-red-600 mb-1">+10 {language === 'ta' ? 'புள்ளிகள்' : 'points'}</div>
                <p className="text-gray-600">{language === 'ta' ? 'ஒவ்வொரு தீர்க்கப்படாத பிரச்சனைக்கும்' : 'For each unresolved issue'}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="font-semibold text-orange-600 mb-1">+2 {language === 'ta' ? 'புள்ளிகள்' : 'points'}</div>
                <p className="text-gray-600">{language === 'ta' ? 'மீண்டும் மீண்டும் வரும் பிரச்சனைகளுக்கு' : 'For repeat/recurring issues'}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="font-semibold text-green-600 mb-1">-3 {language === 'ta' ? 'புள்ளிகள்' : 'points'}</div>
                <p className="text-gray-600">{language === 'ta' ? 'ஒவ்வொரு தீர்க்கப்பட்ட பிரச்சனைக்கும்' : 'For each resolved issue'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PFIPage;
