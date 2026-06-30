import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { 
  FileText, ThumbsUp, MessageSquare, ChevronRight, 
  MapPin, Plus, AlertCircle
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const MyIssuesPage = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const fetchMyIssues = async () => {
    try {
      const response = await axios.get(`${API}/my-issues`);
      if (response.data.success) {
        setIssues(response.data.issues);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800',
      area_concern: 'bg-orange-100 text-orange-800',
      serious_issue: 'bg-red-100 text-red-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return styles[status] || styles.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-secondary/30">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-tamil">
              {t('myIssues')}
            </h1>
            <p className="text-muted-foreground font-tamil">
              {language === 'ta' 
                ? `${issues.length} பிரச்சனைகள் எழுப்பப்பட்டன`
                : `${issues.length} issues raised`
              }
            </p>
          </div>
          <Button onClick={() => navigate('/raise-issue')} className="gap-2" data-testid="raise-new-issue-btn">
            <Plus className="w-4 h-4" />
            {language === 'ta' ? 'புதிய பிரச்சனை' : 'New Issue'}
          </Button>
        </div>

        {/* Issues List */}
        {issues.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2 font-tamil">
                {language === 'ta' ? 'பிரச்சனைகள் இல்லை' : 'No issues yet'}
              </h3>
              <p className="text-muted-foreground mb-6 font-tamil">
                {language === 'ta' 
                  ? 'உங்கள் முதல் பிரச்சனையை எழுப்புங்கள்'
                  : 'Raise your first issue to get started'
                }
              </p>
              <Button onClick={() => navigate('/raise-issue')} data-testid="raise-first-issue-btn">
                {t('raiseIssue')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {issues.map((issue, idx) => (
              <Card 
                key={issue.id}
                className="card-hover cursor-pointer animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => navigate(`/issues/${issue.id}`)}
                data-testid={`my-issue-${issue.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Status & Category */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={getStatusBadge(issue.status)}>
                          {t(issue.status)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {language === 'ta' ? issue.category_name_ta : issue.category_name_en}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Level {issue.current_level}
                        </Badge>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-foreground mb-1 font-tamil">
                        {language === 'ta' ? issue.problem_name_ta : issue.problem_name_en}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 font-tamil">
                        {issue.description}
                      </p>

                      {/* Location & Date */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {issue.district}, {issue.local_body_name}
                        </span>
                        <span>{formatDate(issue.created_at)}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3">
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <ThumbsUp className="w-4 h-4" />
                          {issue.support_count}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MessageSquare className="w-4 h-4" />
                          {issue.comment_count}
                        </span>
                        <span className="text-sm text-primary font-medium">
                          {issue.support_percentage}% {language === 'ta' ? 'ஆதரவு' : 'support'}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
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

export default MyIssuesPage;
