import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { 
  BarChart3, MapPin, TrendingUp, ThumbsUp, MessageSquare,
  ChevronRight, AlertTriangle, CheckCircle, Clock, Users, Building
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DashboardPage = () => {
  const { district: urlDistrict } = useParams();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const [selectedDistrict, setSelectedDistrict] = useState(urlDistrict || '');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [districtData, setDistrictData] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [leadershipData, setLeadershipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDistricts();
    fetchOverview();
    fetchLeadership();
  }, []);

  useEffect(() => {
    if (selectedDistrict) {
      fetchDistrictData(selectedDistrict);
      fetchConstituencies(selectedDistrict);
      setSelectedConstituency(''); // Reset constituency when district changes
    } else {
      setConstituencies([]);
      setSelectedConstituency('');
    }
  }, [selectedDistrict]);

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${API}/constants/districts`);
      setDistricts(response.data.districts || []);
    } catch (error) {
      console.error('Failed to fetch districts');
    }
  };

  const fetchConstituencies = async (district) => {
    try {
      const response = await axios.get(`${API}/constants/constituencies?district=${encodeURIComponent(district)}`);
      setConstituencies(response.data.constituencies || []);
    } catch (error) {
      console.error('Failed to fetch constituencies');
      setConstituencies([]);
    }
  };

  const fetchOverview = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/overview`);
      setOverviewData(response.data);
    } catch (error) {
      console.error('Failed to fetch overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadership = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/leadership`);
      setLeadershipData(response.data);
    } catch (error) {
      console.error('Failed to fetch leadership data');
    }
  };

  const fetchDistrictData = async (district) => {
    try {
      const response = await axios.get(`${API}/dashboard/district/${district}`);
      setDistrictData(response.data);
    } catch (error) {
      console.error('Failed to fetch district data');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const IssueCard = ({ issue }) => (
    <Card 
      className="card-hover cursor-pointer"
      onClick={() => navigate(`/issues/${issue.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {language === 'ta' ? issue.category_name_ta : issue.category_name_en}
              </Badge>
              <Badge className={`status-${issue.status} text-xs`}>
                {t(issue.status)}
              </Badge>
            </div>
            <h4 className="font-medium text-sm line-clamp-1 font-tamil">
              {language === 'ta' ? issue.problem_name_ta : issue.problem_name_en}
            </h4>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {issue.district}
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <ThumbsUp className="w-3 h-3" />
                {issue.support_count}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-secondary/30">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-tamil">
              {language === 'ta' ? 'வெளிப்படை நிலைப்பலகை' : 'Transparency Dashboard'}
            </h1>
            <p className="text-muted-foreground font-tamil">
              {language === 'ta' 
                ? 'நேரடி பிரச்சனை நிலைகள் மற்றும் புள்ளிவிவரங்கள்'
                : 'Live issue status and statistics'
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-[200px] border-2 border-primary/20" data-testid="dashboard-district-filter">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                <SelectValue placeholder={language === 'ta' ? 'மாவட்டம் தேர்வு' : 'Select District'} />
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
                <SelectTrigger className="w-[220px] border-2 border-yellow-300" data-testid="dashboard-constituency-filter">
                  <Building className="w-4 h-4 mr-2 text-yellow-600" />
                  <SelectValue placeholder={language === 'ta' ? 'தொகுதி தேர்வு' : 'Select Constituency'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=" ">{language === 'ta' ? 'அனைத்து தொகுதிகள்' : 'All Constituencies'}</SelectItem>
                  {constituencies.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Info Banner */}
        {selectedDistrict && selectedDistrict.trim() && (
          <div className="bg-gradient-to-r from-red-50 to-yellow-50 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-medium">{selectedDistrict}</span>
            {constituencies.length > 0 && (
              <Badge variant="outline" className="bg-white border-yellow-300 text-yellow-700">
                {constituencies.length} {language === 'ta' ? 'தொகுதிகள்' : 'constituencies'}
              </Badge>
            )}
            {selectedConstituency && selectedConstituency.trim() && (
              <>
                <span className="text-gray-400">→</span>
                <span className="text-yellow-700 font-medium">{selectedConstituency}</span>
              </>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold text-foreground">
                {formatNumber(selectedDistrict && districtData ? districtData.stats.total : overviewData?.stats?.total_issues)}
              </p>
              <p className="text-sm text-muted-foreground font-tamil">{t('totalIssues')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <p className="text-3xl font-bold text-amber-600">
                {formatNumber(selectedDistrict && districtData ? districtData.stats.pending : 
                  overviewData?.status_breakdown?.find(s => s.status === 'pending')?.count || 0)}
              </p>
              <p className="text-sm text-muted-foreground font-tamil">{t('pendingIssues')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-3xl font-bold text-green-600">
                {formatNumber(selectedDistrict && districtData ? districtData.stats.resolved :
                  overviewData?.status_breakdown?.find(s => s.status === 'resolved')?.count || 0)}
              </p>
              <p className="text-sm text-muted-foreground font-tamil">{t('resolvedIssues')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-3xl font-bold text-foreground">
                {formatNumber(overviewData?.stats?.total_users)}
              </p>
              <p className="text-sm text-muted-foreground font-tamil">
                {language === 'ta' ? 'பயனர்கள்' : 'Users'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="font-tamil">
              {language === 'ta' ? 'கண்ணோட்டம்' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="trending" className="font-tamil">
              {language === 'ta' ? 'முக்கிய பிரச்சனைகள்' : 'Top Issues'}
            </TabsTrigger>
            <TabsTrigger value="leadership" className="font-tamil">
              {language === 'ta' ? 'தலைமை நிலை' : 'Leadership'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Top Districts */}
            {!selectedDistrict && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-tamil">
                    {language === 'ta' ? 'மாவட்ட வாரியாக பிரச்சனைகள்' : 'Issues by District'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overviewData?.top_districts?.slice(0, 10).map((d, idx) => (
                      <div 
                        key={d.district}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedDistrict(d.district)}
                      >
                        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {idx + 1}
                        </span>
                        <span className="flex-1 font-medium">{d.district}</span>
                        <span className="text-muted-foreground">{d.count} issues</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* District Specific */}
            {selectedDistrict && districtData && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-tamil">
                      {language === 'ta' ? 'பிரிவு வாரியாக' : 'By Category'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {districtData.category_breakdown?.map(cat => (
                        <div key={cat.category} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <span className="text-sm font-tamil">{cat.category}</span>
                          <Badge variant="secondary">{cat.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-tamil">
                      {language === 'ta' ? 'சமீபத்தில் தீர்க்கப்பட்டவை' : 'Recently Resolved'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {districtData.recently_resolved?.slice(0, 5).map(issue => (
                        <IssueCard key={issue.id} issue={issue} />
                      ))}
                      {districtData.recently_resolved?.length === 0 && (
                        <p className="text-center text-muted-foreground py-4 font-tamil">
                          {language === 'ta' ? 'தீர்க்கப்பட்டவை இல்லை' : 'No resolved issues'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 font-tamil">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    {language === 'ta' ? 'அதிக ஆதரவு' : 'Most Supported'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(selectedDistrict && districtData ? districtData.top_issues : overviewData?.trending)?.slice(0, 5).map(issue => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 font-tamil">
                    <Clock className="w-5 h-5 text-amber-500" />
                    {language === 'ta' ? 'நீண்ட காலம் நிலுவையில்' : 'Longest Pending'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(selectedDistrict && districtData?.longest_pending || []).slice(0, 5).map(issue => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leadership Tab */}
          <TabsContent value="leadership">
            <div className="space-y-6">
              {/* High Level Issues */}
              {[
                { level: 'minister', data: leadershipData?.minister_issues, labelTa: 'அமைச்சர்கள்', labelEn: 'Ministers' },
                { level: 'cs', data: leadershipData?.cs_issues, labelTa: 'தலைமை செயலாளர்', labelEn: 'Chief Secretary' },
                { level: 'cm', data: leadershipData?.cm_issues, labelTa: 'முதலமைச்சர்', labelEn: 'Chief Minister' }
              ].map(({ level, data, labelTa, labelEn }) => (
                <Card key={level}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between font-tamil">
                      <span>{language === 'ta' ? labelTa : labelEn}</span>
                      <Badge variant="secondary">{data?.count || 0} {language === 'ta' ? 'பிரச்சனைகள்' : 'issues'}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data?.issues?.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-3">
                        {data.issues.slice(0, 4).map(issue => (
                          <IssueCard key={issue.id} issue={issue} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4 font-tamil">
                        {language === 'ta' ? 'பிரச்சனைகள் இல்லை' : 'No issues at this level'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Overdue Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-destructive font-tamil">
                    <AlertTriangle className="w-5 h-5" />
                    {language === 'ta' ? 'காலாவதி ஆனவை' : 'Overdue Issues'}
                    <Badge variant="destructive">{leadershipData?.overdue_issues?.count || 0}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {leadershipData?.overdue_issues?.issues?.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {leadershipData.overdue_issues.issues.slice(0, 6).map(issue => (
                        <IssueCard key={issue.id} issue={issue} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4 font-tamil">
                      {language === 'ta' ? 'காலாவதி பிரச்சனைகள் இல்லை' : 'No overdue issues'}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;
