import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Shield, CheckCircle2, UserCheck, AlertTriangle, LifeBuoy, 
  FileText, Briefcase, Mail, MapPin, Send, HelpCircle, Eye, Globe, ChevronRight, Phone
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import HelpCenter from './HelpCenter';

interface InfoPageProps {
  pageId: string;
  onBack: () => void;
  returnView?: string;
  onOpenReportModalFromInfo?: () => void;
}

export default function InfoPage({ pageId, onBack, returnView, onOpenReportModalFromInfo }: InfoPageProps) {
  const { currentLanguage, appFeatures, jobOpenings, systemSettings, properties, users, t } = useApp();
  const [activeTab, setActiveTab] = useState<string>(pageId);

  React.useEffect(() => {
    if (pageId) {
      setActiveTab(pageId);
    }
  }, [pageId]);

  // Real live metrics from database
  const verifiedListingsCount = (properties || []).filter(
    p => p.verificationStatus === 'verified' || p.isVerifiedListing === true || p.approvalStatus === 'approved'
  ).length;

  const activeProfilesCount = (users || []).filter(
    u => u.status === 'active' || !u.status
  ).length;

  const formatStatNumber = (count: number) => {
    if (!count || count <= 0) return '0+';
    if (count >= 1000000) {
      const val = count / 1000000;
      return `${val % 1 === 0 ? val : val.toFixed(1)}M+`;
    }
    if (count >= 1000) {
      const val = count / 1000;
      return `${val % 1 === 0 ? val : val.toFixed(1)}k+`;
    }
    return `${count}+`;
  };

  // Admin-controlled Contact Us data source:
  // ONLY use admin-configured settings. Do NOT invent placeholders if admin has not configured them.
  const adminContactSettings = systemSettings?.contactUsSettings !== undefined
    ? systemSettings.contactUsSettings
    : (() => {
        try {
          const saved = localStorage.getItem('sof_umer_contact_us_settings');
          return saved ? JSON.parse(saved) : null;
        } catch {
          return null;
        }
      })();

  const contactEmailVal = adminContactSettings?.email || systemSettings?.supportEmail || '';
  const contactPhoneVal = adminContactSettings?.phone || systemSettings?.supportPhone || '';
  const contactLocationVal = adminContactSettings?.location || '';
  const contactHqTitleVal = adminContactSettings?.hqTitle || '';
  const contactHqAddressVal = adminContactSettings?.hqAddress || '';

  const hasAnyContactMethod = Boolean(
    contactEmailVal ||
    contactPhoneVal ||
    contactLocationVal ||
    contactHqAddressVal ||
    contactHqTitleVal
  );

  const safetyIds = ['marketplace-rules', 'verify-ownership', 'safety-tips', 'report-listing', 'help-center', 'terms-of-service', 'privacy-policy'];
  const safetyFeatures = appFeatures.filter(f => safetyIds.includes(f.id));
  const aboutFeatures = appFeatures.filter(f => !safetyIds.includes(f.id));

  // Contact Us state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Careers state
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applyName, setApplyName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyResume, setApplyResume] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);
  const [applySubmitting, setApplySubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: contactEmail,
          subject: `Contact Form Message from ${contactName}`,
          message: contactMessage
        })
      });
      if (res.ok) {
        setContactSuccess(true);
        setContactName('');
        setContactEmail('');
        setContactMessage('');
        setTimeout(() => setContactSuccess(false), 5000);
      } else {
        alert('Failed to submit your message. Please try again.');
      }
    } catch (err) {
      console.error('Failed to submit support ticket:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplySubmitting(true);
    setTimeout(() => {
      setApplySubmitting(false);
      setApplySuccess(true);
      setApplyName('');
      setApplyEmail('');
      setApplyPhone('');
      setApplyResume('');
      setTimeout(() => {
        setApplySuccess(false);
        setSelectedJob(null);
      }, 5000);
    }, 1200);
  };

  // Translations for all 11 pages/topics
  const tInfo = {
    backToMarketplace: {
      en: "Back to Marketplace",
      om: "Gara Gabaatti Deebi'i",
      am: "ወደ ገበያ ቦታ ይመለሱ"
    },
    safetySupportHeader: {
      en: "Safety & Support",
      om: "Nageenya & Deggarsa",
      am: "ደህንነት እና ድጋፍ"
    },
    aboutHeader: {
      en: "About SOF-UMER",
      om: "Waa'ee SOF-UMER",
      am: "ስለ SOF-UMER"
    },
    tabs: {
      'marketplace-rules': {
        en: "Marketplace Rules",
        om: "Seera Gabaa",
        am: "የገበያ ቦታ ደንቦች"
      },
      'verify-ownership': {
        en: "Verify Ownership",
        om: "Mirkaneessa Abbummaa",
        am: "ባለቤትነትን ያረጋግጡ"
      },
      'safety-tips': {
        en: "Safety Tips",
        om: "Gorsa Nageenyaa",
        am: "የደህንነት ምክሮች"
      },
      'report-listing': {
        en: "Report a Listing",
        om: "Beeksisa Gabaasi",
        am: "ያልተገባ ንብረት ሪፖርት ያድርጉ"
      },
      'help-center': {
        en: "Frequently Asked Questions (FAQ)",
        om: "Gaaffilee Yeroo Baay’ee (FAQ)",
        am: "ተደጋጋሚ ጥያቄዎች (FAQ)"
      },
      'terms-of-service': {
        en: "Terms of Service",
        om: "Waliigaltee Tajaajilaa",
        am: "የአጠቃቀም ስምምነት"
      },
      'privacy-policy': {
        en: "Privacy Policy",
        om: "Ibsa Iccitii",
        am: "የግላዊነት ፖሊሲ"
      },
      'about-us': {
        en: "About SOF-UMER",
        om: "Waa'ee SOF-UMER",
        am: "ስለ SOF-UMER"
      },
      'how-it-works': {
        en: "How It Works",
        om: "Inni Akkamitti Hojjata",
        am: "እንዴት እንደሚሰራ"
      },
      'contact-us': {
        en: "Contact Us",
        om: "Nu Quunnamaa",
        am: "ያግኙን"
      },
      'careers': {
        en: "Careers",
        om: "Carraa Hojii",
        am: "ስራዎች"
      }
    }
  };

  const getTranslation = (obj: any) => {
    return obj[currentLanguage] || obj['en'] || '';
  };

  // Static content for the pages
  const renderContent = () => {
    switch (activeTab) {
      case 'marketplace-rules':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
              <Shield className="w-8 h-8 text-emerald-400" />
              <div>
                <h2 className="text-2xl font-serif text-white font-bold">
                  {currentLanguage === 'om' ? 'Seera & Qajeelfama Gabaa' : currentLanguage === 'am' ? 'የገበያ ቦታ ደንቦች እና መመሪያዎች' : 'Marketplace Rules & Guidelines'}
                </h2>
                <p className="text-xs text-white/40">
                  {currentLanguage === 'om' ? 'Hawaasa amansiisaa fi qulqulluu ijaaruuf seera hordofamuu qabu' : currentLanguage === 'am' ? 'ደህንነቱ የተጠበቀ እና እውነተኛ ማህበረሰብ ለመፍጠር ሁሉም ሰው መከተል ያለበት ህጎች' : 'Rules everyone must follow to keep our community safe, clean, and trusted.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0c0c10]/60 p-5 rounded-2xl border border-white/5 space-y-2.5">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Rule #1</span>
                <h3 className="font-serif text-base text-white">
                  {currentLanguage === 'om' ? 'Dhugummaa Beeksisaa' : currentLanguage === 'am' ? 'እውነተኛ እና ትክክለኛ መረጃ' : 'Authentic & Accurate Listings'}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {currentLanguage === 'om' 
                    ? 'Soba dhiyeessuu, gatii dogoggoraa barreessuu ykn suuraa nama biraa fayyadamanii beeksisa baasuun dhowwadha. Qabeenyi hundi haaluma qabatamaa naannoo jiruun ibsamuu qaba.' 
                    : currentLanguage === 'am' 
                      ? 'የሐሰት መግለጫዎችን ማቅረብ፣ የተሳሳቱ ዋጋዎችን መለጠፍ ወይም ያልሆኑ ምስሎችን መጠቀም በጥብቅ የተከለከለ ነው። ሁሉም ዝርዝሮች ትክክለኛውን ሁኔታ ማንጸባረቅ አለባቸው።' 
                      : 'Providing false specs, misrepresenting prices, or using misleading stock/copied photos is strictly prohibited. Every listing must accurately reflect the real-world condition.'}
                </p>
              </div>

              <div className="bg-[#0c0c10]/60 p-5 rounded-2xl border border-white/5 space-y-2.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Rule #2</span>
                <h3 className="font-serif text-base text-white">
                  {currentLanguage === 'om' ? 'Mirga Abbummaa Mirkaneessuu' : currentLanguage === 'am' ? 'የባለቤትነት ማረጋገጫ' : 'Property Ownership Verification'}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {currentLanguage === 'om' 
                    ? 'Abbummaan qabeenyaa ykn hayyamni gurgurtaa / kireessuu jiraachuu qaba. Barbaachisummaa irratti hundaa\'uun waraqaan abbummaa bulchiinsa irraa kenname dhiyaachuu danda\'a.' 
                    : currentLanguage === 'am' 
                      ? 'ንብረቱን ለመሸጥ ወይም ለማከራየት ህጋዊ ስልጣን ሊኖርዎት ይገባል። አስፈላጊ ሲሆን የባለቤትነት ማረጋገጫ ሰነዶችን ለአስተዳዳሪው ማቅረብ ግዴታ ነው።' 
                      : 'You must have the legal authority to sell or lease the listed item. Providing ownership deeds or valid agency representation contracts when requested by admins is mandatory.'}
                </p>
              </div>

              <div className="bg-[#0c0c10]/60 p-5 rounded-2xl border border-white/5 space-y-2.5">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Rule #3</span>
                <h3 className="font-serif text-base text-white">
                  {currentLanguage === 'om' ? 'Qunnamtii Kabaja Qabu' : currentLanguage === 'am' ? 'መልካም ስነ-ምግባር እና ክብር' : 'Respectful Communication'}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {currentLanguage === 'om' 
                    ? 'Ergawwan sobaafi arrabsoo kamiyyuu hawaasa gidduutti dhowwadha. Qunnamtiwwan hundi haala kabajaafi amanamummaarratti hundaa\'een adeemsifamuu qabu.' 
                    : currentLanguage === 'am' 
                      ? 'ማንኛውም ዓይነት ስድብ፣ የሐሰት መልእክቶች ወይም ማስፈራሪያዎች በፍጹም አይፈቀዱም። ሁሉም ግንኙነቶች በክብር እና በታማኝነት ላይ የተመሰረቱ መሆን አለባቸው።' 
                      : 'Harassment, hate speech, or spamming inside the chat channel is strictly banned. Be respectful and professional during inquiries, negotiations, and messaging.'}
                </p>
              </div>

              <div className="bg-[#0c0c10]/60 p-5 rounded-2xl border border-white/5 space-y-2.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Rule #4</span>
                <h3 className="font-serif text-base text-white">
                  {currentLanguage === 'om' ? 'Adabbii Hordofamu' : currentLanguage === 'am' ? 'የጥሰት እርምጃዎች' : 'Enforcement & Penalties'}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {currentLanguage === 'om' 
                    ? 'Cabsi seeraa kamiyyuu beeksisa keessan haquu ykn herrega keessan yeroof ykn guutummaatti ittisuu hordofsiisa. Akkasumas maallaqni kaffaltii beeksisa addaa hin deebi\'u.' 
                    : currentLanguage === 'am' 
                      ? 'ህጎችን መጣስ ማስታወቂያዎን ወዲያውኑ ማገድን፣ መለያዎን መዝጋትን ወይም ሙሉ በሙሉ መታገድን ያስከትላል። ለተጨማሪ ማስታወቂያዎች የተከፈሉ ክፍያዎች አይመለሱም።' 
                      : 'Violating any rules will lead to immediate listing suspension, permanent account deactivation, or temporary access blocks. Any premium visibility subscription fees paid will be forfeited.'}
                </p>
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between mt-6">
              <div className="text-center sm:text-left">
                <h4 className="font-serif text-base text-emerald-400 font-bold">
                  {currentLanguage === 'om' ? 'Dogoggora ykn Cabsa Seeraa Argitee?' : currentLanguage === 'am' ? 'ህገ-ወጥ ድርጊት አግኝተዋል?' : 'Encountered a Violation?'}
                </h4>
                <p className="text-xs text-white/60 mt-1 max-w-lg">
                  {currentLanguage === 'om' ? 'Yoo beeksisa sobaa ykn amala amanamummaa hin qabne argite battalumatti gabaasi.' : currentLanguage === 'am' ? 'እባክዎን ማንኛውንም ተጠራጣሪ ወይም አሳሳች ማስታወቂያ ወዲያውኑ ለደህንነት ሰሌዳችን ሪፖርት ያድርጉ።' : 'Help us maintain safety. Please report any fraudulent behavior, wrong parameters, or spam directly to our safety board.'}
                </p>
              </div>
              <button 
                onClick={onOpenReportModalFromInfo} 
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold uppercase rounded-xl transition cursor-pointer shrink-0"
              >
                {currentLanguage === 'om' ? 'Amma Gabaasi' : currentLanguage === 'am' ? 'አሁን ሪፖርት ያድርጉ' : 'Report Now'}
              </button>
            </div>
          </div>
        );

      case 'verify-ownership':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
              <UserCheck className="w-8 h-8 text-emerald-400" />
              <div>
                <h2 className="text-2xl font-serif text-white font-bold">
                  {currentLanguage === 'om' ? 'Mirkaneessa Abbummaa Beeksisaa' : currentLanguage === 'am' ? 'የንብረት ባለቤትነት ማረጋገጫ' : 'Verify Listing Ownership'}
                </h2>
                <p className="text-xs text-white/40">
                  {currentLanguage === 'om' ? 'Mallattoo amanamummaa "Verified Badge" argachuuf odeeffannoo dhiyeeffachuu' : currentLanguage === 'am' ? 'የእምነት ምልክት "የተረጋገጠ ባጅ" ለማግኘት የባለቤትነት ሰነድ ማረጋገጫ' : 'Get the trusted green check badge on your listings by verifying your property ownership.'}
                </p>
              </div>
            </div>

            <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-serif text-lg text-amber-500">
                {currentLanguage === 'om' ? 'Maaliif Mirkaneessuun Barbaachise?' : currentLanguage === 'am' ? 'ማረጋገጥ ለምን ያስፈልጋል?' : 'Why Verify Your Ownership?'}
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                {currentLanguage === 'om' 
                  ? 'Beeksisonni mirkanaa\'an gabaa keessatti amanamummaa olaanaa argatu. Bitattoonni fi kireeffattoonni battalumatti beeksisa keessan filatu, kunis gurgurtaa fi kiraayii keessan harka sadiin (3x) saffisiisa.' 
                  : currentLanguage === 'am' 
                    ? 'የተረጋገጡ ማስታወቂያዎች በገበያው ውስጥ ከፍተኛ እምነት ያገኛሉ። ገዢዎች እና ተከራዮች የተረጋገጡ ዝርዝሮችን ይመርጣሉ፣ ይህም የሽያጭ ወይም የኪራይ ፍጥነትን በ 3 እጥፍ ይጨምራል።' 
                    : 'Verified listings display a distinct green verification check. Verified assets receive high search ranks and attract up to 3x more genuine user inquiries, speeding up sales and rentals significantly.'}
              </p>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {currentLanguage === 'om' ? 'Adeemsa Mirkaneessaa (Koreen Mirkaneessu):' : currentLanguage === 'am' ? 'የማረጋገጫ ሂደቶች (ደረጃ በደረጃ)፦' : 'The Verification Process:'}
                </h4>
                <ul className="text-xs text-white/60 space-y-2 list-disc list-inside">
                  <li>
                    {currentLanguage === 'om' ? 'Abbummaa kee kan mirkaneessu waraqaan ragaa qabeenyaa, kaartaa, ykn walii-galtee seeraa dhiyyeessi.' : currentLanguage === 'am' ? 'የባለቤትነት ማረጋገጫ ካርታ፣ የሊዝ ሰነድ፣ ወይም ህጋዊ የውክልና ሰነድ ለአስተዳዳሪው ያጋሩ።' : 'Submit your property deed, title map, lease certificate, or authorized power of attorney documents through the listing editor.'}
                  </li>
                  <li>
                    {currentLanguage === 'om' ? 'Teessoo kessan ragaa dhuunfaa (Waraqaa Eenyummaa / Paaspoortii) waliin wal-qunnamsiisi.' : currentLanguage === 'am' ? 'ህጋዊ የብሔራዊ መታወቂያ ካርድ ወይም ፓስፖርት ቅጂ ከተስማሚ ሰነዶች ጋር ያያይዙ።' : 'Upload a clear photocopy of your government-issued National ID or Passport to verify your identity.'}
                  </li>
                  <li>
                    {currentLanguage === 'om' ? 'Koreen abbootii taayitaa keenya guyyoota hojii 2 keessatti ragaa dhiyaate qoratee beeksisa keessan mirkaneessa.' : currentLanguage === 'am' ? 'የባለሙያ ቡድናችን ሰነዶቹን በ 2 የስራ ቀናት ውስጥ በመመርመር የተረጋገጠ ባጅ ያነቃል።' : 'Our review team will inspect and validate the documents within 2 business days and grant the verification badge.'}
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-3">
              <h3 className="font-serif text-base text-white">
                {currentLanguage === 'om' ? 'Mirkaneessa Gabaasa herrega dhuunfaa' : currentLanguage === 'am' ? 'የመለያ መገለጫ ማረጋገጫ' : 'Profile Identity Verification'}
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                {currentLanguage === 'om' 
                  ? 'Qabeenya dabalatarratti herrega dhuunfaa keessanis "User Profile Verification" gochuun gabaa keessatti daldala amansiisaa gochuu dandeessu. Gara herrega dhuunfaa keessanii deemuun "Verification" cuqaasanii ragaa fidaa.' 
                  : currentLanguage === 'am' 
                    ? 'ከግል ንብረት በተጨማሪ መገለጫዎን "User Profile Verification" በማድረግ ሙሉ በሙሉ እምነት ማግኘት ይችላሉ። ወደ የግል መገለጫ ዳሽቦርድዎ በመሄድ የማረጋገጫ ትርን ይጎብኙ።' 
                    : 'Beyond individual properties, you can also verify your agent/owner profile. Go to your personal Account Settings inside the User Dashboard and submit your agency or personal documents under the Identity verification tab.'}
              </p>
            </div>
          </div>
        );

      case 'safety-tips':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500 animate-pulse" />
              <div>
                <h2 className="text-2xl font-serif text-white font-bold">
                  {currentLanguage === 'om' ? 'Gorsa Nageenya Hawaasaa' : currentLanguage === 'am' ? 'የደህንነት ምክሮች ለመላው ማህበረሰብ' : 'Safety Tips & Safe Trading'}
                </h2>
                <p className="text-xs text-white/40">
                  {currentLanguage === 'om' ? 'Sof Umer fayyadamanii yeroo bittan ykn gurgurtan nageenya keessan eeggachuuf' : currentLanguage === 'am' ? 'በሶፍ ኡመር ሲገበያዩ ደህንነትዎን ለመጠበቅ መከተል ያለባቸው ቁልፍ ነጥቦች' : 'Best practices to shield yourself from fraud and ensure secure transactions.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0c0c10]/60 p-5 rounded-2xl border border-white/5 space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">1</div>
                <h4 className="font-serif text-sm text-white">
                  {currentLanguage === 'om' ? 'Fuula dura ijaan argi' : currentLanguage === 'am' ? 'በአካል ተገናኝተው ይመልከቱ' : 'Inspect In Person'}
                </h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  {currentLanguage === 'om' 
                    ? 'Yeroo kamiyyuu maallaqa kaffaluun dura qabeenyicha, konkolaataa ykn meeshaa fuulleetti argamanii arguufi sakatta\'uun dirqama.' 
                    : currentLanguage === 'am' 
                      ? 'የቅድሚያ ክፍያ ከመፈጸምዎ በፊት ሁል ጊዜ ንብረቱን፣ መኪናውን ወይም እቃውን በአካል ተገኝተው ማረጋገጥ እና መመርመር አለብዎት።' 
                      : 'Always inspect the property, vehicle, or item in person before making any advance payments or signing binding agreements.'}
                </p>
              </div>

              <div className="bg-[#0c0c10]/60 p-5 rounded-2xl border border-white/5 space-y-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs mb-2">2</div>
                <h4 className="font-serif text-sm text-white">
                  {currentLanguage === 'om' ? 'Iddoo Ummataa Waliitti Qubadhaa' : currentLanguage === 'am' ? 'በሕዝብ ቦታዎች ይገናኙ' : 'Meet in Public Places'}
                </h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  {currentLanguage === 'om' 
                    ? 'Bittoota ykn daldaltoota waliin yeroo wal-argitan iddoowwan ummataa kanneen akka baankotaa ykn kaafeewwan ifa ta\'an filadhaa.' 
                    : currentLanguage === 'am' 
                      ? 'ከሻጮች ወይም ከደንበኞች ጋር ለመጀመሪያ ጊዜ ሲገናኙ እንደ ባንክ፣ ካፌዎች ወይም የገበያ ማዕከላት ያሉ ደህንነታቸው የተጠበቀ የሕዝብ ቦታዎችን ይምረጡ።' 
                      : 'When meeting sellers or clients for transactions, prefer secure, busy, and well-lit public spots like banks, malls, or cafes.'}
                </p>
              </div>

              <div className="bg-[#0c0c10]/60 p-5 rounded-2xl border border-white/5 space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">3</div>
                <h4 className="font-serif text-sm text-white">
                  {currentLanguage === 'om' ? 'Kaffaltii dursaa eeggadhaa' : currentLanguage === 'am' ? 'ከቅድሚያ ክፍያ ይጠንቀቁ' : 'Beware of Upfront Money'}
                </h4>
                <p className="text-xs text-white/50 leading-relaxed">
                  {currentLanguage === 'om' 
                    ? 'Waliigaltee seeraa malee herrega baankii dhuunfaatti maallaqa dursaa (advance) hin ergininaa. Bittoota sobaa eeggadhaa.' 
                    : currentLanguage === 'am' 
                      ? 'ህጋዊ ሰነዶች ሳይኖሩ ለግል የባንክ ሂሳቦች የቅድሚያ ክፍያዎችን ወይም ተቀማጭ ሂሳቦችን በጭራሽ አይላኩ። ከማጭበርበሮች ይጠንቀቁ።' 
                      : 'Never wire upfront deposits or booking fees to personal bank accounts before validating state ownership papers and signing contracts.'}
                </p>
              </div>
            </div>

            <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-3">
              <h3 className="font-serif text-base text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                {currentLanguage === 'om' ? 'Waliigaltee seeraa qofaan fayyadamaa' : currentLanguage === 'am' ? 'ህጋዊ ውል እና ሰነድ ይጠቀሙ' : 'Always Use Legal Contracts'}
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                {currentLanguage === 'om' 
                  ? 'Gurgurtaa fi kiraayii manneenii hundaaf ragaawwan seeraa fi walii-galteewwan gabaa eeggateen bulchiinsa mootummaa biratti beekamtii qabuu fayyadamaa. Sof Umer gorsa seeraa ykn jidduu-galtummaa hin kennu.' 
                  : currentLanguage === 'am' 
                    ? 'ለትላልቅ ግብይቶች ወይም የቤት ኪራይ ሁል ጊዜ በህግ የተረጋገጡ ውሎችን እና ሰነዶችን ይጠቀሙ። ሶፍ ኡመር ህጋዊ ሽምግልና ወይም የውል አገልግሎት አይሰጥም።' 
                    : 'For high-value assets like land, houses, or vehicles, execute standard escrow contracts with registered notary agents. Sof Umer is a connector platform and does not provide legal arbitration services.'}
              </p>
            </div>
          </div>
        );

      case 'report-listing':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
              <AlertTriangle className="w-8 h-8 text-rose-500 animate-pulse" />
              <div>
                <h2 className="text-2xl font-serif text-white font-bold">
                  {currentLanguage === 'om' ? 'Beeksisa ykn Fayyadamaa Soba Gabaasi' : currentLanguage === 'am' ? 'ያልተገባ ንብረት ወይም ተጠቃሚ ሪፖርት ያድርጉ' : 'Report a Listing / Suspicious Profile'}
                </h2>
                <p className="text-xs text-white/40">
                  {currentLanguage === 'om' ? 'Hawaasa keenya qulqulluu gochuuf odeeffannoo sobaa nuuf ergi' : currentLanguage === 'am' ? 'አሳሳች ማስታወቂያዎችን ወይም አጭበርባሪዎችን ሪፖርት በማድረግ ማህበረሰባችንን ደህንነቱን ይጠብቁ' : 'Help us keep our community clean. Lodge an administrative complaint against scams.'}
                </p>
              </div>
            </div>

            <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-serif text-base text-white">
                {currentLanguage === 'om' ? 'Beeksisa Akkamitti Gabaasna?' : currentLanguage === 'am' ? 'ማስታወቂያዎችን እንዴት ሪፖርት ማድረግ እንችላለን?' : 'How to File a Complaint?'}
              </h3>
              <p className="text-xs text-white/70 leading-relaxed">
                {currentLanguage === 'om' 
                  ? 'Sof Umer keessatti beeksisa kamiyyuu yeroo dhimma baatan, fuula qabeenya sunii jalatti mallattoo "Shield Alert" ykn "Gabaasi / Report" cuqaasanii haala violation dhiyeessuu dandeessu. Koreen keenya daqiiqaa 30 keessatti herregicha ni qorata.' 
                  : currentLanguage === 'am' 
                    ? 'በሶፍ ኡመር ውስጥ ማንኛውንም ማስታወቂያ በሚጎበኙበት ጊዜ፣ በንብረት ዝርዝር ገጽ ላይ የደህንነት ምልክቱን "ሪፖርት / Report" በመጫን ጥሰቱን ማቅረብ ይችላሉ። የእኛ አወያይ ቦርድ በ 30 ደቂቃዎች ውስጥ እርምጃ ይወስዳል።' 
                    : 'To report any active listing, simply navigate to that property/item details screen, click the "Report Listing" safety shield button on the top right, choose your reason (Fraud, Incorrect Price, Spam), and hit submit. Our review panel evaluates reports within 30 minutes.'}
              </p>

              <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">
                    {currentLanguage === 'om' ? 'Gabaasa Battalaa Dhiyeessi' : currentLanguage === 'am' ? 'ፈጣን የአቤቱታ ማስገቢያ፦' : 'Direct Quick Complaint Panel:'}
                  </h4>
                  <p className="text-[11px] text-white/50 mt-1">
                    {currentLanguage === 'om' ? 'Beeksisa sobaa beektan irratti amma xalayaa dhiyeessuuf' : currentLanguage === 'am' ? 'ለደህንነት ቦርዳችን አቤቱታ ለማስገባት ከዚህ በታች ያለውን ቁልፍ ይጠቀሙ።' : 'To initiate an interactive safety report right now, use the administrative report wizard:'}
                  </p>
                </div>
                <button 
                  onClick={onOpenReportModalFromInfo} 
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase rounded-xl transition cursor-pointer shrink-0"
                >
                  {currentLanguage === 'om' ? 'Amma Gabaasi' : currentLanguage === 'am' ? 'አሁኑኑ ሪፖርት ያድርጉ' : 'Open Report Wizard'}
                </button>
              </div>
            </div>

            <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-3">
              <h3 className="font-serif text-sm text-amber-500">
                {currentLanguage === 'om' ? 'Adabbii fi qorannoo dabalataa' : currentLanguage === 'am' ? 'የክትትል እርምጃዎች' : 'Investigation & Escalations'}
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                {currentLanguage === 'om' 
                  ? 'Yoo violation mirkanaa\'e herregni beeksisa baase battalumatti ni suspended ta\'a, herrega baankii fi bilbilli isaanii blacklist herrega gabaa irratti ni galmaa\'a.' 
                  : currentLanguage === 'am' 
                    ? 'አንዴ ጥሰቱ ከተረጋገጠ፣ የአስተዋዋቂው መለያ ወዲያውኑ ይታገዳል፣ ስልካቸው እና የባንክ መረጃቸው በማጭበርበር መዝገብ ውስጥ እንዲካተት ይደረጋል።' 
                    : 'Verified frauds result in instant permanent IP bans, blacklisting of phone numbers/bank accounts, and sharing of offender metadata with official local cybercrime police in Ethiopia.'}
              </p>
            </div>
          </div>
        );

      case 'help-center':
      case 'faq':
        return <HelpCenter />;

      case 'terms-of-service':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
              <FileText className="w-8 h-8 text-emerald-400" />
              <div>
                <h2 className="text-2xl font-serif text-white font-bold">
                  {currentLanguage === 'om' ? 'Waliigaltee Tajaajilaa (Terms of Service)' : currentLanguage === 'am' ? 'የአጠቃቀም ስምምነት እና ውሎች' : 'Terms of Service'}
                </h2>
                <p className="text-xs text-white/40">
                  {currentLanguage === 'om' ? 'Seerota qunnamtii fi daldalaa Sof Umer' : currentLanguage === 'am' ? 'በሶፍ ኡመር ፕላትፎርም ሲጠቀሙ የሚስማሙባቸው ህጋዊ ውሎች' : 'Legal terms governing your use of the Sof Umer marketplace platform.'}
                </p>
              </div>
            </div>

            {systemSettings?.termsAndPrivacy && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-amber-200 leading-relaxed font-medium">
                <span className="font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  {currentLanguage === 'om' ? 'Seera Sagantaa & Hubachiisa Seeraa:' : currentLanguage === 'am' ? 'የመድረክ ፖሊሲ እና ህጋዊ ማስታወቂያ፡' : 'Platform Policy & Legal Notice:'}
                </span>
                {systemSettings.termsAndPrivacy}
              </div>
            )}

            <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 text-xs text-white/70 space-y-4 max-h-[400px] overflow-y-auto leading-relaxed scrollbar-thin">
              <h3 className="font-serif text-sm text-white font-bold">
                {currentLanguage === 'om' ? '1. Waliigaltee Ulaagaalee' : currentLanguage === 'am' ? '1. የውሎች ስምምነት' : '1. Agreement to Terms'}
              </h3>
              <p>
                {currentLanguage === 'om'
                  ? "Herrega Sof Umer irratti banachuun, oomisha, lafa, konkolaataa ykn tajaajila kamuu beeksisuun, ykn beeksisoota wajjin walqunnamuun, Waliigaltee Tajaajilaa kanaafi seerota mootummaa Itoophiyaa kabajuuf haalduree tokko malee walii galtu."
                  : currentLanguage === 'am'
                  ? "በሶፍ ኡመር ላይ አካውንት በመክፈት፣ ማንኛውንም ምርት፣ ንብረት፣ ተሽከርካሪ ወይም አገልግሎት በማስታወቅ፣ ወይም ከሻጮች ጋር በመገናኘት፣ እነዚህን የአጠቃቀም ደንቦች እና የኢትዮጵያን ህጎች ለማክበር ያለምንም ቅድመ ሁኔታ ተስማምተዋል።"
                  : "By creating an account on Sof Umer, listing any products, real estate, vehicles, or services, or interacting with any advertisers, you unconditionally agree to be bound by these legal Terms of Service and all regional laws of the Federal Democratic Republic of Ethiopia."}
              </p>
              <h3 className="font-serif text-sm text-white font-bold">
                {currentLanguage === 'om' ? '2. Nageenya Herrega Fayyadamaa' : currentLanguage === 'am' ? '2. የተጠቃሚ መለያ ደህንነት' : '2. User Account Security'}
              </h3>
              <p>
                {currentLanguage === 'om'
                  ? "Jecha icciitii fi odeeffannoo eenyummaa herrega keessanii eeguuf itti gaafatamummaa guutuu qabdu. Sochii herrega keessaniin raawwatamu hundaaf isintu itti gaafatama."
                  : currentLanguage === 'am'
                  ? "የመለያዎን የይለፍ ቃል እና መረጃ ደህንነት የመጠበቅ ሙሉ ኃላፊነት አለብዎት። በመለያዎ በኩል ለሚከናወኑ ማናቸውም እንቅስቃሴዎች እርስዎ ተጠያቂ ይሆናሉ።"
                  : "You are solely responsible for maintaining the password and credentials of your account. Any activities performed through your account will be attributed to you. If you suspect any breach of security, you must notify our help desk immediately."}
              </p>
              <h3 className="font-serif text-sm text-white font-bold">
                {currentLanguage === 'om' ? '3. Abbummaa Beeksisaafi Hayyama' : currentLanguage === 'am' ? '3. የማስታወቂያ ባለቤትነት እና ፈቃድ' : '3. Listing Ownership and Licensing'}
              </h3>
              <p>
                {currentLanguage === 'om'
                  ? "Beeksisa yeroo maxxansitan, mirga qabeenyichaa kan qabdan ta'uu ykn beeksisuuf bakka-bu'ummaa seeraa qabaachuu keessan mirkaneessitu."
                  : currentLanguage === 'am'
                  ? "ማስታወቂያ በሚለጥፉበት ጊዜ፣ የንብረቱ ህጋዊ ባለቤት መሆንዎን ወይም የማስተዋወቅ ህጋዊ ውክልና እንዳለዎት ያረጋግጣሉ።"
                  : "When you publish a listing, you guarantee that you own the intellectual and material property rights of that asset or possess legal power of attorney to advertise it. Sof Umer reserves the right to strip badges or delete listings that are contested by third-party owners."}
              </p>
              <h3 className="font-serif text-sm text-white font-bold">
                {currentLanguage === 'om' ? '4. Daangaa Itti-gaafatamummaa' : currentLanguage === 'am' ? '4. የተጠያቂነት ገደብ' : '4. Limitation of Liability'}
              </h3>
              <p>
                {currentLanguage === 'om'
                  ? "Sof Umer walqunnamsiisaa gabaa bilisaati. Qabeenya, oomisha ykn konkolaattota beeksisaman abbummaadhaan hin to'atu. Daldalli kallattiin bittaafi gurgurtaa gidduutti xumurama."
                  : currentLanguage === 'am'
                  ? "ሶፍ ኡመር ገዢዎችን እና ሻጮችን የሚያገናኝ ክፍት የገበያ መድረክ ነው። በተጠቃሚዎች የተዘረዘሩትን ንብረቶች፣ ምርቶች ወይም ተሽከርካሪዎች ባለቤት አይደለም። ግብይቶች በቀጥታ በተዋዋይ ወገኖች መካከል ይከናወናሉ።"
                  : "Sof Umer is an open-market peer-to-peer advertising utility. We do not own, inspect, guarantee, or manage the real properties, products, or vehicles listed by users. Transactions are finalized directly between the transacting parties, and Sof Umer shall not be liable for any losses, fraudulent deals, or damages arising from physical meets or legal disputes."}
              </p>
            </div>
          </div>
        );

      case 'privacy-policy':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
              <Eye className="w-8 h-8 text-emerald-400" />
              <div>
                <h2 className="text-2xl font-serif text-white font-bold">
                  {currentLanguage === 'om' ? 'Ibsa Iccitii Dhuunfaa (Privacy Policy)' : currentLanguage === 'am' ? 'የግላዊነት ፖሊሲ እና ደህንነት' : 'Privacy Policy'}
                </h2>
                <p className="text-xs text-white/40">
                  {currentLanguage === 'om' ? 'Odeeffannoo keessan akkamitti akka eegnu ibsa gabaabaa' : currentLanguage === 'am' ? 'የግል መረጃዎችን እንዴት እንደምንሰበስብ እና እንደምንጠብቅ የሚገልጽ ፖሊሲ' : 'How we safeguard and manage your personal data and listing specifications.'}
                </p>
              </div>
            </div>

            <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 text-xs text-white/70 space-y-4 max-h-[400px] overflow-y-auto leading-relaxed scrollbar-thin">
              <h3 className="font-serif text-sm text-white font-bold">
                {currentLanguage === 'om' ? '1. Odeeffannoo Nuti Walitti Qabnu' : currentLanguage === 'am' ? '1. የምንሰበስበው መረጃ' : '1. Information We Collect'}
              </h3>
              <p>
                {currentLanguage === 'om'
                  ? "Tajaajila gabaa kennuuf maqaa guutuu, teessoo imeelii, lakkoofsa bilbilaa, bakka jireenyaa fi qabiyyee beeksisa keessanii walitti qabna."
                  : currentLanguage === 'am'
                  ? "የገበያ ቦታ አገልግሎቶችን ለመስጠት ሙሉ ስምዎን፣ የኢሜል አድራሻዎን፣ የስልክ ቁጥርዎን፣ አካባቢዎን እና የማስታወቂያ ይዘትን እንሰበስባለን።"
                  : "We collect your full name, email address, phone number, location, profile credentials, and listing content (images, title, description, pricing) during account registration and listing creation to provide the marketplace services."}
              </p>
              <h3 className="font-serif text-sm text-white font-bold">
                {currentLanguage === 'om' ? '2. Odeeffannoo Qunnamtii Qooduu' : currentLanguage === 'am' ? '2. የእውቂያ መረጃን ማጋራት' : '2. Sharing of Contact Information'}
              </h3>
              <p>
                {currentLanguage === 'om'
                  ? "Bittaa fi gurgurtaa mijeessuuf lakkoofsi bilbilaa fi teessoon imeelii keessan fuula bal'ina beeksisaa irratti fayyadamtootaaf ni mul'ata."
                  : currentLanguage === 'am'
                  ? "የሽያጭ ጥያቄዎችን እና ድርድሮችን ለማመቻቸት የስልክ ቁጥርዎ እና የኢሜይል አድራሻዎ በማስታወቂያ ዝርዝር ገጾች ላይ ለተመዘገቡ ተጠቃሚዎች ይታያሉ።"
                  : "Your phone number and email address are explicitly shared with other registered users on listing details pages to facilitate sales inquiries, bookings, and negotiations. If you do not wish to share your phone, you may toggle off listings or use our internal inquiry chat system."}
              </p>
              <h3 className="font-serif text-sm text-white font-bold">
                {currentLanguage === 'om' ? '3. Kuusaa fi Kuukiiwwan' : currentLanguage === 'am' ? '3. ኩኪዎች እና ማከማቻ' : '3. Cookies and Storage'}
              </h3>
              <p>
                {currentLanguage === 'om'
                  ? "Seensa keessan, afaan filatameefi beeksisa jaallataman tursiisuuf kuusaa naannoo (localStorage) fayyadamna."
                  : currentLanguage === 'am'
                  ? "የተጠቃሚ ክፍለ ጊዜዎን፣ የተመረጠውን የቋንቋ ምርጫ እና ተወዳጅ ምልክቶችን ለማስቀመጥ የአካባቢ ማከማቻ (localStorage) እንጠቀማለን።"
                  : "We use local storage (localStorage) to persist your active user session, selected language preferences, and favorite property bookmarks. This data is stored locally on your browser device and can be cleared at any time by logging out or wiping browser cookies."}
              </p>
              <h3 className="font-serif text-sm text-white font-bold">
                {currentLanguage === 'om' ? '4. Nageenya Deetaa' : currentLanguage === 'am' ? '4. የውሂብ ደህንነት' : '4. Data Security'}
              </h3>
              <p>
                {currentLanguage === 'om'
                  ? "Jecha icciitii fi kuusaa deetaa keenya eeguuf koodii ammayyaatti fayyadamna. Nageenya deetaa keessaniif of-eeggannoo guddaa goona."
                  : currentLanguage === 'am'
                  ? "የይለፍ ቃላትን እና የመረጃ ቋቶችን ደህንነት ለመጠበቅ ደረጃቸውን የጠበቁ ስልቶችን እንጠቀማለን። ለደህንነትዎ ከፍተኛ ጥንቃቄ እናደርጋለን።"
                  : "We employ standard hashing algorithms to encrypt passwords and secure database backends on our Cloud infrastructure. While we strive to maintain top-tier cybersecurity shields, no digital transmission is 100% secure, and users are encouraged to choose highly robust password parameters."}
              </p>
            </div>
          </div>
        );

      case 'about-us':
        return (
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
              <Globe className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h2 className="text-2xl font-serif text-white font-bold">
                  {t('about.title') || (currentLanguage === 'om' ? "Waa'ee SOF-UMER" : currentLanguage === 'am' ? "ስለ SOF-UMER" : "About SOF-UMER")}
                </h2>
                <p className="text-xs text-white/40">
                  {t('about.subtitle') || (currentLanguage === 'om' ? "Gabaa dhiyeessii hedduu Itoophiyaa isa duraa kan namoota, daldalaafi carraawwan walitti hidhu." : currentLanguage === 'am' ? "ሰዎችን፣ ንግዶችን እና እድሎችን የሚያገናኝ የኢትዮጵያ ግንባር ቀደም ባለብዙ-ምድብ ገበያ።" : "Ethiopia's premier multi-category marketplace connecting people, businesses, and opportunities.")}
                </p>
              </div>
            </div>

            <div className="bg-[#0c0c10]/60 p-6 md:p-8 rounded-2xl border border-white/5 space-y-4 text-xs text-white/70 leading-relaxed font-light">
              <p>
                {t('about.p1')}
              </p>
              <p>
                {t('about.p2')}
              </p>
              <p>
                {t('about.p3')}
              </p>
              <p>
                {t('about.p4')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/5">
                <div className="text-center p-4 bg-black/40 rounded-xl border border-white/5">
                  <h4 className="text-lg font-serif text-emerald-400 font-bold">{formatStatNumber(verifiedListingsCount)}</h4>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">
                    {t('about.verified_listings') || (currentLanguage === 'om' ? "Beeksisa Mirkanaa'e" : currentLanguage === 'am' ? "የተረጋገጡ ማስታወቂያዎች" : "Verified Listings")}
                  </p>
                </div>
                <div className="text-center p-4 bg-black/40 rounded-xl border border-white/5">
                  <h4 className="text-lg font-serif text-amber-500 font-bold">{formatStatNumber(activeProfilesCount)}</h4>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">
                    {t('about.active_profiles') || (currentLanguage === 'om' ? "Profeelii Socho'aa" : currentLanguage === 'am' ? "ንቁ መገለጫዎች" : "Active Profiles")}
                  </p>
                </div>
                <div className="text-center p-4 bg-black/40 rounded-xl border border-white/5">
                  <h4 className="text-lg font-serif text-emerald-400 font-bold">3</h4>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">
                    {t('about.ethiopian_languages') || (currentLanguage === 'om' ? "Afaanota Itoophiyaa" : currentLanguage === 'am' ? "የኢትዮጵያ ቋንቋዎች" : "Ethiopian Languages")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'how-it-works':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
              <HelpCircle className="w-8 h-8 text-amber-500" />
              <div>
                <h2 className="text-2xl font-serif text-white font-bold">
                  {t('how_it_works.title') || (currentLanguage === 'om' ? 'Inni Akkamitti Hojjata' : currentLanguage === 'am' ? 'እንዴት እንደሚሰራ' : 'How It Works')}
                </h2>
                <p className="text-xs text-white/40">
                  {t('how_it_works.subtitle') || (currentLanguage === 'om' ? 'Adeemsa salphaa bittan, gurgurtan ykn kireeffattan.' : currentLanguage === 'am' ? 'በሶፍ ኡመር ለመሸጥ፣ ለመግዛት፣ ለመከራየት የሚከተሉት 3 ቀላል መንገዶች።' : 'A simple 3-step guide to buy, sell, rent, or trade.')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-3 relative">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  {t('how_it_works.step1_badge') || (currentLanguage === 'om' ? 'Tarkaanfii 01' : currentLanguage === 'am' ? 'ደረጃ 01' : 'Step 01')}
                </span>
                <h3 className="font-serif text-base text-white">
                  {t('how_it_works.step1_title') || (currentLanguage === 'om' ? 'Herrega Banadhaa' : currentLanguage === 'am' ? 'መለያ ይፍጠሩ' : 'Create an Account')}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  {t('how_it_works.step1_desc') || (currentLanguage === 'om' 
                    ? "Teessoo imeelii keessaniin sekondii muraasa keessatti galmaa'aa. Baafata afaanii gubbaarra jiru irraa afaan filattan (Ingiliffa, Afaan Oromoo, Amaara) filadhaa." 
                    : currentLanguage === 'am' 
                    ? 'የኢሜይል አድራሻዎን በመጠቀም በሰከንዶች ውስጥ ይመዝገቡ። ከላይ ካለው የቋንቋ ፓነል የሚመርጡትን ቋንቋ (እንግሊዝኛ፣ አፋን ኦሮሞ፣ አማርኛ) ይቀይሩ።' 
                    : 'Sign up in seconds using your email address. Toggle your preferred language (English, Afaan Oromoo, Amharic) from the top language panel.')}
                </p>
              </div>

              <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-3 relative">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                  {t('how_it_works.step2_badge') || (currentLanguage === 'om' ? 'Tarkaanfii 02' : currentLanguage === 'am' ? 'ደረጃ 02' : 'Step 02')}
                </span>
                <h3 className="font-serif text-base text-white">
                  {t('how_it_works.step2_title') || (currentLanguage === 'om' ? "Maxxansaa ykn Sakatta'aa" : currentLanguage === 'am' ? 'ያትሙ ወይም ያስሱ' : 'Publish or Explore')}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  {t('how_it_works.step2_desc') || (currentLanguage === 'om' 
                    ? "Qabeenya, konkolaataa, oomisha ykn beeksisa hojii keessan unka salphaa amaloota fi teessoo qabuun maxxansaa. Yookiin beeksisa kumaatamaan lakkaa'aman sakatta'aa." 
                    : currentLanguage === 'am' 
                    ? 'ንብረትዎን፣ ተሽከርካሪዎን፣ ምርትዎን ወይም የስራ ማስታወቂያዎን ቀላል ቅጽ በመጠቀም ይለጥፉ። ወይም በሺዎች የሚቆጠሩ ማስታወቂያዎችን ያጣሩ።' 
                    : 'Post your property, vehicle, product, or job listing using our streamlined form with custom attributes and local coordinates. Or filter thousands of listings.')}
                </p>
              </div>

              <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-3 relative">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  {t('how_it_works.step3_badge') || (currentLanguage === 'om' ? 'Tarkaanfii 03' : currentLanguage === 'am' ? 'ደረጃ 03' : 'Step 03')}
                </span>
                <h3 className="font-serif text-base text-white">
                  {t('how_it_works.step3_title') || (currentLanguage === 'om' ? 'Walqunnamaa & Walii Galaa' : currentLanguage === 'am' ? 'ይገናኙ እና ይገበያዩ' : 'Connect & Deal')}
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  {t('how_it_works.step3_desc') || (currentLanguage === 'om' 
                    ? "Tajaajila yaada qajeeltoo fayyadamaa ykn lakkoofsa bilbilaa mirkanaa'een kallattiin gurguraa qunnamaa. Bakka nagaa qabutti sakatta'iinsa taasisaa, waligaltee seera qabeessa raawwadhaa." 
                    : currentLanguage === 'am' 
                    ? 'የቀጥታ ውይይት ይጠቀሙ ወይም በተረጋገጡ የስልክ ቁጥሮች አማካኝነት ሻጩን በቀጥታ ያነጋግሩ። ደህንነቱ የተጠበቀ ምርመራ ያድርጉ፣ ህጋዊ ስምምነቶችን ያጠናቅቁ እና በሰላም ይገበያዩ።' 
                    : 'Use our live chat or contact the seller directly using verified phone numbers. Arrange safe physical inspections, secure legal deals, and trade with peace of mind.')}
                </p>
              </div>
            </div>
          </div>
        );

      case 'contact-us':
        if (!hasAnyContactMethod && (!adminContactSettings || !adminContactSettings.title)) {
          return (
            <div className="p-10 text-center bg-[#0c0c10]/60 border border-white/5 rounded-2xl space-y-3">
              <Mail className="w-10 h-10 text-white/30 mx-auto" />
              <h3 className="text-lg font-serif text-white font-bold">
                {t('contact_channel_unavailable') || (currentLanguage === 'om' ? 'Kallattiin Qunnamtii Hin Jiru' : currentLanguage === 'am' ? 'የእውቂያ መስመር አይገኝም' : 'Contact Channel Unavailable')}
              </h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                {t('contact_channel_unavailable_desc') || (currentLanguage === 'om' ? 'Bulchaan yeroodhaaf kaardii qunnamtii dhokseera ykn tajaajila sarara ala godheera. Maaloo booda deebi’aa ilaalaa.' : currentLanguage === 'am' ? 'አስተዳዳሪው የእውቂያ ካርዱን ለጊዜው ደብቆታል ወይም ከመስመር ውጭ ድጋፍን አዘጋጅቷል። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።' : 'The administrator has temporarily hidden the contact card or configured offline support. Please check back later.')}
              </p>
            </div>
          );
        }

        const contactTitle = adminContactSettings?.title || t('contact_us') || (currentLanguage === 'om' ? 'Nu Quunnamaa' : currentLanguage === 'am' ? 'ያግኙን' : 'Contact Us');
        const contactSubtitle = adminContactSettings?.subtitle || t('contact_us_subtitle') || (currentLanguage === 'om' ? 'Gaaffii ykn yaada qabdan nuuf ergaa.' : currentLanguage === 'am' ? 'ለማንኛውም ጥያቄዎች ወይም አስተያየቶች ከዚህ በታች ያለውን ቅጽ በመጠቀም ይላኩልን።' : 'Have questions or feedback? Send us an inquiry directly.');

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
              <Mail className="w-8 h-8 text-emerald-400" />
              <div>
                <h2 className="text-2xl font-serif text-white font-bold">
                  {contactTitle}
                </h2>
                <p className="text-xs text-white/40">
                  {contactSubtitle}
                </p>
              </div>
            </div>

            <div className={`grid grid-cols-1 ${hasAnyContactMethod ? 'lg:grid-cols-12' : ''} gap-6`}>
              {/* Contact Info (Only if admin configured details) */}
              {hasAnyContactMethod && (
                <div className="lg:col-span-5 bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-6 text-left">
                  {(contactHqTitleVal || contactHqAddressVal) && (
                    <div className="space-y-2">
                      {contactHqTitleVal && (
                        <h3 className="font-serif text-base text-white">{contactHqTitleVal}</h3>
                      )}
                      {contactHqAddressVal && (
                        <p className="text-xs text-white/50 leading-relaxed">
                          {contactHqAddressVal}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 border-t border-white/5 pt-4">
                    {contactLocationVal && (
                      <div className="flex items-center gap-3 text-xs text-white/70">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{contactLocationVal}</span>
                      </div>
                    )}
                    {contactEmailVal && (
                      <div className="flex items-center gap-3 text-xs text-white/70">
                        <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                        <a href={`mailto:${contactEmailVal}`} className="hover:underline hover:text-white transition">
                          {contactEmailVal}
                        </a>
                      </div>
                    )}
                    {contactPhoneVal && (
                      <div className="flex items-center gap-3 text-xs text-white/70">
                        <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                        <a href={`tel:${contactPhoneVal}`} className="hover:underline hover:text-white transition">
                          {contactPhoneVal}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Form */}
              <div className={`${hasAnyContactMethod ? 'lg:col-span-7' : 'max-w-2xl mx-auto w-full'} bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5`}>
                <AnimatePresence mode="wait">
                  {contactSuccess ? (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-10 space-y-3"
                    >
                      <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                      <h4 className="font-serif text-base text-white">
                        {currentLanguage === 'om' ? 'Yaadni Keessan Ergamuuf!' : currentLanguage === 'am' ? 'መልዕክትዎ በተሳካ ሁኔታ ተልኳል!' : 'Inquiry Sent Successfully!'}
                      </h4>
                      <p className="text-xs text-white/50 max-w-sm mx-auto">
                        {currentLanguage === 'om' ? 'Giddugalli keenya dhiyoo keessatti bilbila ykn imeeliin si quunnama.' : currentLanguage === 'am' ? 'የእኛ የደንበኞች እንክብካቤ ሰሌዳ በተጠቀሰው ኢሜይል በኩል በቅርቡ ያነጋግርዎታል።' : 'Our customer care board will get back to you via your email or phone shortly.'}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="form"
                      onSubmit={handleContactSubmit} 
                      className="space-y-4 text-left"
                    >
                      <div>
                        <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
                          {adminContactSettings?.fullNameLabel || (currentLanguage === 'om' ? 'Maqaa Guutuu *' : currentLanguage === 'am' ? 'ሙሉ ስም *' : 'Full Name *')}
                        </label>
                        <input 
                          type="text" 
                          required 
                          value={contactName} 
                          onChange={e => setContactName(e.target.value)} 
                          placeholder={adminContactSettings?.fullNamePlaceholder || (currentLanguage === 'om' ? 'fkn. Jemal Jimma' : currentLanguage === 'am' ? 'ምሳሌ፡ ጀማል ጅማ' : 'e.g. Jemal Jimma')} 
                          className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 placeholder-white/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
                          {adminContactSettings?.emailLabel || (currentLanguage === 'om' ? 'Teessoo Imeelii *' : currentLanguage === 'am' ? 'የኢሜል አድራሻ *' : 'Email Address *')}
                        </label>
                        <input 
                          type="email" 
                          required 
                          value={contactEmail} 
                          onChange={e => setContactEmail(e.target.value)} 
                          placeholder={adminContactSettings?.emailPlaceholder || (contactEmailVal ? `e.g. ${contactEmailVal}` : 'e.g. user@sofumer.com')} 
                          className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 placeholder-white/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
                          {adminContactSettings?.messageLabel || (currentLanguage === 'om' ? 'Ergaa / Gaaffii *' : currentLanguage === 'am' ? 'መልእክት / ጥያቄ *' : 'Message / Inquiry *')}
                        </label>
                        <textarea 
                          required 
                          rows={4} 
                          value={contactMessage} 
                          onChange={e => setContactMessage(e.target.value)} 
                          placeholder={adminContactSettings?.messagePlaceholder || (currentLanguage === 'om' ? 'Gaaffii ykn yaada qabdan asitti ibsaa...' : currentLanguage === 'am' ? 'ጥያቄዎን ወይም አስተያየትዎን እዚህ ይግለጹ...' : 'Describe your inquiry, error or collaboration suggestion here...')} 
                          className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 placeholder-white/20"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={contactSubmitting}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold uppercase rounded-xl transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {contactSubmitting 
                            ? (currentLanguage === 'om' ? 'Ergaa jira...' : currentLanguage === 'am' ? 'በመላክ ላይ...' : 'Sending...') 
                            : (adminContactSettings?.submitBtnText || (currentLanguage === 'om' ? 'Ergaa Ergi' : currentLanguage === 'am' ? 'መልእክት ላክ' : 'Send Message'))}
                        </span>
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );

      case 'careers':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
              <Briefcase className="w-8 h-8 text-emerald-400" />
              <div>
                <h2 className="text-2xl font-serif text-white font-bold">
                  {currentLanguage === 'om' ? 'Carra Hojii (Careers)' : currentLanguage === 'am' ? 'የስራ እድሎች (Careers)' : 'Careers at Sof Umer'}
                </h2>
                <p className="text-xs text-white/40">
                  {currentLanguage === 'om' ? 'Hawaasa keenya guddisuuf nu waliin hojjedhaa' : currentLanguage === 'am' ? 'የምንወደውን ፕላትፎርም ለማሳደግ ከእኛ ባለሙያ ቡድን ጋር ይቀላቀሉ' : 'Join our team and build the future of localized commerce in East Africa.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-base text-white">Active Openings in Ethiopia:</h3>
              
              {jobOpenings.length === 0 ? (
                <div className="bg-[#0c0c10]/60 p-8 rounded-2xl border border-white/5 text-center text-white/40 text-xs">
                  {currentLanguage === 'om' ? 'Yeroo ammaa carraan hojii banaa ta\'e hin jiru.' : currentLanguage === 'am' ? 'በአሁኑ ጊዜ ክፍት የስራ መደቦች የሉም።' : 'No active job openings available at the moment. Please check back later!'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {jobOpenings.map(job => (
                    <div key={job.id} className="bg-[#0c0c10]/60 p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-500/20 transition-all duration-300 text-left">
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex flex-wrap gap-2 items-center">
                          <h4 className="font-serif text-base text-white font-bold">{job.title}</h4>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wide">{job.department}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {job.salary}</span>
                        </div>
                        <p className="text-xs text-white/60 mt-2 font-light">
                          {job.description}
                        </p>
                      </div>

                      <button 
                        onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)} 
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer shrink-0 ${
                          selectedJob === job.id 
                            ? 'bg-white text-black' 
                            : 'bg-emerald-500 hover:bg-emerald-600 text-black'
                        }`}
                      >
                        {selectedJob === job.id ? 'Close' : 'Apply Now'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive application form */}
              <AnimatePresence>
                {selectedJob && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[#0c0c10]/60 border border-emerald-500/20 p-6 rounded-2xl overflow-hidden mt-6 text-left"
                  >
                    <h4 className="font-serif text-base text-white mb-4">
                      Apply for: <span className="text-emerald-400">{jobOpenings.find(j => j.id === selectedJob)?.title || 'Selected Position'}</span>
                    </h4>

                    {applySuccess ? (
                      <div className="text-center py-6 space-y-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                        <h5 className="font-serif text-sm text-white">Application Received!</h5>
                        <p className="text-xs text-white/50 max-w-xs mx-auto">Thank you for applying. Our talent acquisition committee will review your resume and reach out within 5 days.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleApplySubmit} className="space-y-4 max-w-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Full Name *</label>
                            <input 
                              type="text" 
                              required 
                              value={applyName} 
                              onChange={e => setApplyName(e.target.value)} 
                              placeholder="Jemal Jimma" 
                              className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 placeholder-white/20"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Email Address *</label>
                            <input 
                              type="email" 
                              required 
                              value={applyEmail} 
                              onChange={e => setApplyEmail(e.target.value)} 
                              placeholder="jemal@sofumer.com" 
                              className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 placeholder-white/20"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Phone Number *</label>
                            <input 
                              type="text" 
                              inputMode="text"
                              required 
                              value={applyPhone} 
                              onChange={e => setApplyPhone(e.target.value)} 
                              placeholder="+251 911 223 344" 
                              className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 placeholder-white/20"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1">Resume / Cover Letter Link *</label>
                            <input 
                              type="url" 
                              required 
                              value={applyResume} 
                              onChange={e => setApplyResume(e.target.value)} 
                              placeholder="e.g. Google Drive/Dropbox resume URL" 
                              className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 placeholder-white/20"
                            />
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          disabled={applySubmitting}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold uppercase rounded-xl transition flex items-center gap-2 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{applySubmitting ? 'Submitting Application...' : 'Submit Application'}</span>
                        </button>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );

      default:
        const genericFeat = appFeatures.find(f => f.id === activeTab);
        if (genericFeat) {
          const title = currentLanguage === 'om' ? genericFeat.titleOm : currentLanguage === 'am' ? genericFeat.titleAm : genericFeat.titleEn;
          const content = currentLanguage === 'om' ? genericFeat.contentOm : currentLanguage === 'am' ? genericFeat.contentAm : genericFeat.contentEn;
          
          let IconComponent = FileText;
          if (genericFeat.id === 'marketplace-rules') IconComponent = Shield;
          else if (genericFeat.id === 'verify-ownership') IconComponent = UserCheck;
          else if (genericFeat.id === 'safety-tips') IconComponent = AlertTriangle;
          else if (genericFeat.id === 'how-it-works') IconComponent = HelpCircle;
          
          return (
            <div className="space-y-6 text-left animate-fade-in">
              <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
                <IconComponent className="w-8 h-8 text-emerald-400" />
                <div>
                  <h2 className="text-2xl font-serif text-white font-bold">
                    {title}
                  </h2>
                  <p className="text-xs text-white/40">
                    {currentLanguage === 'om' ? 'Ibsa dabalataa dhimma kanaa' : currentLanguage === 'am' ? 'የዚህ ርዕስ ዝርዝር መረጃ' : 'Detailed information regarding this topic.'}
                  </p>
                </div>
              </div>

              <div className="bg-[#0c0c10]/60 p-6 md:p-8 rounded-2xl border border-white/5 space-y-4">
                <div className="text-sm text-white/80 leading-relaxed font-light whitespace-pre-wrap">
                  {content}
                </div>
              </div>
            </div>
          );
        }
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans min-h-[70vh]">
      {/* Back navigation header */}
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-xs font-bold uppercase tracking-wider text-white/80 transition-all duration-300 hover:translate-x-[-2px] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {returnView === 'profile' || returnView === 'dashboard'
              ? (currentLanguage === 'om' ? "Gara Piroofayiliitti Deebi'i" : currentLanguage === 'am' ? "ወደ መለያ ይመለሱ" : "Back to Profile")
              : getTranslation(tInfo.backToMarketplace)}
          </span>
        </button>

        <span className="text-[10px] uppercase font-black tracking-widest text-[#10b981]/60">
          {['terms-of-service', 'privacy-policy'].includes(activeTab)
            ? (currentLanguage === 'om' ? 'SOF-UMER • Seera & Ibsa Iccitii' : currentLanguage === 'am' ? 'SOF-UMER • ህጋዊ ውሎች እና ግላዊነት' : 'SOF-UMER • Legal Terms & Privacy')
            : activeTab === 'contact-us'
            ? (currentLanguage === 'om' ? 'SOF-UMER • Nu Quunnamaa' : currentLanguage === 'am' ? 'SOF-UMER • ያግኙን' : 'SOF-UMER • Contact Us')
            : ['help-center', 'marketplace-rules', 'safety-tips', 'careers'].includes(activeTab) 
            ? (currentLanguage === 'om' ? 'SOF-UMER • Qajeelfama Deggarsaa & Nageenyaa' : currentLanguage === 'am' ? 'SOF-UMER • ድጋፍ እና የደህንነት መመሪያ' : 'SOF-UMER • Support, Rules & Safety Guide') 
            : (currentLanguage === 'om' ? "SOF-UMER • Waa'ee Keenya" : currentLanguage === 'am' ? 'SOF-UMER • ስለ እኛ' : 'SOF-UMER • About')}
        </span>
      </div>

      {['terms-of-service', 'privacy-policy', 'contact-us'].includes(activeTab) ? (
        /* Standalone page - ONLY existing content, NO ABOUT SOF-UMER section */
        <div className="max-w-4xl mx-auto bg-[#0e0e13]/90 rounded-3xl border border-[#10b981]/15 p-6 md:p-8 backdrop-blur-xl shadow-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* Navigation panel */}
          <div className="lg:col-span-3 space-y-6">
            {['help-center', 'marketplace-rules', 'safety-tips', 'careers'].includes(activeTab) ? (
              /* Profile -> Support, Rules & Safety Guide Section */
              <div className="bg-[#0c0c10]/60 p-4 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-b border-white/5 pb-2">
                  {currentLanguage === 'om' ? 'Deggarsa, Seera & Nageenya' : currentLanguage === 'am' ? 'ድጋፍ፣ ደንቦች እና የደህንነት መመሪያ' : 'Support, Rules & Safety Guide'}
                </h3>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: 'help-center', titleEn: 'FAQ', titleOm: 'Gaaffilee Yeroo Baay’ee (FAQ)', titleAm: 'ተደጋጋሚ ጥያቄዎች (FAQ)' },
                    { id: 'marketplace-rules', titleEn: 'Marketplace Rules', titleOm: 'Seera Gabaa', titleAm: 'የገበያ ቦታ ደንቦች' },
                    { id: 'safety-tips', titleEn: 'Safety Tips', titleOm: 'Gorsa Nageenyaa', titleAm: 'የደህንነት ምክሮች' },
                    { id: 'careers', titleEn: 'Careers', titleOm: 'Carraa Hojii', titleAm: 'ስራዎች' }
                  ].map(feat => {
                    const title = currentLanguage === 'om' ? feat.titleOm : currentLanguage === 'am' ? feat.titleAm : feat.titleEn;
                    return (
                      <button
                        key={feat.id}
                        onClick={() => setActiveTab(feat.id)}
                        className={`w-full text-left p-3 rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                          activeTab === feat.id
                            ? 'bg-gradient-to-r from-emerald-500/10 to-transparent border-l-2 border-emerald-500 text-emerald-400 font-bold'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{title}</span>
                        <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition ${activeTab === feat.id ? 'text-emerald-400 opacity-100' : 'text-white/30'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* ABOUT SOF-UMER Section - 2 items (Contact Us is standalone) */
              <div className="bg-[#0c0c10]/60 p-4 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest border-b border-white/5 pb-2">
                  {currentLanguage === 'om' ? "Waa'ee SOF-UMER" : currentLanguage === 'am' ? 'ስለ SOF-UMER' : 'About SOF-UMER'}
                </h3>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: 'about-us', titleEn: 'About SOF-UMER', titleOm: "Waa'ee SOF-UMER", titleAm: 'ስለ SOF-UMER' },
                    { id: 'how-it-works', titleEn: 'How It Works', titleOm: 'Inni Akkamitti Hojjata', titleAm: 'እንዴት እንደሚሰራ' }
                  ].map(feat => {
                    const title = currentLanguage === 'om' ? feat.titleOm : currentLanguage === 'am' ? feat.titleAm : feat.titleEn;
                    return (
                      <button
                        key={feat.id}
                        onClick={() => setActiveTab(feat.id)}
                        className={`w-full text-left p-3 rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                          activeTab === feat.id
                            ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 text-amber-500 font-bold'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{title}</span>
                        <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition ${activeTab === feat.id ? 'text-amber-500 opacity-100' : 'text-white/30'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Content body */}
          <div className="lg:col-span-9 bg-[#0e0e13]/90 rounded-3xl border border-[#10b981]/15 p-6 md:p-8 backdrop-blur-xl shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
