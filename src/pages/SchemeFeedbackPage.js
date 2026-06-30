import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  FileWarning, Plus, ThumbsUp, Loader2, ChevronRight,
  AlertTriangle, Edit3, Trash2, GitMerge
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SchemeFeedbackPage = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    scheme_name: '',
    feedback_type: 'not_useful',
    action: 'modify',
    description: ''
  });

  const feedbackTypes = [
    { value: 'not_useful', labelTa: 'பயனற்றது', labelEn: 'Not Useful', icon: AlertTriangle },
    { value: 'corrupt', labelTa: 'ஊழல்', labelEn: 'Corrupt', icon: FileWarning },
    { value: 'not_reaching', labelTa: 'சேரவில்லை', labelEn: 'Not Reaching', icon: ThumbsUp },
    { value: 'outdated', labelTa: 'காலாவதி', labelEn: 'Outdated', icon: AlertTriangle }
  ];

  const actions = [
    { value: 'modify', labelTa: 'மாற்று', labelEn: 'Modify', icon: Edit3 },
    { value: 'merge', labelTa: 'இணை', labelEn: 'Merge', icon: GitMerge },
    { value: 'remove', labelTa: 'நீக்கு', labelEn: 'Remove', icon: Trash2 }
  ];

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`${API}/schemes/feedback`);
      if (response.data.success) {
        setFeedback(response.data.feedback || []);
      }
    } catch (error) {
      console.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.scheme_name || !formData.description) {
      toast.error(language === 'ta' ? 'அனைத்து தேவையான புலங்களையும் நிரப்பவும்' : 'Fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/schemes/feedback`, formData);
      if (response.data.success) {
        toast.success(language === 'ta' ? 'கருத்து சேர்க்கப்பட்டது!' : 'Feedback submitted!');
        setShowDialog(false);
        setFormData({
          scheme_name: '',
          feedback_type: 'not_useful',
          action: 'modify',
          description: ''
        });
        fetchFeedback();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFeedbackTypeBadge = (type) => {
    const colors = {
      not_useful: 'bg-amber-100 text-amber-800',
      corrupt: 'bg-red-100 text-red-800',
      not_reaching: 'bg-orange-100 text-orange-800',
      outdated: 'bg-slate-100 text-slate-800'
    };
    return colors[type] || colors.not_useful;
  };

  const getActionBadge = (action) => {
    const colors = {
      modify: 'bg-blue-100 text-blue-800',
      merge: 'bg-purple-100 text-purple-800',
      remove: 'bg-red-100 text-red-800'
    };
    return colors[action] || colors.modify;
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-secondary/30">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-tamil">
              {language === 'ta' ? 'திட்ட கருத்துகள்' : 'Scheme Feedback'}
            </h1>
            <p className="text-muted-foreground font-tamil">
              {language === 'ta' 
                ? 'அரசு திட்டங்கள் பற்றிய கருத்துகளை பகிரவும்'
                : 'Share feedback on government schemes'
              }
            </p>
          </div>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="add-feedback-btn">
                <Plus className="w-4 h-4" />
                {language === 'ta' ? 'கருத்து சேர்' : 'Add Feedback'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-tamil">
                  {language === 'ta' ? 'திட்ட கருத்து' : 'Scheme Feedback'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Scheme Name */}
                <div className="space-y-2">
                  <Label className="font-tamil">
                    {language === 'ta' ? 'திட்டத்தின் பெயர்' : 'Scheme Name'} *
                  </Label>
                  <Input
                    value={formData.scheme_name}
                    onChange={e => setFormData({ ...formData, scheme_name: e.target.value })}
                    placeholder={language === 'ta' ? 'திட்டத்தின் பெயர்' : 'Enter scheme name'}
                    data-testid="scheme-name-input"
                  />
                </div>

                {/* Feedback Type */}
                <div className="space-y-2">
                  <Label className="font-tamil">
                    {language === 'ta' ? 'கருத்து வகை' : 'Feedback Type'}
                  </Label>
                  <RadioGroup 
                    value={formData.feedback_type} 
                    onValueChange={v => setFormData({ ...formData, feedback_type: v })}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {feedbackTypes.map(type => (
                        <div 
                          key={type.value}
                          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            formData.feedback_type === type.value ? 'border-primary bg-primary/5' : 'border-input'
                          }`}
                          onClick={() => setFormData({ ...formData, feedback_type: type.value })}
                        >
                          <RadioGroupItem value={type.value} id={type.value} />
                          <Label htmlFor={type.value} className="cursor-pointer font-tamil text-sm">
                            {language === 'ta' ? type.labelTa : type.labelEn}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Action */}
                <div className="space-y-2">
                  <Label className="font-tamil">
                    {language === 'ta' ? 'பரிந்துரை' : 'Recommendation'}
                  </Label>
                  <Select 
                    value={formData.action} 
                    onValueChange={v => setFormData({ ...formData, action: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map(action => (
                        <SelectItem key={action.value} value={action.value}>
                          {language === 'ta' ? action.labelTa : action.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="font-tamil">
                    {language === 'ta' ? 'விவரம்' : 'Description'} *
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder={language === 'ta' ? 'உங்கள் கருத்தை விரிவாக விவரிக்கவும்...' : 'Describe your feedback in detail...'}
                    rows={4}
                    className="font-tamil"
                    data-testid="feedback-description-textarea"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting} data-testid="submit-feedback-btn">
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {language === 'ta' ? 'சமர்ப்பி' : 'Submit Feedback'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex items-start gap-3">
            <FileWarning className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground font-tamil">
                {language === 'ta' ? 'திட்டங்களை மறுஆய்வு செய்யுங்கள்' : 'Review Schemes'}
              </p>
              <p className="text-sm text-muted-foreground font-tamil">
                {language === 'ta' 
                  ? 'உங்கள் மாவட்டத்தில் பெரும்பான்மை ஆதரவு பெற்றால், கொள்கை மறுஆய்வு வரிசையில் சேர்க்கப்படும்'
                  : 'If majority supports in your district, it enters Policy Review Queue'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : feedback.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileWarning className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2 font-tamil">
                {language === 'ta' ? 'கருத்துகள் இல்லை' : 'No feedback yet'}
              </h3>
              <p className="text-muted-foreground font-tamil">
                {language === 'ta' 
                  ? 'முதல் கருத்தை சேர்க்கவும்'
                  : 'Be the first to add feedback'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedback.map((item, idx) => (
              <Card 
                key={item.id}
                className="card-hover animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={getFeedbackTypeBadge(item.feedback_type)}>
                          {feedbackTypes.find(t => t.value === item.feedback_type)?.[language === 'ta' ? 'labelTa' : 'labelEn']}
                        </Badge>
                        <Badge className={getActionBadge(item.action)}>
                          {actions.find(a => a.value === item.action)?.[language === 'ta' ? 'labelTa' : 'labelEn']}
                        </Badge>
                      </div>

                      {/* Scheme Name */}
                      <h3 className="font-semibold text-foreground mb-2 font-tamil">
                        {item.scheme_name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-3 font-tamil">
                        {item.description}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDate(item.created_at)}</span>
                        {item.user_district && (
                          <span>{item.user_district}</span>
                        )}
                      </div>

                      {/* Support */}
                      <div className="flex items-center gap-2 mt-3">
                        <ThumbsUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          {item.support_count} {language === 'ta' ? 'ஆதரவு' : 'support'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemeFeedbackPage;
