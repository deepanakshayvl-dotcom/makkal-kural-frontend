import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { 
  MapPin, ChevronRight, ChevronLeft, Mic, MicOff, Upload, 
  Loader2, CheckCircle, AlertCircle, X, Image, Video
} from 'lucide-react';
import AnonymousToggle from '../components/AnonymousToggle';
import GeoLock from '../components/GeoLock';
import MultiDeptTagger from '../components/MultiDeptTagger';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RaiseIssuePage = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [districts, setDistricts] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [categories, setCategories] = useState({});
  const [formData, setFormData] = useState({
    district: user?.district || '',
    constituency: '',
    local_body_type: user?.local_body_type || '',
    local_body_name: user?.local_body_name || '',
    ward: user?.ward || '',
    street: '',
    category: '',
    problem_id: '',
    description: '',
    voice_note_text: '',
    frequency: 'daily',
    affected_people: 'only_me',
    duration: 'weeks',
    media_urls: [],
    is_anonymous: false,
    // Batch 2 loophole fixes: GPS + multi-dept tagging
    gps_lat: null,
    gps_lng: null,
    gps_accuracy: null,
    responsible_depts: [],
    dept_type: 'state'
  });

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // File upload
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const localBodyTypes = ['Corporation', 'Municipality', 'Town Panchayat', 'Village Panchayat'];
  const frequencies = [
    { value: 'daily', labelTa: 'தினமும்', labelEn: 'Daily' },
    { value: 'weekly', labelTa: 'வாரம்தோறும்', labelEn: 'Weekly' },
    { value: 'seasonal', labelTa: 'பருவகால', labelEn: 'Seasonal' },
    { value: 'emergency', labelTa: 'அவசரம்', labelEn: 'Emergency' }
  ];
  const affectedOptions = [
    { value: 'only_me', labelTa: 'நான் மட்டும்', labelEn: 'Only me' },
    { value: '10-50', labelTa: '10-50 பேர்', labelEn: '10-50 people' },
    { value: '50-500', labelTa: '50-500 பேர்', labelEn: '50-500 people' },
    { value: 'entire_area', labelTa: 'முழு பகுதி', labelEn: 'Entire area' }
  ];
  const durations = [
    { value: 'weeks', labelTa: 'வாரங்கள்', labelEn: 'Weeks' },
    { value: 'months', labelTa: 'மாதங்கள்', labelEn: 'Months' },
    { value: 'years', labelTa: 'வருடங்கள்', labelEn: 'Years' }
  ];

  useEffect(() => {
    fetchConstants();
  }, []);

  // Fetch constituencies when district changes
  useEffect(() => {
    if (formData.district) {
      fetchConstituencies(formData.district);
    } else {
      setConstituencies([]);
    }
  }, [formData.district]);

  const fetchConstants = async () => {
    setLoading(true);
    try {
      const [districtsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/constants/districts`),
        axios.get(`${API}/constants/categories`)
      ]);
      setDistricts(districtsRes.data.districts);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      toast.error('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const fetchConstituencies = async (district) => {
    try {
      const res = await axios.get(`${API}/constants/constituencies?district=${encodeURIComponent(district)}`);
      setConstituencies(res.data.constituencies || []);
    } catch (error) {
      console.error('Failed to fetch constituencies:', error);
      setConstituencies([]);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info(language === 'ta' ? 'பதிவு தொடங்கியது' : 'Recording started');
    } catch (error) {
      toast.error(language === 'ta' ? 'மைக் அணுகல் மறுக்கப்பட்டது' : 'Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info(language === 'ta' ? 'பதிவு நிறுத்தப்பட்டது' : 'Recording stopped');
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    
    setTranscribing(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('file', audioBlob, 'voice.wav');
      
      const response = await axios.post(`${API}/voice/transcribe`, formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        updateFormData('voice_note_text', response.data.text);
        updateFormData('description', formData.description + (formData.description ? '\n' : '') + response.data.text);
        toast.success(language === 'ta' ? 'குரல் உரையாக மாற்றப்பட்டது' : 'Voice transcribed');
      }
    } catch (error) {
      toast.error(language === 'ta' ? 'உரை மாற்றம் தோல்வி' : 'Transcription failed');
    } finally {
      setTranscribing(false);
    }
  };

  // File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(language === 'ta' ? 'கோப்பு அளவு அதிகம் (50MB வரை)' : 'File too large (max 50MB)');
      return;
    }

    setUploadingFile(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      
      const response = await axios.post(`${API}/upload`, uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        updateFormData('media_urls', [...formData.media_urls, response.data.url]);
        toast.success(language === 'ta' ? 'பதிவேற்றம் வெற்றி' : 'Upload successful');
      }
    } catch (error) {
      toast.error(language === 'ta' ? 'பதிவேற்றம் தோல்வி' : 'Upload failed');
    } finally {
      setUploadingFile(false);
    }
  };

  const removeMedia = (index) => {
    const newUrls = formData.media_urls.filter((_, i) => i !== index);
    updateFormData('media_urls', newUrls);
  };

  // Submit
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/issues`, formData);
      if (response.data.success) {
        toast.success(language === 'ta' ? 'பிரச்சனை சமர்ப்பிக்கப்பட்டது!' : 'Issue submitted successfully!');
        navigate(`/issues/${response.data.issue.id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.district && formData.local_body_type && formData.local_body_name;
      case 2:
        return formData.category && formData.problem_id;
      case 3:
        return formData.description.length >= 10 && formData.frequency && formData.affected_people && formData.duration;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedCategory = categories[formData.category];

  return (
    <div className="min-h-screen py-8 px-4 bg-secondary/30">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium font-tamil">
              {language === 'ta' ? `படி ${step}/3` : `Step ${step}/3`}
            </span>
            <span className="text-sm text-muted-foreground font-tamil">
              {step === 1 && (language === 'ta' ? 'இடம் தேர்வு' : 'Select Location')}
              {step === 2 && (language === 'ta' ? 'பிரச்சனை தேர்வு' : 'Select Problem')}
              {step === 3 && (language === 'ta' ? 'விவரங்கள்' : 'Details')}
            </span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        <Card className="animate-fade-in">
          {/* Step 1: Location */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-tamil">
                  <MapPin className="w-5 h-5 text-primary" />
                  {language === 'ta' ? 'இடம் தேர்வு செய்யவும்' : 'Select Location'}
                </CardTitle>
                <CardDescription className="font-tamil">
                  {language === 'ta' ? 'உங்கள் பகுதியின் விவரங்கள்' : 'Details of your area'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* District */}
                <div className="space-y-2">
                  <Label className="font-tamil">{t('selectDistrict')} *</Label>
                  <Select value={formData.district} onValueChange={v => {
                    updateFormData('district', v);
                    updateFormData('constituency', ''); // Reset constituency when district changes
                  }}>
                    <SelectTrigger data-testid="district-select">
                      <SelectValue placeholder={language === 'ta' ? 'மாவட்டம் தேர்வு' : 'Select district'} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Constituency - NEW */}
                {formData.district && constituencies.length > 0 && (
                  <div className="space-y-2">
                    <Label className="font-tamil">
                      {language === 'ta' ? 'சட்டமன்ற தொகுதி' : 'Assembly Constituency'} *
                    </Label>
                    <Select value={formData.constituency} onValueChange={v => updateFormData('constituency', v)}>
                      <SelectTrigger data-testid="constituency-select">
                        <SelectValue placeholder={language === 'ta' ? 'தொகுதி தேர்வு' : 'Select constituency'} />
                      </SelectTrigger>
                      <SelectContent>
                        {constituencies.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ta' ? `${constituencies.length} தொகுதிகள் ${formData.district} மாவட்டத்தில்` : `${constituencies.length} constituencies in ${formData.district}`}
                    </p>
                  </div>
                )}

                {/* Local Body Type */}
                <div className="space-y-2">
                  <Label className="font-tamil">{t('selectLocalBody')} *</Label>
                  <Select value={formData.local_body_type} onValueChange={v => updateFormData('local_body_type', v)}>
                    <SelectTrigger data-testid="local-body-type-select">
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
                    {language === 'ta' ? 'நகரம்/கிராமம் பெயர்' : 'City/Village Name'} *
                  </Label>
                  <Input
                    value={formData.local_body_name}
                    onChange={e => updateFormData('local_body_name', e.target.value)}
                    placeholder={language === 'ta' ? 'பெயர் உள்ளிடவும்' : 'Enter name'}
                    data-testid="local-body-name-input"
                  />
                </div>

                {/* Ward */}
                <div className="space-y-2">
                  <Label className="font-tamil">
                    {language === 'ta' ? 'வார்டு / கிராமம்' : 'Ward / Village'}
                  </Label>
                  <Input
                    value={formData.ward}
                    onChange={e => updateFormData('ward', e.target.value)}
                    placeholder={language === 'ta' ? 'விருப்பமானால்' : 'Optional'}
                  />
                </div>

                {/* Street */}
                <div className="space-y-2">
                  <Label className="font-tamil">
                    {language === 'ta' ? 'தெரு / பகுதி' : 'Street / Area'}
                  </Label>
                  <Input
                    value={formData.street}
                    onChange={e => updateFormData('street', e.target.value)}
                    placeholder={language === 'ta' ? 'விருப்பமானால்' : 'Optional'}
                  />
                </div>

                {/* GeoLock: GPS capture to survive ward boundary redraws (L2 fix) */}
                <div data-testid="geo-lock">
                  <GeoLock
                    onLocationCaptured={(coords) => {
                      updateFormData('gps_lat', coords.lat);
                      updateFormData('gps_lng', coords.lng);
                      updateFormData('gps_accuracy', coords.accuracy);
                    }}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Category & Problem */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="font-tamil">
                  {language === 'ta' ? 'பிரச்சனை தேர்வு செய்யவும்' : 'Select Problem'}
                </CardTitle>
                <CardDescription className="font-tamil">
                  {language === 'ta' ? 'பிரிவு மற்றும் குறிப்பிட்ட பிரச்சனை' : 'Category and specific problem'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category */}
                <div className="space-y-2">
                  <Label className="font-tamil">{t('selectCategory')} *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(categories).map(([key, cat]) => (
                      <Button
                        key={key}
                        type="button"
                        variant={formData.category === key ? 'default' : 'outline'}
                        className="h-auto py-3 px-2 flex flex-col items-center gap-1 font-tamil"
                        onClick={() => {
                          updateFormData('category', key);
                          updateFormData('problem_id', '');
                        }}
                        data-testid={`category-${key}`}
                      >
                        <span className="text-xs">
                          {language === 'ta' ? cat.name_ta : cat.name_en}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Problem */}
                {formData.category && selectedCategory && (
                  <div className="space-y-2 animate-fade-in">
                    <Label className="font-tamil">{t('selectProblem')} *</Label>
                    <RadioGroup 
                      value={formData.problem_id} 
                      onValueChange={v => updateFormData('problem_id', v)}
                    >
                      {selectedCategory.problems.map(p => (
                        <div key={p.id} className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-muted/50 cursor-pointer">
                          <RadioGroupItem value={p.id} id={p.id} data-testid={`problem-${p.id}`} />
                          <Label htmlFor={p.id} className="cursor-pointer flex-1 font-tamil">
                            {language === 'ta' ? p.name_ta : p.name_en}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* MultiDeptTagger: Tag all responsible depts to prevent buck-passing (L3) */}
                {formData.category && (
                  <div data-testid="multi-dept-tagger">
                    <MultiDeptTagger
                      category={selectedCategory?.name_en || formData.category}
                      onDeptsSelected={(depts) => {
                        updateFormData('responsible_depts', depts);
                        const hasCentral = depts.some(d => /Central|NHAI|CBI|CPCB|KVS|NHM|CEA|Railways|AAI|NSAP/.test(d));
                        updateFormData('dept_type', hasCentral ? 'mixed' : 'state');
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="font-tamil">
                  {language === 'ta' ? 'விவரங்கள் சேர்க்கவும்' : 'Add Details'}
                </CardTitle>
                <CardDescription className="font-tamil">
                  {language === 'ta' ? 'பிரச்சனையை விவரிக்கவும்' : 'Describe the issue'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Voice Recording */}
                <div className="space-y-3">
                  <Label className="font-tamil">{t('recordVoice')}</Label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className={`voice-btn ${isRecording ? 'recording' : ''}`}
                      onClick={isRecording ? stopRecording : startRecording}
                      data-testid="voice-record-btn"
                    >
                      {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>
                    {audioBlob && !isRecording && (
                      <div className="flex-1 space-y-2">
                        <audio src={URL.createObjectURL(audioBlob)} controls className="w-full h-10" />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={transcribeAudio}
                          disabled={transcribing}
                        >
                          {transcribing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          {language === 'ta' ? 'உரையாக மாற்று' : 'Transcribe to Text'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="font-tamil">{t('describeIssue')} *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={e => updateFormData('description', e.target.value)}
                    placeholder={language === 'ta' ? 'பிரச்சனையை விரிவாக விவரிக்கவும்...' : 'Describe the problem in detail...'}
                    rows={4}
                    className="font-tamil"
                    data-testid="description-textarea"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/500
                  </p>
                </div>

                {/* Impact Questions */}
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Frequency */}
                  <div className="space-y-2">
                    <Label className="font-tamil text-sm">
                      {language === 'ta' ? 'எவ்வளவு அடிக்கடி?' : 'How often?'}
                    </Label>
                    <Select value={formData.frequency} onValueChange={v => updateFormData('frequency', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map(f => (
                          <SelectItem key={f.value} value={f.value}>
                            {language === 'ta' ? f.labelTa : f.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Affected People */}
                  <div className="space-y-2">
                    <Label className="font-tamil text-sm">
                      {language === 'ta' ? 'எத்தனை பேர்?' : 'How many affected?'}
                    </Label>
                    <Select value={formData.affected_people} onValueChange={v => updateFormData('affected_people', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {affectedOptions.map(a => (
                          <SelectItem key={a.value} value={a.value}>
                            {language === 'ta' ? a.labelTa : a.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label className="font-tamil text-sm">
                      {language === 'ta' ? 'எவ்வளவு காலம்?' : 'How long?'}
                    </Label>
                    <Select value={formData.duration} onValueChange={v => updateFormData('duration', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map(d => (
                          <SelectItem key={d.value} value={d.value}>
                            {language === 'ta' ? d.labelTa : d.labelEn}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Media Upload */}
                <div className="space-y-3">
                  <Label className="font-tamil">{t('uploadMedia')}</Label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <div className="flex flex-wrap gap-3">
                    {formData.media_urls.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg border overflow-hidden group">
                        {url.includes('video') ? (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Video className="w-6 h-6 text-muted-foreground" />
                          </div>
                        ) : (
                          <img src={`${process.env.REACT_APP_BACKEND_URL}${url}`} alt="" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {formData.media_urls.length < 3 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-primary/50 transition-colors"
                        data-testid="upload-media-btn"
                      >
                        {uploadingFile ? (
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Add</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'ta' ? 'அதிகபட்சம் 3 படங்கள்/வீடியோக்கள்' : 'Max 3 photos/videos'}
                  </p>
                </div>

                {/* Anonymous Toggle */}
                <AnonymousToggle 
                  isAnonymous={formData.is_anonymous}
                  onChange={(val) => updateFormData('is_anonymous', val)}
                />
              </CardContent>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between p-6 pt-0">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} data-testid="back-btn">
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t('back')}
              </Button>
            ) : (
              <div />
            )}
            
            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()} data-testid="next-btn">
                {t('next')}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || submitting} data-testid="submit-btn">
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {t('submitIssue')}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RaiseIssuePage;
