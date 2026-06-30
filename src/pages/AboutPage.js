import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { 
  Shield, ThumbsUp, TrendingUp, Eye, Scale, Users, 
  CheckCircle, HelpCircle, AlertTriangle, ChevronRight
} from 'lucide-react';

const AboutPage = () => {
  const { language } = useLanguage();

  const sections = [
    {
      icon: ThumbsUp,
      titleEn: "How Issues Are Validated",
      titleTa: "பிரச்சனைகள் எப்படி சரிபார்க்கப்படுகின்றன",
      contentEn: [
        "When you raise an issue, other citizens from your district can support or oppose it",
        "Each person can vote only once (can change vote once)",
        "Support percentage is calculated: Support ÷ (Support + Oppose) × 100",
        "60%+ support marks the issue as 'Publicly Validated'",
        "This democratic validation ensures genuine issues get attention"
      ],
      contentTa: [
        "நீங்கள் பிரச்சனை எழுப்பும்போது, உங்கள் மாவட்டத்தின் மற்ற குடிமக்கள் ஆதரவு அல்லது எதிர்ப்பு தெரிவிக்கலாம்",
        "ஒவ்வொரு நபரும் ஒரு முறை மட்டுமே வாக்களிக்க முடியும் (ஒரு முறை மாற்றலாம்)",
        "ஆதரவு சதவீதம்: ஆதரவு ÷ (ஆதரவு + எதிர்ப்பு) × 100",
        "60%+ ஆதரவு 'பொது சரிபார்ப்பு' என குறிக்கப்படும்",
        "இந்த ஜனநாயக சரிபார்ப்பு உண்மையான பிரச்சனைகளுக்கு கவனம் உறுதி செய்கிறது"
      ]
    },
    {
      icon: TrendingUp,
      titleEn: "How Escalation Works",
      titleTa: "உயர்வு எப்படி செயல்படுகிறது",
      contentEn: [
        "Issues start at Level 1 (Village Officer / Ward Officer)",
        "75%+ support with 25+ supporters → Auto-escalation to next level",
        "60%+ support with 50+ supporters → Also triggers escalation",
        "Each level has a deadline (SLA) for response",
        "If deadline passes, issue is marked overdue publicly",
        "Escalation chain: VAO → BDO → Collector → Secretary → Minister → Chief Secretary → CM"
      ],
      contentTa: [
        "பிரச்சனைகள் நிலை 1 இல் தொடங்குகின்றன (கிராம அலுவலர் / வார்டு அலுவலர்)",
        "75%+ ஆதரவு + 25+ ஆதரவாளர்கள் → அடுத்த நிலைக்கு தானியங்கி உயர்வு",
        "60%+ ஆதரவு + 50+ ஆதரவாளர்கள் → இதுவும் உயர்வை தூண்டும்",
        "ஒவ்வொரு நிலைக்கும் பதில் கால எல்லை (SLA) உள்ளது",
        "கால எல்லை கடந்தால், பிரச்சனை பொதுவில் தாமதமானது என குறிக்கப்படும்",
        "உயர்வு வரிசை: VAO → BDO → ஆட்சியர் → செயலாளர் → அமைச்சர் → தலைமை செயலாளர் → முதலமைச்சர்"
      ]
    },
    {
      icon: Eye,
      titleEn: "Why Transparency Is Public",
      titleTa: "வெளிப்படைத்தன்மை ஏன் பொதுவானது",
      contentEn: [
        "Every issue's status is visible to everyone - no login needed to view",
        "Escalation history shows exactly who is responsible at each stage",
        "Public Failure Index (PFI) shows which districts are failing",
        "Overdue issues are highlighted publicly",
        "Government responses (when added) are visible to all",
        "This public visibility creates accountability pressure"
      ],
      contentTa: [
        "ஒவ்வொரு பிரச்சனையின் நிலையும் அனைவருக்கும் தெரியும் - பார்க்க உள்நுழைவு தேவையில்லை",
        "உயர்வு வரலாறு ஒவ்வொரு கட்டத்திலும் யார் பொறுப்பு என்பதை காட்டுகிறது",
        "பொது தோல்வி குறியீடு (PFI) எந்த மாவட்டங்கள் தோல்வியடைகின்றன என்பதை காட்டுகிறது",
        "தாமதமான பிரச்சனைகள் பொதுவில் சிறப்பிக்கப்படுகின்றன",
        "அரசு பதில்கள் (சேர்க்கப்படும்போது) அனைவருக்கும் தெரியும்",
        "இந்த பொது தெரிவுநிலை பொறுப்புணர்வு அழுத்தத்தை உருவாக்குகிறது"
      ]
    },
    {
      icon: Scale,
      titleEn: "Fairness Rules",
      titleTa: "நேர்மை விதிகள்",
      contentEn: [
        "Rate limits: Max 5 issues per day, 50 votes per day",
        "Only citizens from same district can vote on an issue",
        "Abusive content is blocked by AI moderation",
        "Criticism of policy is allowed; personal attacks are not",
        "All votes are anonymous but counted fairly",
        "No political party branding or bias"
      ],
      contentTa: [
        "வரம்புகள்: நாளுக்கு அதிகபட்சம் 5 பிரச்சனைகள், 50 வாக்குகள்",
        "அதே மாவட்டத்தின் குடிமக்கள் மட்டுமே வாக்களிக்க முடியும்",
        "தவறான உள்ளடக்கம் AI மூலம் தடுக்கப்படுகிறது",
        "கொள்கை விமர்சனம் அனுமதிக்கப்படுகிறது; தனிப்பட்ட தாக்குதல்கள் அல்ல",
        "அனைத்து வாக்குகளும் அநாமதேயமானவை ஆனால் நேர்மையாக எண்ணப்படுகின்றன",
        "எந்த அரசியல் கட்சி முத்திரை அல்லது சார்பு இல்லை"
      ]
    }
  ];

  const glossary = [
    { term: "Support", termTa: "ஆதரவு", defEn: "Vote indicating you face this issue too", defTa: "இந்த பிரச்சனை உங்களுக்கும் உள்ளது என்று வாக்கு" },
    { term: "Oppose", termTa: "எதிர்ப்பு", defEn: "Vote indicating you don't think this is valid", defTa: "இது செல்லுபடியாகாது என்று நினைக்கிறீர்கள்" },
    { term: "Escalation", termTa: "உயர்வு", defEn: "Issue moving to higher authority for action", defTa: "நடவடிக்கைக்காக உயர் அதிகாரிக்கு செல்லும் பிரச்சனை" },
    { term: "PFI", termTa: "பொது தோல்வி குறியீடு", defEn: "Score measuring district's failure to resolve issues", defTa: "மாவட்டத்தின் பிரச்சனை தீர்க்காமையை அளவிடும் மதிப்பெண்" },
    { term: "SLA", termTa: "சேவை நிலை ஒப்பந்தம்", defEn: "Time limit for official to respond", defTa: "அதிகாரி பதில் அளிக்க கால வரம்பு" },
    { term: "Publicly Validated", termTa: "பொதுவில் சரிபார்க்கப்பட்டது", defEn: "Issue with 60%+ public support", defTa: "60%+ பொது ஆதரவு பெற்ற பிரச்சனை" }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen py-8 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground font-tamil">
              {language === 'ta' ? 'நம்பகத்தன்மை & வெளிப்படைத்தன்மை' : 'Trust & Transparency'}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto font-tamil">
              {language === 'ta' 
                ? 'மக்கள் குரல் வெளிப்படைத்தன்மை, நேர்மை மற்றும் ஜனநாயக சரிபார்ப்பை முன்னுரிமை அளிக்கிறது - வேகம் அல்லது அரசியல் காட்சிகள் அல்ல.'
                : 'Makkal Kural prioritizes transparency, fairness, and democratic validation - not speed or political optics.'}
            </p>
          </div>

          {/* Principles */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 font-tamil">
                <Users className="w-5 h-5 text-primary" />
                {language === 'ta' ? 'முக்கிய கொள்கைகள்' : 'Core Principles'}
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { icon: CheckCircle, en: "People can raise issues", ta: "மக்கள் பிரச்சனைகளை எழுப்பலாம்" },
                  { icon: ThumbsUp, en: "Others can support or oppose", ta: "மற்றவர்கள் ஆதரவு அல்லது எதிர்க்கலாம்" },
                  { icon: TrendingUp, en: "Majority triggers escalation", ta: "பெரும்பான்மை உயர்வை தூண்டும்" },
                  { icon: Eye, en: "Every step is public", ta: "ஒவ்வொரு படியும் பொதுவானது" },
                  { icon: AlertTriangle, en: "No issue disappears silently", ta: "எந்த பிரச்சனையும் அமைதியாக மறைவதில்லை" },
                  { icon: Scale, en: "Transparency is default", ta: "வெளிப்படைத்தன்மை இயல்பானது" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-tamil">{language === 'ta' ? item.ta : item.en}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Sections */}
          <div className="space-y-6">
            {sections.map((section, idx) => (
              <Card key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-tamil">
                    <section.icon className="w-5 h-5 text-primary" />
                    {language === 'ta' ? section.titleTa : section.titleEn}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(language === 'ta' ? section.contentTa : section.contentEn).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="font-tamil">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Glossary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-tamil">
                <HelpCircle className="w-5 h-5 text-primary" />
                {language === 'ta' ? 'சொற்களஞ்சியம்' : 'Glossary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {glossary.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-muted/50">
                    <p className="font-semibold text-sm font-tamil">
                      {language === 'ta' ? item.termTa : item.term}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-tamil">
                      {language === 'ta' ? item.defTa : item.defEn}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <div className="text-center text-sm text-muted-foreground font-tamil">
            {language === 'ta' 
              ? '"இந்த தளம் குடிமக்களை அதிகாரமளிக்கவும், நிர்வாகிகளை பொறுப்புள்ளவர்களாக உணரவும் செய்ய வேண்டும்."'
              : '"This platform must make citizens feel empowered, and administrators feel accountable."'}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AboutPage;
