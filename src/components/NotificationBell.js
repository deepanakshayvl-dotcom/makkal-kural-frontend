import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Bell, CheckCheck, TrendingUp, AlertCircle, MessageSquare, ChevronRight } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`);
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`${API}/notifications/read/${notificationId}`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`${API}/notifications/read-all`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.issue_id) {
      navigate(`/issues/${notification.issue_id}`);
      setOpen(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'escalation': return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'majority': return <CheckCheck className="w-4 h-4 text-green-500" />;
      case 'status_change': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return language === 'ta' ? 'இப்போது' : 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}${language === 'ta' ? ' நிமி' : 'm'}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${language === 'ta' ? ' மணி' : 'h'}`;
    return `${Math.floor(diff / 86400)}${language === 'ta' ? ' நாள்' : 'd'}`;
  };

  if (!isAuthenticated) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="notification-bell">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm font-tamil">
            {language === 'ta' ? 'அறிவிப்புகள்' : 'Notifications'}
          </h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllAsRead}>
              {language === 'ta' ? 'அனைத்தும் படி' : 'Mark all read'}
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground font-tamil">
                {language === 'ta' ? 'அறிவிப்புகள் இல்லை' : 'No notifications'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground font-tamil">
                        {language === 'ta' ? notification.title_ta : notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 font-tamil">
                        {language === 'ta' ? notification.message_ta : notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
