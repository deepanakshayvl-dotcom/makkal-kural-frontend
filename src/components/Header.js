import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Menu, User, LogOut, FileText, BarChart3, Globe, Megaphone, Home, AlertTriangle, Shield, Flame, Scale, Newspaper } from 'lucide-react';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 glass border-b-0">
      {/* TVK Top Stripe */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" data-testid="logo-link">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground font-tamil flex items-center gap-1.5">
                மக்கள் குரல்
                <Flame className="w-4 h-4 text-yellow-500" />
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Makkal Kural</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button variant="ghost" className="gap-2 hover:bg-primary/5 hover:text-primary" data-testid="nav-home">
                <Home className="w-4 h-4" />
                {t('home')}
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost" className="gap-2 hover:bg-primary/5 hover:text-primary" data-testid="nav-dashboard">
                <BarChart3 className="w-4 h-4" />
                {t('dashboard')}
              </Button>
            </Link>
            <Link to="/pfi">
              <Button variant="ghost" className="gap-2 hover:bg-primary/5 hover:text-primary" data-testid="nav-pfi">
                <AlertTriangle className="w-4 h-4" />
                {language === 'ta' ? 'PFI' : 'PFI'}
              </Button>
            </Link>
            <Link to="/compare">
              <Button variant="ghost" className="gap-2 hover:bg-primary/5 hover:text-primary" data-testid="nav-compare">
                <Scale className="w-4 h-4" />
                {language === 'ta' ? 'ஒப்பிடு' : 'Compare'}
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="ghost" className="gap-2 hover:bg-primary/5 hover:text-primary" data-testid="nav-reports">
                <Newspaper className="w-4 h-4" />
                {language === 'ta' ? 'அறிக்கைகள்' : 'Reports'}
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" className="gap-2 hover:bg-primary/5 hover:text-primary" data-testid="nav-about">
                <Shield className="w-4 h-4" />
                {language === 'ta' ? 'நம்பகம்' : 'Trust'}
              </Button>
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/raise-issue">
                  <Button className="gap-2 btn-tvk rounded-xl ml-2" data-testid="nav-raise-issue">
                    <FileText className="w-4 h-4" />
                    {t('raiseIssue')}
                  </Button>
                </Link>
                <Link to="/my-issues">
                  <Button variant="ghost" className="gap-2 hover:bg-primary/5 hover:text-primary" data-testid="nav-my-issues">
                    {t('myIssues')}
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <NotificationBell />
            
            {/* Language Toggle */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleLanguage}
              className="gap-1 text-xs border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 rounded-lg"
              data-testid="lang-toggle"
            >
              <Globe className="w-4 h-4 text-primary" />
              {language === 'ta' ? 'EN' : 'த'}
            </Button>

            {/* Auth / User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5" data-testid="user-menu">
                    <User className="w-4 h-4 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.mobile}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} data-testid="menu-profile">
                    <User className="w-4 h-4 mr-2" />
                    {t('profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/my-issues')} data-testid="menu-my-issues">
                    <FileText className="w-4 h-4 mr-2" />
                    {t('myIssues')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/schemes')} data-testid="menu-schemes">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {t('schemes')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="menu-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button className="btn-tvk rounded-xl text-sm" data-testid="login-btn">
                  {t('login')}
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="mobile-menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
                    <Home className="w-4 h-4 mr-2" />
                    {t('home')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {t('dashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navigate('/pfi'); setMobileMenuOpen(false); }}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    PFI
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navigate('/compare'); setMobileMenuOpen(false); }}>
                    <Scale className="w-4 h-4 mr-2" />
                    {language === 'ta' ? 'ஒப்பிடு' : 'Compare'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navigate('/reports'); setMobileMenuOpen(false); }}>
                    <Newspaper className="w-4 h-4 mr-2" />
                    {language === 'ta' ? 'அறிக்கைகள்' : 'Reports'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}>
                    <Shield className="w-4 h-4 mr-2" />
                    {language === 'ta' ? 'நம்பகம்' : 'Trust'}
                  </DropdownMenuItem>
                  {isAuthenticated && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { navigate('/raise-issue'); setMobileMenuOpen(false); }}>
                        <FileText className="w-4 h-4 mr-2" />
                        {t('raiseIssue')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { navigate('/my-issues'); setMobileMenuOpen(false); }}>
                        {t('myIssues')}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
