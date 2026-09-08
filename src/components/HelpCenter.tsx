import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Copy, Check, Share2, ChevronDown, HelpCircle, 
  Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock,
  ThumbsUp, ThumbsDown, Printer, Sparkles, BookOpen, Flame, ChevronRight, CheckCircle
} from 'lucide-react';
import { useApp } from '../lib/AppContext';

// Categories translations
const categoryTranslations: Record<string, Record<string, string>> = {
  all: {
    en: 'All Topics',
    om: 'Mata-duree Hundumaa',
    am: 'ሁሉም ርዕሶች'
  },
  popular: {
    en: 'Popular Questions 🔥',
    om: 'Gaaffilee Baay\'ee Gaafataman 🔥',
    am: 'በተደጋጋሚ የሚጠየቁ ጥያቄዎች 🔥'
  },
  account: {
    en: 'Account & Verification',
    om: 'Herrega & Profaayilii',
    am: 'መለያ እና ማረጋገጫ'
  },
  properties: {
    en: 'Real Estate & Properties',
    om: 'Manneen & Lafa',
    am: 'ሪል እስቴት እና ንብረቶች'
  },
  jobs: {
    en: 'Jobs & Careers',
    om: 'Hojii & Karroora',
    am: 'ስራዎች እና ስራ ፈላጊዎች'
  },
  products: {
    en: 'Goods & Electronics',
    om: 'Meeshaalee & Ellektirooniksi',
    am: 'እቃዎች እና ኤሌክትሮኒክስ'
  },
  services: {
    en: 'Services & Freelance',
    om: 'Tajaajila & Ogeeyyii',
    am: 'አገልግሎቶች እና ፍሪላንስ'
  },
  businesses: {
    en: 'Local Businesses',
    om: 'Dhaabbilee Daldalaa',
    am: 'የአካባቢ ንግዶች'
  },
  community: {
    en: 'Community & Events',
    om: 'Hawaasa & Qophii',
    am: 'ማህበረሰብ እና ኩነቶች'
  },
  chat_offer: {
    en: 'Chat & Make Offer',
    om: 'Chaatii & Gatii Dhiyeessuu',
    am: 'ቻት እና ዋጋ ማቅረብ'
  },
  premium: {
    en: 'Promotional Boost & Telebirr/CBE',
    om: 'Beeksisa Ol-kaasuu',
    am: 'ማስታወቂያ ማሳደግ (Boost)'
  },
  safety: {
    en: 'Safety & Scam Warning',
    om: 'Nageenya & Of-eeggannoo',
    am: 'ደህንነት እና ጥንቃቄ'
  },
  policies: {
    en: 'Policies & Rules',
    om: 'Seera & Imaammata',
    am: 'ፖሊሲዎች እና ህጎች'
  },
  support: {
    en: 'Customer Support',
    om: 'Deggarsa Daldalaa',
    am: 'የደንበኞች ድጋፍ'
  },
  posting: {
    en: 'Posting Listings',
    om: 'Beeksisa Baasuu',
    am: 'ማስታወቂያ መለጠፍ'
  },
  decline: {
    en: 'Decline Reasons',
    om: 'Sababoota Dhowwamuuf',
    am: 'ውድቅ የተደረጉበት ምክንያት'
  },
  payments: {
    en: 'Payments & Billing',
    om: 'Kaffaltii & Kafaltii dabalataa',
    am: 'ክፍያዎች እና ሂሳብ'
  }
};

// FAQ Data Structure (31 questions total)
interface FAQItem {
  id: string;
  category: string;
  question: { en: string; om: string; am: string };
  answer: { en: string; om: string; am: string };
}

const faqData: FAQItem[] = [
  // Category: popular
  {
    id: 'pop-1',
    category: 'popular',
    question: {
      en: 'What is Sof Umer?',
      om: 'Sof Umer maali?',
      am: 'ሶፍ ኡመር ምንድነው?'
    },
    answer: {
      en: 'Sof Umer is Ethiopia\'s trusted local marketplace where people can discover, buy, sell, rent, and connect with businesses and communities. Users can browse or post listings in categories such as Properties, Vehicles, Jobs, Products, Services, Local Businesses, Community, and more.',
      om: 'Sof Umer gabaa naannoo Itoophiyaa amanamaa ta\'eedha, daldaltoonni, bitattoonni fi hawaasni manneen, konkolaattota, meeshota, hojii fi tajaajiloota adda addaa itti wal-qunnamaniidha.',
      am: 'ሶፍ ኡመር ሰዎች ንብረቶችን፣ ተሽከርካሪዎችን፣ ስራዎችን፣ ምርቶችን፣ አገልግሎቶችን እና የአካባቢ ንግዶችን የሚያገኙበት፣ የሚገዙበት፣ የሚሸጡበት እና የሚከራዩበት የታመነ የኢትዮጵያ የገበያ ቦታ ነው።'
    }
  },
  {
    id: 'pop-2',
    category: 'popular',
    question: {
      en: 'How do I create an account?',
      om: 'Herrega akkamitti banna?',
      am: 'መለያ እንዴት መክፈት እችላለሁ?'
    },
    answer: {
      en: 'Tap Sign Up, choose Email, Google, or Phone Number, verify your account if required, and complete your profile before posting or contacting sellers.',
      om: 'Bannaa irratti \'Sign Up\' cuqaasi, Imeelii, Google ykn Lakkoofsa Bilbilaa filadhu, eennummaa kee mirkaneessi, achiise profaayilii kee guuti.',
      am: 'ይመዝገቡ የሚለውን ይጫኑ፣ በኢሜል፣ በጉግል ወይም በስልክ ቁጥር መለያዎን ይፍጠሩ፣ አስፈላጊ ከሆነ ያረጋግጡ እና መገለጫዎን ያጠናቅቁ።'
    }
  },
  {
    id: 'pop-3',
    category: 'popular',
    question: {
      en: 'How do I post a listing?',
      om: 'Beeksisa akkamitti dhiyyeessina?',
      am: 'ማስታወቂያ እንዴት መለጠፍ እችላለሁ?'
    },
    answer: {
      en: 'Sign in to your account, tap Post Listing, choose the correct category, upload clear photos, write an accurate title and description, and set a fair price.',
      om: 'Herrega keetti seeni, \'Post Listing\' cuqaasi, damee sirrii filadhu, suuraa qulqulluu fidi, ibsa fi gatii sirrii barreessi.',
      am: 'ወደ መለያዎ ይግቡ፣ \'ማስታወቂያ ይለጥፉ\' የሚለውን ይጫኑ፣ ትክክለኛውን ምድብ ይምረጡ፣ ግልጽ ምስሎችን ያክሉ፣ ትክክለኛ መግለጫ እና ተመጣጣኝ ዋጋ ያስገቡ።'
    }
  },
  {
    id: 'pop-4',
    category: 'popular',
    question: {
      en: 'Is using Sof Umer free?',
      om: 'Sof Umer fayyadamuun bilisaa?',
      am: 'ሶፍ ኡመርን መጠቀም ነፃ ነው?'
    },
    answer: {
      en: 'Yes, standard browsing and listing creation are completely free. Premium features like boosting or featuring your listing for higher visibility require a small fee.',
      om: 'Eeyyee, beeksisa dhiyeessuu fi gabaa barbaaduun bilisa. Beeksisa keessan gabaarratti dursuuf (boost) kaffaltii xiqqoo qaba.',
      am: 'አዎ፣ መደበኛ አጠቃቀም እና ማስታወቂያ መለጠፍ ሙሉ በሙሉ ነፃ ነው። ማስታወቂያዎን በዋናነት ለማስተዋወቅ (Boost) አነስተኛ ክፍያ ይጠየቃል።'
    }
  },
  {
    id: 'pop-5',
    category: 'popular',
    question: {
      en: 'How do I contact a seller?',
      om: 'Gurgurtaadhaaf akkamitti qunnamna?',
      am: 'አስተዋዋቂውን እንዴት ማግኘት እችላለሁ?'
    },
    answer: {
      en: 'Open the listing detail page, and use the direct chat option or tap the "Call" button to view their verified phone number.',
      om: 'Fuula beeksisaa keessatti \'Chat\' cuqaasuun barreessi ykn bilbila isaanii argachuuf \'Call\' cuqaasi.',
      am: 'የማስታወቂያውን ዝርዝር ገጽ ይክፈቱ፣ በቀጥታ በውስጥ መስመር ይጻፉ ወይም ስልክ ቁጥራቸውን ለማግኘት \'ይደውሉ\' የሚለውን ይጫኑ።'
    }
  },

  // Category: account
  {
    id: 'acc-1',
    category: 'account',
    question: {
      en: 'How do I edit my profile?',
      om: 'Profaayilii koo akkamittan sirreessa?',
      am: 'መገለጫዬን እንዴት ማስተካከል እችላለሁ?'
    },
    answer: {
      en: 'Navigate to the User Dashboard, select the Settings tab, update your full name, and save the changes.',
      om: 'Gara \'Dashboard\' deemi, \'Settings\' filadhu, maqaa kee sirreessi, achiis ol-kaa\'i.',
      am: 'ወደ ተጠቃሚ ዳሽቦርድ ይሂዱ፣ የቅንብሮች (Settings) ትርን ይምረጡ፣ ሙሉ ስምዎን ያዘምኑ እና ለውጦቹን ያስቀምጡ።'
    }
  },
  {
    id: 'acc-2',
    category: 'account',
    question: {
      en: 'How do I change my password?',
      om: 'Password koo akkamitti jijjiira?',
      am: 'የይለፍ ቃሌን እንዴት መቀየር እችላለሁ?'
    },
    answer: {
      en: 'Go to Settings, choose Change Password, input your current password, type your new password twice, and confirm.',
      om: '\'Settings\' keessatti password jijjiiruu filadhu, isa ammaa galchi, haaraa sadii galchuun mirkaneessi.',
      am: 'ወደ ቅንብሮች ይሂዱ፣ \'የይለፍ ቃል ይቀይሩ\' የሚለውን ይምረጡ፣ የአሁኑን ያስገቡ፣ አዲሱን ይለፍ ቃል ሁለት ጊዜ አስገብተው ያረጋግጡ።'
    }
  },
  {
    id: 'acc-3',
    category: 'account',
    question: {
      en: 'What is a verified profile?',
      om: 'Profaayilii mirkanaa\'e jechuun maal jechuudha?',
      am: 'የተረጋገጠ መገለጫ ምንድነው?'
    },
    answer: {
      en: 'A verified profile has a green check badge indicating the identity of the seller or agency has been audited by our admins using government IDs.',
      om: 'Profaayiliin mirkanaa\'e (verified check badge) ragaa eenyummaa abbaa beeksisaa ykn ejensii mootummaan mirkanaa\'e agarsiisa.',
      am: 'የተረጋገጠ መገለጫ (Verified Badge) የአስተዋዋቂው ወይም የኤጀንሲው ማንነት በህጋዊ መታወቂያ በአስተዳዳሪዎቻችን መረጋገጡን ያሳያል።'
    }
  },
  {
    id: 'acc-4',
    category: 'account',
    question: {
      en: 'Can I delete my account?',
      om: 'Herrega koo haquu nan danda\'aa?',
      am: 'መለያዬን መሰረዝ እችላለሁ?'
    },
    answer: {
      en: 'Yes, go to Settings, scroll to the bottom, and click Delete Account to permanently remove your data.',
      om: 'Eeyyee, \'Settings\' keessatti gara gadii deemi herrega kee guutummaatti haquuf \'Delete Account\' filadhu.',
      am: 'አዎ፣ ወደ ቅንብሮች ይሂዱ፣ ወደ ታች ይውረዱ እና ውሂብዎን በዘላቂነት ለማጥፋት \'መለያ አጥፋ\' የሚለውን ይጫኑ።'
    }
  },
  {
    id: 'acc-5',
    category: 'account',
    question: {
      en: 'Why was my account suspended?',
      om: 'Herregni koo maaliif ittifame?',
      am: 'መለያዬ ለምን ታገደ?'
    },
    answer: {
      en: 'Accounts are suspended for violating our marketplace rules, posting fraudulent items, scam attempts, or using abusive language in chat.',
      om: 'Seera gabaa keenya cabsuu, beeksisa sobaa baasuu ykn haasaa arrabsoo fayyadamuun herrega cufa.',
      am: 'መለያዎች የሚታገዱት የገበያ ቦታውን መመሪያዎች ሲጥሱ፣ የሐሰት ማስታወቂያ ሲለጥፉ ወይም በውስጥ መስመር ያልተገባ ንግግር ሲጠቀሙ ነው።'
    }
  },

  // Category: posting
  {
    id: 'post-1',
    category: 'posting',
    question: {
      en: 'What details are required to post a listing?',
      om: 'Beeksisa baasuuf ragaalee maalfaatu barbaachisa?',
      am: 'ማስታወቂያ ለመለጠፍ ምን መረጃዎች ያስፈልጋሉ?'
    },
    answer: {
      en: 'You need an accurate title, subcategory, detailed description, condition (if applicable), price, currency, location, and contact information.',
      om: 'Maqaa beeksisaa sirrii, damee gadii, ibsa gabaabaa, haala jiru, gatii, teessoo fi lakkoofsa bilbilaa guutuun dirqama.',
      am: 'ትክክለኛ ርዕስ፣ ንዑስ ምድብ፣ ዝርዝር መግለጫ፣ የአገልግሎት ዘመን፣ ዋጋ፣ አድራሻ እና የእውቂያ መረጃ ማስገባት ግዴታ ነው።'
    }
  },
  {
    id: 'post-2',
    category: 'posting',
    question: {
      en: 'How many images can I upload?',
      om: 'Suuraa meeqa ol-fe\'uu nan danda\'aa?',
      am: 'ስንት ምስሎችን መጫን እችላለሁ?'
    },
    answer: {
      en: 'You can upload up to 8 high-quality images per listing to showcase the item from different angles.',
      om: 'Beeksisa tokkoof suuraalee qulqulluu hamma 8 dhiyeessuu dandeessa.',
      am: 'ለእያንዳንዱ ማስታወቂያ እቃውን በተለያዩ አቅጣጫዎች የሚያሳዩ እስከ 8 ጥራት ያላቸው ምስሎችን መጫን ይችላሉ።'
    }
  },
  {
    id: 'post-3',
    category: 'posting',
    question: {
      en: 'Can I edit a listing after posting?',
      om: 'Beeksisa ergan baasee booda sirreessuu nan danda\'aa?',
      am: 'ከተለጠፈ በኋላ ማስተካከል እችላለሁ?'
    },
    answer: {
      en: 'Yes, go to "My Listings", select the item, and click "Edit" to modify any detail or change images.',
      om: 'Eeyyee, \'My Listings\' deemi, beeksisa kee filadhu, achiise \'Edit\' cuqaasuun sirreessi.',
      am: 'አዎ፣ ወደ \'የእኔ ማስታወቂያዎች\' ይሂዱ፣ ንብረቱን ይምረጡ እና ዝርዝሩን ወይም ምስሉን ለመቀየር \'ያስተካክሉ\' (Edit) የሚለውን ይጫኑ።'
    }
  },
  {
    id: 'post-4',
    category: 'posting',
    question: {
      en: 'How long does a listing stay active?',
      om: 'Beeksisni gabaa irra yeroo meeqaf tura?',
      am: 'የተለጠፈው ማስታወቂያ ለስንት ጊዜ ይቆያል?'
    },
    answer: {
      en: 'Standard listings stay active based on active Free Listing Campaign limits set by admin. You can renew or boost them directly from your dashboard.',
      om: 'Beeksisonni akka seera beeksisa tolaa bulchaan murteessetti turu. Dashboard keessan irraa haaromsuu dandeessu.',
      am: 'መደበኛ ማስታወቂያዎች በአስተዳዳሪው በተዘጋጀው በነፃ ማስታወቂያ ዘመቻ ደንብ መሰረት ንቁ ሆነው ይቆያሉ። ከዳሽቦርድዎ ላይ ማደስ ወይም ማሳደግ ይችላሉ።'
    }
  },
  {
    id: 'post-5',
    category: 'posting',
    question: {
      en: 'How do I bump my listing to the top?',
      om: 'Beeksisa koo akkamitti ol-fida?',
      am: 'ማስታወቂያዬን እንዴት ወደ መጀመሪያው ገጽ ማምጣት እችላለሁ?'
    },
    answer: {
      en: 'Go to "My Listings" and use the "Boost" feature to make your listing prominent on the homepage and search results.',
      om: '\'My Listings\' deemi, beeksisa kee gabaarratti dursuuf kaffaltii \'Boost\' raawwadhu.',
      am: 'ወደ \'የእኔ ማስታወቂያዎች\' ይሂዱ እና ማስታወቂያዎን በመጀመሪያ ገጽ ላይ ለማሳየት የ \'Boost\' አገልግሎትን ይጠቀሙ።'
    }
  },

  // Category: decline
  {
    id: 'dec-1',
    category: 'decline',
    question: {
      en: 'Why was my listing declined?',
      om: 'Beeksisni koo maaliif ittifame?',
      am: 'ማስታወቂያዬ ለምን ውድቅ ተደረገ?'
    },
    answer: {
      en: 'Listings are declined if they contain incorrect prices, misleading images, prohibited items, or inappropriate keywords.',
      om: 'Gatiin sobaa, suuraan dogoggoraa ykn meeshonni dhowwadhaa yoo jiraatan beeksisni kee ni dhowwama.',
      am: 'ማስታወቂያዎች ውድቅ የሚደረጉት የተሳሳተ ዋጋ፣ አሳሳች ምስሎች፣ ወይም የተከለከሉ ቁሶች ሲኖራቸው ነው።'
    }
  },
  {
    id: 'dec-2',
    category: 'decline',
    question: {
      en: 'What items are prohibited on Sof Umer?',
      om: 'Meeshaalee akkamiitu dhowwadha?',
      am: 'በሶፍ ኡመር ላይ የተከለከሉ ቁሶች ምንድናቸው?'
    },
    answer: {
      en: 'Weapons, illegal drugs, hazardous materials, counterfeit goods, and offensive content are strictly prohibited.',
      om: 'Meeshaaleen waraanaa, qorichoonni dhowwaman, meeshaleen sobaa fi arrabsoon guutaman dhowwadha.',
      am: 'የጦር መሳሪያዎች፣ አደንዛዥ እጾች፣ የሐሰት ምርቶች እና መርዛማ ቁሶች በሶፍ ኡመር ላይ መለጠፍ በጥብቅ የተከለከለ ነው።'
    }
  },
  {
    id: 'dec-3',
    category: 'decline',
    question: {
      en: 'Can I post the same item multiple times?',
      om: 'Meeshaa tokko si\'a baay\'ee post gochuu nan danda\'aa?',
      am: 'አንድን ማስታወቂያ በተደጋጋሚ መለጠፍ እችላለሁ?'
    },
    answer: {
      en: 'No, duplicate listings are not allowed. Duplicate posts will be automatically declined or removed by the system.',
      om: 'Lakki, beeksisa wal-fakkaatu irra deddeebisanii baasuun dhowwadha. Beeksisni dabalataa ni haquma.',
      am: 'አይ፣ ተደጋጋሚ ማስታወቂያዎችን መለጠፍ አይፈቀድም። ተደጋጋሚ ዝርዝሮች በስርዓቱ ወዲያውኑ ውድቅ ይደረጋሉ።'
    }
  },
  {
    id: 'dec-4',
    category: 'decline',
    question: {
      en: 'How do I fix a declined listing?',
      om: 'Beeksisa ittifame akkamitti sirreessu?',
      am: 'ውድቅ የተደረገ ማስታወቂያን እንዴት ማስተካከል እችላለሁ?'
    },
    answer: {
      en: 'Go to "My Listings", read the decline reason, correct the issues (e.g., set real prices or real images), and resubmit.',
      om: '\'My Listings\' deemi, sababa ittisamee dubbisi, sirreessi, achiis deebisii ergi.',
      am: 'ወደ \'የእኔ ማስታወቂያዎች\' ይሂዱ፣ ውድቅ የተደረገበትን ምክንያት ያንብቡ፣ ያስተካክሉ እና እንደገና ያስገቡ።'
    }
  },

  // Category: safety
  {
    id: 'saf-1',
    category: 'safety',
    question: {
      en: 'How do I verify my listing ownership?',
      om: 'Abbummaa beeksisa koo akkamitti mirkaneessa?',
      am: 'የንብረቴን ባለቤትነት እንዴት ማረጋገጥ እችላለሁ?'
    },
    answer: {
      en: 'When creating or editing a listing, upload supporting documentation like title deeds, cards, or registry contracts to get verified status.',
      om: 'Beeksisa yeroo dhiyyeessitu, kaartaa manneenii, hayyama gurgurtaa ykn ragaa seeraa dhiyeessi.',
      am: 'ማስታወቂያ ሲፈጥሩ የባለቤትነት ካርታ፣ የሊዝ ሰነድ ወይም ህጋዊ የውክልና ሰነዶችን በማያያዝ የተረጋገጠ ባጅ ማግኘት ይችላሉ።'
    }
  },
  {
    id: 'saf-2',
    category: 'safety',
    question: {
      en: 'What safety precautions should I take?',
      om: 'Nageenya kootiif maal gochuu qaba?',
      am: 'ምን ዓይነት የደህንነት ጥንቃቄዎችን ማድረግ አለብኝ?'
    },
    answer: {
      en: 'Always meet in well-lit public places, inspect items in person, and never send upfront payments or deposits to unverified accounts.',
      om: 'Yeroo hunda iddoowwan ifa ta\'anitti wal-argaa, suuraan qofa osoo hin ta\'in ijaan mirkaneessaa, kaffaltii dursaa hin ergininaa.',
      am: 'ሁል ጊዜ በሕዝብ ቦታዎች ይገናኙ፣ እቃዎችን በአካል ይመልከቱ፣ እና ለማይታወቁ ሰዎች የቅድሚያ ክፍያ በጭራሽ አይላኩ።'
    }
  },
  {
    id: 'saf-3',
    category: 'safety',
    question: {
      en: 'How do I report a suspicious user or listing?',
      om: 'Beeksisa shakkisiisaa akkamitti gabaasa?',
      am: 'አጠራጣሪ ማስታወቂያ ወይም ተጠቃሚን እንዴት ሪፖርት ማድረግ እችላለሁ?'
    },
    answer: {
      en: 'Click the "Report Listing" safety shield icon on the listing page, choose the reason, write a description, and submit.',
      om: 'Fuula beeksisaa keessatti mallattoo \'Report\' cuqaasi, sababa dhiyeessi, achiis ergi.',
      am: 'በማስታወቂያው ገጽ ላይ የ \'ሪፖርት\' (Report) ምልክቱን ይጫኑ፣ ምክንያቱን ይምረጡ፣ መግለጫ ይጻፉ እና ያስገቡ።'
    }
  },
  {
    id: 'saf-4',
    category: 'safety',
    question: {
      en: 'Does Sof Umer guarantee transactions?',
      om: 'Sof Umer kaffaltii fi gurgurtaa ni mirkaneessaa?',
      am: 'ሶፍ ኡመር ለግብይቶች ዋስትና ይሰጣል?'
    },
    answer: {
      en: 'No, Sof Umer is an introductory platform. Transactions are conducted and finalized directly between buyers and sellers under their own responsibility.',
      om: 'Lakki, Sof Umer wal-qunnamsiisaa qofa. Waliigaltee dhuunfaan bittoota fi gurgurtoota gidduutti raawwatama.',
      am: 'አይ፣ ሶፍ ኡመር አስተዋዋቂዎችን እና ገዢዎችን የሚያገናኝ መድረክ ነው። ግብይቶች የሚፈጸሙት በራሳችሁ ኃላፊነት ነው።'
    }
  },

  // Category: payments
  {
    id: 'pay-1',
    category: 'payments',
    question: {
      en: 'What payment methods are supported for boosting?',
      om: 'Boost gochuuf kaffaltii maalfaatu jira?',
      am: 'ለማስታወቂያ ማስተዋወቂያ ምን ዓይነት ክፍያዎችን ትቀበላላችሁ?'
    },
    answer: {
      en: 'We support CBE Birr, Telebirr, and direct bank transfers. You can upload the deposit receipt in your dashboard.',
      om: 'CBE Birr, Telebirr fi kaffaltii Baankii biyyaalessaa hunda ni hordofna. Kaffaltii dhiyeessanii ragaa fidaa.',
      am: 'በቴሌብር፣ በሲቢኢ ብር (CBE Birr) እና በቀጥታ የባንክ ሂሳቦች ክፍያ መፈጸም ይችላሉ። የክፍያ ሰነዱን በዳሽቦርድዎ ላይ ይጫኑ።'
    }
  },
  {
    id: 'pay-2',
    category: 'payments',
    question: {
      en: 'Why is my deposit receipt pending?',
      om: 'Kaffaltiin koo maaliif Pending ta\'a?',
      am: 'የከፈልኩበት ሰነድ ለምን በፈቃድ መጠበቂያ (Pending) ላይ ይቆያል?'
    },
    answer: {
      en: 'Our finance team manually audits all transaction receipts against bank ledgers. This process typically takes between 10 minutes and 2 hours.',
      om: 'Gareen keenya kaffaltii kee qulqulleessuuf daqiiqaa 10 hanga sa\'aatii 2 fudhachuu danda\'a.',
      am: 'የእኛ አስተዳዳሪ የባንክ ማስተላለፊያ ሰነዱን ከባንክ ሂሳባችን ጋር ለማጣራት ከ 10 ደቂቃ እስከ 2 ሰዓታት ይፈጅበታል።'
    }
  },
  {
    id: 'pay-3',
    category: 'payments',
    question: {
      en: 'Can I get a refund for an active boost?',
      om: 'Kaffaltii dursaa deebifachuu nan danda\'aa?',
      am: 'የማስተዋወቂያ ክፍያ ተመላሽ ይደረጋል?'
    },
    answer: {
      en: 'No, once a listing has been boosted and approved, the service is considered rendered, and boost payments are non-refundable.',
      om: 'Lakki, beeksisi erga boost ta\'ee gabaatti ba\'ee booda, kaffaltiin hin deebi\'u.',
      am: 'አይ፣ ማስታወቂያዎ አንዴ ከተዋወቀ እና gabaa ላይ ከዋለ በኋላ ክፍያው ተመላሽ አይደረግም።'
    }
  },
  {
    id: 'pay-4',
    category: 'payments',
    question: {
      en: 'How much does it cost to boost a listing?',
      om: 'Boost gochuuf gatiin meeqa?',
      am: 'ማስታወቂያን ለማስተዋወቅ ዋጋው ስንት ነው?'
    },
    answer: {
      en: 'Boosting costs vary by category and duration. You can view the exact rates on the listing boost page.',
      om: 'Gatiin beeksisa dursuu (boost) damee fi guyyoota beeksisaa irratti hundaa\'a. Gatii guutuu beeksisa dursuu keessatti ilaaluu dandeessu.',
      am: 'የማስታወቂያ ማስተዋወቂያ ዋጋዎች እንደ ምድቡ እና ለስንት ቀናት እንደሚቆይ ይለያያሉ። ዋጋዎቹን በ Boost ገጽ ላይ ማየት ይችላሉ።'
    }
  },

  // Category: support
  {
    id: 'sup-1',
    category: 'support',
    question: {
      en: 'How do I contact customer support?',
      om: 'Gareen deggarsaa akkamitti qunnamna?',
      am: 'የደንበኞች አገልግሎትን እንዴት ማግኘት እችላለሁ?'
    },
    answer: {
      en: 'Use the Contact Support form in the Support tab, call +251 911 000 000, or email support@sofumer.com.',
      om: 'Taba \'Support\' keessatti foomii quunnamtii fayyadami, bilbila +251 911 000 000 ykn imeelii support@sofumer.com fayyadami.',
      am: 'በ \'ድጋፍ\' (Support) ገጽ ያለውን ፎርም ይጠቀሙ፣ በ +251 911 000 000 ይደውሉ ወይም በ support@sofumer.com ይጻፉልን።'
    }
  }
];

// Content Translation helper
const staticTexts = {
  title: {
    en: 'Help & FAQ Center',
    om: 'Giddugala Deggarsa & FAQ',
    am: 'የእርዳታ እና በተደጋጋሚ የሚጠየቁ ጥያቄዎች ማዕከል'
  },
  subtitle: {
    en: 'Search our knowledge base or browse categories to find answers instantly.',
    om: 'Deebiiwwan battalatti argachuuf beekumsa keenya barbaadi ykn dameewwan dhiyeessi.',
    am: 'መልሶችን በፍጥነት ለማግኘት የእውቀት ማምረቻችንን ይፈልጉ ወይም ምድቦችን ያስሱ።'
  },
  searchPlaceholder: {
    en: 'Search for questions, keywords, or topics...',
    om: 'Gaaffilee, jechoota furtuu, ykn mata-dureewwan barbaadi...',
    am: 'ጥያቄዎችን፣ ቁልፍ ቃላትን ወይም ርዕሶችን ይፈልጉ...'
  },
  noResults: {
    en: 'No questions found matching your search. Try different keywords.',
    om: 'Gaaffiin barbaaddan hin argamne. Jechoota biraa fayyadamaa.',
    am: 'ከፍለጋዎ ጋር የሚዛመድ ጥያቄ አልተገኘም። እባክዎን ሌላ ቃል ይሞክሩ።'
  },
  copySuccess: {
    en: 'Copied to clipboard!',
    om: 'Gara Clipboarditti kofifameera!',
    am: 'ወደ ቅንጥብ ሰሌዳ ተገልብጧል!'
  },
  shareSuccess: {
    en: 'Link copied! Share this FAQ article.',
    om: 'Liinkiin kofifameera! Beeksisa FAQ kana hirmaadhu.',
    am: 'ሊንኩ ተገልብጧል! ይህንን ጥያቄ ያጋሩት።'
  },
  contactTitle: {
    en: 'Still need help? Contact Support',
    om: 'Gargaarsi dabalataa si barbaachisaa? Nu Quunnamaa',
    am: 'አሁንም እገዛ ይፈልጋሉ? ድጋፍ ሰጪዎችን ያግኙ'
  },
  contactSubtitle: {
    en: 'Submit a support ticket and our team will get back to you within 2 hours.',
    om: 'Tikitii deggarsaa ergi, gareen keenya sa\'aatii 2 keessatti si quunnama.',
    am: 'የድጋፍ መጠየቂያ ቅጽ ያስገቡ፣ ቡድናችን በ 2 ሰዓታት ውስጥ ይመልስልዎታል።'
  },
  contactName: {
    en: 'Your Full Name',
    om: 'Maqaa Guutuu',
    am: 'ሙሉ ስምዎ'
  },
  contactEmail: {
    en: 'Email Address',
    om: 'Imeelii keessan',
    am: 'ኢሜል አድራሻ'
  },
  contactMessage: {
    en: 'Message / Question Details',
    om: 'Ergaa / Ibsa Gaaffii',
    am: 'መልዕክት / የጥያቄው ዝርዝር'
  },
  contactSubmit: {
    en: 'Send Support Message',
    om: 'Ergaa Deggarsaa Ergi',
    am: 'የድጋፍ መልዕክት ላክ'
  },
  contactSubmitting: {
    en: 'Sending...',
    om: 'Ergamaa jira...',
    am: 'በመላክ ላይ...'
  },
  contactSuccessMsg: {
    en: 'Message sent successfully! Our support team will contact you shortly.',
    om: 'Ergaan kee milkaa\'inaan ergameera! Gareen keenya dhiyootti si quunnama.',
    am: 'መልዕክትዎ በተሳካ ሁኔታ ተልኳል! የድጋፍ ቡድናችን በቅርቡ ያገኝዎታል።'
  },
  contactErrorMsg: {
    en: 'Failed to send message. Please try again.',
    om: 'Ergaan hin ergamne. Maaloo irra deebi\'i yaali.',
    am: 'መልዕክቱን መላክ አልተቻለም። እባክዎን እንደገና ይሞክሩ።'
  },
  quickContact: {
    en: 'Quick Help Contacts',
    om: 'Quunnamtii Ariifachiisaa',
    am: 'የፈጣን እገዛ አድራሻዎች'
  }
};

export default function HelpCenter() {
  const { currentLanguage, faqs: contextFaqs, voteFaqHelpful, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [votedIds, setVotedIds] = useState<Record<string, 'yes' | 'no'>>({});
  
  // Notification states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState(false);

  // Translate helper for multilingual objects (e.g. { en: '...', om: '...', am: '...' })
  const tr = (obj: Record<string, string> | undefined | null) => {
    if (!obj) return '';
    return obj[currentLanguage] || obj['en'] || Object.values(obj)[0] || '';
  };

  // Helper for UI keys: tries global t() first, then staticTexts fallback, then key/default
  const trText = (key: string, staticFallback?: Record<string, string>): string => {
    const globalVal = t(key);
    if (globalVal && globalVal !== key) return globalVal;
    if (staticFallback) {
      return staticFallback[currentLanguage] || staticFallback['en'] || Object.values(staticFallback)[0] || '';
    }
    return key;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Combine server FAQs with fallback
  const effectiveFaqs = useMemo(() => {
    if (Array.isArray(contextFaqs) && contextFaqs.length > 0) {
      return contextFaqs.filter(f => f.status !== 'draft');
    }
    return faqData as any[];
  }, [contextFaqs]);

  // Handle URL deep linking if faqId is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const faqId = params.get('faqId');
    if (faqId) {
      setExpandedId(faqId);
      const el = document.getElementById(`faq-item-${faqId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, []);

  // Filter and search FAQs
  const filteredFAQs = useMemo(() => {
    return effectiveFaqs.filter(item => {
      // 1. Tab filter
      if (activeTab === 'popular') {
        if (!item.isPopular && item.category !== 'popular') return false;
      } else if (activeTab !== 'all' && item.category !== activeTab) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const questionText = tr(item.question).toLowerCase();
        const answerText = tr(item.answer).toLowerCase();
        return questionText.includes(query) || answerText.includes(query);
      }
      return true;
    });
  }, [effectiveFaqs, activeTab, searchQuery, currentLanguage]);

  // Search live suggestions (max 5)
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return effectiveFaqs
      .filter(item => tr(item.question).toLowerCase().includes(query))
      .slice(0, 5);
  }, [effectiveFaqs, searchQuery, currentLanguage]);

  // Toggle accordion (one open at a time)
  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Vote helpfulness
  const handleVote = async (e: React.MouseEvent, id: string, type: 'yes' | 'no') => {
    e.stopPropagation();
    if (votedIds[id]) return;
    setVotedIds(prev => ({ ...prev, [id]: type }));
    if (voteFaqHelpful) {
      await voteFaqHelpful(id, type);
    }
    showToast(type === 'yes' ? 'Thank you for your feedback!' : 'Feedback received. We will improve this article.');
  };

  // Copy answer helper
  const handleCopy = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const textToCopy = `${tr(item.question)}\n\n${tr(item.answer)}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(item.id);
      showToast(trText('help.copy_success', staticTexts.copySuccess));
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Share link helper
  const handleShare = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?view=info-page&pageId=help-center&faqId=${item.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast(trText('help.share_success', staticTexts.shareSuccess));
    });
  };

  // Print helper
  const handlePrint = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Sof Umer FAQ - ${tr(item.question)}</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
              h1 { color: #059669; font-size: 20px; border-bottom: 2px solid #eee; padding-bottom: 12px; }
              p { font-size: 14px; margin-top: 16px; }
              footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
            </style>
          </head>
          <body>
            <h1>${tr(item.question)}</h1>
            <p>${tr(item.answer)}</p>
            <footer>Sof Umer Official Marketplace FAQ - ${new Date().toLocaleDateString()}</footer>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // Handle Contact Ticket submission
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setSubmitting(true);
    setFormSuccess(false);
    setFormError(false);

    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          subject: `Help Center Direct Ticket from ${name.trim()}`,
          message: message.trim()
        })
      });

      if (res.ok) {
        setFormSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setFormError(true);
      }
    } catch (err) {
      console.error('Error submitting support ticket:', err);
      setFormError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto" id="help-center-container">
      
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
        <span className="hover:text-emerald-400 cursor-pointer transition">{t('home') || 'Home'}</span>
        <ChevronRight className="w-3.5 h-3.5 text-white/20" />
        <span className="text-white/60">{trText('help.title', staticTexts.title)}</span>
        {activeTab !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
            <span className="text-emerald-400 font-semibold">{tr(categoryTranslations[activeTab]) || activeTab}</span>
          </>
        )}
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/40 via-black to-slate-950 border border-emerald-500/20 p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <HelpCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              {trText('help.title', staticTexts.title)}
            </h2>
            <p className="text-xs md:text-sm text-white/60 font-light mt-1">
              {trText('help.subtitle', staticTexts.subtitle)}
            </p>
          </div>
        </div>

        {/* Search Bar with Live Suggestions Dropdown */}
        <div className="relative w-full max-w-2xl pt-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
            <input
              id="help-center-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={trText('help.search_placeholder', staticTexts.searchPlaceholder)}
              className="w-full bg-black/80 hover:bg-black focus:bg-black border border-white/15 focus:border-emerald-500 rounded-2xl py-3.5 px-11 text-xs md:text-sm text-white placeholder-white/40 focus:outline-none transition duration-300 font-sans shadow-2xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white uppercase font-black tracking-widest cursor-pointer"
              >
                {t('clear') || 'Clear'}
              </button>
            )}
          </div>

          {/* Live Suggestions Overlay */}
          {searchSuggestions.length > 0 && searchQuery.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 right-0 top-full mt-2 z-30 bg-[#0d0f14] border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>{t('matching_questions') || 'Matching Questions'}</span>
              </div>
              {searchSuggestions.map(sugg => (
                <button
                  key={sugg.id}
                  onClick={() => {
                    setExpandedId(sugg.id);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-emerald-500/10 rounded-xl transition flex items-center justify-between gap-2"
                >
                  <span className="truncate">{tr(sugg.question)}</span>
                  <span className="text-[9px] text-emerald-400 uppercase font-mono shrink-0">{sugg.category}</span>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('browse_categories') || 'Browse Categories'}</span>
          </span>
          <span className="text-xs text-white/40">{filteredFAQs.length} {t('questions_available') || 'questions available'}</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5" id="help-categories-tabs">
          {Object.keys(categoryTranslations).map(key => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-250 cursor-pointer flex items-center gap-1.5 ${
                activeTab === key
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5'
              }`}
            >
              <span>{tr(categoryTranslations[key])}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: FAQs Accordion List */}
        <div className="lg:col-span-8 space-y-4" id="faq-list-container">
          {filteredFAQs.length > 0 ? (
            <div className="space-y-3">
              {filteredFAQs.map((item) => {
                const isExpanded = expandedId === item.id;
                const userVote = votedIds[item.id];

                return (
                  <div
                    key={item.id}
                    id={`faq-item-${item.id}`}
                    className={`bg-white/[0.03] hover:bg-white/[0.05] border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isExpanded 
                        ? 'border-emerald-500/40 bg-white/[0.04] shadow-2xl' 
                        : 'border-white/5'
                    }`}
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="w-full py-4.5 px-5 flex items-start justify-between gap-4 text-left transition focus:outline-none cursor-pointer"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {tr(categoryTranslations[item.category]) || item.category}
                          </span>
                          {item.isPopular && (
                            <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-400" />
                              <span>{t('popular') || 'Popular'}</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs md:text-sm font-medium text-white/90 font-sans leading-relaxed">
                          {tr(item.question)}
                        </h4>
                      </div>
                      <div className="pt-1.5 shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-emerald-400 rotate-180 transition duration-300" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-white/40 transition duration-300" />
                        )}
                      </div>
                    </button>

                    {/* Accordion body panels */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                          <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-4">
                            <p className="text-xs md:text-sm text-white/70 font-light leading-relaxed font-sans whitespace-pre-wrap">
                              {tr(item.answer)}
                            </p>

                            {/* Helpfulness Voting and Actions Bar */}
                            <div className="flex flex-wrap gap-4 justify-between items-center pt-3 border-t border-white/[0.05]">
                              {/* Was this helpful? */}
                              <div className="flex items-center gap-2 text-xs text-white/50">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{t('was_this_helpful') || 'Was this helpful?'}</span>
                                <button
                                  onClick={(e) => handleVote(e, item.id, 'yes')}
                                  disabled={!!userVote}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                                    userVote === 'yes'
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold'
                                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60 hover:text-white'
                                  }`}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>{t('yes') || 'Yes'} ({ (item.helpfulYes || 0) + (userVote === 'yes' ? 1 : 0) })</span>
                                </button>
                                <button
                                  onClick={(e) => handleVote(e, item.id, 'no')}
                                  disabled={!!userVote}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                                    userVote === 'no'
                                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-bold'
                                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/60 hover:text-white'
                                  }`}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                  <span>{t('no') || 'No'} ({ (item.helpfulNo || 0) + (userVote === 'no' ? 1 : 0) })</span>
                                </button>
                              </div>

                              {/* Tools: Copy / Share / Print */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => handleCopy(e, item)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] md:text-xs text-white/50 hover:text-white transition cursor-pointer"
                                  title="Copy text"
                                >
                                  {copiedId === item.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                  <span>{t('copy') || 'Copy'}</span>
                                </button>
                                
                                <button
                                  onClick={(e) => handleShare(e, item)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] md:text-xs text-white/50 hover:text-white transition cursor-pointer"
                                  title="Share link"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                  <span>{t('share') || 'Share'}</span>
                                </button>

                                <button
                                  onClick={(e) => handlePrint(e, item)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] md:text-xs text-white/50 hover:text-white transition cursor-pointer"
                                  title="Print FAQ"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>{t('print') || 'Print'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-3xl space-y-3">
              <HelpCircle className="w-10 h-10 text-white/20 mx-auto" />
              <p className="text-sm font-medium text-white/60">{trText('help.no_results', staticTexts.noResults)}</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                className="text-xs text-emerald-400 underline hover:text-emerald-300 font-semibold"
              >
                {t('reset_search_filters') || 'Reset Search Filters'}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Quick Contacts & Support Form */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Help Contacts info */}
          <div className="bg-[#0d0d12]/60 border border-white/5 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{trText('help.quick_contact', staticTexts.quickContact)}</span>
            </h4>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-white/80">{t('support_hotline') || 'Support Hotline'}</p>
                  <p className="text-white/50 font-mono">+251 911 000 000</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-white/80">{t('email_support') || 'Email Support'}</p>
                  <p className="text-white/50 font-mono">support@sofumer.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-white/80">{t('headquarters') || 'Headquarters'}</p>
                  <p className="text-white/50 leading-relaxed">{t('headquarters_address') || 'Bole District, near Edna Mall, Addis Ababa, Ethiopia'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-white/80">{t('response_guarantee') || 'Response Guarantee'}</p>
                  <p className="text-white/50">{t('response_guarantee_time') || 'Under 2 hours (8:00 AM - 6:00 PM)'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Support Form */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-5 space-y-5 shadow-2xl" id="contact-support-form-card">
            <div className="space-y-1 border-b border-white/5 pb-3">
              <h4 className="text-xs md:text-sm font-serif font-bold text-white tracking-tight flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{trText('help.contact_title', staticTexts.contactTitle)}</span>
              </h4>
              <p className="text-[10px] text-white/40 leading-relaxed font-light">
                {trText('help.contact_subtitle', staticTexts.contactSubtitle)}
              </p>
            </div>

            {formSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl font-bold text-center flex flex-col items-center gap-2 animate-in fade-in duration-300">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <span>{trText('help.contact_success_msg', staticTexts.contactSuccessMsg)}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                
                {formError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg text-center font-bold">
                    {trText('help.contact_error_msg', staticTexts.contactErrorMsg)}
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5">
                    {trText('help.contact_name', staticTexts.contactName)}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Abebe Kebede"
                    className="w-full p-2.5 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none focus:border-emerald-500 transition font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5">
                    {trText('help.contact_email', staticTexts.contactEmail)}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g., abebe@gmail.com"
                    className="w-full p-2.5 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none focus:border-emerald-500 transition font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5">
                    {trText('help.contact_message', staticTexts.contactMessage)}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={t('describe_issue_placeholder') || 'Describe your issue or request in detail...'}
                    className="w-full p-2.5 bg-black border border-white/10 text-xs text-white rounded-xl focus:outline-none focus:border-emerald-500 transition font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/40 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? trText('help.contact_submitting', staticTexts.contactSubmitting) : trText('help.contact_submit', staticTexts.contactSubmit)}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0c0c0c] border border-emerald-500/30 text-white rounded-xl py-2.5 px-4 text-xs font-medium shadow-2xl flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
