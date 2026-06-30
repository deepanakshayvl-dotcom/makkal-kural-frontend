import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { User, MapPin, Save, Loader2, FileText, ThumbsUp } from 'lucide-react';
import SMSAlertSettings from '../components/SMSAlertSettings';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { language, t } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    district: user?.district || '',
    local_body_type: user?.local_body_type || '',
    local_body_name: user?.local_body_name || '',
    ward: user?.ward || ''
  });

  const localBodyTypes = ['Corporation', 'Municipality', 'Town Panchayat', 'Village Panchayat'];

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        district: user.district || '',
        local_body_type: user.local_body_type || '',
        local_body_name: user.local_body_name || '',
        ward: user.ward || ''
      });
    }
  }, [user]);

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${API}/constants/districts`);
      setDistricts(response.data.districts || []);
    } catch (error) {
      console.error('Failed to fetch districts');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success(language === 'ta' ? 'சுயவிவரம் புதுப்பிக்கப்பட்டது!' : 'Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-secondary/30">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-tamil">
            {t('profile')}
          </h1>
          <p className="text-muted-foreground">
            {user?.mobile}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{user?.issues_raised || 0}</p>
              <p className="text-xs text-muted-foreground font-tamil">
                {language === 'ta' ? 'எழுப்பிய பிரச்சனைகள்' : 'Issues Raised'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ThumbsUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{user?.votes_cast || 0}</p>
              <p className="text-xs text-muted-foreground font-tamil">
                {language === 'ta' ? 'வாக்குகள்' : 'Votes Cast'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-tamil">
              {language === 'ta' ? 'சுயவிவர தகவல்கள்' : 'Profile Information'}
            </CardTitle>
            <CardDescription className="font-tamil">
              {language === 'ta' 
                ? 'உங்கள் இருப்பிடத்தை புதுப்பிக்கவும்'
                : 'Update your location details'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label className="font-tamil">
                {language === 'ta' ? 'பெயர்' : 'Name'}
              </Label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'ta' ? 'உங்கள் பெயர்' : 'Your name'}
                data-testid="profile-name-input"
              />
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="font-tamil">{language === 'ta' ? 'இருப்பிட விவரங்கள்' : 'Location Details'}</span>
              </div>

              {/* District */}
              <div className="space-y-2">
                <Label className="font-tamil">{t('selectDistrict')}</Label>
                <Select 
                  value={formData.district} 
                  onValueChange={v => setFormData({ ...formData, district: v })}
                >
                  <SelectTrigger data-testid="profile-district-select">
                    <SelectValue placeholder={language === 'ta' ? 'மாவட்டம் தேர்வு' : 'Select district'} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Local Body Type */}
              <div className="space-y-2">
                <Label className="font-tamil">{t('selectLocalBody')}</Label>
                <Select 
                  value={formData.local_body_type} 
                  onValueChange={v => setFormData({ ...formData, local_body_type: v })}
                >
                  <SelectTrigger data-testid="profile-local-body-select">
                    <SelectValue placeholder={language === 'ta' ? 'உள்ளாட்சி வகை' : 'Select type'} />
                  </SelectTrigger>
                  <SelectContent>
                    {localBodyTypes.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Local Body Name */}
              <div className="space-y-2">
                <Label className="font-tamil">
                  {language === 'ta' ? 'நகரம்/கிராமம் பெயர்' : 'City/Village Name'}
                </Label>
                <Input
                  value={formData.local_body_name}
                  onChange={e => setFormData({ ...formData, local_body_name: e.target.value })}
                  placeholder={language === 'ta' ? 'பெயர் உள்ளிடவும்' : 'Enter name'}
                />
              </div>

              {/* Ward */}
              <div className="space-y-2">
                <Label className="font-tamil">
                  {language === 'ta' ? 'வார்டு' : 'Ward'}
                </Label>
                <Input
                  value={formData.ward}
                  onChange={e => setFormData({ ...formData, ward: e.target.value })}
                  placeholder={language === 'ta' ? 'விருப்பமானால்' : 'Optional'}
                />
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={loading} 
              className="w-full"
              data-testid="save-profile-btn"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {language === 'ta' ? 'சேமி' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* SMS Alerts */}
        <div data-testid="sms-alert-settings">
          <SMSAlertSettings user={user} onUpdate={() => {}} />
        </div>

        {/* Logout */}
        <Card>
          <CardContent className="p-4">
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:text-destructive"
              onClick={logout}
              data-testid="logout-btn"
            >
              {t('logout')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
