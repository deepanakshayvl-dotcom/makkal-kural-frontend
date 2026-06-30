import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Megaphone, Users, CheckCircle, TrendingUp, MapPin, 
  ThumbsUp, MessageSquare, ChevronRight, ArrowRight,
  Droplets, Building2, Zap, Truck, Heart, Shield, Star,
  Flame, Award, Target, AlertTriangle, Factory, GraduationCap,
  TreePine, Trash2, Building
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedDistrict, selectedConstituency]);

  // Fetch constituencies when district changes
  useEffect(() => {
    if (selectedDistrict) {
      axios.get(`${API}/constants/constituencies?district=${encodeURIComponent(selectedDistrict)}`)
        .then(res => {
          setConstituencies(res.data.constituencies || []);
          setSelectedConstituency('');
        })
        .catch(() => setConstituencies([]));
    } else {
      setConstituencies([]);
      setSelectedConstituency('');
    }
  }, [selectedDistrict]);

  const fetchData = async () => {
    try {
      const params = { sort_by: 'support_count', limit: 6 };
      if (selectedDistrict) params.district = selectedDistrict;
      if (selectedConstituency) params.constituency = selectedConstituency;
      
      const [issuesRes, statsRes, districtsRes] = await Promise.all([
        axios.get(`${API}/issues`, { params }),
        axios.get(`${API}/dashboard/overview`),
        axios.get(`${API}/constants/districts`)
      ]);
      
      setIssues(issuesRes.data.issues || []);
      setStats(statsRes.data.stats);
      setDistricts(districtsRes.data.districts || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = {
    water: Droplets,
    roads: Building2,
    electricity: Zap,
    transport: Truck,
    health: Heart,
    pollution: Factory,
    flooding: AlertTriangle,
    schools: GraduationCap,
    farming: TreePine,
    garbage: Trash2,
    safety: Shield,
    employment: Target,
    welfare: Award
  };

  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  return (
    <div className="min-h-screen">
      {/* TVK Stripe */}
      <div className="tvk-stripe" />
      
      {/* Hero Section */}
      <section className="relative hero-mesh py-16 lg:py-24 noise-overlay overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <Badge className="tvk-badge text-sm">
                  <Flame className="w-4 h-4 mr-1.5 inline" />
                  {language === 'ta' ? 'தமிழ்நாட்டின் முதல்' : "Tamil Nadu's First"}
                </Badge>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground font-tamil leading-tight">
                <span className="highlight-yellow">{t('heroTitle')}</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl font-tamil leading-relaxed">
                {t('heroSubtitle')}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="btn-tvk gap-2 touch-target text-base px-8 rounded-xl"
                  onClick={() => navigate(isAuthenticated ? '/raise-issue' : '/auth')}
                  data-testid="hero-get-started"
                >
                  <Megaphone className="w-5 h-5" />
                  {t('getStarted')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="gap-2 touch-target text-base rounded-xl border-2 border-primary/30 hover:bg-primary/5"
                  onClick={() => navigate('/dashboard')}
                  data-testid="hero-view-issues"
                >
                  {t('viewIssues')}
                </Button>
              </div>
              
              {/* Quick Stats Row */}
              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>{stats?.total_issues || 0}+ {language === 'ta' ? 'பிரச்சனைகள்' : 'Issues'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>38 {language === 'ta' ? 'மாவட்டங்கள்' : 'Districts'}</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 animate-slide-up">
              <Card className="card-hover bg-white/90 backdrop-blur tvk-card-accent">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <Megaphone className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{formatNumber(stats?.total_issues)}</p>
                  <p className="text-sm text-muted-foreground font-tamil">
                    {language === 'ta' ? 'பிரச்சனைகள்' : 'Issues Raised'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-hover bg-white/90 backdrop-blur tvk-card-accent">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {stats?.status_breakdown?.find(s => s.status === 'resolved')?.count || 0}
                  </p>
                  <p className="text-sm text-muted-foreground font-tamil">
                    {language === 'ta' ? 'தீர்வு' : 'Resolved'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-hover bg-white/90 backdrop-blur tvk-card-accent">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-yellow-900" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{formatNumber(stats?.total_users)}</p>
                  <p className="text-sm text-muted-foreground font-tamil">
                    {language === 'ta' ? 'குடிமக்கள்' : 'Citizens'}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="card-hover bg-white/90 backdrop-blur tvk-card-accent">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{formatNumber(stats?.total_votes)}</p>
                  <p className="text-sm text-muted-foreground font-tamil">
                    {language === 'ta' ? 'வாக்குகள்' : 'Votes'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 border-primary/30">
              <Star className="w-4 h-4 mr-1.5 text-primary" />
              {language === 'ta' ? 'எளிமையான செயல்முறை' : 'Simple Process'}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground font-tamil">
              {language === 'ta' ? 'எப்படி செயல்படுகிறது?' : 'How It Works'}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                icon: Megaphone,
                titleTa: 'பிரச்சனை எழுப்பு',
                titleEn: 'Raise Issue',
                descTa: 'உங்கள் பகுதியில் உள்ள பிரச்சனையை விவரிக்கவும்',
                descEn: 'Describe the problem in your area with voice or text',
                color: 'from-red-500 to-red-600'
              },
              {
                step: 2,
                icon: Users,
                titleTa: 'ஆதரவு பெறுங்கள்',
                titleEn: 'Get Support',
                descTa: 'மற்ற குடிமக்கள் ஆதரவு அளிக்கலாம்',
                descEn: 'Other citizens can support or oppose',
                color: 'from-yellow-400 to-yellow-500'
              },
              {
                step: 3,
                icon: TrendingUp,
                titleTa: 'தானியங்கி உயர்வு',
                titleEn: 'Auto Escalation',
                descTa: 'போதுமான ஆதரவுடன், உயர் அதிகாரிகளுக்கு செல்கிறது',
                descEn: 'With enough support, it escalates to higher officials',
                color: 'from-green-500 to-green-600'
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="text-center animate-slide-up group" style={{ animationDelay: `${idx * 0.15}s` }}>
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="w-10 h-10 mx-auto -mt-7 mb-2 rounded-full bg-white border-4 border-background flex items-center justify-center text-lg font-bold text-primary shadow">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 font-tamil">
                    {language === 'ta' ? item.titleTa : item.titleEn}
                  </h3>
                  <p className="text-muted-foreground font-tamil">
                    {language === 'ta' ? item.descTa : item.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Issues Feed */}
      <section className="py-16 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <Badge variant="outline" className="mb-2 border-primary/30">
                <Flame className="w-3 h-3 mr-1 text-primary" />
                {language === 'ta' ? 'நேரடி' : 'Live'}
              </Badge>
              <h2 className="text-2xl font-bold text-foreground font-tamil">
                {language === 'ta' ? 'மக்களின் குரல்கள்' : "People's Voices"}
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-[180px] border-2 border-primary/20" data-testid="district-filter">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  <SelectValue placeholder={language === 'ta' ? 'மாவட்டம்' : 'District'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">{language === 'ta' ? 'அனைத்து மாவட்டங்கள்' : 'All Districts'}</SelectItem>
                  {districts.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Constituency Filter */}
              {selectedDistrict && selectedDistrict.trim() && constituencies.length > 0 && (
                <Select value={selectedConstituency} onValueChange={setSelectedConstituency}>
                  <SelectTrigger className="w-[200px] border-2 border-yellow-300" data-testid="constituency-filter">
                    <Building className="w-4 h-4 mr-2 text-yellow-600" />
                    <SelectValue placeholder={language === 'ta' ? 'தொகுதி' : 'Constituency'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">{language === 'ta' ? 'அனைத்து தொகுதிகள்' : 'All'} ({constituencies.length})</SelectItem>
                    {constituencies.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Selected filters info */}
          {(selectedDistrict && selectedDistrict.trim()) && (
            <div className="mb-6 flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
                <MapPin className="w-3 h-3 mr-1" />
                {selectedDistrict}
              </Badge>
              {selectedConstituency && selectedConstituency.trim() && (
                <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
                  <Building className="w-3 h-3 mr-1" />
                  {selectedConstituency}
                </Badge>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-20 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : issues.length === 0 ? (
            <Card className="border-dashed border-2 border-primary/20">
              <CardContent className="p-12 text-center">
                <Megaphone className="w-12 h-12 mx-auto mb-4 text-primary/40" />
                <p className="text-muted-foreground font-tamil">
                  {language === 'ta' ? 'பிரச்சனைகள் இல்லை' : 'No issues found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue, idx) => {
                const Icon = categoryIcons[issue.category] || Megaphone;
                return (
                  <Card 
                    key={issue.id} 
                    className="card-hover cursor-pointer animate-fade-in bg-white overflow-hidden"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                    onClick={() => navigate(`/issues/${issue.id}`)}
                    data-testid={`issue-card-${issue.id}`}
                  >
                    {/* Category Color Bar */}
                    <div className="h-1.5 bg-gradient-to-r from-primary to-accent" />
                    
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <Badge variant="outline" className="text-xs border-primary/20">
                            {language === 'ta' ? issue.category_name_ta : issue.category_name_en}
                          </Badge>
                        </div>
                        <Badge className={`status-${issue.status} text-xs`}>
                          {t(issue.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-1 font-tamil">
                        {language === 'ta' ? issue.problem_name_ta : issue.problem_name_en}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-tamil">
                        {issue.description}
                      </p>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3 bg-muted/50 rounded-lg px-2 py-1.5 w-fit">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span className="font-medium">{issue.district}</span>
                        <span className="text-muted-foreground/60">•</span>
                        <span>{issue.local_body_name}</span>
                      </div>
                      
                      {/* Support Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600 font-semibold">
                            {issue.support_percentage}% {language === 'ta' ? 'ஆதரவு' : 'support'}
                          </span>
                          <span className="text-muted-foreground">
                            {issue.support_count + issue.oppose_count} {language === 'ta' ? 'வாக்குகள்' : 'votes'}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill support" 
                            style={{ width: `${issue.support_percentage}%` }} 
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5 text-green-500" />
                            {issue.support_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-primary" />
                            {issue.comment_count}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-primary text-sm font-medium">
                          {language === 'ta' ? 'மேலும்' : 'View'}
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Button 
              variant="outline" 
              size="lg"
              className="gap-2 border-2 border-primary/30 hover:bg-primary/5 rounded-xl"
              onClick={() => navigate('/dashboard')} 
              data-testid="view-all-btn"
            >
              {language === 'ta' ? 'அனைத்தும் காண்க' : 'View All Issues'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section - TVK Themed */}
      <section className="cta-tvk py-20 text-white relative">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 mb-6">
            <Shield className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-medium">{language === 'ta' ? 'ஒவ்வொரு குரலும் முக்கியம்' : 'Every Voice Matters'}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-tamil">
            {language === 'ta' 
              ? 'உங்கள் குரலை எழுப்புங்கள்' 
              : 'Make Your Voice Heard'}
          </h2>
          <p className="text-lg opacity-90 mb-8 font-tamil max-w-2xl mx-auto">
            {language === 'ta'
              ? 'ஒவ்வொரு பிரச்சனையும் வெளிப்படையாக கண்காணிக்கப்படும். மக்களின் ஆதரவுடன் அதிகாரிகளுக்கு தானாகவே உயர்த்தப்படும்.'
              : 'Every issue is tracked publicly and transparently. With public support, it automatically escalates to officials.'}
          </p>
          <Button 
            size="lg" 
            className="btn-tvk-secondary gap-2 touch-target text-base px-8 rounded-xl"
            onClick={() => navigate(isAuthenticated ? '/raise-issue' : '/auth')}
            data-testid="cta-raise-issue"
          >
            <Megaphone className="w-5 h-5" />
            {t('raiseIssue')}
          </Button>
        </div>
      </section>
      
      {/* TVK Stripe Bottom */}
      <div className="tvk-stripe" />
    </div>
  );
};

export default LandingPage;
