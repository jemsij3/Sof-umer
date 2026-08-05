import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Shield, CheckCircle2, UserCheck, AlertTriangle, LifeBuoy, 
  FileText, Briefcase, Mail, MapPin, Send, HelpCircle, Eye, Globe, ChevronRight
} from 'lucide-react';
import { useApp } from '../lib/AppContext';
import HelpCenter from './HelpCenter';

interface InfoPageProps {
  pageId: string;
  onBack: () => void;
  onOpenReportModalFromInfo?: () => void;
}

export default function InfoPage({ pageId, onBack, onOpenReportModalFromInfo }: InfoPageProps) {
  const { currentLanguage, appFeatures, jobOpenings, systemSettings, properties, users, t } = useApp();
  const [activeTab, setActiveTab] = useState<string>(pageId);

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

  const defaultContactUs = {
    title: 'Contact Us',
    subtitle: 'Have questions or feedback? Send us an inquiry directly.',
    hqTitle: 'Sof Umer Headquarters',
    hqAddress: '6th Floor, Premium Plaza Building, Churchill Road, Addis Ababa, Ethiopia.',
    location: 'Churchill Road, Addis Ababa',
    email: 'info@sofumer.com',
    phone: '+251 911 000 000',
    fullNameLabel: 'Full Name *',
    fullNamePlaceholder: 'e.g. Jemal Jimma',
    emailLabel: 'Email Address *',
    emailPlaceholder: 'e.g. jemal@sofumer.com',
    messageLabel: 'Message / Inquiry *',
    messagePlaceholder: 'Describe your inquiry, error or collaboration suggestion here...',
    submitBtnText: 'Send Message'
  };

  const activeContactUs = systemSettings?.contactUsSettings !== undefined
    ? systemSettings.contactUsSettings
    : (() => {
        try {
          const saved = localStorage.getItem('sof_umer_contact_us_settings');
          return saved ? JSON.parse(saved) : defaultContactUs;
        } catch {
          return defaultContactUs;
        }
      })();

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
      en: "About Sof Umer",
      om: "Waa'ee Sof Umer",
      am: "ስለ ሶፍ ኡመር"
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
        en: "Help Center",
        om: "Giddugala Deggarsaa",
        am: "የእርዳታ ማዕከል"
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
        en: "About Us",
        om: "Waa'ee Keenya",
        am: "ስለ እኛ"
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
                <span className="font-bold uppercase tracking-wider text-amber-400 block mb-1">Platform Policy & Legal Notice:</span>
                {systemSettings.termsAndPrivacy}
              </div>
            )}

            <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 text-xs text-white/70 space-y-4 max-h-[400px] overflow-y-auto leading-relaxed scrollbar-thin">
              <h3 className="font-serif text-sm text-white font-bold">1. Agreement to Terms</h3>
              <p>
                By creating an account on Sof Umer, listing any products, real estate, vehicles, or services, or interacting with any advertisers, you unconditionally agree to be bound by these legal Terms of Service and all regional laws of the Federal Democratic Republic of Ethiopia.
              </p>
              <h3 className="font-serif text-sm text-white font-bold">2. User Account Security</h3>
              <p>
                You are solely responsible for maintaining the password and credentials of your account. Any activities performed through your account will be attributed to you. If you suspect any breach of security, you must notify our help desk immediately.
              </p>
              <h3 className="font-serif text-sm text-white font-bold">3. Listing Ownership and Licensing</h3>
              <p>
                When you publish a listing, you guarantee that you own the intellectual and material property rights of that asset or possess legal power of attorney to advertise it. Sof Umer reserves the right to strip badges or delete listings that are contested by third-party owners.
              </p>
              <h3 className="font-serif text-sm text-white font-bold">4. Limitation of Liability</h3>
              <p>
                Sof Umer is an open-market peer-to-peer advertising utility. We do not own, inspect, guarantee, or manage the real properties, products, or vehicles listed by users. Transactions are finalized directly between the transacting parties, and Sof Umer shall not be liable for any losses, fraudulent deals, or damages arising from physical meets or legal disputes.
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
              <h3 className="font-serif text-sm text-white font-bold">1. Information We Collect</h3>
              <p>
                We collect your full name, email address, phone number, location, profile credentials, and listing content (images, title, description, pricing) during account registration and listing creation to provide the marketplace services.
              </p>
              <h3 className="font-serif text-sm text-white font-bold">2. Sharing of Contact Information</h3>
              <p>
                Your phone number and email address are explicitly shared with other registered users on listing details pages to facilitate sales inquiries, bookings, and negotiations. If you do not wish to share your phone, you may toggle off listings or use our internal inquiry chat system.
              </p>
              <h3 className="font-serif text-sm text-white font-bold">3. Cookies and Storage</h3>
              <p>
                We use local storage (localStorage) to persist your active user session, selected language preferences, and favorite property bookmarks. This data is stored locally on your browser device and can be cleared at any time by logging out or wiping browser cookies.
              </p>
              <h3 className="font-serif text-sm text-white font-bold">4. Data Security</h3>
              <p>
                We employ standard hashing algorithms to encrypt passwords and secure database backends on our Cloud infrastructure. While we strive to maintain top-tier cybersecurity shields, no digital transmission is 100% secure, and users are encouraged to choose highly robust password parameters.
              </p>
            </div>
          </div>
        );

      case 'about-us':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
              <Globe className="w-8 h-8 text-emerald-400" />
              <div>
                <h2 className="text-2xl font-serif text-white font-bold">
                  {t('about.title')}
                </h2>
                <p className="text-xs text-white/40">
                  {t('about.subtitle')}
                </p>
              </div>
            </div>

            <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-4 text-xs text-white/70 leading-relaxed">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                <div className="text-center p-3.5 bg-black/40 rounded-xl border border-white/5">
                  <h4 className="text-base font-serif text-emerald-400 font-bold">{formatStatNumber(verifiedListingsCount)}</h4>
                  <p className="text-[10px] uppercase text-white/40 mt-1">
                    {t('about.verified_listings')}
                  </p>
                </div>
                <div className="text-center p-3.5 bg-black/40 rounded-xl border border-white/5">
                  <h4 className="text-base font-serif text-amber-500 font-bold">{formatStatNumber(activeProfilesCount)}</h4>
                  <p className="text-[10px] uppercase text-white/40 mt-1">
                    {t('about.active_profiles')}
                  </p>
                </div>
                <div className="text-center p-3.5 bg-black/40 rounded-xl border border-white/5">
                  <h4 className="text-base font-serif text-emerald-400 font-bold">3</h4>
                  <p className="text-[10px] uppercase text-white/40 mt-1">
                    {t('about.ethiopian_languages')}
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
                  {currentLanguage === 'om' ? 'Inni Akkamitti Hojjata?' : currentLanguage === 'am' ? 'እንዴት እንደሚሰራ ያንብቡ' : 'How It Works'}
                </h2>
                <p className="text-xs text-white/40">
                  {currentLanguage === 'om' ? 'Adeemsa salphaa bittan, gurgurtan ykn kireeffattan' : currentLanguage === 'am' ? 'በሶፍ ኡመር ለመሸጥ፣ ለመግዛት፣ ለመከራየት የሚከተሉት ቀላል መንገዶች' : 'A simple 3-step guide to buy, sell, rent, or trade.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-3 relative">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Step 01</span>
                <h3 className="font-serif text-base text-white">Create an Account</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Sign up in seconds using your email address. Toggle your preferred language (English, Afaan Oromoo, Amharic) from the top language panel.
                </p>
              </div>

              <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-3 relative">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Step 02</span>
                <h3 className="font-serif text-base text-white">Publish or Explore</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Post your property, vehicle, product, or job listing using our streamlined form with custom attributes and local coordinates. Or filter thousands of listings.
                </p>
              </div>

              <div className="bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-3 relative">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Step 03</span>
                <h3 className="font-serif text-base text-white">Connect & Deal</h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Use our live chat or contact the seller directly using verified phone numbers. Arrange safe physical inspections, secure legal deals, and trade with peace of mind.
                </p>
              </div>
            </div>
          </div>
        );

      case 'contact-us':
        if (!activeContactUs) {
          return (
            <div className="p-10 text-center bg-[#0c0c10]/60 border border-white/5 rounded-2xl space-y-3">
              <Mail className="w-10 h-10 text-white/30 mx-auto" />
              <h3 className="text-lg font-serif text-white font-bold">Contact Channel Unavailable</h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                The administrator has temporarily hidden the contact card or configured offline support. Please check back later.
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#10b981]/15 pb-4">
              <Mail className="w-8 h-8 text-emerald-400" />
              <div>
                <h2 className="text-2xl font-serif text-white font-bold">
                  {activeContactUs.title || (currentLanguage === 'om' ? 'Nu Quunnamaa' : currentLanguage === 'am' ? 'እኛን ያግኙን' : 'Contact Us')}
                </h2>
                <p className="text-xs text-white/40">
                  {activeContactUs.subtitle || (currentLanguage === 'om' ? 'Gaaffii ykn yaada qabdan nuuf ergaa' : currentLanguage === 'am' ? 'ለማንኛውም ጥያቄዎች ወይም አስተያየቶች ከዚህ በታች ያለውን ቅጽ በመጠቀም ይላኩልን' : 'Have questions or feedback? Send us an inquiry directly.')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Contact Info */}
              <div className="lg:col-span-5 bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5 space-y-6 text-left">
                <div className="space-y-2">
                  <h3 className="font-serif text-base text-white">{activeContactUs.hqTitle || 'Sof Umer Headquarters'}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {activeContactUs.hqAddress || '6th Floor, Premium Plaza Building, Churchill Road, Addis Ababa, Ethiopia.'}
                  </p>
                </div>

                <div className="space-y-4 border-t border-white/5 pt-4">
                  {activeContactUs.location && (
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{activeContactUs.location}</span>
                    </div>
                  )}
                  {activeContactUs.email && (
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{activeContactUs.email}</span>
                    </div>
                  )}
                  {activeContactUs.phone && (
                    <div className="flex items-center gap-3 text-xs text-white/70">
                      <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{activeContactUs.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-7 bg-[#0c0c10]/60 p-6 rounded-2xl border border-white/5">
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
                          {activeContactUs.fullNameLabel || 'Full Name *'}
                        </label>
                        <input 
                          type="text" 
                          required 
                          value={contactName} 
                          onChange={e => setContactName(e.target.value)} 
                          placeholder={activeContactUs.fullNamePlaceholder || 'e.g. Jemal Jimma'} 
                          className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 placeholder-white/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
                          {activeContactUs.emailLabel || 'Email Address *'}
                        </label>
                        <input 
                          type="email" 
                          required 
                          value={contactEmail} 
                          onChange={e => setContactEmail(e.target.value)} 
                          placeholder={activeContactUs.emailPlaceholder || 'e.g. jemal@sofumer.com'} 
                          className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 placeholder-white/20"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
                          {activeContactUs.messageLabel || 'Message / Inquiry *'}
                        </label>
                        <textarea 
                          required 
                          rows={4} 
                          value={contactMessage} 
                          onChange={e => setContactMessage(e.target.value)} 
                          placeholder={activeContactUs.messagePlaceholder || 'Describe your inquiry, error or collaboration suggestion here...'} 
                          className="w-full p-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 placeholder-white/20"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={contactSubmitting}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold uppercase rounded-xl transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{contactSubmitting ? 'Sending...' : (activeContactUs.submitBtnText || 'Send Message')}</span>
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
          else if (genericFeat.id === 'about-us') IconComponent = Globe;
          
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
          <span>{getTranslation(tInfo.backToMarketplace)}</span>
        </button>

        <span className="text-[10px] uppercase font-black tracking-widest text-[#10b981]/60">
          Sof Umer Core Information Page
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Navigation panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#0c0c10]/60 p-4 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
              {getTranslation(tInfo.safetySupportHeader)}
            </h3>
            <div className="flex flex-col gap-1.5">
              {(safetyFeatures.length > 0 ? safetyFeatures : [
                { id: 'marketplace-rules', titleEn: 'Marketplace Rules', titleOm: 'Seera Gabaa', titleAm: 'የገበያ ቦታ ደንቦች' },
                { id: 'verify-ownership', titleEn: 'Verify Ownership', titleOm: 'Mirkaneessa Abbummaa', titleAm: 'ባለቤትነትን ያረጋግጡ' },
                { id: 'safety-tips', titleEn: 'Safety Tips', titleOm: 'Gorsa Nageenyaa', titleAm: 'የደህንነት ምክሮች' },
                { id: 'report-listing', titleEn: 'Report a Listing', titleOm: 'Beeksisa Gabaasi', titleAm: 'ያልተገባ ንብረት ሪፖርት ያድርጉ' },
                { id: 'help-center', titleEn: 'Help Center', titleOm: 'Giddugala Deggarsaa', titleAm: 'የእርዳታ ማዕከል' },
                { id: 'terms-of-service', titleEn: 'Terms of Service', titleOm: 'Waliigaltee Tajaajilaa', titleAm: 'የአጠቃቀም ስምምነት' },
                { id: 'privacy-policy', titleEn: 'Privacy Policy', titleOm: 'Ibsa Iccitii', titleAm: 'የግላዊነት ፖሊሲ' }
              ]).map(feat => {
                const title = (feat as any).titleEn 
                  ? (currentLanguage === 'om' ? (feat as any).titleOm : currentLanguage === 'am' ? (feat as any).titleAm : (feat as any).titleEn)
                  : getTranslation((tInfo.tabs as any)[feat.id]);
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

          <div className="bg-[#0c0c10]/60 p-4 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
              {getTranslation(tInfo.aboutHeader)}
            </h3>
            <div className="flex flex-col gap-1.5">
              {(aboutFeatures.length > 0 ? aboutFeatures : [
                { id: 'about-us', titleEn: 'About Us', titleOm: "Waa'ee Keenya", titleAm: 'ስለ እኛ' },
                { id: 'how-it-works', titleEn: 'How It Works', titleOm: 'Inni Akkamitti Hojjata', titleAm: 'እንዴት እንደሚሰራ' },
                { id: 'contact-us', titleEn: 'Contact Us', titleOm: 'Nu Quunnamaa', titleAm: 'እኛን ያግኙን' },
                { id: 'careers', titleEn: 'Careers', titleOm: 'Carraa Hojii', titleAm: 'ስራዎች' }
              ]).map(feat => {
                const title = (feat as any).titleEn 
                  ? (currentLanguage === 'om' ? (feat as any).titleOm : currentLanguage === 'am' ? (feat as any).titleAm : (feat as any).titleEn)
                  : getTranslation((tInfo.tabs as any)[feat.id]);
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
    </div>
  );
}
