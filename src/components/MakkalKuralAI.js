import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const SESSION_ID = `mk-ai-${Math.random().toString(36).slice(2)}-${Date.now()}`;

// MakkalKuralAI.js — AI CIVIC ASSISTANT
// ================================================================
// WHAT THIS DOES:
// A Tamil-first AI assistant embedded in the platform that helps citizens:
// 1. Find the right category/department for their issue
// 2. Write better issue descriptions
// 3. Understand their rights (RTI, CPGRAMS, escalation)
// 4. Get guidance in Tamil or English
// 5. Know which level of government to approach
// 6. Understand what they can and can't demand from officials
//
// POWERED BY: Anthropic Claude API (claude-sonnet-4-20250514)
// Uses the Artifacts API pattern — Claude in Claude
//
// Usage: Add floating button to App.js
//   import MakkalKuralAI from './components/MakkalKuralAI';
//   <MakkalKuralAI /> — renders as floating chat button on every page

const SYSTEM_PROMPT = `You are Makkal Kural AI (மக்கள் குரல் AI), a Tamil Nadu civic governance assistant embedded in the Makkal Kural democratic platform.

Your role: Help Tamil Nadu citizens understand their rights, navigate government systems, write better complaints, and know how to escalate issues.

LANGUAGE RULES:
- If user writes in Tamil, respond primarily in Tamil with English terms where needed
- If user writes in English, respond in English
- Always use simple, accessible language — many users are rural citizens unfamiliar with legal terms
- When explaining government hierarchy, use local Tamil terms: VAO (கிராம நிர்வாக அலுவலர்), BDO (வட்டார வளர்ச்சி அலுவலர்), Collector (மாவட்ட ஆட்சியர்)

YOUR KNOWLEDGE BASE:
1. Tamil Nadu government hierarchy: VAO → BDO → District Collector → Dept Secretary → Minister → Chief Secretary → Chief Minister
2. All 38 TN districts and their local body structure
3. RTI Act 2005: Citizens can file RTI at rtionline.tn.gov.in, 30-day response mandate, Rs.10 fee, Tamil accepted
4. CPGRAMS (pgportal.gov.in): For central government issues, 21-day mandate
5. Issue categories: Water, Roads, Health, Electricity, Flooding, Pollution, Schools, Farming, Transport, Garbage, Sewage, Employment, Housing, Welfare, Corruption, Public Safety
6. Central vs State jurisdiction: Railways/NHAI/Central banks = Central; TANGEDCO/PWD/Corporation = State
7. Auto-escalation thresholds: 25+ supporters = Area Concern, 75%+ support + 25 votes = escalate level
8. SLA by level: VAO=7days, BDO=14days, Collector=30days, Secretary=45days, Minister=60days, CS=75days, CM=90days
9. Anonymous reporting: Available for corruption/safety issues
10. Resolution disputes: Citizens can dispute "resolved" status within 7 days if issue not actually fixed

WHAT YOU CAN HELP WITH:
- "How do I raise a complaint about X?" → Guide them to right category and description tips
- "My VAO isn't responding" → Explain how to escalate to BDO, what threshold needed
- "Can I file RTI for this?" → RTI guidance specific to their issue
- "Is this a state or central issue?" → Jurisdiction explanation
- "How do I write a good complaint description?" → Help draft description
- "What are my rights?" → Explain relevant rights
- "The government said it's resolved but it's not" → Explain dispute process

WHAT TO AVOID:
- Do not make specific legal promises ("you will definitely get a response")
- Do not recommend illegal actions
- Do not discuss politics or specific politicians by name
- Do not share contact numbers (may be outdated)
- Keep responses under 200 words unless user needs detailed guidance

TONE: Supportive, clear, empowering. Citizens often feel powerless — make them feel capable.

Always end responses about RTI/CPGRAMS/complaints with a specific actionable next step.`;

const QUICK_PROMPTS = [
  { label: 'எனது பிரச்சனை', labelEn: 'Raise an issue', prompt: 'எனது பகுதியில் ஒரு பிரச்சனை உள்ளது. எந்த வகையில் புகாரளிக்கணும்?' },
  { label: 'RTI தாக்கல்', labelEn: 'File RTI', prompt: 'RTI எப்படி தாக்கல் செய்வது? என்ன கேள்விகள் கேட்கலாம்?' },
  { label: 'அலுவலர் பதில் இல்லை', labelEn: 'No response', prompt: 'VAO/BDO பதில் சொல்லவில்லை. என்ன செய்வது?' },
  { label: 'Central vs State', labelEn: 'Which govt?', prompt: 'என் பிரச்சனை மாநில அரசின் கீழா அல்லது மத்திய அரசின் கீழா என்று எப்படி தெரியும்?' },
  { label: 'ஊழல் புகார்', labelEn: 'Corruption', prompt: 'ஒரு அரசு அலுவலர் ஊழல் செய்கிறார். அனாமதேயமாக புகாரளிக்க முடியுமா?' },
  { label: 'தீர்க்கப்பட்டது என்றார்கள்', labelEn: 'Fake resolved', prompt: 'அரசு என் பிரச்சனை தீர்க்கப்பட்டது என்று மூடிவிட்டார்கள். ஆனால் பிரச்சனை இன்னும் உள்ளது. என்ன செய்வது?' },
];

const MakkalKuralAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('ta');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: language === 'ta'
          ? 'வணக்கம்! நான் மக்கள் குரல் AI. உங்கள் அரசு சார்ந்த பிரச்சனைகளுக்கு உதவ இங்கே இருக்கிறேன்.\n\nRTI தாக்கல், புகார் எழுதுவது, உரிமைகள் புரிந்துகொள்வது — எதுவும் கேளுங்கள் 👇'
          : 'Hello! I\'m Makkal Kural AI, your Tamil Nadu civic rights assistant.\n\nI can help you raise issues, file RTIs, understand your rights, and navigate government systems. What can I help you with?',
        isGreeting: true,
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Call our backend AI chat endpoint (uses Claude via Emergent LLM key server-side)
      const response = await axios.post(
        `${API_BASE}/api/ai/chat`,
        {
          session_id: SESSION_ID,
          message: userMsg,
          language,
          history: newMessages
            .filter(m => !m.isGreeting)
            .slice(0, -1) // exclude the just-pushed user message (sent separately)
            .map(m => ({ role: m.role, content: m.content })),
        }
      );

      const reply = response.data?.reply || 'Sorry, I could not get a response. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m temporarily unavailable. Please try again in a moment.\n\nநேரமின்மை காரணமாக பதில் வரவில்லை. மீண்டும் முயற்சிக்கவும்.',
        isError: true,
      }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setTimeout(() => {
      setMessages([{
        role: 'assistant',
        content: language === 'ta'
          ? 'வணக்கம்! புதிய உரையாடல் தொடங்கியது. என்ன உதவி வேண்டும்?'
          : 'Hello! New conversation started. How can I help you?',
        isGreeting: true,
      }]);
    }, 100);
  };

  return (
    <>
      {/* Floating button */}
      <button
        data-testid="makkal-kural-ai-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: 80, right: 24,
          width: 60, height: 60, borderRadius: '50%',
          backgroundColor: '#B91C1C', color: '#fff',
          border: 'none', cursor: 'pointer', zIndex: 9999,
          boxShadow: '0 4px 20px rgba(185,28,28,0.5)',
          fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        title="Makkal Kural AI Assistant"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Notification dot when closed */}
      {!isOpen && (
        <div style={{
          position: 'fixed', bottom: 132, right: 24,
          backgroundColor: '#FACC15', color: '#92400e',
          fontSize: 11, fontWeight: 700, padding: '3px 8px',
          borderRadius: 20, zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
        }}>
          AI உதவி கிடைக்கும்
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div style={S.chatWindow} data-testid="makkal-kural-ai-window">
          {/* Header */}
          <div style={S.header}>
            <div style={S.headerLeft}>
              <div style={S.avatar}>🤖</div>
              <div>
                <div style={S.headerTitle}>மக்கள் குரல் AI</div>
                <div style={S.headerSub}>உங்கள் அரசு உரிமை வழிகாட்டி</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Language toggle */}
              <div style={S.langSwitch}>
                {[['ta', 'த'], ['en', 'EN']].map(([k, l]) => (
                  <button key={k} onClick={() => setLanguage(k)} style={{
                    ...S.langSwitchBtn,
                    backgroundColor: language === k ? '#fff' : 'transparent',
                    color: language === k ? '#B91C1C' : 'rgba(255,255,255,0.7)',
                  }}>{l}</button>
                ))}
              </div>
              <button onClick={clearChat} style={S.clearBtn} title="Clear chat">🗑️</button>
              <button onClick={() => setIsOpen(false)} style={S.closeBtn}>✕</button>
            </div>
          </div>

          {/* Messages */}
          <div style={S.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                ...S.messageRow,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                {msg.role === 'assistant' && (
                  <div style={S.botAvatar}>🤖</div>
                )}
                <div style={{
                  ...S.bubble,
                  backgroundColor: msg.role === 'user' ? '#B91C1C' : msg.isError ? '#fff1f2' : '#f3f4f6',
                  color: msg.role === 'user' ? '#fff' : msg.isError ? '#dc2626' : '#111827',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                }}>
                  {msg.content.split('\n').map((line, li) => (
                    <React.Fragment key={li}>
                      {line}
                      {li < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ ...S.messageRow, justifyContent: 'flex-start' }}>
                <div style={S.botAvatar}>🤖</div>
                <div style={{ ...S.bubble, backgroundColor: '#f3f4f6' }}>
                  <div style={S.typingDots}>
                    <span style={S.dot1} /><span style={S.dot2} /><span style={S.dot3} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick prompts — show only at start */}
            {messages.length <= 1 && !loading && (
              <div style={S.quickPrompts}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>Quick questions:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {QUICK_PROMPTS.map((qp, i) => (
                    <button key={i} onClick={() => sendMessage(qp.prompt)} style={S.quickBtn}>
                      {language === 'ta' ? qp.label : qp.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={S.inputArea}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'ta' ? 'உங்கள் கேள்வியை தமிழில் கேளுங்கள்...' : 'Ask your question in Tamil or English...'}
              style={S.input}
              rows={2}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                ...S.sendBtn,
                backgroundColor: input.trim() && !loading ? '#B91C1C' : '#e5e7eb',
                color: input.trim() && !loading ? '#fff' : '#9ca3af',
              }}
            >
              ➤
            </button>
          </div>
          <div style={S.footer}>
            Powered by Claude AI · Your conversation is private · Not legal advice
          </div>
        </div>
      )}

      {/* Typing animation styles */}
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        .mk-dot { width:8px;height:8px;background:#9ca3af;border-radius:50%;display:inline-block;margin:0 2px; }
        .mk-dot1{animation:bounce 1.4s ease-in-out 0s infinite both}
        .mk-dot2{animation:bounce 1.4s ease-in-out 0.16s infinite both}
        .mk-dot3{animation:bounce 1.4s ease-in-out 0.32s infinite both}
      `}</style>
    </>
  );
};

const S = {
  chatWindow: { position: 'fixed', bottom: 156, right: 24, width: 360, height: 560, backgroundColor: '#fff', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', zIndex: 9998, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e5e7eb' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#B91C1C', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  headerTitle: { fontSize: 14, fontWeight: 700, color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  langSwitch: { display: 'flex', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 2 },
  langSwitchBtn: { padding: '3px 8px', border: 'none', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' },
  clearBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14 },
  closeBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 16, fontWeight: 700 },
  messages: { flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 },
  messageRow: { display: 'flex', alignItems: 'flex-end', gap: 6 },
  botAvatar: { width: 26, height: 26, backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 },
  bubble: { maxWidth: '80%', padding: '10px 14px', fontSize: 13, lineHeight: 1.6, wordBreak: 'break-word' },
  typingDots: { display: 'flex', gap: 4, padding: '4px 2px' },
  dot1: { className: 'mk-dot mk-dot1', width: 8, height: 8, backgroundColor: '#9ca3af', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s ease-in-out 0s infinite both' },
  dot2: { width: 8, height: 8, backgroundColor: '#9ca3af', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s ease-in-out 0.16s infinite both' },
  dot3: { width: 8, height: 8, backgroundColor: '#9ca3af', borderRadius: '50%', display: 'inline-block', animation: 'bounce 1.4s ease-in-out 0.32s infinite both' },
  quickPrompts: { marginTop: 4 },
  quickBtn: { fontSize: 11, fontWeight: 600, padding: '5px 10px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap' },
  inputArea: { display: 'flex', gap: 8, padding: '10px 12px', borderTop: '1px solid #f3f4f6', flexShrink: 0 },
  input: { flex: 1, padding: '8px 12px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 10, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, outline: 'none' },
  sendBtn: { width: 40, height: 40, borderRadius: '50%', border: 'none', fontSize: 16, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0, alignSelf: 'flex-end' },
  footer: { fontSize: 10, color: '#9ca3af', textAlign: 'center', padding: '6px', borderTop: '1px solid #f3f4f6', flexShrink: 0 },
};

export default MakkalKuralAI;
