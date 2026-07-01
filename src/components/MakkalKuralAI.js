import React, { useState, useRef, useEffect } from 'react';

// ─── Rule-based civic assistant ───────────────────────────────────────────────
// No API key needed. Covers RTI, escalation, categories, rights, corruption.

const RULES = [
  // ── RTI ──────────────────────────────────────────────────────────────────
  {
    keywords: ['rti', 'right to information', 'தகவல் உரிமை', 'தகவல் உரிமைச் சட்டம்', 'rtionline', 'information act'],
    en: `📋 **Right to Information (RTI) Act 2005**

RTI lets every citizen get information from any government office within **30 days**.

**How to file in Tamil Nadu:**
1. Go to **rtionline.tn.gov.in** (online) or visit the nearest government office
2. Write your question clearly — what information you want, which department, which period
3. Pay **₹10 fee** (postal order / online)
4. Tamil language is fully accepted

**What you can ask:**
• Why your complaint hasn't been resolved
• How government funds were spent in your area
• Status of a road/water/sewage project
• Why a scheme benefit wasn't given to you

**If no response in 30 days:** File a **First Appeal** to the senior officer. If still no response in 45 days, approach the **Tamil Nadu Information Commission** at tnsic.gov.in

➡️ **Next step:** Go to rtionline.tn.gov.in and click "Submit Request"`,

    ta: `📋 **தகவல் உரிமைச் சட்டம் (RTI) 2005**

இந்தச் சட்டத்தின் கீழ் எந்த அரசு அலுவலகத்திலிருந்தும் **30 நாட்களுக்குள்** தகவல் பெறலாம்.

**தமிழ்நாட்டில் RTI தாக்கல் செய்வது எப்படி:**
1. **rtionline.tn.gov.in** இணையதளம் அல்லது அருகில் உள்ள அரசு அலுவலகம்
2. உங்கள் கேள்வியை தெளிவாக எழுதுங்கள் — என்ன தகவல், எந்த துறை, எந்த காலகட்டம்
3. **₹10 கட்டணம்** செலுத்துங்கள் (postal order / online)
4. தமிழில் எழுதலாம்

**என்ன கேட்கலாம்:**
• உங்கள் புகார் ஏன் தீர்க்கப்படவில்லை
• உங்கள் பகுதியில் நிதி எப்படி செலவிடப்பட்டது
• சாலை/நீர்/கழிவுநீர் திட்டம் எந்த நிலையில் உள்ளது
• திட்ட பலன் ஏன் கிடைக்கவில்லை

**30 நாட்களில் பதில் இல்லாவிட்டால்:** மூத்த அலுவலரிடம் **First Appeal** தாக்கல் செய்யுங்கள். 45 நாட்களிலும் பதில் இல்லாவிட்டால் **தமிழ்நாடு தகவல் ஆணையம்** (tnsic.gov.in) அணுகுங்கள்.

➡️ **அடுத்த படி:** rtionline.tn.gov.in சென்று "Submit Request" கிளிக் செய்யுங்கள்`,
  },

  // ── Escalation / No response ──────────────────────────────────────────────
  {
    keywords: ['vao', 'bdo', 'பதில் சொல்லவில்லை', 'no response', 'escalate', 'escalation', 'அலுவலர்', 'collector', 'மாவட்ட ஆட்சியர்', 'complaint ignored', 'not responding', 'பதில் இல்லை', 'உரிய நடவடிக்கை இல்லை'],
    en: `📢 **How to Escalate When Officials Don't Respond**

Tamil Nadu uses a clear 7-level escalation system:

| Level | Official | Response Time |
|-------|----------|---------------|
| L1 | VAO (Village Admin Officer) | 7 days |
| L2 | BDO (Block Development Officer) | 14 days |
| L3 | District Collector | 30 days |
| L4 | Department Secretary | 45 days |
| L5 | Minister | 60 days |
| L6 | Chief Secretary | 75 days |
| L7 | Chief Minister's Cell | 90 days |

**On Makkal Kural:** Once your issue gets **25+ supporters**, it auto-escalates to the next level. At **75%+ support**, it becomes a public demand.

**Other ways to escalate:**
• **CM Helpline:** 1100 (Tamil Nadu Chief Minister's grievance cell)
• **TNCM Portal:** cm.tn.gov.in/petition
• **District Collector office:** Walk in with printed complaint copies
• **RTI:** File RTI asking why your complaint wasn't addressed

➡️ **Next step:** File your issue on Makkal Kural and rally supporters. 25 votes triggers automatic escalation.`,

    ta: `📢 **அலுவலர்கள் பதில் சொல்லாவிட்டால் என்ன செய்வது?**

தமிழ்நாட்டில் 7 நிலை மேல்முறையீட்டு முறை உள்ளது:

| நிலை | அலுவலர் | பதில் காலம் |
|------|---------|------------|
| L1 | VAO (கிராம நிர்வாக அலுவலர்) | 7 நாட்கள் |
| L2 | BDO (வட்டார வளர்ச்சி அலுவலர்) | 14 நாட்கள் |
| L3 | மாவட்ட ஆட்சியர் | 30 நாட்கள் |
| L4 | துறை செயலாளர் | 45 நாட்கள் |
| L5 | அமைச்சர் | 60 நாட்கள் |
| L6 | தலைமை செயலாளர் | 75 நாட்கள் |
| L7 | முதலமைச்சர் அலுவலகம் | 90 நாட்கள் |

**மக்கள் குரலில்:** உங்கள் பிரச்சனைக்கு **25+ ஆதரவாளர்கள்** கிடைத்தால் தானாக அடுத்த நிலைக்கு மேல்முறையீடு செய்யப்படும்.

**மற்ற வழிகள்:**
• **CM Helpline:** 1100 அழைக்கவும்
• **CM Portal:** cm.tn.gov.in/petition
• RTI தாக்கல் செய்யுங்கள்

➡️ **அடுத்த படி:** மக்கள் குரலில் பிரச்சனை பதிவு செய்து 25 ஆதரவு பெறுங்கள்`,
  },

  // ── Water ────────────────────────────────────────────────────────────────
  {
    keywords: ['water', 'நீர்', 'குடிநீர்', 'தண்ணீர்', 'borewell', 'tanker', 'pipeline', 'metro water', 'twad', 'cmwssb'],
    en: `💧 **Drinking Water Issues — Who to Contact**

**Urban areas (Corporation/Municipality):**
• Chennai: CMWSSB — 044-28440111 / cmwssb.tn.gov.in
• Other cities: Local municipality water department
• Raise issue category: **Drinking Water** on Makkal Kural

**Rural areas:**
• TWAD Board (Tamil Nadu Water Supply & Drainage) handles rural water
• Contact: Your BDO or Panchayat President
• CM Helpline 1100 also routes water complaints

**Common problems & what to mention in your complaint:**
• No water supply → mention last date water came, tanker cost you're paying
• Contaminated water → mention colour/smell, if anyone fell sick
• Borewell dried up → mention how many months dry, how many families affected

**Rights you have:**
Every Tamil Nadu household has a right to minimum 70 litres per person per day of safe drinking water under the state water policy.

➡️ **Next step:** Raise a "Drinking Water" issue on Makkal Kural with your ward/village name and how many families are affected.`,

    ta: `💧 **குடிநீர் பிரச்சனை — யாரை அணுகுவது?**

**நகரப் பகுதிகள்:**
• சென்னை: CMWSSB — 044-28440111
• மற்ற நகரங்கள்: உள்ளாட்சி நீர் வழங்கல் துறை
• மக்கள் குரலில் **குடிநீர்** வகை தேர்ந்தெடுங்கள்

**கிராமப் பகுதிகள்:**
• TWAD Board கிராமங்களில் நீர் வழங்கலை கவனிக்கிறது
• உங்கள் BDO அல்லது பஞ்சாயத்து தலைவரை அணுகுங்கள்
• CM Helpline 1100

**புகாரில் என்ன குறிப்பிட வேண்டும்:**
• கடைசியாக தண்ணீர் வந்த தேதி
• டேங்கர் வாங்கினால் கட்டணம் எவ்வளவு
• எத்தனை குடும்பங்கள் பாதிக்கப்பட்டன

**உங்கள் உரிமை:**
ஒவ்வொரு குடும்பத்திற்கும் தினமும் ஒருவருக்கு குறைந்தது 70 லிட்டர் குடிநீர் கிடைக்க வேண்டும் என்பது அரசு கொள்கை.

➡️ **அடுத்த படி:** மக்கள் குரலில் "குடிநீர்" வகையில் பிரச்சனை பதிவு செய்யுங்கள்`,
  },

  // ── Roads ────────────────────────────────────────────────────────────────
  {
    keywords: ['road', 'சாலை', 'pothole', 'குழி', 'highway', 'நெடுஞ்சாலை', 'pwdc', 'nhai', 'street light', 'தெரு விளக்கு'],
    en: `🛣️ **Road Issues — Who is Responsible?**

Tamil Nadu has 3 types of roads with different authorities:

| Road Type | Authority | Contact |
|-----------|-----------|---------|
| National Highways (NH) | NHAI | nhai.gov.in / 1033 |
| State Highways (SH) | Tamil Nadu Highways Dept | highways.tn.gov.in |
| City/Town Roads | Corporation/Municipality | Local body |
| Village Roads | Panchayat / PMGSY | Block Dev Office |

**For your complaint, mention:**
• Road name and stretch (start point to end point)
• Number of potholes / length of damaged section
• Any accidents that happened due to road condition
• How long it's been damaged

**Street lights:** Contact your local ward councillor or the municipality electrical department.

**Tip:** Photograph the damage with your location on and share it in the complaint — this strengthens your case significantly.

➡️ **Next step:** Raise a "Roads" issue on Makkal Kural. If 25+ people in your area support it, it escalates automatically.`,

    ta: `🛣️ **சாலை பிரச்சனை — யாரின் பொறுப்பு?**

தமிழ்நாட்டில் சாலைகளுக்கு வெவ்வேறு அதிகாரிகள் பொறுப்பு:

| சாலை வகை | பொறுப்பு அமைப்பு |
|----------|----------------|
| தேசிய நெடுஞ்சாலை (NH) | NHAI — 1033 |
| மாநில நெடுஞ்சாலை (SH) | TN Highways |
| நகர சாலைகள் | Corporation/Municipality |
| கிராம சாலைகள் | Panchayat / BDO |

**புகாரில் என்ன குறிப்பிட வேண்டும்:**
• சாலையின் பெயர், தொடக்க-இறுதி இடம்
• குழிகள் எண்ணிக்கை / சேதமடைந்த தூரம்
• ஏதாவது விபத்து நடந்ததா
• எத்தனை நாட்களாக சேதம்

**தெரு விளக்கு:** உங்கள் வார்டு உறுப்பினர் அல்லது உள்ளாட்சி மின் துறையை அணுகுங்கள்.

➡️ **அடுத்த படி:** மக்கள் குரலில் "சாலைகள்" வகையில் பதிவு செய்யுங்கள்`,
  },

  // ── Corruption ───────────────────────────────────────────────────────────
  {
    keywords: ['corruption', 'bribe', 'லஞ்சம்', 'ஊழல்', 'corrupt', 'bribery', 'money demanded', 'பணம் கேட்கிறார்', 'anonymous', 'அனாமதேயம்'],
    en: `🔒 **Reporting Corruption Anonymously**

You can report corruption **without revealing your identity** in multiple ways:

**1. Vigilance & Anti-Corruption Directorate (DVAC)**
• Website: dvac.tn.gov.in
• Helpline: **044-28592750**
• Anonymous complaints accepted

**2. Tamil Nadu Lokayukta**
• For complaints against government officers
• tnlokayukta.tn.gov.in

**3. Chief Minister's Grievance Cell**
• CM Helpline: **1100**
• Anonymous complaints can be submitted

**4. Makkal Kural Anonymous Reporting**
• When raising an issue, enable the "Anonymous" toggle
• Your mobile number will NOT be shown to anyone

**What to document before reporting:**
• Date, time, and place of the bribe demand
• Exact amount demanded
• Name/designation of the officer (if known)
• Any witnesses
• Any written communication

**Your protection:** The Prevention of Corruption Act protects complainants. Revealing your identity to harass you is itself an offense.

➡️ **Next step:** Call DVAC at 044-28592750 or file anonymously on Makkal Kural`,

    ta: `🔒 **ஊழல் புகாரை அனாமதேயமாக எப்படி தெரிவிப்பது?**

உங்கள் அடையாளம் தெரிவிக்காமல் புகார் செய்யலாம்:

**1. விஜிலன்ஸ் மற்றும் ஊழல் ஒழிப்பு இயக்குநரகம் (DVAC)**
• dvac.tn.gov.in
• தொலைபேசி: **044-28592750**
• அனாமதேய புகார் ஏற்கப்படும்

**2. தமிழ்நாடு லோகாயுக்தா**
• அரசு அலுவலர்களுக்கு எதிரான புகார்கள்
• tnlokayukta.tn.gov.in

**3. முதலமைச்சர் புகார் செல்**
• CM Helpline: **1100**

**4. மக்கள் குரலில் அனாமதேயமாக**
• பிரச்சனை பதிவு செய்யும்போது "Anonymous" தேர்வு செய்யுங்கள்
• உங்கள் போன் நம்பர் யாருக்கும் தெரியாது

**என்ன பதிவு வைக்க வேண்டும்:**
• தேதி, நேரம், இடம்
• கேட்கப்பட்ட தொகை
• அலுவலர் பெயர்/பதவி
• சாட்சிகள்

➡️ **அடுத்த படி:** DVAC 044-28592750 அழைக்கவும் அல்லது மக்கள் குரலில் அனாமதேயமாக பதிவு செய்யுங்கள்`,
  },

  // ── State vs Central ──────────────────────────────────────────────────────
  {
    keywords: ['central', 'state', 'மாநில', 'மத்திய', 'central government', 'state government', 'which government', 'எந்த அரசு', 'railway', 'bank', 'nhai', 'post office'],
    en: `🏛️ **State Government vs Central Government — Who to Approach?**

**State Government (Tamil Nadu) handles:**
• Roads (except National Highways)
• Schools & colleges (state board)
• Water supply, sewage (TWAD, CMWSSB)
• Electricity (TANGEDCO)
• Police
• Hospitals (government)
• Agriculture, irrigation
• Panchayats, municipalities

**Central Government handles:**
• Railways (Indian Railways — 139)
• National Highways (NHAI — 1033)
• Post offices
• Central government banks (SBI, etc.)
• Income Tax, GST
• Central schools (Kendriya Vidyalaya)
• BSNL/telecom spectrum

**For Central issues:** Use **CPGRAMS** (pgportal.gov.in) — 21-day response mandate

**For State issues:** Use Makkal Kural, CM Helpline 1100, or your local elected representative

**Quick test:** If the office has "Tamil Nadu" in its name → State. If it has "India" or "National" → Central.

➡️ **Next step:** Identify the right government and file through the correct channel`,

    ta: `🏛️ **மாநில அரசா? மத்திய அரசா? யாரை அணுகுவது?**

**மாநில அரசு (தமிழ்நாடு) கவனிக்கும் விஷயங்கள்:**
• சாலைகள் (தேசிய நெடுஞ்சாலை தவிர)
• பள்ளிகள், கல்லூரிகள் (மாநில பாடத்திட்டம்)
• குடிநீர், கழிவுநீர் (TWAD, CMWSSB)
• மின்சாரம் (TANGEDCO)
• காவல்துறை, மருத்துவமனைகள்
• விவசாயம், பாசனம்
• பஞ்சாயத்துகள், நகர்ப்பாலிகைகள்

**மத்திய அரசு கவனிக்கும் விஷயங்கள்:**
• ரயில்வே (139 அழைக்கவும்)
• தேசிய நெடுஞ்சாலை (NHAI — 1033)
• தபால் அலுவலகம், மத்திய வங்கிகள்
• வருமான வரி, GST

**மத்திய பிரச்சனைகளுக்கு:** CPGRAMS (pgportal.gov.in) — 21 நாட்கள் பதில் கட்டாயம்

**மாநில பிரச்சனைகளுக்கு:** மக்கள் குரல், CM Helpline 1100

**எளிய அடையாளம்:** "தமிழ்நாடு" என்று பெயரில் இருந்தால் → மாநில அரசு. "இந்தியா / National" என்றால் → மத்திய அரசு.`,
  },

  // ── Health ───────────────────────────────────────────────────────────────
  {
    keywords: ['hospital', 'மருத்துவமனை', 'doctor', 'மருத்துவர்', 'medicine', 'மருந்து', 'health', 'சுகாதாரம்', 'phc', 'ambulance', 'dialysis'],
    en: `🏥 **Health Service Issues — How to Get Help**

**For government hospital complaints:**
• Contact the Medical Superintendent of the hospital directly
• District Health Officer (DHO) for your district
• Tamil Nadu Health Helpline: **104**
• CM Helpline: **1100**

**Emergency ambulance:** Dial **108** (free, 24/7 across Tamil Nadu)

**Essential medicines not available at govt hospital:**
• This violates Tamil Nadu Essential Drugs Policy
• File complaint with DHO — medicines should be provided free
• File RTI asking about drug stock and procurement

**No doctors at PHC:**
• File complaint with District Collector
• Contact Tamil Nadu Health & Family Welfare Dept
• Raise on Makkal Kural under "Health Services" → "No Doctors"

**Dialysis patients:**
• Many districts have free government dialysis centers
• Contact District Collector if center is non-functional
• Chief Minister's Comprehensive Health Insurance Scheme covers dialysis

**Your rights:**
• Free treatment at all government hospitals
• Right to emergency treatment even without documents
• Right to get referral to higher hospital if local can't treat you

➡️ **Next step:** Call 104 health helpline or raise issue on Makkal Kural under "Health Services"`,

    ta: `🏥 **மருத்துவ சேவை பிரச்சனைகள்**

**அரசு மருத்துவமனை புகார்கள்:**
• மருத்துவமனை மருத்துவ கண்காணிப்பாளரை நேரில் சந்தியுங்கள்
• மாவட்ட சுகாதார அலுவலர் (DHO)
• TN Health Helpline: **104**
• CM Helpline: **1100**

**அவசர ஆம்புலன்ஸ்:** **108** — இலவசம், 24/7

**PHC-யில் மருத்துவர் இல்லை:**
• மாவட்ட ஆட்சியரிடம் புகார் செய்யுங்கள்
• மக்கள் குரலில் "சுகாதாரம் → மருத்துவர்கள் இல்லை" பதிவு செய்யுங்கள்

**டையாலிசிஸ்:**
• பல மாவட்டங்களில் இலவச அரசு டையாலிசிஸ் மையங்கள் உள்ளன
• CM's Comprehensive Health Insurance Scheme டையாலிசிஸ் செலவை ஏற்கும்

**உங்கள் உரிமைகள்:**
• அனைத்து அரசு மருத்துவமனைகளிலும் இலவச சிகிச்சை
• ஆவணங்கள் இல்லாவிட்டாலும் அவசர சிகிச்சை உரிமை

➡️ **அடுத்த படி:** 104 அழைக்கவும் அல்லது மக்கள் குரலில் "சுகாதாரம்" வகையில் பதிவு செய்யுங்கள்`,
  },

  // ── Electricity ──────────────────────────────────────────────────────────
  {
    keywords: ['electricity', 'மின்சாரம்', 'மின்வெட்டு', 'power cut', 'tangedco', 'transformer', 'மின்மாற்றி', 'current', 'bill', 'மின் கட்டணம்'],
    en: `⚡ **Electricity Issues in Tamil Nadu**

**Authority:** TANGEDCO (Tamil Nadu Generation and Distribution Corporation)

**Complaint channels:**
• **TANGEDCO Helpline: 1912** (24/7 fault reporting)
• Online: tnebnet.org → Consumer Complaints
• Walk into your nearest TANGEDCO section office

**Power cuts / outages:**
• Call 1912 to report and get estimated restoration time
• Scheduled cuts are published on TANGEDCO website 24 hrs in advance
• Extended unscheduled cuts → complain to your Divisional Engineer

**Transformer failure:**
• Report on 1912 — 24-hour restoration mandate for transformers
• If delayed, escalate to Assistant Engineer → Divisional Engineer → Superintendent Engineer

**High electricity bill dispute:**
• Submit written complaint to your section office
• Request meter inspection within 7 days
• If meter faulty, bill will be revised

**New connection / reconnection delays:**
• Should happen within 7 days for domestic connections
• File complaint with TANGEDCO Consumer Grievance Redressal Forum

➡️ **Next step:** Call 1912 for immediate faults, or raise on Makkal Kural for chronic issues`,

    ta: `⚡ **மின்சாரம் பிரச்சனை — TANGEDCO**

**புகார் வழிகள்:**
• **TANGEDCO Helpline: 1912** (24/7)
• Online: tnebnet.org → Consumer Complaints
• அருகில் உள்ள TANGEDCO பிரிவு அலுவலகம்

**மின்வெட்டு:**
• 1912 அழைத்து புகார் பதிவு செய்யுங்கள்
• திட்டமிட்ட வெட்டுகள் 24 மணி நேரம் முன்பே TANGEDCO இணையதளத்தில் வெளியிடப்படும்

**மின்மாற்றி பழுது:**
• 1912-ல் புகார் — 24 மணி நேரத்தில் சரிசெய்ய வேண்டும்
• தாமதமாகினால்: AE → DE → SE என்று மேல்முறையீடு செய்யுங்கள்

**மின் கட்டண சர்ச்சை:**
• பிரிவு அலுவலகத்தில் எழுத்துபூர்வ புகார்
• 7 நாட்களில் மீட்டர் பரிசோதனை கேளுங்கள்

➡️ **அடுத்த படி:** உடனடி பழுதுக்கு 1912 அழைக்கவும்`,
  },

  // ── Welfare schemes ──────────────────────────────────────────────────────
  {
    keywords: ['scheme', 'திட்டம்', 'benefit', 'pension', 'பென்ஷன்', 'ration', 'pds', 'subsidy', 'allowance', 'welfare', 'நலத்திட்டம்', 'உதவித்தொகை', 'கல்யாண உதவி'],
    en: `🎯 **Welfare Schemes — Getting Your Benefits**

**Major Tamil Nadu schemes:**
• **Kalaignar Magalir Urimai Thogai:** ₹1,000/month for eligible women — apply at amma.tn.gov.in
• **CM's Health Insurance:** Free treatment up to ₹5 lakh — tnhsp.tn.gov.in
• **Amma Unavagam:** Subsidised food
• **PDS (Ration):** Fair price shop, contact block office if card issues
• **Old Age Pension:** ₹1,000/month — apply at social welfare office

**If you're not getting benefits:**
1. Check eligibility at the scheme's official website
2. Get a printout of the eligibility rules
3. Visit the scheme office with your Aadhaar and all documents
4. File a written complaint if they refuse
5. File RTI asking why you were denied and what criteria was used

**Common rejection reasons you can challenge:**
• Wrong income certificate used
• Data mismatch in government systems
• Officer negligence

**Helplines:**
• Social Welfare: 044-28414808
• PDS: 1967 (ration card)
• CM Helpline: 1100

➡️ **Next step:** Visit your nearest Common Service Centre (CSC) with Aadhaar to check all schemes you qualify for`,

    ta: `🎯 **நலத்திட்டங்கள் — உங்களுக்கு உரிய பலன்களை பெறுவது எப்படி?**

**முக்கிய தமிழ்நாடு திட்டங்கள்:**
• **கலைஞர் மகளிர் உரிமத் தொகை:** தகுதியான பெண்களுக்கு மாதம் ₹1,000 — amma.tn.gov.in
• **CM's Health Insurance:** ₹5 லட்சம் வரை இலவச சிகிச்சை
• **அம்மா உணவகம்:** மானிய விலையில் உணவு
• **PDS:** உங்கள் ரேஷன் அட்டையில் பிரச்சனை — 1967
• **முதியோர் ஓய்வூதியம்:** மாதம் ₹1,000

**பலன் கிடைக்கவில்லை என்றால்:**
1. உத்தியோகபூர்வ இணையதளத்தில் தகுதி சரிபாருங்கள்
2. தகுதி விதிகள் அச்சிட்டு வாருங்கள்
3. Aadhaar மற்றும் ஆவணங்களுடன் அலுவலகம் செல்லுங்கள்
4. மறுத்தால் எழுத்துபூர்வ புகார் கொடுங்கள்
5. RTI மூலம் ஏன் மறுக்கப்பட்டீர்கள் என்று கேளுங்கள்

**உதவி எண்கள்:**
• சமூக நலன்: 044-28414808
• ரேஷன்: 1967
• CM Helpline: 1100`,
  },

  // ── How to raise issue / write complaint ──────────────────────────────────
  {
    keywords: ['raise', 'how to', 'எப்படி', 'புகார்', 'complaint', 'write', 'எழுதுவது', 'description', 'பிரச்சனை பதிவு', 'file complaint', 'register issue'],
    en: `✍️ **How to Write a Strong Complaint**

A well-written complaint gets resolved faster. Follow this structure:

**1. Location (be specific)**
❌ "My area has water problem"
✅ "Ward 174, Velachery, near Vijaya Hospital, Chennai"

**2. The problem (be factual)**
❌ "No water for long time"
✅ "No piped water supply since 15 June 2025 (45 days). 80+ families affected."

**3. Impact (what it's costing people)**
✅ "We're spending ₹1,500/week on water tankers. Two children fell ill with stomach infection."

**4. What you've tried**
✅ "Complained to ward office on 20 June — no action taken. Called 1916 on 5 July — promised 3 days but no response."

**5. Your ask (clear demand)**
✅ "Request restoration of water supply within 7 days and compensation for tanker expenses."

**On Makkal Kural:**
→ Choose the right category (Water/Roads/Health etc.)
→ Select your exact district and ward
→ Write in Tamil or English — both are accepted
→ Add photos if possible (shows proof)
→ Share with neighbours — more supporters = faster escalation

➡️ **Next step:** Tap "Raise Issue" in the top menu to file your complaint now`,

    ta: `✍️ **வலுவான புகாரை எப்படி எழுதுவது?**

நன்றாக எழுதப்பட்ட புகார் வேகமாக தீர்க்கப்படும். இந்த வடிவமைப்பை பின்பற்றுங்கள்:

**1. இடம் (குறிப்பிட்டு சொல்லுங்கள்)**
❌ "என் பகுதியில் தண்ணீர் பிரச்சனை"
✅ "Ward 174, வேளச்சேரி, விஜயா மருத்துவமனை அருகில், சென்னை"

**2. பிரச்சனை (உண்மையான தகவல்)**
❌ "நீண்ட நாளாக தண்ணீர் இல்லை"
✅ "15 ஜூன் 2025 முதல் குழாய் தண்ணீர் இல்லை (45 நாட்கள்). 80+ குடும்பங்கள் பாதிக்கப்பட்டுள்ளன."

**3. பாதிப்பு**
✅ "வாரம் ₹1,500 டேங்கர் செலவு. இரண்டு குழந்தைகளுக்கு வயிற்றுவலி."

**4. முயற்சித்தது**
✅ "20 ஜூன் வார்டு அலுவலகத்தில் புகார் — நடவடிக்கை இல்லை. 1916 அழைத்தேன் — 3 நாட்கள் என்றார்கள், வரவில்லை."

**5. கோரிக்கை**
✅ "7 நாட்களுக்குள் குழாய் தண்ணீர் வழங்கல் சரிசெய்யவும்."

**மக்கள் குரலில்:**
→ சரியான வகை (நீர்/சாலை/சுகாதாரம்) தேர்வு செய்யுங்கள்
→ உங்கள் மாவட்டம், வார்டு குறிப்பிடுங்கள்
→ புகைப்படம் சேர்த்தால் வலுவாக இருக்கும்
→ அண்டை வீட்டினரிடம் பகிருங்கள் — ஆதரவு கிடைத்தால் வேகமாக தீர்வு

➡️ **அடுத்த படி:** மேலே உள்ள "Raise Issue" பட்டனை கிளிக் செய்யுங்கள்`,
  },

  // ── Farming / Agriculture ─────────────────────────────────────────────────
  {
    keywords: ['farm', 'farmer', 'விவசாயி', 'விவசாயம்', 'crop', 'பயிர்', 'irrigation', 'பாசனம்', 'agriculture', 'canal', 'கால்வாய்', 'compensation', 'insurance'],
    en: `🌾 **Farmer Issues — Rights and Helplines**

**Crop damage compensation:**
• Natural disasters: Apply for SDRF/NDRF relief through your VAO
• Crop insurance: Under PM Fasal Bima Yojana — contact your nearest bank or agriculture office
• File within 72 hours of crop damage

**Water / irrigation problems:**
• Canal issue: Contact your district PWD (Irrigation) office
• Dam water release: Petition to District Collector or Cauvery Water Disputes Tribunal matters via state
• Borewell failure: Contact TWAD Board or Agriculture Engineering Dept

**Loan & debt:**
• Agricultural loan waiver: Check eligibility at tnagrisnet.tn.gov.in
• For harassment by moneylenders: Approach District Collector — usurious lending is illegal
• Kisan Credit Card issues: Contact your bank's agriculture desk

**Price issues:**
• Minimum Support Price (MSP): Contact district Agriculture Marketing office
• Report unfair price at regulated markets to TNAU or district officer

**Key helplines:**
• Agriculture Helpline: **1800-425-1551** (toll-free)
• PM Kisan: **155261**
• CM Helpline: **1100**

➡️ **Next step:** Call 1800-425-1551 for crop damage or contact your VAO within 72 hours of damage`,

    ta: `🌾 **விவசாயி பிரச்சனைகள் — உரிமைகளும் தொடர்பு எண்களும்**

**பயிர் சேதம் இழப்பீடு:**
• இயற்கை சேதம்: உங்கள் VAO மூலம் SDRF/NDRF நிவாரணம் கோருங்கள்
• பயிர் காப்பீடு: PM Fasal Bima Yojana — அருகில் உள்ள வங்கி அல்லது விவசாய அலுவலகம்
• சேதத்திற்கு 72 மணி நேரத்தில் தெரிவிக்கவும்

**பாசன பிரச்சனை:**
• கால்வாய்: மாவட்ட PWD (பாசன) அலுவலகம்
• அணை நீர்: மாவட்ட ஆட்சியரிடம் மனு

**கடன் பிரச்சனை:**
• வட்டிக்கடை கொடுமை: மாவட்ட ஆட்சியர் — சட்டவிரோதமான வட்டி பெறுவது குற்றம்
• கிசான் கிரெடிட் கார்டு: உங்கள் வங்கி விவசாய பிரிவு

**முக்கிய தொலைபேசி:**
• விவசாய Helpline: **1800-425-1551** (இலவசம்)
• PM Kisan: **155261**
• CM Helpline: **1100**`,
  },

  // ── Default / general ────────────────────────────────────────────────────
  {
    keywords: ['__DEFAULT__'],
    en: `👋 I'm here to help with Tamil Nadu civic issues. I can assist with:

• 📋 **RTI** — How to file for information from government
• 📢 **Escalation** — What to do when officials don't respond
• 💧 **Water** — Who handles supply, how to complain
• 🛣️ **Roads** — Which authority is responsible
• ⚡ **Electricity** — TANGEDCO complaints, power cuts
• 🏥 **Health** — Hospital complaints, 108 ambulance
• 🔒 **Corruption** — Anonymous reporting options
• 🏛️ **State vs Central** — Which government to approach
• 🌾 **Farmers** — Crop damage, irrigation rights
• 🎯 **Welfare Schemes** — Pension, ration, health insurance
• ✍️ **Writing complaints** — How to write an effective complaint

Type your question or tap one of the quick buttons below.`,

    ta: `👋 தமிழ்நாடு குடிமக்கள் பிரச்சனைகளுக்கு உதவ இங்கே இருக்கிறேன். இவற்றில் உதவ முடியும்:

• 📋 **RTI** — அரசிடம் தகவல் கேட்பது எப்படி
• 📢 **மேல்முறையீடு** — அலுவலர்கள் பதில் சொல்லாவிட்டால்
• 💧 **குடிநீர்** — யாரை அணுகுவது
• 🛣️ **சாலைகள்** — யார் பொறுப்பு
• ⚡ **மின்சாரம்** — TANGEDCO புகார்கள்
• 🏥 **சுகாதாரம்** — மருத்துவமனை புகார்கள்
• 🔒 **ஊழல்** — அனாமதேய புகார் வழிகள்
• 🏛️ **மாநில vs மத்திய** — எந்த அரசை அணுகுவது
• 🌾 **விவசாயிகள்** — பயிர் சேதம், பாசன உரிமைகள்
• 🎯 **நலத்திட்டங்கள்** — ஓய்வூதியம், ரேஷன், காப்பீடு
• ✍️ **புகார் எழுதுவது** — வலுவான புகாரை எழுதுவது எப்படி

உங்கள் கேள்வியை தட்டச்சு செய்யுங்கள் அல்லது கீழே உள்ள பட்டன்களை கிளிக் செய்யுங்கள்.`,
  },
];

function getReply(text, lang) {
  const lower = (text || '').toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords[0] === '__DEFAULT__') continue;
    if (rule.keywords.some(k => lower.includes(k.toLowerCase()))) {
      return lang === 'ta' ? rule.ta : rule.en;
    }
  }
  // default
  const def = RULES[RULES.length - 1];
  return lang === 'ta' ? def.ta : def.en;
}

// ─── Quick prompts ─────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: 'RTI தாக்கல்', labelEn: 'File RTI', prompt: 'How do I file an RTI?' },
  { label: 'பதில் இல்லை', labelEn: 'No response', prompt: 'VAO is not responding to my complaint' },
  { label: 'யாரை அணுகுவது?', labelEn: 'Who to contact?', prompt: 'Is my issue state or central government?' },
  { label: 'ஊழல் புகார்', labelEn: 'Report corruption', prompt: 'How to report corruption anonymously?' },
  { label: 'புகார் எழுதுவது', labelEn: 'Write complaint', prompt: 'How to write a good complaint?' },
  { label: 'நலத்திட்டம்', labelEn: 'Welfare scheme', prompt: 'I am not getting my welfare scheme benefits' },
];

// ─── Component ─────────────────────────────────────────────────────────────
const MakkalKuralAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('ta');
  const messagesEndRef = useRef(null);

  const getGreeting = (lang) => lang === 'ta'
    ? 'வணக்கம்! நான் மக்கள் குரல் AI. RTI தாக்கல், புகார் எழுதுவது, உரிமைகள் புரிந்துகொள்வது — எதுவும் கேளுங்கள் 👇'
    : 'Hello! I\'m Makkal Kural AI, your Tamil Nadu civic rights assistant. Ask me about RTI, escalation, water, roads, electricity, health, corruption, or welfare schemes 👇';

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: getGreeting(language), isGreeting: true }]);
    }
  }, [isOpen]);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].isGreeting) {
        return [{ role: 'assistant', content: getGreeting(language), isGreeting: true }];
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg) return;
    setInput('');

    const reply = getReply(userMsg, language);
    setMessages(prev => [
      ...prev,
      { role: 'user', content: userMsg },
      { role: 'assistant', content: reply },
    ]);
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: getGreeting(language), isGreeting: true }]);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: 80, right: 24,
          width: 60, height: 60, borderRadius: '50%',
          backgroundColor: '#B91C1C', color: '#fff',
          border: 'none', cursor: 'pointer', zIndex: 9999,
          boxShadow: '0 4px 20px rgba(185,28,28,0.5)',
          fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Makkal Kural AI Assistant"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {!isOpen && (
        <div style={{
          position: 'fixed', bottom: 148, right: 24,
          backgroundColor: '#FACC15', color: '#92400e',
          fontSize: 11, fontWeight: 700, padding: '3px 8px',
          borderRadius: 20, zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
        }}>
          AI உதவி கிடைக்கும்
        </div>
      )}

      {isOpen && (
        <div style={S.chatWindow}>
          {/* Header */}
          <div style={S.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={S.avatar}>🤖</div>
              <div>
                <div style={S.headerTitle}>மக்கள் குரல் AI</div>
                <div style={S.headerSub}>உங்கள் அரசு உரிமை வழிகாட்டி</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={S.langSwitch}>
                {[['ta', 'த'], ['en', 'EN']].map(([k, l]) => (
                  <button key={k} onClick={() => setLanguage(k)} style={{
                    ...S.langBtn,
                    backgroundColor: language === k ? '#fff' : 'transparent',
                    color: language === k ? '#B91C1C' : 'rgba(255,255,255,0.7)',
                  }}>{l}</button>
                ))}
              </div>
              <button onClick={clearChat} style={S.iconBtn} title="Clear">🗑️</button>
              <button onClick={() => setIsOpen(false)} style={{ ...S.iconBtn, fontSize: 16, fontWeight: 700, color: '#fff' }}>✕</button>
            </div>
          </div>

          {/* Messages */}
          <div style={S.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
                {msg.role === 'assistant' && <div style={S.botAvatar}>🤖</div>}
                <div style={{
                  ...S.bubble,
                  backgroundColor: msg.role === 'user' ? '#B91C1C' : '#f3f4f6',
                  color: msg.role === 'user' ? '#fff' : '#111827',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {messages.length <= 1 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>
                  {language === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்:' : 'Quick questions:'}
                </div>
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
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={language === 'ta' ? 'உங்கள் கேள்வியை கேளுங்கள்...' : 'Ask your question...'}
              style={S.input}
              rows={2}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              style={{ ...S.sendBtn, backgroundColor: input.trim() ? '#B91C1C' : '#e5e7eb', color: input.trim() ? '#fff' : '#9ca3af' }}
            >➤</button>
          </div>
          <div style={S.footer}>Makkal Kural Civic AI · உங்கள் உரையாடல் தனிப்பட்டது</div>
        </div>
      )}
    </>
  );
};

const S = {
  chatWindow: { position: 'fixed', bottom: 156, right: 24, width: 360, height: 560, backgroundColor: '#fff', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', zIndex: 9998, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e5e7eb' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#B91C1C', flexShrink: 0 },
  avatar: { width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  headerTitle: { fontSize: 14, fontWeight: 700, color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  langSwitch: { display: 'flex', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 2 },
  langBtn: { padding: '3px 8px', border: 'none', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' },
  iconBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 14 },
  messages: { flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  botAvatar: { width: 26, height: 26, backgroundColor: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 },
  bubble: { maxWidth: '82%', padding: '10px 14px', fontSize: 13, lineHeight: 1.65, wordBreak: 'break-word' },
  quickBtn: { fontSize: 11, fontWeight: 600, padding: '5px 10px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap' },
  inputArea: { display: 'flex', gap: 8, padding: '10px 12px', borderTop: '1px solid #f3f4f6', flexShrink: 0 },
  input: { flex: 1, padding: '8px 12px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 10, resize: 'none', fontFamily: 'inherit', lineHeight: 1.5, outline: 'none' },
  sendBtn: { width: 40, height: 40, borderRadius: '50%', border: 'none', fontSize: 16, cursor: 'pointer', flexShrink: 0, alignSelf: 'flex-end' },
  footer: { fontSize: 10, color: '#9ca3af', textAlign: 'center', padding: '6px', borderTop: '1px solid #f3f4f6', flexShrink: 0 },
};

export default MakkalKuralAI;
