import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { 
  MapPin, ThumbsUp, ThumbsDown, MessageSquare, Clock, 
  ChevronRight, Send, Loader2, AlertCircle, CheckCircle,
  User, Calendar, Users, HelpCircle, Share2, Info, EyeOff
} from 'lucide-react';
import WhatsAppShare from '../components/WhatsAppShare';
import SLACountdown from '../components/SLACountdown';
import RepeatIssueDetector from '../components/RepeatIssueDetector';
import CPGRAMSBridge from '../components/CPGRAMSBridge';
import RTIAutoBridge from '../components/RTIAutoBridge';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const IssueDetailPage = () => {
  const { issueId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [escalationHierarchy, setEscalationHierarchy] = useState([]);

  useEffect(() => {
    fetchIssue();
    fetchHierarchy();
  }, [issueId]);

  const fetchIssue = async () => {
    try {
      const response = await axios.get(`${API}/issues/${issueId}`);
      if (response.data.success) {
        setIssue(response.data.issue);
        setComments(response.data.comments || []);
        setUserVote(response.data.user_vote);
      }
    } catch (error) {
      toast.error('Failed to load issue');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async () => {
    try {
      const response = await axios.get(`${API}/constants/escalation-hierarchy`);
      setEscalationHierarchy(response.data.hierarchy || []);
    } catch (error) {
      console.error('Failed to fetch hierarchy');
    }
  };

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: `/issues/${issueId}` } } });
      return;
    }

    setVoting(true);
    try {
      const response = await axios.post(`${API}/issues/${issueId}/vote`, { vote_type: voteType });
      if (response.data.success) {
        setIssue(response.data.issue);
        setUserVote(userVote === voteType ? null : voteType);
        toast.success(language === 'ta' ? 'வாக்கு பதிவானது!' : 'Vote recorded!');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      navigate('/auth', { state: { from: { pathname: `/issues/${issueId}` } } });
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await axios.post(`${API}/issues/${issueId}/comments`, { text: newComment });
      if (response.data.success) {
        setComments([response.data.comment, ...comments]);
        setNewComment('');
        toast.success(language === 'ta' ? 'கருத்து சேர்க்கப்பட்டது!' : 'Comment added!');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'serious_issue': return 'bg-red-100 text-red-800 border-red-200';
      case 'area_concern': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Issue not found</p>
        </div>
      </div>
    );
  }

  const totalVotes = issue.support_count + issue.oppose_count;

  return (
    <div className="min-h-screen py-8 px-4 bg-secondary/30">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Repeat Issue Detector - Systemic failure evidence */}
        <div data-testid="repeat-issue-detector">
          <RepeatIssueDetector issue={issue} />
        </div>

        {/* CPGRAMS Bridge - Legal-teeth at 100+ supporters (L5 fix) */}
        {issue.support_count >= 100 && (
          <div data-testid="cpgrams-bridge">
            <CPGRAMSBridge issue={issue} />
          </div>
        )}

        {/* RTI Auto-Bridge - Auto-trigger after 14+ days unresolved (L5/L6 fix) */}
        <div data-testid="rti-auto-bridge">
          <RTIAutoBridge issue={issue} currentUser={user} />
        </div>

        {/* Header Card */}
        <Card className="animate-fade-in">
          <CardContent className="p-6">
            {/* Status & Category */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className={getStatusColor(issue.status)}>
                {t(issue.status)}
              </Badge>
              <Badge variant="outline">
                {language === 'ta' ? issue.category_name_ta : issue.category_name_en}
              </Badge>
              <Badge variant="secondary">
                Level {issue.current_level}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground mb-2 font-tamil">
              {language === 'ta' ? issue.problem_name_ta : issue.problem_name_en}
            </h1>

            {/* Location */}
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {issue.district}, {issue.local_body_name}
                {issue.ward && `, ${issue.ward}`}
                {issue.street && `, ${issue.street}`}
              </span>
            </div>

            {/* Description */}
            <p className="text-foreground mb-6 font-tamil leading-relaxed">
              {issue.description}
            </p>

            {/* Voice Note Text */}
            {issue.voice_note_text && (
              <div className="bg-muted/50 p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-1 font-tamil">
                  {language === 'ta' ? 'குரல் பதிவு உரை:' : 'Voice note transcription:'}
                </p>
                <p className="text-foreground font-tamil italic">"{issue.voice_note_text}"</p>
              </div>
            )}

            {/* Media */}
            {issue.media_urls?.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {issue.media_urls.map((url, idx) => (
                  <img 
                    key={idx}
                    src={`${process.env.REACT_APP_BACKEND_URL}${url}`}
                    alt={`Media ${idx + 1}`}
                    className="w-24 h-24 rounded-lg object-cover border"
                  />
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                {issue.is_anonymous ? (
                  <>
                    <EyeOff className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 font-medium">{language === 'ta' ? 'அநாமதேய குடிமகன்' : 'Anonymous Citizen'}</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    {issue.user_name || 'Anonymous'} (****{issue.user_mobile})
                  </>
                )}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(issue.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {language === 'ta' ? issue.affected_people : t(issue.affected_people)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* SLA Countdown */}
        <SLACountdown issue={issue} />

        {/* Voting Card */}
        <TooltipProvider>
          <Card className="animate-fade-in stagger-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 font-tamil">
                {language === 'ta' ? 'உங்கள் ஆதரவு' : 'Your Support'}
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm font-tamil">
                      {language === 'ta' 
                        ? '"ஆதரவு" = இந்த பிரச்சனை எனக்கும் உள்ளது. "எதிர்ப்பு" = இது செல்லுபடியாகாது என்று நினைக்கிறேன். உங்கள் மாவட்ட மக்கள் மட்டுமே வாக்களிக்க முடியும்.'
                        : '"Support" = I face this issue too. "Oppose" = I don\'t think this is valid. Only people from this district can vote.'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* District Restriction Notice */}
              {user && user.district && user.district !== issue.district && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800 font-tamil">
                    {language === 'ta' 
                      ? `நீங்கள் ${user.district} மாவட்டத்தைச் சேர்ந்தவர். ${issue.district} மாவட்ட பிரச்சனைகளில் வாக்களிக்க முடியாது.`
                      : `You are from ${user.district} district. You can only vote on issues from your own district.`}
                  </p>
                </div>
              )}
              
              {/* Publicly Validated Badge */}
              {issue.publicly_validated && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-green-800 font-tamil">
                    {language === 'ta' ? '✓ பொதுவில் சரிபார்க்கப்பட்ட பிரச்சனை (60%+ ஆதரவு)' : '✓ Publicly Validated Issue (60%+ Support)'}
                  </p>
                </div>
              )}
              
              {/* Vote Progress */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-green-600">
                    {issue.support_percentage}% {language === 'ta' ? 'ஆதரவு' : 'Support'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {totalVotes} {language === 'ta' ? 'வாக்குகள்' : 'votes'}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden flex">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500" 
                    style={{ width: `${issue.support_percentage}%` }}
                  />
                  <div 
                    className="h-full bg-slate-400 transition-all duration-500" 
                    style={{ width: `${100 - issue.support_percentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>{issue.support_count} {language === 'ta' ? 'ஆதரவு' : 'support'}</span>
                  <span>{issue.oppose_count} {language === 'ta' ? 'எதிர்ப்பு' : 'oppose'}</span>
                </div>
              </div>

              {/* Threshold Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 text-center">
                {[
                  { threshold: '25+', label: language === 'ta' ? 'பகுதி கவலை' : 'Area Concern', tooltip: language === 'ta' ? '25+ ஆதரவாளர்கள் பெற்றால் பகுதி கவலையாக குறிக்கப்படும்' : 'Marked as Area Concern when 25+ supporters' },
                  { threshold: '100+', label: language === 'ta' ? 'தீவிர பிரச்சனை' : 'Serious Issue', tooltip: language === 'ta' ? '100+ ஆதரவாளர்கள் பெற்றால் தீவிர பிரச்சனையாக குறிக்கப்படும்' : 'Marked as Serious Issue when 100+ supporters' },
                  { threshold: '60%', label: language === 'ta' ? 'சரிபார்ப்பு' : 'Validated', tooltip: language === 'ta' ? '60%+ ஆதரவுடன் பொதுவில் சரிபார்க்கப்படும்' : 'Publicly Validated with 60%+ support' },
                  { threshold: '75%', label: language === 'ta' ? 'தானியங்கி உயர்வு' : 'Auto Escalate', tooltip: language === 'ta' ? '75%+ ஆதரவுடன் தானாக அடுத்த நிலைக்கு உயர்த்தப்படும்' : 'Auto-escalated to next level with 75%+ support' }
                ].map((item, idx) => (
                  <Tooltip key={idx}>
                    <TooltipTrigger className="w-full">
                      <div className={`p-2 rounded-lg ${
                        (item.threshold === '25+' && issue.support_count >= 25) ||
                        (item.threshold === '100+' && issue.support_count >= 100) ||
                        (item.threshold === '60%' && issue.support_percentage >= 60) ||
                        (item.threshold === '75%' && issue.support_percentage >= 75)
                          ? 'bg-primary/10 border border-primary/30' : 'bg-muted/50'
                      }`}>
                        <p className="text-lg font-bold text-primary">{item.threshold}</p>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm font-tamil">{item.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              {/* Vote Buttons */}
              <div className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`flex-1 h-14 text-base gap-2 ${userVote === 'support' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                      variant={userVote === 'support' ? 'default' : 'outline'}
                      onClick={() => handleVote('support')}
                      disabled={voting || (user?.district && user.district !== issue.district)}
                      data-testid="support-btn"
                    >
                      {voting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ThumbsUp className="w-5 h-5" />}
                      {t('support')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-tamil">{language === 'ta' ? 'இந்த பிரச்சனை எனக்கும் உள்ளது' : 'I face this issue too'}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className={`flex-1 h-14 text-base gap-2 ${userVote === 'oppose' ? 'bg-slate-500 hover:bg-slate-600' : ''}`}
                      variant={userVote === 'oppose' ? 'default' : 'outline'}
                      onClick={() => handleVote('oppose')}
                      disabled={voting || (user?.district && user.district !== issue.district)}
                      data-testid="oppose-btn"
                    >
                      {voting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ThumbsDown className="w-5 h-5" />}
                      {t('oppose')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-tamil">{language === 'ta' ? 'இது செல்லுபடியாகாது என்று நினைக்கிறேன்' : 'I don\'t think this is valid'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {/* Share Button */}
              <div className="flex gap-3 mt-4">
                <WhatsAppShare issue={issue} />
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    navigator.share?.({
                      title: issue.problem_name_en,
                      text: issue.description,
                      url: window.location.href
                    }).catch(() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success(language === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது' : 'Link copied!');
                    });
                  }}
                  data-testid="share-btn"
                >
                  <Share2 className="w-4 h-4" />
                  {language === 'ta' ? 'பகிர்' : 'Share'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>

        {/* Escalation Timeline */}
        <Card className="animate-fade-in stagger-2">
          <CardHeader>
            <CardTitle className="text-lg font-tamil">
              {language === 'ta' ? 'உயர்வு நிலை' : 'Escalation Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {escalationHierarchy.map((level, idx) => {
                const historyEntry = issue.escalation_history?.find(h => h.level === level.level);
                const isActive = issue.current_level === level.level;
                const isCompleted = issue.current_level > level.level;
                
                return (
                  <div key={level.level} className="escalation-step">
                    <div className={`escalation-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                      {isCompleted ? <CheckCircle className="w-3 h-3" /> : level.level}
                    </div>
                    <div className={`${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      <p className="font-medium font-tamil">
                        {language === 'ta' ? level.role_ta : level.role_en}
                      </p>
                      {historyEntry && (
                        <p className="text-xs">
                          {language === 'ta' ? 'சேர்ந்தது:' : 'Reached:'} {formatDate(historyEntry.reached_at)}
                        </p>
                      )}
                      {isActive && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {language === 'ta' ? 'தற்போது இங்கே' : 'Currently here'}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <Card className="animate-fade-in stagger-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-tamil">
              <MessageSquare className="w-5 h-5" />
              {t('comments')} ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment */}
            <form onSubmit={handleComment} className="flex gap-2 mb-6">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={language === 'ta' ? 'கருத்து சேர்க்க...' : 'Add a comment...'}
                className="flex-1"
                data-testid="comment-input"
              />
              <Button type="submit" disabled={!newComment.trim() || submittingComment} data-testid="submit-comment-btn">
                {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 font-tamil">
                {language === 'ta' ? 'கருத்துகள் இல்லை' : 'No comments yet'}
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {comment.user_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.user_name || 'Anonymous'}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-foreground font-tamil">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IssueDetailPage;
