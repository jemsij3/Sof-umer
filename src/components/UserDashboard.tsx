import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../lib/AppContext';
import { formatTimeAgo } from '../lib/utils';
import { Property, Inquiry, AppNotification } from '../types';
import { TwoFactorSecurityModule } from './TwoFactorSecurityModule';
import { ReceiptUploadInput } from './ReceiptUploadInput';
import { getCampaignStatusInfo } from '../utils/campaignUtils';
import { 
  User, MessageSquare, Bell, CreditCard, Settings, LogOut, CheckCircle2, 
  ChevronRight, UploadCloud, HelpCircle, FileText, AlertTriangle, Send, 
  ShieldCheck, Camera, Heart, Eye, Trash2, Edit2, Play, Pause, TrendingUp, 
  Info, List, Clock, Zap, DollarSign, Languages, Smartphone, Globe, ShieldAlert, Check, Plus, Lock, EyeOff, CheckSquare,
  ChevronDown, Search, ArrowRight, Shield, ToggleLeft, ToggleRight, X, Folder, FolderOpen, Building, Gift
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Expandable Accordion Item for FAQ Section
function AccordionItem({ title, content, isOpen, onToggle }: { title: string; content: string; isOpen: boolean; onToggle: () => void; key?: React.Key }) {
  return (
    <div className="border border-white/5 bg-black/20 rounded-xl overflow-hidden transition duration-300">
      <button 
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-xs text-white hover:bg-white/5 transition"
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 text-[11px] text-white/60 leading-relaxed border-t border-white/5 bg-black/40">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// L10n Dictionaries
const DICT = {
  en: {
    welcome: "Welcome back",
    active_badge: "Active Account",
    verified_badge: "Verified Account",
    pending_badge: "Pending Verification",
    unverified_badge: "Unverified Account",
    edit_profile_btn: "Edit Profile Info",
    save_changes: "Save Profile Updates",
    change_photo: "Change Photo URL",
    my_listings_title: "Manage My Listings",
    no_listings: "You have not uploaded any properties/listings yet.",
    no_saved: "Your favorites list is currently empty.",
    no_messages: "No active inbox chat conversations.",
    no_notifications: "You do not have any new system alerts.",
    no_recent: "You have not viewed any listings in this session.",
    ticket_submit: "Submit Support Ticket",
    ticket_success_msg: "Your support ticket has been logged successfully!",
    report_btn: "File Report",
    logout_confirm: "Log Out Safely",
    logout_desc: "Are you sure you want to log out of your session? You will need to log back in to contact sellers or manage your active listings.",
    close: "Close",
    promote_action: "Promote Listing"
  },
  om: {
    welcome: "Baga nagaan dhufte",
    active_badge: "Hojataa Jira",
    verified_badge: "Mirkanaa'eera",
    pending_badge: "Qorannoorra Jira",
    unverified_badge: "Hin Mirkanoofne",
    edit_profile_btn: "Profaayilii Gulaali",
    save_changes: "Haaromsi Herregaa",
    change_photo: "URL Fakkii Jijjiiri",
    my_listings_title: "Beeksisa Koo Bulchi",
    no_listings: "Hanga ammaatti beeksisa tokkollee hin olshitsine.",
    no_saved: "Kutaan jaallatamoowwan kee duwwaadha.",
    no_messages: "Ergaan haasawaa argame hin jiru.",
    no_notifications: "Beeksisa haaraa hin qabdu.",
    no_recent: "Hanga ammaatti beeksisa hin daawwanne.",
    ticket_submit: "Tikeettii Deggarsaa Ergi",
    ticket_success_msg: "Tikeettiin kee milkiidhaan galmeeffameera!",
    report_btn: "Rakkina Gabaasi",
    logout_confirm: "Herrega Koo keessaa Ba'i",
    logout_desc: "Herrega kee keessaa ba'uu ni barbaaddaa? Beeksisa kee bulchuuf deebitee seenuun si barbaachisa.",
    close: "Cufi",
    promote_action: "Beeksisa Guddisi"
  },
  am: {
    welcome: "እንኳን ደህና መጡ",
    active_badge: "ገባሪ መለያ",
    verified_badge: "የተረጋገጠ መለያ",
    pending_badge: "ግምገማ ላይ ያለ",
    unverified_badge: "ያልተረጋገጠ መለያ",
    edit_profile_btn: "መገለጫ ያስተካክሉ",
    save_changes: "መገለጫ አሻሽል",
    change_photo: "የፎቶ ሊንክ ቀይር",
    my_listings_title: "የእኔ ማስታወቂያዎች አስተዳድር",
    no_listings: "እስካሁን ምንም አይነት ማስታወቂያ አልለጠፉም።",
    no_saved: "የተቀመጡ ማስታወቂያዎች ዝርዝር ባዶ ነው።",
    no_messages: "ምንም ገባሪ የውይይት መልእክቶች የሉም።",
    no_notifications: "ምንም አዲስ የስርዓት ማሳወቂያዎች የሉም።",
    no_recent: "በቅርብ ጊዜ የታዩ ማስታወቂያዎች የሉም።",
    ticket_submit: "የድጋፍ ጥያቄ አስገባ",
    ticket_success_msg: "የድጋፍ ጥያቄዎ በተሳካ ሁኔታ ተመዝግቧል!",
    report_btn: "ችግር ሪፖርት አድርግ",
    logout_confirm: "በደህና ውጣ",
    logout_desc: "እርግጠኛ ነዎት ከመለያዎ መውጣት ይፈልጋሉ? ማስታወቂያዎችዎን ለማስተዳደር ተመልሰው መግባት ይኖርብዎታል።",
    close: "ዝጋ",
    promote_action: "ማስታወቂያ አስተዋውቅ"
  }
};

const FAQ_ITEMS = [
  {
    q_en: "What is Sof Umer?",
    q_om: "Sof Umer maali?",
    q_am: "ሶፍ ኡመር ምንድነው?",
    a_en: "Sof Umer is Ethiopia's trusted local marketplace where people can discover, buy, sell, rent, and connect with businesses and communities securely.",
    a_om: "Sof Umer gabaa naannoo Itoophiyaa amanamaa ta'eedha, daldaltoonni, bitattoonni fi hawaasni adda addaa itti wal-qunnamaniidha.",
    a_am: "ሶፍ ኡመር ሰዎች ንብረቶችን፣ ተሽከርካሪዎችን፣ ስራዎችን እና ምርቶችን የሚያገኙበት፣ የሚገዙበት እና የሚሸጡበት የታመነ የኢትዮጵያ የገበያ ቦታ ነው።"
  },
  {
    q_en: "How do I promote my listing to Premium?",
    q_om: "Beeksisa koo akkamitti beeksisa Premium godha?",
    q_am: "ማስታወቂያዬን እንዴት ወደ ፕሪሚየም ማሳደግ እችላለሁ?",
    a_en: "Go to 'My Listings', click 'Promote Listing', select Bank Transfer (CBE) or Telebirr, and upload your payment transaction reference/screenshot for approval.",
    a_om: "Gara 'Beeksisa Koo' deemi, 'Promote' cuqaasi, kaffaltii CBE ykn Telebirr kaffaluun nagahee screenshot ol-ergi.",
    a_am: "ወደ 'የእኔ ማስታወቂያዎች' ይሂዱ፣ ማስታወቂያ አስተዋውቅ የሚለውን ይጫኑ፣ በባንክ ወይም በቴሌብር ይክፈሉ እና የደረሰኝ ፎቶ ያያይዙ።"
  },
  {
    q_en: "Is listing creation free?",
    q_om: "Beeksisa baasuun bilisaan danda'amaa?",
    q_am: "ማስታወቂያ መለጠፍ በነጻ ነው?",
    a_en: "Yes, standard listing postings on Sof Umer are 100% free of charge. Premium enhancements are fully optional.",
    a_om: "Eeyyee, beeksisa dhiyyeessuun kaffaltii malee bilisa dha. Filannoowwan biroo kaffaltii qabu.",
    a_am: "አዎ፣ በሶፍ ኡመር ላይ መደበኛ ማስታወቂያ መለጠፍ ሙሉ በሙሉ ነፃ ነው። ፕሪሚየም ማሳደጊያዎች አማራጭ ናቸው።"
  },
  {
    q_en: "How long does audit verification take?",
    q_om: "Mirkaneessarra sa'aatii hammam fudhata?",
    q_am: "የማረጋገጫ ግምገማ ምን ያህል ጊዜ ይፈጃል?",
    a_en: "Our safety administrators review all newly created listings within 1 to 4 hours to preserve platform trustworthiness.",
    a_om: "Koreen keenya beeksisa hundumaa qulqullinaaf ni qora. Yeroo baay’ee sa’aatii 1 hanga 4 ni fudhata.",
    a_am: "የማህበረሰቡን ጥራት ለመጠበቅ የእኛ አወያዮች ማስታወቂያዎችን ከ1 እስከ 4 ሰዓታት ባለው ጊዜ ውስጥ ይገመግማሉ።"
  }
];

interface UserDashboardProps {
  initialTab?: 'profile' | 'mylistings' | 'favorites' | 'messages' | 'payments';
  onNavigate: (view: 'marketplace' | 'profile') => void;
  onNavigateToInfo?: (pageId: string) => void;
  onOpenCreateModal?: () => void;
  onSelectProperty?: (property: Property) => void;
}

export default function UserDashboard({ 
  initialTab = 'profile', 
  onNavigate, 
  onNavigateToInfo,
  onOpenCreateModal, 
  onSelectProperty 
}: UserDashboardProps) {
  
  const {
    currentUser,
    setCurrentUser,
    token,
    paymentMethods,
    receipts,
    properties,
    inquiries,
    notifications,
    currentLanguage,
    refreshData,
    logout,
    favorites,
    toggleFavorite,
    setLanguage,
    supportTickets,
    topUpWallet,
    spendWallet,
    systemSettings,
    faqs,
    deleteNotification,
    deleteAllNotifications,
    toggleNotificationRead,
    deleteInquiry,
    deleteAllInquiries,
    t
  } = useApp();

  // Navigation and State Tabs mapping
  const [activeTab, setActiveTab] = useState<string>('profile');

  // Helper to extract localized text from FAQ items (handles both string and object forms)
  const getFaqText = (val: any, targetLang: string) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (targetLang === 'om') return val.om || val.en || val.am || '';
    if (targetLang === 'am') return val.am || val.en || val.om || '';
    return val.en || val.om || val.am || '';
  };

  // Synchronized FAQs with Admin Dashboard (with default fallback items)
  const effectiveFaqs = useMemo(() => {
    if (Array.isArray(faqs) && faqs.length > 0) {
      return faqs.filter(f => f.status !== 'draft');
    }
    return FAQ_ITEMS.map((item, idx) => ({
      id: `default-${idx}`,
      category: 'General',
      question: { en: item.q_en, om: item.q_om, am: item.q_am },
      answer: { en: item.a_en, om: item.a_om, am: item.a_am }
    }));
  }, [faqs]);

  // Promote Boost Plan state
  const [promotePlan, setPromotePlan] = useState<string>('pkg-1');
  const [promoteTopAd, setPromoteTopAd] = useState(false);
  const [promoteFeatured, setPromoteFeatured] = useState(false);
  const [promotePaymentMethod, setPromotePaymentMethod] = useState<'wallet' | 'direct'>('wallet');
  const [promoteError, setPromoteError] = useState('');

  // Top Up Wallet state
  const [topUpAmount, setTopUpAmount] = useState<number | ''>('');
  const [topUpMethodId, setTopUpMethodId] = useState('');
  const [topUpRefNum, setTopUpRefNum] = useState('');
  const [topUpSubmitting, setTopUpSubmitting] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState('');
  const [topUpError, setTopUpError] = useState('');

  // Read message logs locally tracked for unread state
  const [readInquiries, setReadInquiries] = useState<Record<string, number>>(() => {
    const item = localStorage.getItem('sof_umer_read_inquiries');
    return item ? JSON.parse(item) : {};
  });

  // Expandable FAQ state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Expandable Settings Folders state
  const [openSettingFolder, setOpenSettingFolder] = useState<string | null>(null);

  // Read notifications locally tracked for unread status
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    const item = localStorage.getItem('sof_umer_read_notifications');
    return item ? JSON.parse(item) : [];
  });

  // Sync tab with initialTab
  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'profile') setActiveTab('profile');
      else if (initialTab === 'mylistings') setActiveTab('mylistings');
      else if (initialTab === 'favorites') setActiveTab('saveditems');
      else if (initialTab === 'messages') setActiveTab('messages');
      else if (initialTab === 'payments') setActiveTab('payments');
    }
  }, [initialTab]);



  // Translate helpers
  const lang = (currentLanguage === 'om' || currentLanguage === 'am') ? currentLanguage : 'en';
  const tLocal = (key: keyof typeof DICT['en']): string => {
    return DICT[lang][key] || DICT['en'][key];
  };

  // Form states
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(currentUser?.photoUrl || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setProfilePhone(currentUser.phone || '');
      setProfilePhotoUrl(currentUser.photoUrl || '');
    }
  }, [currentUser]);

  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Listing inline edit
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDesc, setEditDesc] = useState<string>('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Promote receipt upload state
  const [promotingProperty, setPromotingProperty] = useState<Property | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [receiptImageSim, setReceiptImageSim] = useState('');
  const [receiptFileData, setReceiptFileData] = useState<{ url: string; fileType: 'image' | 'pdf'; fileName: string; fileSize: number } | null>(null);
  const [receiptSuccess, setReceiptSuccess] = useState('');
  const [receiptSubmitting, setReceiptSubmitting] = useState(false);

  // Inquiry/Chat active conversation
  const [activeInquiryId, setActiveInquiryId] = useState<string | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');
  const [chatSubmitting, setChatSubmitting] = useState(false);

  // Support ticket form states
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);

  // Report issue form states
  const [reportSubject, setReportSubject] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  // Preference switches (simulation)
  const [emailDigests, setEmailDigests] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [searchIndexable, setSearchIndexable] = useState(true);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-[#0d0d12]/90 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl text-white font-sans">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-bounce" />
        <h3 className="text-lg font-bold">Authentication Required</h3>
        <p className="text-xs text-white/50 mt-2 mb-5">Please sign in to view your marketplace account dashboard.</p>
        <button
          onClick={() => onNavigate('profile')}
          className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-3 rounded-2xl transition duration-300 text-xs uppercase tracking-wider cursor-pointer w-full"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  // Data filtering with robust email, user ID, phone & username cross-matching
  const myListings = properties.filter(p => {
    if (!currentUser) return false;
    if ((p as any).isArchived) return false;
    
    // If admin posted on behalf of someone else, exclude from admin's personal dashboard
    if ((p as any).postedOnBehalf && currentUser.role === 'admin' && p.ownerId !== currentUser.id) {
      const emailLower = (currentUser.email || '').toLowerCase();
      if (!p.contactEmail || p.contactEmail.toLowerCase() !== emailLower) {
        return false;
      }
    }

    if (p.ownerId === currentUser.id) return true;
    if (currentUser.email) {
      const emailLower = (currentUser.email || '').toLowerCase();
      if (p.contactEmail && (p.contactEmail || '').toLowerCase() === emailLower) return true;
      if ((p as any).ownerEmail && ((p as any).ownerEmail || '').toLowerCase() === emailLower) return true;
    }
    if (currentUser.phone) {
      const uPhone = currentUser.phone.trim().replace(/[^\d+]/g, '');
      if (uPhone && uPhone.length >= 7) {
        const shortDigits = uPhone.slice(-9);
        if (p.contactPhone && p.contactPhone.trim().replace(/[^\d+]/g, '').endsWith(shortDigits)) return true;
        if ((p as any).ownerPhone && (p as any).ownerPhone.trim().replace(/[^\d+]/g, '').endsWith(shortDigits)) return true;
      }
    }
    return false;
  });

  const mySavedItems = properties.filter(p => favorites?.includes(p.id));

  const myNotifications = notifications.filter(n => {
    if (!currentUser) return false;
    if (n.userId === currentUser.id) return true;
    if (currentUser.email && (n as any).userEmail && ((n as any).userEmail || '').toLowerCase() === (currentUser.email || '').toLowerCase()) return true;
    return false;
  });
  const unreadNotifCount = myNotifications.filter(n => !readNotificationIds.includes(n.id)).length;

  const myInquiries = inquiries.filter(i => {
    if (!currentUser) return false;
    if (i.senderId === currentUser.id || i.receiverId === currentUser.id) return true;
    if (currentUser.email) {
      const emailLower = (currentUser.email || '').toLowerCase();
      if ((i.senderEmail || '').toLowerCase() === emailLower || (i.receiverEmail || '').toLowerCase() === emailLower) return true;
    }
    return false;
  });

  const myReceipts = receipts.filter(r => {
    if (!currentUser) return false;
    if (r.userId === currentUser.id) return true;
    if (currentUser.email && (r as any).userEmail && ((r as any).userEmail || '').toLowerCase() === (currentUser.email || '').toLowerCase()) return true;
    return false;
  });
  
  // Calculate unread chat badge
  const unreadMessagesCount = myInquiries.filter(inq => {
    const lastMsg = inq.messages[inq.messages.length - 1];
    if (!lastMsg) return false;
    const readCount = readInquiries[inq.id] || 0;
    return lastMsg.senderId !== currentUser.id && inq.messages.length > readCount;
  }).length;

  // Track recently viewed properties
  const getRecentlyViewedProperties = () => {
    const stored = localStorage.getItem('sof_umer_recently_viewed_properties');
    if (!stored) return [];
    try {
      const ids: string[] = JSON.parse(stored);
      // Filter out and maintain order
      return ids.map(id => properties.find(p => p.id === id)).filter((p): p is Property => !!p);
    } catch (e) {
      return [];
    }
  };
  const recentListings = getRecentlyViewedProperties();

  // Handle Profile Picture File Selection & Secure Save
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileError('');
    setProfileSuccess('');

    // Format validation (Allowed image formats)
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setProfileError('Invalid image format. Please select a PNG, JPG, WEBP, or GIF image.');
      e.target.value = '';
      return;
    }

    // Size limit validation (Max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setProfileError('File size exceeds 5MB limit. Please upload a smaller image.');
      e.target.value = '';
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result as string;
      if (!base64Url) {
        setUploadingAvatar(false);
        return;
      }

      setProfilePhotoUrl(base64Url);

      // Save securely to backend
      try {
        const authToken = localStorage.getItem('sof_umer_token') || token || '';
        const res = await fetch(`/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({ fullName, phone: profilePhone, photoUrl: base64Url })
        });

        if (res.ok) {
          const updated = await res.json();
          setCurrentUser(updated);
          setProfileSuccess(
            currentLanguage === 'am' ? 'የመገለጫ ፎቶ በተሳካ ሁኔታ ተቀይሯል!' : 
            currentLanguage === 'om' ? 'Suuraan profaayilii milkiidhaan jijjiirameera!' : 
            'Profile picture updated and saved securely!'
          );
          setTimeout(() => setProfileSuccess(''), 4000);
        } else {
          setProfileError('Failed to save updated profile picture.');
        }
      } catch (err) {
        setProfileError('Network error while saving profile picture.');
      } finally {
        setUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    setProfileError('');
    setProfileSuccess('');
    setUploadingAvatar(true);

    try {
      const authToken = localStorage.getItem('sof_umer_token') || token || '';
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ fullName, phone: profilePhone, photoUrl: '' })
      });

      if (res.ok) {
        const updated = await res.json();
        setProfilePhotoUrl('');
        setCurrentUser(updated);
        setProfileSuccess('Profile picture removed.');
        setTimeout(() => setProfileSuccess(''), 3000);
      } else {
        setProfileError('Failed to remove profile picture.');
      }
    } catch (err) {
      setProfileError('Network error occurred.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setProfileSuccess('');
    setProfileError('');
    try {
      const authToken = localStorage.getItem('sof_umer_token') || token || '';
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ fullName, phone: profilePhone, photoUrl: profilePhotoUrl })
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        setProfileSuccess(currentLanguage === 'am' ? 'የመገለጫ ዝርዝሮች በተሳካ ሁኔታ ተሻሽለዋል!' : currentLanguage === 'om' ? 'Profaayiliin kee milkiidhaan haaromeera!' : 'Profile successfully updated!');
        setTimeout(() => setProfileSuccess(''), 3000);
      } else {
        setProfileError('Failed to update profile.');
      }
    } catch (err) {
      setProfileError('Network error occurred.');
    }
  };

  // Handle Change Password (real secure API)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');
    if (!currPassword || !newPassword || !confirmPassword) {
      setPassError('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match!');
      return;
    }
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token') || token}`
        },
        body: JSON.stringify({ currPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setPassError(data.error || 'Failed to update password.');
        return;
      }
      setPassSuccess(data.message || 'Account password successfully updated.');
      setCurrPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(''), 4000);
    } catch (err: any) {
      setPassError('Network error occurred. Please try again.');
    }
  };

  // Handle Listing Actions
  const handleToggleListingActive = async (property: Property) => {
    const isPaused = property.description?.includes('**PAUSED**');
    const updatedDesc = isPaused 
      ? property.description.replace('**PAUSED**\n', '') 
      : `**PAUSED**\n${property.description || ''}`;
    
    try {
      const authToken = localStorage.getItem('sof_umer_token') || token || '';
      const res = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ description: updatedDesc })
      });
      if (res.ok) refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleListingSold = async (property: Property) => {
    const isSold = property.description?.includes('**SOLD**');
    let updatedDesc = property.description || '';
    if (isSold) {
      updatedDesc = updatedDesc.replace('**SOLD**\n', '');
    } else {
      updatedDesc = `**SOLD**\n${updatedDesc}`;
    }
    
    try {
      const authToken = localStorage.getItem('sof_umer_token') || token || '';
      const res = await fetch(`/api/properties/${property.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ description: updatedDesc })
      });
      if (res.ok) refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveListingEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    setEditSubmitting(true);
    try {
      const authToken = localStorage.getItem('sof_umer_token') || token || '';
      const res = await fetch(`/api/properties/${editingProperty.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ price: Number(editPrice), description: editDesc })
      });
      if (res.ok) {
        setEditingProperty(null);
        refreshData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      const authToken = localStorage.getItem('sof_umer_token') || token || '';
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) refreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Promotion Boost Plan payment
  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingProperty) return;
    setReceiptSubmitting(true);
    setPromoteError('');
    setReceiptSuccess('');

    const DEFAULT_AD_PACKAGES = [
      { id: 'starter', name: 'STARTER', price: 100, currency: 'ETB', duration: '3 days', daysCount: 3, views: 'Category top placement', badge: 'STARTER', desc: 'Category top placement + Basic Verified Badge' },
      { id: 'premium', name: 'PREMIUM', price: 150, currency: 'ETB', duration: '7 days', daysCount: 7, views: 'Featured hero slider', badge: 'PREMIUM', desc: 'Featured hero slider + High priority ranking' },
      { id: 'vip', name: 'VIP ELITE', price: 500, currency: 'ETB', duration: '30 days', daysCount: 30, views: 'Top search billboard pin', badge: 'VIP ELITE', desc: 'Top search billboard pin + Full site promotion' }
    ];

    const rawPackages = (systemSettings?.adPackages && systemSettings.adPackages.length > 0)
      ? systemSettings.adPackages.filter((p: any) => p.name !== 'New Custom Promotion Package' && !p.name.includes('Custom'))
      : DEFAULT_AD_PACKAGES;

    const dynamicPackages = rawPackages.length > 0 ? rawPackages : DEFAULT_AD_PACKAGES;

    const activePlans = dynamicPackages.map((pkg: any) => ({
      id: pkg.id || pkg.name,
      name: pkg.name,
      cost: Number(pkg.price) || 0,
      days: pkg.duration || '7 Days',
      daysCount: pkg.daysCount || (pkg.duration?.includes('30') ? 30 : pkg.duration?.includes('3') ? 3 : 7),
      badge: pkg.badge || 'PROMO',
      desc: pkg.desc || `Promotional ad package on ${pkg.name} (${pkg.duration || '7 days'})`
    }));

    const selectedPlanObj = activePlans.find((p: any) => p.id === promotePlan || p.name === promotePlan) || activePlans[0];
    const basePrice = selectedPlanObj ? selectedPlanObj.cost : 0;

    const topAdPrice = systemSettings?.marketplaceSettings?.topAdPrice ?? 150;
    const featuredPrice = systemSettings?.marketplaceSettings?.featuredAdPrice ?? 300;

    const addonsPrice = (promoteTopAd ? topAdPrice : 0) + (promoteFeatured ? featuredPrice : 0);
    const totalCost = basePrice + addonsPrice;

    if (promotePaymentMethod === 'wallet') {
      if ((currentUser.walletBalance || 0) < totalCost) {
        setPromoteError(`Insufficient wallet balance! You have ${currentUser.walletBalance || 0} ETB, but this plan costs ${totalCost} ETB. Please top up your wallet or choose Direct Bank Transfer.`);
        setReceiptSubmitting(false);
        return;
      }
      try {
        const durationDays = parseInt(selectedPlanObj?.days) || 7;
        const success = await spendWallet(
          totalCost,
          `Boost Plan (${selectedPlanObj?.name || 'Promotion Package'}) for ${promotingProperty.title}`,
          promotingProperty.id,
          selectedPlanObj?.id || 'vip',
          durationDays
        );
        if (success) {
          setReceiptSuccess('Listing successfully boosted with wallet credits! Your ad visibility has been upgraded.');
          refreshData();
          setTimeout(() => {
            setReceiptSuccess('');
            setPromotingProperty(null);
          }, 3000);
        } else {
          setPromoteError('Failed to process promotion payment with wallet.');
        }
      } catch (err: any) {
        setPromoteError(err.message || 'Error processing wallet payment.');
      } finally {
        setReceiptSubmitting(false);
      }
    } else {
      // Direct Bank Transfer
      if (!selectedMethodId) {
        setPromoteError('Please select a bank or mobile money account.');
        setReceiptSubmitting(false);
        return;
      }
      if (!receiptImageSim.trim() && !receiptFileData?.url) {
        setPromoteError('Please enter a transaction reference number or upload a payment receipt file.');
        setReceiptSubmitting(false);
        return;
      }
      const method = paymentMethods.find(m => m.id === selectedMethodId);
      try {
        const res = await fetch('/api/receipts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            userEmail: currentUser.email,
            userName: currentUser.fullName,
            amount: totalCost,
            paymentMethodId: selectedMethodId,
            paymentMethodName: method?.name || 'Bank Transfer',
            relatedPropertyId: promotingProperty.id,
            relatedPropertyTitle: promotingProperty.title,
            referenceNumber: receiptImageSim.trim() || undefined,
            receiptUrlOrFile: receiptFileData?.url || receiptImageSim.trim(),
            fileType: receiptFileData?.fileType || 'image',
            fileName: receiptFileData?.fileName,
            fileSize: receiptFileData?.fileSize
          })
        });
        if (res.ok) {
          setReceiptSuccess('Payment receipt submitted successfully! Admin will verify and activate your boost.');
          setReceiptImageSim('');
          setReceiptFileData(null);
          refreshData();
          setTimeout(() => {
            setReceiptSuccess('');
            setPromotingProperty(null);
          }, 3000);
        } else {
          setPromoteError('Failed to submit receipt.');
        }
      } catch (e) {
        console.error(e);
        setPromoteError('Error submitting promotion receipt.');
      } finally {
        setReceiptSubmitting(false);
      }
    }
  };

  // Chat/Messages handlers
  const handleOpenConversation = (inqId: string) => {
    setActiveInquiryId(inqId);
    const inq = inquiries.find(i => i.id === inqId);
    if (inq) {
      const updated = { ...readInquiries, [inqId]: inq.messages.length };
      setReadInquiries(updated);
      localStorage.setItem('sof_umer_read_inquiries', JSON.stringify(updated));
    }
  };

  const handleSendChatReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInquiryId || !chatMessageText.trim()) return;
    setChatSubmitting(true);
    const inq = inquiries.find(i => i.id === activeInquiryId);
    if (!inq) return;
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: inq.propertyId,
          propertyTitle: inq.propertyTitle,
          senderId: currentUser.id,
          senderName: currentUser.fullName,
          receiverId: currentUser.id === inq.senderId ? inq.receiverId : inq.senderId,
          messageText: chatMessageText.trim()
        })
      });
      if (res.ok) {
        setChatMessageText('');
        refreshData();
        // Automatically mark as read immediately
        setTimeout(() => {
          const freshInq = inquiries.find(i => i.id === activeInquiryId);
          if (freshInq) {
            const updated = { ...readInquiries, [activeInquiryId]: freshInq.messages.length };
            setReadInquiries(updated);
            localStorage.setItem('sof_umer_read_inquiries', JSON.stringify(updated));
          }
        }, 100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChatSubmitting(false);
    }
  };

  // Support Tickets logging
  const handleSupportTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setTicketSubmitting(true);
    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email, subject: ticketSubject.trim(), message: ticketMessage.trim() })
      });
      if (res.ok) {
        setTicketSuccess(tLocal('ticket_success_msg'));
        setTicketSubject('');
        setTicketMessage('');
        refreshData();
        setTimeout(() => setTicketSuccess(''), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTicketSubmitting(false);
    }
  };

  // Report issue handler
  const handleReportProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportSubject.trim() || !reportDetails.trim()) return;
    setReportSuccess('Thank you for reporting this issue. Our team has received your logs and is reviewing it.');
    setReportSubject('');
    setReportDetails('');
    setTimeout(() => setReportSuccess(''), 4000);
  };

  // Top Up Wallet handler
  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount || Number(topUpAmount) <= 0 || !topUpMethodId) {
      setTopUpError('Please select a payment method and enter a valid top-up amount.');
      return;
    }
    const method = paymentMethods.find(m => m.id === topUpMethodId);
    setTopUpSubmitting(true);
    setTopUpError('');
    setTopUpSuccess('');
    try {
      const success = await topUpWallet(
        Number(topUpAmount),
        topUpMethodId,
        method?.name || 'Bank Transfer',
        undefined,
        topUpRefNum
      );
      if (success) {
        setTopUpSuccess('Top-up request submitted successfully! Your balance will be credited after admin confirmation.');
        setTopUpAmount('');
        setTopUpRefNum('');
        refreshData();
      } else {
        setTopUpError('Failed to submit top-up request. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setTopUpError('An error occurred while submitting top-up request.');
    } finally {
      setTopUpSubmitting(false);
    }
  };

  // Mark notifications read
  const handleMarkAllNotificationsRead = () => {
    const ids = myNotifications.map(n => n.id);
    setReadNotificationIds(ids);
    localStorage.setItem('sof_umer_read_notifications', JSON.stringify(ids));
  };

  const activeMethods = paymentMethods.filter(m => m.isActive);

  // List of the sections in precise required order
  const SECTIONS = [
    { id: 'profile', label_en: 'Profile', label_om: 'Profaayilii', label_am: 'መገለጫ', icon: <User className="w-4 h-4" /> },
    { id: 'mylistings', label_en: 'My Listings', label_om: 'Beeksisa Koo', label_am: 'የእኔ ማስታወቂያዎች', icon: <List className="w-4 h-4" />, badge: myListings.length },
    { id: 'payments', label_en: 'Wallet & Payments', label_om: 'Kaffaltii & Boorsaa', label_am: 'የእኔ ቦርሳ እና ክፍያዎች', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'saveditems', label_en: 'Saved Items', label_om: 'Meeshaawwan Qubaman', label_am: 'የተቀመጡ ማስታወቂያዎች', icon: <Heart className="w-4 h-4" />, badge: mySavedItems.length },
    { id: 'messages', label_en: 'Messages', label_om: 'Ergawwan', label_am: 'መልእክቶች', icon: <MessageSquare className="w-4 h-4" />, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined, badgeColor: 'bg-red-500 text-white' },
    { id: 'notifications', label_en: 'Notifications', label_om: 'Beeksisa Caffee', label_am: 'ማሳወቂያዎች', icon: <Bell className="w-4 h-4" />, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined, badgeColor: 'bg-amber-500 text-black' },
    { id: 'recentlyviewed', label_en: 'Recently Viewed', label_om: 'Dhiyeenatti Daawwatame', label_am: 'በቅርቡ የታዩ', icon: <Clock className="w-4 h-4" /> },
    { id: 'supportsafety', label_en: 'Support & Safety', label_om: 'Deggarsa & Nageenya', label_am: 'ድጋፍ እና ደህንነት', icon: <Shield className="w-4 h-4" /> },
    { id: 'settings', label_en: 'Settings', label_om: 'Sajatoo', label_am: 'ቅንብሮች', icon: <Settings className="w-4 h-4" /> },
    { id: 'logout', label_en: 'Log Out', label_om: 'Ba’i', label_am: 'ውጣ', icon: <LogOut className="w-4 h-4 text-red-400" /> }
  ];

  const getSectionLabel = (sec: typeof SECTIONS[0]) => {
    if (lang === 'om') return sec.label_om;
    if (lang === 'am') return sec.label_am;
    return sec.label_en;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-[#F5F5F4] text-left">
      
      {/* Cover Header Banner displaying customer profile photo and full name at the top (Strictly no generic "User"/"Agent") */}
      <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-[#12121a] to-black border border-white/5 p-6 md:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()} title="Click to upload profile picture">
            {profilePhotoUrl ? (
              <img 
                src={profilePhotoUrl} 
                alt={currentUser.fullName} 
                referrerPolicy="no-referrer"
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-amber-500/20 shadow-xl group-hover:opacity-80 transition" 
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-black flex items-center justify-center text-xl md:text-2xl shadow-xl border border-amber-500/20 group-hover:opacity-80 transition">
                {currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <span className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-black ${currentUser.isVerified ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
          </div>

          <div>
            <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase block mb-1">REGISTERED CUSTOMER</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {currentUser.fullName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 font-mono">{currentUser.email}</span>
              {currentUser.isVerified ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{tLocal('verified_badge')}</span>
                </span>
              ) : currentUser.verificationStatus === 'pending' ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Clock className="w-3 h-3" />
                  <span>{tLocal('pending_badge')}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase bg-white/5 text-white/40 px-2 py-0.5 rounded-full border border-white/5">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{tLocal('unverified_badge')}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick status counters */}
        <div className="flex gap-4 relative z-10">
          <div className="px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-center min-w-[90px]">
            <span className="text-xs text-white/40 block">Listings</span>
            <span className="text-xl font-bold text-white">{myListings.length}</span>
          </div>
          <div className="px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-center min-w-[90px]">
            <span className="text-xs text-white/40 block">Favorites</span>
            <span className="text-xl font-bold text-white">{mySavedItems.length}</span>
          </div>
          <div className="px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-center min-w-[90px]">
            <span className="text-xs text-white/40 block">Inbox Chats</span>
            <span className="text-xl font-bold text-white">{myInquiries.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar (Desktop: Left Rail / Mobile: Premium grid for instant selection) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0d0d12]/95 border border-white/5 p-4 rounded-3xl shadow-xl">
            <h3 className="text-[10px] font-black uppercase text-white/40 tracking-wider mb-4 px-2">Account Center Menu</h3>
            
            {/* Desktop Menu List / Mobile Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
              {SECTIONS.map((sec) => {
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      if (sec.id === 'logout') {
                        logout();
                        onNavigate('marketplace');
                      } else {
                        setActiveTab(sec.id);
                        // scroll on mobile devices for ease of navigation
                        if (window.innerWidth < 1024) {
                          const el = document.getElementById('dashboard-main-content-pane');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-between cursor-pointer group ${
                      isActive 
                        ? 'bg-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/5' 
                        : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`${isActive ? 'text-black' : 'text-amber-500/80 group-hover:text-amber-500'} transition`}>
                        {sec.icon}
                      </span>
                      <span className="truncate">{getSectionLabel(sec)}</span>
                    </div>
                    {sec.badge !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-black font-mono leading-none ${sec.badgeColor || 'bg-white/10 text-white'}`}>
                        {sec.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Pane Panel */}
        <div id="dashboard-main-content-pane" className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0d0d12]/95 border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl text-left"
            >
              
              {/* SECTION 1: PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Profile Details</h3>
                      <p className="text-[11px] text-white/40 mt-0.5">Manage your user registration credentials and marketplace identity.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/40 p-5 rounded-2xl border border-white/5">
                    <div>
                      <span className="text-[10px] font-bold text-white/40 uppercase block mb-1 font-mono">Full Name</span>
                      <p className="text-sm font-semibold text-white">{currentUser.fullName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-white/40 uppercase block mb-1 font-mono">Email Address</span>
                      <p className="text-sm font-semibold text-white/80">{currentUser.email}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-white/40 uppercase block mb-1 font-mono">Phone Number</span>
                      <p className="text-sm font-semibold text-white">{currentUser.phone || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-white/40 uppercase block mb-1 font-mono">Member Since</span>
                      <p className="text-sm font-semibold text-white/60">{new Date(currentUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Profile Picture Upload & Management Card */}
                  <div className="bg-gradient-to-r from-[#12121a] to-black/80 border border-white/10 p-5 rounded-2xl shadow-xl">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="relative shrink-0">
                        {profilePhotoUrl ? (
                          <img 
                            src={profilePhotoUrl} 
                            alt={currentUser.fullName} 
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-xl" 
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-black font-black flex items-center justify-center text-2xl shadow-xl border border-amber-500/30">
                            {currentUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-amber-500" />
                            <span>User Profile Picture</span>
                          </h4>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                            Saved to Account
                          </span>
                        </div>

                        <p className="text-xs text-white/70">
                          Upload a photo from your device gallery or files to personalize your account across the marketplace.
                        </p>
                        <p className="text-[10px] text-white/40 font-mono">
                          Allowed formats: PNG, JPG, JPEG, WEBP, GIF • Max size: 5 MB
                        </p>

                        {/* Hidden File Input */}
                        <input 
                          type="file" 
                          ref={avatarInputRef}
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                          onChange={handleAvatarFileChange}
                          className="hidden" 
                        />

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                          <button 
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={uploadingAvatar}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-lg cursor-pointer uppercase tracking-wider disabled:opacity-50"
                          >
                            <UploadCloud className="w-4 h-4" />
                            <span>{uploadingAvatar ? 'Uploading...' : profilePhotoUrl ? 'Change Profile Picture' : 'Add Profile Picture'}</span>
                          </button>

                          {profilePhotoUrl && (
                            <button 
                              type="button"
                              onClick={handleRemoveAvatar}
                              disabled={uploadingAvatar}
                              className="px-3.5 py-2 bg-white/5 hover:bg-rose-500/20 text-rose-400 border border-white/10 hover:border-rose-500/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove Photo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Edit Profile Sub-Section */}
                  <div className="border-t border-white/5 pt-6">
                    <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider mb-4">Edit Profile Information</h4>
                    
                    {profileSuccess && <p className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl mb-4 text-center">{profileSuccess}</p>}
                    {profileError && <p className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl mb-4 text-center">{profileError}</p>}

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase mb-1.5 font-mono">Full Name</label>
                          <input 
                            type="text" 
                            required 
                            value={fullName} 
                            onChange={e => setFullName(e.target.value)} 
                            className="w-full p-3 bg-black border border-white/5 focus:border-amber-500/30 text-xs text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500/20" 
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase mb-1.5 font-mono">Phone Number</label>
                          <input 
                            type="text" 
                            value={profilePhone} 
                            onChange={e => setProfilePhone(e.target.value)} 
                            placeholder="+251 912 345 678"
                            className="w-full p-3 bg-black border border-white/5 focus:border-amber-500/30 text-xs text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500/20" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase mb-1.5 font-mono">Profile Image URL</label>
                        <input 
                          type="text" 
                          value={profilePhotoUrl} 
                          onChange={e => setProfilePhotoUrl(e.target.value)} 
                          placeholder="https://images.unsplash.com/... / portrait.jpg"
                          className="w-full p-3 bg-black border border-white/5 focus:border-amber-500/30 text-xs text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500/20 font-mono" 
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                      >
                        {tLocal('save_changes')}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* SECTION 2: MY LISTINGS */}
              {activeTab === 'mylistings' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">My Listings</h3>
                      <p className="text-[11px] text-white/40 mt-0.5">Edit, pause, promote or delete your properties and assets.</p>
                    </div>
                    {onOpenCreateModal && (
                      <button 
                        onClick={onOpenCreateModal}
                        className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-black px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Post New Listing</span>
                      </button>
                    )}
                  </div>

                  {/* Dynamic Free Listing Campaign Status & Quota Banner */}
                  {(() => {
                    const fls = systemSettings?.freeListingSettings || { enabled: true, maxFreeListingsPerUser: 5, startDate: '2026-08-01', endDate: '2026-08-31' };
                    const campaignInfo = getCampaignStatusInfo(fls);
                    const maxFree = campaignInfo.maxListings;
                    const userFreeUsed = myListings.filter(p => !p.description?.includes('**PAUSED**')).length;
                    const remainingFree = Math.max(0, maxFree - userFreeUsed);

                    return (
                      <div className="bg-gradient-to-r from-amber-500/10 via-black/40 to-emerald-500/10 border border-amber-500/30 p-5 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative z-10">
                          <div className="space-y-1.5 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold font-mono uppercase border ${campaignInfo.badgeColor}`}>
                                Campaign Status: {campaignInfo.status}
                              </span>
                              <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                {campaignInfo.displayText}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>
                                {campaignInfo.isUpcoming && `🎉 Free Listing Campaign`}
                                {campaignInfo.isActive && (campaignInfo.isLastDay ? `⚠️ Last day of the Free Listing Campaign!` : `🎉 Free Listing Campaign is LIVE!`)}
                                {campaignInfo.isExpired && `Free Listing Campaign has ended.`}
                              </span>
                            </h4>
                            <p className="text-xs text-white/70">
                              <span className="font-semibold text-white/90">Campaign Period:</span> {campaignInfo.startDateFormatted} → {campaignInfo.endDateFormatted}
                            </p>
                          </div>

                          <div className="bg-black/60 border border-white/10 p-3.5 rounded-2xl text-center shrink-0 min-w-[200px]">
                            <span className="text-[10px] uppercase font-bold text-white/40 block mb-1">Free Listing Quota</span>
                            <div className="flex justify-center items-center gap-2 text-xs font-mono font-extrabold">
                              <span className="text-white/60">Used: <strong className="text-amber-400">{userFreeUsed} / {maxFree}</strong></span>
                              <span className="text-white/30">•</span>
                              <span className="text-emerald-400">Remaining: <strong className="text-white">{remainingFree}</strong></span>
                            </div>
                            {campaignInfo.isActive && (
                              <p className="text-[9px] text-emerald-400/90 font-medium mt-1">
                                You can publish up to {remainingFree} free listings.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Listings Grid */}
                  {myListings.length === 0 ? (
                    <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/5">
                      <List className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-xs text-white/40">{tLocal('no_listings')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myListings.map(p => {
                        const desc = p.description || '';
                        const isPaused = desc.includes('**PAUSED**');
                        const isSold = desc.includes('**SOLD**') || desc.includes('**COMPLETED**');
                        const isDraft = desc.includes('**DRAFT**');
                        const isExpired = desc.includes('**EXPIRED**');
                        const isEditedReapproval = (p.approvalStatus === 'pending' || p.verificationStatus === 'pending') && ((p as any).lastEditReason === 'Edited after approval' || ((p as any).editHistory && (p as any).editHistory.length > 0));

                        let statusBadge = <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Active</span>;
                        if (isPaused) statusBadge = <span className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Paused</span>;
                        if (isSold) statusBadge = <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Sold</span>;
                        if (isDraft) statusBadge = <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Draft</span>;
                        if (isExpired) statusBadge = <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Expired</span>;
                        if (isEditedReapproval) {
                          statusBadge = <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase animate-pulse">Pending Re-Approval (Edited)</span>;
                        } else if (p.verificationStatus === 'pending' || p.approvalStatus === 'pending') {
                          statusBadge = <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Pending Audit</span>;
                        }
                        if (p.verificationStatus === 'rejected' || p.approvalStatus === 'rejected') statusBadge = <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">Rejected</span>;

                        return (
                          <div key={p.id} className="bg-black/30 hover:bg-black/50 border border-white/5 rounded-2xl p-4 transition duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex gap-4 items-center">
                              {p.images && p.images[0] ? (
                                <img src={p.images[0]} alt={p.title} className="w-14 h-14 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-amber-500/70 border border-white/5">
                                  <HomeIcon className="w-6 h-6" />
                                </div>
                              )}
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-white hover:text-amber-400 cursor-pointer transition line-clamp-1" onClick={() => onSelectProperty?.(p)}>
                                    {p.title}
                                  </span>
                                  {statusBadge}
                                </div>
                                <p className="text-[11px] text-amber-500 font-bold mt-1 font-mono">{Number(p.price).toLocaleString()} ETB</p>
                                <p className="text-[10px] text-white/30 mt-0.5">{p.majorCategory} • {p.propertyType} • {p.location}</p>
                              </div>
                            </div>

                            {/* Responsive Actions bar */}
                            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                              <button 
                                onClick={() => {
                                  setEditingProperty(p);
                                  setEditPrice(p.price);
                                  setEditDesc(p.description || '');
                                }}
                                className="p-2 bg-white/5 hover:bg-white/10 text-white hover:text-amber-400 border border-white/5 rounded-xl transition text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              
                              <button 
                                onClick={() => handleToggleListingActive(p)}
                                className="p-2 bg-white/5 hover:bg-white/10 text-white hover:text-amber-400 border border-white/5 rounded-xl transition text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-zinc-400" />}
                                <span>{isPaused ? 'Activate' : 'Pause'}</span>
                              </button>

                              <button 
                                onClick={() => handleToggleListingSold(p)}
                                className={`p-2 border rounded-xl transition text-[11px] flex items-center gap-1 cursor-pointer ${
                                  isSold 
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                                    : 'bg-white/5 text-white/70 border-white/5 hover:bg-white/10'
                                }`}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isSold ? 'Mark Active' : 'Mark Sold'}</span>
                              </button>

                              <button 
                                onClick={() => {
                                  setPromotingProperty(p);
                                  setReceiptSuccess('');
                                }}
                                className="p-2 bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/15 rounded-xl transition text-[11px] flex items-center gap-1 cursor-pointer font-bold"
                              >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Promote</span>
                              </button>

                              <button 
                                onClick={() => handleDeleteProperty(p.id)}
                                className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/15 rounded-xl transition text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Inline Promote Listing Screen overlay */}
                  {promotingProperty && (() => {
                    const topAdPrice = systemSettings?.marketplaceSettings?.topAdPrice ?? 150;
                    const featuredPrice = systemSettings?.marketplaceSettings?.featuredAdPrice ?? 300;

                    const dynamicPackages = (systemSettings?.adPackages && systemSettings.adPackages.length > 0)
                      ? systemSettings.adPackages
                      : (() => {
                          try {
                            const saved = localStorage.getItem('sof_umer_ad_packages');
                            if (saved) return JSON.parse(saved);
                          } catch (e) {}
                          return [
                            { id: 'starter', name: 'STARTER', price: 100, currency: 'ETB', duration: '3 days', views: 'Category top placement', badge: 'STARTER', desc: 'Category top placement + Basic Verified Badge' },
                            { id: 'premium', name: 'PREMIUM', price: 150, currency: 'ETB', duration: '7 days', views: 'Featured hero slider', badge: 'PREMIUM', desc: 'Featured hero slider + High priority ranking' },
                            { id: 'vip', name: 'VIP ELITE', price: 500, currency: 'ETB', duration: '30 days', views: 'Top search billboard pin', badge: 'VIP ELITE', desc: 'Top search billboard pin + Full site promotion' }
                          ];
                        })();

                    const plans = dynamicPackages.map((pkg: any) => ({
                      id: pkg.id || pkg.name,
                      name: pkg.name,
                      cost: Number(pkg.price) || 0,
                      days: pkg.duration || '7 Days',
                      badge: pkg.badge || (pkg.price >= 3000 ? 'VIP' : pkg.price >= 1000 ? 'POPULAR' : 'PROMO'),
                      desc: pkg.desc || `Promotional ad package: ${pkg.name} (${pkg.duration || '7 days'})`
                    }));

                    const selectedPlanObj = plans.find((p: any) => p.id === promotePlan || p.name === promotePlan) || plans[0];
                    const basePrice = selectedPlanObj ? selectedPlanObj.cost : 0;

                    const addonsPrice = (promoteTopAd ? topAdPrice : 0) + (promoteFeatured ? featuredPrice : 0);
                    const totalCost = basePrice + addonsPrice;

                    return (
                      <div className="bg-[#0c0c12] p-6 sm:p-8 rounded-3xl border border-amber-500/30 mt-6 shadow-2xl animate-fade-in relative">
                        <button 
                          type="button"
                          onClick={() => setPromotingProperty(null)}
                          className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
                            <Zap className="w-5 h-5 fill-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-white">Promote & Feature Listing</h4>
                            <p className="text-xs text-white/50">Promoting: <span className="text-amber-400 font-bold">{promotingProperty.title}</span></p>
                          </div>
                        </div>

                        <p className="text-xs text-white/60 mb-6">Select a promotion package configured by site administration in Ads & Campaigns to increase listing visibility and close deals faster.</p>

                        {receiptSuccess && (
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl mb-6 text-center font-bold flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{receiptSuccess}</span>
                          </div>
                        )}

                        {promoteError && (
                          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-2xl mb-6 text-center font-medium flex items-center justify-center gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <span>{promoteError}</span>
                          </div>
                        )}

                        <form onSubmit={handleSubmitReceipt} className="space-y-6">
                          {/* SECTION 1: BOOST PLANS SET BY ADMIN */}
                          <div>
                            <label className="block text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-3 font-mono">
                              1. Select Admin Promotion Package *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {plans.map(p => {
                                const isSel = (promotePlan || plans[0]?.id) === p.id;
                                return (
                                  <div
                                    key={p.id}
                                    onClick={() => setPromotePlan(p.id)}
                                    className={`p-4 rounded-2xl border flex flex-col justify-between transition cursor-pointer ${
                                      isSel 
                                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10' 
                                        : 'bg-black/40 border-white/10 hover:border-white/20 text-white/70'
                                    }`}
                                  >
                                    <div>
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                                          {p.badge}
                                        </span>
                                        <span className="text-[10px] font-mono text-white/50">{p.days}</span>
                                      </div>
                                      <h5 className="font-extrabold text-sm text-white mb-1">{p.name}</h5>
                                      <p className="text-[11px] text-white/50 leading-relaxed mb-3">{p.desc}</p>
                                    </div>
                                    <div className="pt-3 border-t border-white/5 font-mono text-lg font-black text-amber-400">
                                      {p.cost} ETB
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* SECTION 2: OPTIONAL ADD-ONS */}
                          <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-3">
                            <span className="text-xs font-bold text-white uppercase tracking-wider block font-mono">2. Optional Visibility Add-ons</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <label className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${promoteTopAd ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-black/20 border-white/5 text-white/60'}`}>
                                <div className="flex items-center gap-2.5 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={promoteTopAd}
                                    onChange={e => setPromoteTopAd(e.target.checked)}
                                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                                  />
                                  <div>
                                    <span className="font-bold block">Top Search Pin</span>
                                    <span className="text-[10px] text-white/40">Pin to top position of search queries</span>
                                  </div>
                                </div>
                                <span className="font-mono text-xs font-bold text-amber-400">+{topAdPrice} ETB</span>
                              </label>

                              <label className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${promoteFeatured ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-black/20 border-white/5 text-white/60'}`}>
                                <div className="flex items-center gap-2.5 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={promoteFeatured}
                                    onChange={e => setPromoteFeatured(e.target.checked)}
                                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                                  />
                                  <div>
                                    <span className="font-bold block">Homepage Spotlight</span>
                                    <span className="text-[10px] text-white/40">Feature on primary homepage banner</span>
                                  </div>
                                </div>
                                <span className="font-mono text-xs font-bold text-amber-400">+{featuredPrice} ETB</span>
                              </label>
                            </div>
                          </div>

                          {/* SECTION 3: TOTAL INVESTMENT SUMMARY */}
                          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-500/30 flex justify-between items-center">
                            <div>
                              <span className="text-xs font-bold text-white uppercase block font-mono">Total Boost Investment</span>
                              <span className="text-[10px] text-amber-300/70">Includes plan duration and selected add-ons</span>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-amber-400 font-mono">{totalCost} ETB</span>
                            </div>
                          </div>

                          {/* SECTION 4: PAYMENT METHOD SELECTION */}
                          <div className="space-y-4 pt-2 border-t border-white/5">
                            <label className="block text-xs font-bold text-amber-500 uppercase tracking-widest font-mono">
                              3. Select Payment Method *
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => setPromotePaymentMethod('wallet')}
                                className={`p-4 rounded-2xl border flex items-center gap-3 transition cursor-pointer text-left ${
                                  promotePaymentMethod === 'wallet' 
                                    ? 'bg-amber-500/15 border-amber-500 text-white' 
                                    : 'bg-black/40 border-white/5 text-white/60 hover:bg-black/60'
                                }`}
                              >
                                <CreditCard className="w-6 h-6 text-amber-400 shrink-0" />
                                <div>
                                  <span className="font-bold text-xs block">Marketplace Wallet (Instant)</span>
                                  <span className="text-[10px] text-white/50 block font-mono">
                                    Balance: {currentUser.walletBalance?.toLocaleString() || 0} ETB
                                  </span>
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => setPromotePaymentMethod('direct')}
                                className={`p-4 rounded-2xl border flex items-center gap-3 transition cursor-pointer text-left ${
                                  promotePaymentMethod === 'direct' 
                                    ? 'bg-amber-500/15 border-amber-500 text-white' 
                                    : 'bg-black/40 border-white/5 text-white/60 hover:bg-black/60'
                                }`}
                              >
                                <Building className="w-6 h-6 text-amber-400 shrink-0" />
                                <div>
                                  <span className="font-bold text-xs block">Bank Transfer / Telebirr</span>
                                  <span className="text-[10px] text-white/50 block">Upload FT / Reference Code</span>
                                </div>
                              </button>
                            </div>

                            {/* Wallet Payment View */}
                            {promotePaymentMethod === 'wallet' && (
                              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                  <span className="text-white/60">Your Wallet Balance:</span>
                                  <span className="font-mono font-bold text-white">{currentUser.walletBalance?.toLocaleString() || 0} ETB</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-white/60">Required Deduction:</span>
                                  <span className="font-mono font-bold text-amber-400">-{totalCost} ETB</span>
                                </div>
                                {(currentUser.walletBalance || 0) < totalCost ? (
                                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <span>⚠️ Insufficient wallet balance!</span>
                                    <button
                                      type="button"
                                      onClick={() => setActiveTab('payments')}
                                      className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-[10px] font-bold font-mono uppercase"
                                    >
                                      Top Up Wallet
                                    </button>
                                  </div>
                                ) : (
                                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-xl mt-2 font-medium">
                                    ✅ Sufficient balance! Clicking submit will instantly apply this boost plan to your listing.
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Direct Transfer View */}
                            {promotePaymentMethod === 'direct' && (
                              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-4 text-xs">
                                <div>
                                  <label className="block text-[10px] font-bold text-white/50 uppercase mb-1.5 font-mono">
                                    Select Official Bank / Telebirr Account *
                                  </label>
                                  <select 
                                    required 
                                    value={selectedMethodId} 
                                    onChange={e => setSelectedMethodId(e.target.value)} 
                                    className="w-full p-3 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none focus:border-amber-500/30 font-mono"
                                  >
                                    <option value="">-- Choose Account --</option>
                                    {activeMethods.map(m => (
                                      <option key={m.id} value={m.id}>{m.name} ({m.accountNumber})</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="col-span-1 sm:col-span-2 pt-2">
                                  <ReceiptUploadInput
                                    referenceNumber={receiptImageSim}
                                    onReferenceChange={setReceiptImageSim}
                                    receiptFile={receiptFileData?.url || ''}
                                    fileName={receiptFileData?.fileName}
                                    fileType={receiptFileData?.fileType}
                                    fileSize={receiptFileData?.fileSize}
                                    onFileChange={(data) => setReceiptFileData(data)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* SUBMIT ACTIONS */}
                          <div className="flex flex-wrap gap-3 pt-2">
                            <button 
                              type="submit" 
                              disabled={receiptSubmitting || (promotePaymentMethod === 'wallet' && (currentUser.walletBalance || 0) < totalCost)}
                              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 shadow-lg shadow-amber-500/10"
                            >
                              {receiptSubmitting ? (
                                'Processing...'
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 fill-black" />
                                  <span>{promotePaymentMethod === 'wallet' ? `Pay ${totalCost} ETB & Boost Now` : `Submit Receipt (${totalCost} ETB)`}</span>
                                </>
                              )}
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setPromotingProperty(null)}
                              className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>

                        {/* Display historic Receipts for this user */}
                        {myReceipts.length > 0 && (
                          <div className="border-t border-white/5 mt-6 pt-4 text-left">
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-wider block mb-2 font-mono">Previous Promotion Receipts</span>
                            <div className="space-y-2 max-h-[120px] overflow-y-auto">
                              {myReceipts.map(rc => (
                                <div key={rc.id} className="p-2.5 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center text-[11px]">
                                  <span className="font-semibold text-white/80">{rc.relatedPropertyTitle}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-amber-500 font-bold font-mono">{rc.amount} ETB</span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${rc.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : rc.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-500'}`}>
                                      {rc.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Listing Inline Edit Form overlay */}
                  {editingProperty && (
                    <div className="bg-black/95 p-6 rounded-2xl border border-white/10 mt-6 animate-fade-in relative">
                      <button 
                        onClick={() => setEditingProperty(null)}
                        className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <h4 className="text-sm font-bold text-white mb-1">Edit Listing Details</h4>
                      <p className="text-[10px] text-white/40 mb-3">Edit the details of "{editingProperty.title}"</p>
                      
                      <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl mb-4 text-[11px] text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>Re-Approval Required:</strong> Any edits made to an approved listing will immediately require admin re-approval. Your listing will be temporarily hidden from public pages until approved by an administrator.
                        </div>
                      </div>
                      <form onSubmit={handleSaveListingEdit} className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase mb-1 font-mono">Price (ETB)</label>
                          <input type="text" inputMode="text" value={editPrice} onChange={e => setEditPrice(e.target.value as any)} className="w-full p-2.5 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase mb-1 font-mono">Item Description</label>
                          <textarea rows={4} value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full p-2.5 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none" />
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" disabled={editSubmitting} className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2 px-5 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer">
                            {editSubmitting ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button type="button" onClick={() => setEditingProperty(null)} className="bg-white/5 hover:bg-white/10 text-white font-bold py-2 px-5 rounded-xl text-[10px] uppercase tracking-wider transition">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: WALLET & PAYMENTS */}
              {activeTab === 'payments' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Wallet & Payment Center</h3>
                      <p className="text-[11px] text-white/40 mt-0.5">Top up your marketplace wallet, pay for ad boosts, and review payment history.</p>
                    </div>
                  </div>

                  {/* Wallet Balance Card */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider block mb-1">AVAILABLE WALLET BALANCE</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white">{currentUser.walletBalance?.toLocaleString() || 0}</span>
                        <span className="text-sm font-extrabold text-amber-500">ETB</span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-1">Use your wallet credits for instant 1-click ad boost promotions.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-amber-500/20 text-amber-400 font-mono px-3 py-1.5 rounded-xl border border-amber-500/30 font-bold">
                        1 ETB = 1 Credit
                      </span>
                    </div>
                  </div>

                  {/* Top Up Wallet Form */}
                  <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                    <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider mb-2">Top Up Wallet Credits</h4>
                    <p className="text-[11px] text-white/40 mb-4">Deposit funds using your preferred payment method and submit the transaction reference.</p>

                    {topUpSuccess && <p className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl mb-4 text-center font-bold">{topUpSuccess}</p>}
                    {topUpError && <p className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl mb-4 text-center">{topUpError}</p>}

                    <form onSubmit={handleTopUpSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase mb-1.5 font-mono">Payment Channel</label>
                          <select 
                            required
                            value={topUpMethodId} 
                            onChange={e => setTopUpMethodId(e.target.value)} 
                            className="w-full p-3 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none focus:border-amber-500/30"
                          >
                            <option value="">-- Select Payment Method --</option>
                            {activeMethods.map(m => (
                              <option key={m.id} value={m.id}>{m.name} ({m.accountNumber})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-white/40 uppercase mb-1.5 font-mono font-bold">Top-Up Amount (ETB)</label>
                          <input 
                            type="text" 
                            inputMode="text"
                            required 
                            value={topUpAmount} 
                            onChange={e => setTopUpAmount(e.target.value as any)} 
                            placeholder="e.g. 500, 1000, 2500 ETB" 
                            className="w-full p-3 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none focus:border-amber-500/30 font-mono"
                          />
                        </div>
                      </div>

                      {/* Quick Amount Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] text-white/40 font-mono">Quick Amounts:</span>
                        {[250, 500, 1000, 2500, 5000].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setTopUpAmount(amt)}
                            className="px-3 py-1 bg-white/5 hover:bg-amber-500/20 text-white hover:text-amber-400 text-xs font-mono font-bold rounded-lg border border-white/5 transition"
                          >
                            +{amt} ETB
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase mb-1.5 font-mono">Transaction Ref / FT Reference SMS</label>
                        <input 
                          type="text" 
                          required 
                          value={topUpRefNum} 
                          onChange={e => setTopUpRefNum(e.target.value)} 
                          placeholder="e.g. CBE FT230918... / Telebirr Transaction ID" 
                          className="w-full p-3 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none focus:border-amber-500/30 font-mono"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={topUpSubmitting} 
                        className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                      >
                        {topUpSubmitting ? 'Submitting...' : 'Submit Top-Up Request'}
                      </button>
                    </form>
                  </div>

                  {/* Payment Receipts History */}
                  <div className="border-t border-white/5 pt-6">
                    <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider mb-4">My Payment Receipts & Boost History</h4>
                    {myReceipts.length === 0 ? (
                      <p className="text-xs text-white/30 text-center py-8">No payment receipts or boost history records found.</p>
                    ) : (
                      <div className="space-y-3">
                        {myReceipts.map(rc => (
                          <div key={rc.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <span className="text-xs font-bold text-white block">{rc.relatedPropertyTitle || 'Wallet Top-Up Deposit'}</span>
                              <span className="text-[10px] text-white/40 block mt-0.5">{new Date(rc.submittedAt).toLocaleDateString()} • Ref: {rc.referenceNumber || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-amber-500 font-mono font-bold text-xs">{rc.amount} ETB</span>
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${rc.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : rc.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                {rc.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 3: SAVED ITEMS */}
              {activeTab === 'saveditems' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold text-white">Saved Items</h3>
                    <p className="text-[11px] text-white/40 mt-0.5">Quickly view or contact sellers of saved marketplace listings.</p>
                  </div>

                  {mySavedItems.length === 0 ? (
                    <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/5">
                      <Heart className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-xs text-white/40">{tLocal('no_saved')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {mySavedItems.map(p => (
                        <div key={p.id} className="bg-black/30 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition duration-300 flex items-center justify-between gap-4">
                          <div className="flex gap-3 items-center truncate">
                            {p.images && p.images[0] ? (
                              <img src={p.images[0]} alt={p.title} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-amber-500/70">
                                <HomeIcon className="w-5 h-5" />
                              </div>
                            )}
                            <div className="text-left truncate">
                              <h4 
                                onClick={() => onSelectProperty?.(p)}
                                className="text-xs font-bold text-white hover:text-amber-500 transition cursor-pointer truncate"
                              >
                                {p.title}
                              </h4>
                              <p className="text-[11px] text-amber-500 font-mono font-semibold mt-0.5">{Number(p.price).toLocaleString()} ETB</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => onSelectProperty?.(p)}
                              className="p-2 bg-white/5 hover:bg-white/10 text-white hover:text-amber-400 rounded-xl transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => toggleFavorite(p.id)}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition"
                              title="Remove Favorite"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 4: MESSAGES */}
              {activeTab === 'messages' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Messages</h3>
                      <p className="text-[11px] text-white/40 mt-0.5">Instant secure inbox communication history with buyers and sellers.</p>
                    </div>
                    {myInquiries.length > 0 && (
                      <button 
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete all message conversations?')) {
                            await deleteAllInquiries();
                            setActiveInquiryId(null);
                          }
                        }}
                        className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete All Conversations</span>
                      </button>
                    )}
                  </div>

                  {myInquiries.length === 0 ? (
                    <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/5">
                      <MessageSquare className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-xs text-white/40">{tLocal('no_messages')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      
                      {/* Conversations list Pane */}
                      <div className="md:col-span-5 bg-black/20 rounded-2xl border border-white/5 p-3 space-y-2 max-h-[350px] overflow-y-auto">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block px-2 mb-1">Conversations</span>
                        {myInquiries.map(inq => {
                          const isActive = activeInquiryId === inq.id;
                          const lastMsg = inq.messages[inq.messages.length - 1];
                          const hasUnread = lastMsg && lastMsg.senderId !== currentUser.id && inq.messages.length > (readInquiries[inq.id] || 0);

                          return (
                            <div
                              key={inq.id}
                              className={`p-3 rounded-xl transition flex justify-between items-center gap-3 cursor-pointer ${
                                isActive ? 'bg-amber-500 text-black' : 'bg-white/5 hover:bg-white/10'
                              }`}
                            >
                              <div className="truncate flex-1" onClick={() => handleOpenConversation(inq.id)}>
                                <p className={`text-xs font-bold truncate ${isActive ? 'text-black' : 'text-white'}`}>
                                  {inq.propertyTitle}
                                </p>
                                <p className={`text-[10px] truncate ${isActive ? 'text-black/80' : 'text-white/40'} mt-0.5`}>
                                  {lastMsg ? `${lastMsg.senderName}: ${lastMsg.text}` : 'Inquiry thread started'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {hasUnread && !isActive && (
                                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                                )}
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete message thread for "${inq.propertyTitle}"?`)) {
                                      await deleteInquiry(inq.id);
                                      if (activeInquiryId === inq.id) setActiveInquiryId(null);
                                    }
                                  }}
                                  className={`p-1 rounded transition ${isActive ? 'text-black/60 hover:text-black hover:bg-black/10' : 'text-white/40 hover:text-rose-400 hover:bg-white/10'}`}
                                  title="Delete Message Thread"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Chat Messages Pane */}
                      <div className="md:col-span-7 bg-black/30 rounded-2xl border border-white/5 p-4 flex flex-col h-[350px] justify-between">
                        {activeInquiryId ? (
                          <>
                            {/* Thread header */}
                            <div className="border-b border-white/5 pb-2 mb-2 flex justify-between items-center">
                              <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-wider line-clamp-1">
                                  {inquiries.find(i => i.id === activeInquiryId)?.propertyTitle}
                                </h4>
                                <p className="text-[9px] text-white/40">Secure End-to-End Chat Mode</p>
                              </div>
                              <button 
                                onClick={() => setActiveInquiryId(null)} 
                                className="text-[10px] text-amber-500 hover:underline"
                              >
                                Close
                              </button>
                            </div>

                            {/* Message items list */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2 text-xs">
                              {inquiries.find(i => i.id === activeInquiryId)?.messages.map((m, index) => {
                                const isMe = m.senderId === currentUser.id;
                                return (
                                  <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                                      isMe ? 'bg-amber-500 text-black rounded-tr-none' : 'bg-white/5 text-white rounded-tl-none border border-white/5'
                                    }`}>
                                      <p className="font-bold text-[9px] opacity-70 mb-0.5">{m.senderName}</p>
                                      <p>{m.text}</p>
                                    </div>
                                    <span className="text-[9px] text-white/30 mt-1 block px-1">
                                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Send Box Form */}
                            <form onSubmit={handleSendChatReply} className="mt-3 flex gap-2 pt-2 border-t border-white/5">
                              <input 
                                type="text"
                                required
                                value={chatMessageText}
                                onChange={e => setChatMessageText(e.target.value)}
                                placeholder="Type your secure chat reply..."
                                className="flex-1 bg-black border border-white/10 text-xs text-white p-2.5 rounded-xl focus:outline-none"
                              />
                              <button 
                                type="submit"
                                disabled={chatSubmitting}
                                className="p-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl transition cursor-pointer flex items-center justify-center"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </form>
                          </>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                            <MessageSquare className="w-12 h-12 text-white mb-2" />
                            <p className="text-xs">Select a conversation thread on the left side to review or send messages.</p>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* SECTION 5: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Notifications Center</h3>
                      <p className="text-[11px] text-white/40 mt-0.5">Stay updated with listing status reports and chat notification alerts.</p>
                    </div>
                    {myNotifications.length > 0 && (
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={handleMarkAllNotificationsRead}
                          className="text-[11px] text-amber-500 hover:underline font-bold cursor-pointer"
                        >
                          Mark All as Read
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to clear all notifications?')) {
                              await deleteAllNotifications();
                            }
                          }}
                          className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clear All</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {myNotifications.length === 0 ? (
                    <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/5">
                      <Bell className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-xs text-white/40">{tLocal('no_notifications')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myNotifications.slice().reverse().map(n => {
                        const isRead = readNotificationIds.includes(n.id) || n.isRead;
                        return (
                          <div key={n.id} className={`p-4 rounded-2xl border transition duration-300 text-left flex justify-between items-start gap-3 ${
                            isRead ? 'bg-black/20 border-white/5' : 'bg-[#e5a00d]/5 border-[#e5a00d]/10'
                          }`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${isRead ? 'bg-white/20' : 'bg-amber-500 animate-pulse'}`} />
                                <h4 className="text-xs font-bold text-white">{n.title}</h4>
                              </div>
                              <p className="text-[11px] text-white/60 mt-1 pl-3.5 leading-relaxed">{n.message}</p>
                              <span className="text-[9px] text-white/30 block pl-3.5 mt-1.5 font-mono">
                                {formatTimeAgo(n.createdAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  await toggleNotificationRead(n.id);
                                }}
                                className="p-1.5 text-white/40 hover:text-amber-400 hover:bg-white/5 rounded-lg transition"
                                title={isRead ? "Mark as Unread" : "Mark as Read"}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await deleteNotification(n.id);
                                }}
                                className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                                title="Delete Notification"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 6: RECENTLY VIEWED */}
              {activeTab === 'recentlyviewed' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold text-white">Recently Viewed</h3>
                    <p className="text-[11px] text-white/40 mt-0.5">Quickly revisit active listings you opened recently in this browser session.</p>
                  </div>

                  {recentListings.length === 0 ? (
                    <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/5">
                      <Clock className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-xs text-white/40">{tLocal('no_recent')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recentListings.map(p => (
                        <div key={p.id} className="bg-black/30 border border-white/5 rounded-2xl p-4 hover:border-amber-500/20 transition duration-300 flex items-center justify-between gap-4">
                          <div className="flex gap-3 items-center truncate">
                            {p.images && p.images[0] ? (
                              <img src={p.images[0]} alt={p.title} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-amber-500/70">
                                <HomeIcon className="w-5 h-5" />
                              </div>
                            )}
                            <div className="text-left truncate">
                              <h4 
                                onClick={() => onSelectProperty?.(p)}
                                className="text-xs font-bold text-white hover:text-amber-500 transition cursor-pointer truncate"
                              >
                                {p.title}
                              </h4>
                              <p className="text-[11px] text-amber-500 font-mono font-semibold mt-0.5">{Number(p.price).toLocaleString()} ETB</p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => onSelectProperty?.(p)}
                            className="p-2 bg-white/5 hover:bg-amber-500 hover:text-black rounded-xl transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 7: SUPPORT & SAFETY */}
              {activeTab === 'supportsafety' && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold text-white">Support, Rules & Safety Guide</h3>
                    <p className="text-[11px] text-white/40 mt-0.5">Explore secure guidelines, report problem tickets, or log official support requests.</p>
                  </div>

                  {/* Safety Advice Card */}
                  <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl text-left">
                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                      <Shield className="w-5 h-5" />
                      <h4 className="text-xs font-black uppercase tracking-wider">Secure Commerce Safety Protocols</h4>
                    </div>
                    <ul className="text-[11px] text-white/70 space-y-1.5 list-disc pl-4 leading-relaxed">
                      <li><strong>Meet in Public:</strong> Always meet buyers or sellers in heavily populated public spots or secure banks.</li>
                      <li><strong>Inspect Goods:</strong> Examine any item or check land titles in-person before wiring deposit cash transfers.</li>
                      <li><strong>Promote Securely:</strong> We only accept verified payments submitted via our internal receipt uploader.</li>
                      <li><strong>Audit Checks:</strong> Standard listings are manually audited within 4 hours to block scam items instantly.</li>
                    </ul>
                  </div>

                  {/* Contact Support Form & Log Ticket */}
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                    <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider mb-3">Contact Official Customer Support</h4>
                    {ticketSuccess && <p className="p-3 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl text-center mb-4">{ticketSuccess}</p>}
                    
                    <form onSubmit={handleSupportTicketSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase mb-1 font-mono">Subject</label>
                        <input 
                          type="text" 
                          required 
                          value={ticketSubject}
                          onChange={e => setTicketSubject(e.target.value)}
                          placeholder="e.g. CBE receipt verification time/Listing edit help"
                          className="w-full p-2.5 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase mb-1 font-mono">Message context</label>
                        <textarea 
                          required 
                          rows={3}
                          value={ticketMessage}
                          onChange={e => setTicketMessage(e.target.value)}
                          placeholder="Please specify issue details..."
                          className="w-full p-2.5 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={ticketSubmitting}
                        className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold py-2 px-5 rounded-xl uppercase tracking-wider transition cursor-pointer"
                      >
                        {ticketSubmitting ? 'Logging...' : tLocal('ticket_submit')}
                      </button>
                    </form>
                  </div>

                  {/* Logged Tickets History */}
                  <div className="border-t border-white/5 pt-4">
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-wider block mb-2">My Ticket History</span>
                    {supportTickets.filter(t => t.email === currentUser.email).length === 0 ? (
                      <p className="text-[11px] text-white/30">No active support ticket records loaded.</p>
                    ) : (
                      <div className="space-y-3">
                        {supportTickets.filter(t => t.email === currentUser.email).map((tk, idx) => (
                          <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-xl">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-white">{tk.subject}</span>
                              <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold">{tk.status || 'Open'}</span>
                            </div>
                            <p className="text-[11px] text-white/50 leading-relaxed font-light">{tk.message}</p>
                            {tk.reply && (
                              <div className="mt-2 p-2.5 bg-amber-500/5 text-amber-400 border-l-2 border-amber-500 text-[11px] rounded-r-lg">
                                <strong>Admin Reply:</strong> {tk.reply}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Report a Problem Form */}
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
                    <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider mb-3">Report a Bug / Technical Problem</h4>
                    {reportSuccess && <p className="p-3 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl text-center mb-4">{reportSuccess}</p>}
                    
                    <form onSubmit={handleReportProblem} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase mb-1 font-mono">Bug Title</label>
                        <input 
                          type="text" 
                          required 
                          value={reportSubject}
                          onChange={e => setReportSubject(e.target.value)}
                          placeholder="e.g. Chat is unresponsive / Image uploading error"
                          className="w-full p-2.5 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase mb-1 font-mono">Technical Details</label>
                        <textarea 
                          required 
                          rows={3}
                          value={reportDetails}
                          onChange={e => setReportDetails(e.target.value)}
                          placeholder="Please provide steps to reproduce this issue..."
                          className="w-full p-2.5 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold py-2 px-5 rounded-xl uppercase tracking-wider transition cursor-pointer"
                      >
                        {tLocal('report_btn')}
                      </button>
                    </form>
                  </div>

                  {/* Safety, Privacy & Terms Policy text */}
                  <div className="space-y-4 bg-black/40 p-5 rounded-2xl border border-white/5 text-[11px] text-white/50 leading-relaxed">
                    <div>
                      <h4 className="text-xs font-bold text-white mb-1">Privacy Policy Highlights</h4>
                      <p>Your registered email and contact info are strictly utilized to connect buyers and authenticate promotions. We do not distribute credentials to unauthorized third parties or marketing brokers.</p>
                    </div>
                    <div className="border-t border-white/5 pt-3">
                      <h4 className="text-xs font-bold text-white mb-1">Terms & Conditions Highlights</h4>
                      <p>Sof Umer holds a zero-tolerance policy for fraudulent listings or unverified properties. Accounts logged listing scam items, duplicates, or offensive content will be disabled permanently.</p>
                    </div>
                  </div>

                  {/* Frequently Asked Questions (FAQ) Section - Nested directly under Support & Safety */}
                  <div id="faq-sub-section" className="border-t border-white/5 pt-6 mt-6 scroll-mt-12 text-left">
                    <div className="border-b border-white/5 pb-4 mb-4">
                      <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider">{t('faq.title')}</h4>
                      <p className="text-[11px] text-white/40 mt-0.5">{t('faq.subtitle')}</p>
                    </div>

                    <div className="space-y-3">
                      {effectiveFaqs.map((item: any, index: number) => {
                        const question = getFaqText(item.question, lang);
                        const answer = getFaqText(item.answer, lang);
                        const isOpen = expandedFaqIndex === index;

                        return (
                          <AccordionItem 
                            key={item.id || index}
                            title={question}
                            content={answer}
                            isOpen={isOpen}
                            onToggle={() => setExpandedFaqIndex(isOpen ? null : index)}
                          />
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* SECTION 9: SETTINGS */}
              {activeTab === 'settings' && (() => {
                const folders = [
                  {
                    id: 'password',
                    label: 'Password & Security',
                    label_om: 'Eegumsa & Iccitii',
                    label_am: 'የደህንነት የይለፍ ቃል',
                    desc: 'Update your login credentials and security password.',
                    desc_om: 'Iccitii seensa keetii fi ulaagaalee nageenyaa haaromsi.',
                    desc_am: 'የመግቢያ መረጃዎን እና የደህንነት የይለፍ ቃልዎን ያዘምኑ።',
                    icon: <Lock className="w-4 h-4 text-amber-500/80" />
                  },
                  {
                    id: 'notifications',
                    label: 'Notification Preferences',
                    label_om: 'Filannoo Beeksisaa',
                    label_am: 'የማሳወቂያ ምርጫዎች',
                    desc: 'Manage email digests, SMS alerts, and platform push notices.',
                    desc_om: 'Digests e-mail, SMS fi beeksisa bilbilaa kee to’adhu.',
                    desc_am: 'የኢሜል መልዕክቶችን፣ የኤስኤምኤስ ማንቂያዎችን እና ማሳወቂያዎችን ያስተዳድሩ።',
                    icon: <Bell className="w-4 h-4 text-amber-500/80" />
                  },
                  {
                    id: 'privacy',
                    label: 'Privacy & Account Safety',
                    label_om: 'Iccitii & Nageenya Herregaa',
                    label_am: 'የግላዊነት እና ደህንነት ቅንብሮች',
                    desc: 'Control public visibility, search crawling, and account termination.',
                    desc_om: 'Mul’atni kee, barbaacha Google fi haquu herregaa to’adhu.',
                    desc_am: 'የህዝብ ታይነትን፣ የፍለጋ ሞተር መረጃ መውሰጃን እና መለያ መሰረዝን ይቆጣጠሩ።',
                    icon: <Shield className="w-4 h-4 text-amber-500/80" />
                  },
                  {
                    id: 'language',
                    label: 'Language Settings / ቋንቋ',
                    label_om: 'Sajatoo Afaanii',
                    label_am: 'የቋንቋ ምርጫ',
                    desc: 'Choose your preferred translation language for the marketplace interface.',
                    desc_om: 'Afaan ittiin fayyadamtu filadhu.',
                    desc_am: 'ለገበያ ቦታ በይነገጽ የመረጡትን የትርጉም ቋንቋ ይምረጡ።',
                    icon: <Languages className="w-4 h-4 text-amber-500/80" />
                  }
                ];

                const getFolderLabel = (f: typeof folders[0]) => {
                  if (lang === 'om') return f.label_om;
                  if (lang === 'am') return f.label_am;
                  return f.label;
                };

                const getFolderDesc = (f: typeof folders[0]) => {
                  if (lang === 'om') return f.desc_om;
                  if (lang === 'am') return f.desc_am;
                  return f.desc;
                };

                const toggleSettingFolder = (folderId: string) => {
                  setOpenSettingFolder(openSettingFolder === folderId ? null : folderId);
                };

                return (
                  <div className="space-y-6">
                    <div className="border-b border-white/5 pb-4">
                      <h3 className="text-lg font-bold text-white">System Settings</h3>
                      <p className="text-[11px] text-white/40 mt-0.5">Manage notifications preferences, privacy controls and change passwords.</p>
                    </div>

                    <div className="space-y-4">
                      {folders.map(f => {
                        const isOpen = openSettingFolder === f.id;
                        return (
                          <div 
                            key={f.id} 
                            className={`border transition-all duration-300 rounded-2xl overflow-hidden ${
                              isOpen 
                                ? 'border-amber-500/30 bg-[#12121a]/85 shadow-lg shadow-amber-500/5' 
                                : 'border-white/5 bg-black/20 hover:bg-white/5 hover:border-white/10'
                            }`}
                          >
                            {/* Folder Tab Header */}
                            <button
                              type="button"
                              onClick={() => toggleSettingFolder(f.id)}
                              className="w-full flex items-center justify-between p-4 text-left cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-3.5">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/10 flex items-center justify-center">
                                  {isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    {f.icon}
                                    <h4 className="text-xs font-black text-white uppercase tracking-wider">{getFolderLabel(f)}</h4>
                                  </div>
                                  <p className="text-[10px] text-white/40 mt-0.5 leading-relaxed">{getFolderDesc(f)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <ChevronRight className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-90 text-amber-500' : ''}`} />
                              </div>
                            </button>

                            {/* Folder Content Area */}
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-5 pt-1 border-t border-white/5 bg-black/40">
                                    {f.id === 'password' && (
                                      <div className="space-y-4 pt-3">
                                        {passSuccess && <p className="p-3 bg-emerald-500/10 text-emerald-400 text-xs rounded-xl text-center font-medium">{passSuccess}</p>}
                                        {passError && <p className="p-3 bg-rose-500/10 text-rose-400 text-xs rounded-xl text-center font-medium">{passError}</p>}
                                        <form onSubmit={handleChangePassword} className="space-y-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                              <label className="block text-[10px] font-bold text-white/40 uppercase mb-1 font-mono">Current Password</label>
                                              <input type="password" required value={currPassword} onChange={e => setCurrPassword(e.target.value)} className="w-full p-2.5 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none focus:border-amber-500/50" />
                                            </div>
                                            <div>
                                              <label className="block text-[10px] font-bold text-white/40 uppercase mb-1 font-mono">New Password</label>
                                              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2.5 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none focus:border-amber-500/50" />
                                            </div>
                                            <div>
                                              <label className="block text-[10px] font-bold text-white/40 uppercase mb-1 font-mono">Confirm Password</label>
                                              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-2.5 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none focus:border-amber-500/50" />
                                            </div>
                                          </div>
                                          <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2 px-5 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer">
                                            Change Security Password
                                          </button>
                                        </form>

                                        {currentUser && (
                                          <div className="pt-6 border-t border-white/10">
                                            <TwoFactorSecurityModule 
                                              currentUser={currentUser} 
                                              onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)} 
                                            />
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {f.id === 'notifications' && (
                                      <div className="space-y-4 text-xs pt-3">
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                          <div>
                                            <p className="font-bold text-white">Email Digests</p>
                                            <p className="text-[10px] text-white/40">Receive daily summaries of visitor inquiries and saved items updates.</p>
                                          </div>
                                          <button type="button" onClick={() => setEmailDigests(!emailDigests)} className="cursor-pointer">
                                            {emailDigests ? <ToggleRight className="w-8 h-8 text-amber-500" /> : <ToggleLeft className="w-8 h-8 text-white/30" />}
                                          </button>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                          <div>
                                            <p className="font-bold text-white">SMS Alerts</p>
                                            <p className="text-[10px] text-white/40">Receive instant SMS alerts for incoming chats on active listings.</p>
                                          </div>
                                          <button type="button" onClick={() => setSmsAlerts(!smsAlerts)} className="cursor-pointer">
                                            {smsAlerts ? <ToggleRight className="w-8 h-8 text-amber-500" /> : <ToggleLeft className="w-8 h-8 text-white/30" />}
                                          </button>
                                        </div>

                                        <div className="flex justify-between items-center py-2">
                                          <div>
                                            <p className="font-bold text-white">Push Notifications</p>
                                            <p className="text-[10px] text-white/40">Show floating banners for platform system updates.</p>
                                          </div>
                                          <button type="button" onClick={() => setPushEnabled(!pushEnabled)} className="cursor-pointer">
                                            {pushEnabled ? <ToggleRight className="w-8 h-8 text-amber-500" /> : <ToggleLeft className="w-8 h-8 text-white/30" />}
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {f.id === 'privacy' && (
                                      <div className="space-y-4 text-xs pt-3">
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                          <div>
                                            <p className="font-bold text-white">Public Profile Search</p>
                                            <p className="text-[10px] text-white/40">Allow anonymous users to look up listings by your registered profile handle.</p>
                                          </div>
                                          <button type="button" onClick={() => setProfilePublic(!profilePublic)} className="cursor-pointer">
                                            {profilePublic ? <ToggleRight className="w-8 h-8 text-amber-500" /> : <ToggleLeft className="w-8 h-8 text-white/30" />}
                                          </button>
                                        </div>

                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                          <div>
                                            <p className="font-bold text-white">Search Engine Indexing</p>
                                            <p className="text-[10px] text-white/40">Let Google and external crawlers index your uploaded listings.</p>
                                          </div>
                                          <button type="button" onClick={() => setSearchIndexable(!searchIndexable)} className="cursor-pointer">
                                            {searchIndexable ? <ToggleRight className="w-8 h-8 text-amber-500" /> : <ToggleLeft className="w-8 h-8 text-white/30" />}
                                          </button>
                                        </div>

                                        <div className="pt-3">
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              if (window.confirm('Delete account permanently? This action is fully irreversible.')) {
                                                logout();
                                                onNavigate('marketplace');
                                              }
                                            }}
                                            className="px-4 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-[10px] font-bold uppercase rounded-xl transition cursor-pointer"
                                          >
                                            Terminate Account Permanently
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {f.id === 'language' && (
                                      <div className="py-2 pt-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                          {[
                                            { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
                                            { code: 'om', label: 'Afaan Oromoo', native: 'Afaan Oromoo', flag: '🇪🇹' },
                                            { code: 'am', label: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' }
                                          ].map(langItem => (
                                            <button
                                              key={langItem.code}
                                              onClick={() => setLanguage(langItem.code)}
                                              className={`p-5 rounded-2xl border transition text-left cursor-pointer flex flex-col justify-between h-28 ${
                                                currentLanguage === langItem.code 
                                                  ? 'bg-amber-500 text-black border-amber-500 font-extrabold shadow-lg shadow-amber-500/5' 
                                                  : 'bg-white/5 border-white/5 text-white/80 hover:bg-white/10'
                                              }`}
                                            >
                                              <span className="text-2xl">{langItem.flag}</span>
                                              <div>
                                                <p className="text-xs font-black">{langItem.label}</p>
                                                <p className={`text-[10px] mt-0.5 ${currentLanguage === langItem.code ? 'text-black/70' : 'text-white/40'}`}>
                                                  {langItem.native}
                                                </p>
                                              </div>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}

// Minimal placeholder fallback icon matching standard Home representation
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}
