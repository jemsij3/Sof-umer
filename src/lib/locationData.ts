export interface CityOption {
  id: string;
  name: { en: string; om: string; am: string };
}

export interface RegionOption {
  id: string;
  name: { en: string; om: string; am: string };
  cities: CityOption[];
}

export const ETHIOPIA_LOCATIONS: RegionOption[] = [
  {
    id: 'all',
    name: { en: 'All Ethiopia', om: 'Guutuu Itoophiyaa', am: 'መላው ኢትዮጵያ' },
    cities: []
  },
  {
    id: 'addis_ababa',
    name: { en: 'Addis Ababa', om: 'Finfinnee', am: 'አዲስ አበባ' },
    cities: [
      { id: 'addis_bole', name: { en: 'Bole', om: 'Bolee', am: 'ቦሌ' } },
      { id: 'addis_kirkos', name: { en: 'Kirkos', om: 'Kiirkoos', am: 'ቂርቆስ' } },
      { id: 'addis_yeka', name: { en: 'Yeka', om: 'Yakka', am: 'የካ' } },
      { id: 'addis_lideta', name: { en: 'Lideta', om: 'Lideetaa', am: 'ልደታ' } },
      { id: 'addis_nifas_silk', name: { en: 'Nifas Silk Lafto', om: 'Nifaas Silk Laftoo', am: 'ንፋስ ስልክ ላፍቶ' } },
      { id: 'addis_arada', name: { en: 'Arada', om: 'Araadaa', am: 'አራዳ' } },
      { id: 'addis_gullele', name: { en: 'Gullele', om: 'Gullaallee', am: 'ጉለሌ' } },
      { id: 'addis_kolfe', name: { en: 'Kolfe Keranio', om: 'Kolfii Qaraaniyoo', am: 'ኮልፌ ቀራኒዮ' } },
      { id: 'addis_akaky', name: { en: 'Akaky Kality', om: 'Akaakii Kaaliitii', am: 'አቃቂ ቃሊቲ' } },
      { id: 'addis_lemi_kura', name: { en: 'Lemi Kura', om: 'Lamee Kuraa', am: 'ለሚ ኩራ' } }
    ]
  },
  {
    id: 'oromia',
    name: { en: 'Oromia', om: 'Oromiyaa', am: 'ኦሮሚያ' },
    cities: [
      { id: 'oromia_adama', name: { en: 'Adama', om: 'Adaamaa', am: 'አዳማ' } },
      { id: 'oromia_jimma', name: { en: 'Jimma', om: 'Jimmaa', am: 'ጂማ' } },
      { id: 'oromia_bishoftu', name: { en: 'Bishoftu', om: 'Bishooftuu', am: 'ቢሾፍቱ' } },
      { id: 'oromia_nekemte', name: { en: 'Nekemte', om: 'Naqamte', am: 'ነቀምቴ' } },
      { id: 'oromia_shashemene', name: { en: 'Shashemene', om: 'Shaashamannee', am: 'ሻሸመኔ' } },
      { id: 'oromia_asella', name: { en: 'Asella', om: 'Aasallaa', am: 'አሰላ' } },
      { id: 'oromia_batu', name: { en: 'Batu (Ziway)', om: 'Baatuu (Ziwaay)', am: 'ባቱ (ዝዋይ)' } },
      { id: 'oromia_ambo', name: { en: 'Ambo', om: 'Ammboo', am: 'አምቦ' } },
      { id: 'oromia_burayu', name: { en: 'Burayu', om: 'Buraayyuu', am: 'ቡራዩ' } },
      { id: 'oromia_sebeta', name: { en: 'Sebeta', om: 'Sabbataa', am: 'ሰበታ' } },
      { id: 'oromia_dukem', name: { en: 'Dukem', om: 'Duukam', am: 'ዱከም' } },
      { id: 'oromia_robe', name: { en: 'Robe (Bale)', om: 'Roobee', am: 'ሮቤ' } },
      { id: 'oromia_woliso', name: { en: 'Woliso', om: 'Walisoo', am: 'ወሊሶ' } }
    ]
  },
  {
    id: 'amhara',
    name: { en: 'Amhara', om: 'Amaaraa', am: 'አማራ' },
    cities: [
      { id: 'amhara_bahir_dar', name: { en: 'Bahir Dar', om: 'Baahir Daar', am: 'ባሕር ዳር' } },
      { id: 'amhara_gondar', name: { en: 'Gondar', om: 'Gondaar', am: 'ጎንደር' } },
      { id: 'amhara_dessie', name: { en: 'Dessie', om: 'Dasee', am: 'ደሴ' } },
      { id: 'amhara_debre_birhan', name: { en: 'Debre Birhan', om: 'Debre Birhaan', am: 'ደብረ ብርሃን' } },
      { id: 'amhara_debre_markos', name: { en: 'Debre Markos', om: 'Debre Maarkos', am: 'ደብረ ማርቆስ' } },
      { id: 'amhara_kombolcha', name: { en: 'Kombolcha', om: 'Kombolchaa', am: 'ኮምቦልቻ' } },
      { id: 'amhara_woldiya', name: { en: 'Woldiya', om: 'Waldiyaa', am: 'ወልዲያ' } }
    ]
  },
  {
    id: 'tigray',
    name: { en: 'Tigray', om: 'Tigraay', am: 'ትግራይ' },
    cities: [
      { id: 'tigray_mekelle', name: { en: 'Mekelle', om: 'Maqalee', am: 'መቀሌ' } },
      { id: 'tigray_adigrat', name: { en: 'Adigrat', om: 'Adigraat', am: 'ዓዲግራት' } },
      { id: 'tigray_shire', name: { en: 'Shire', om: 'Shiree', am: 'ሽሬ' } },
      { id: 'tigray_axum', name: { en: 'Axum', om: 'Aaksum', am: 'አክሱም' } },
      { id: 'tigray_adwa', name: { en: 'Adwa', om: 'Adwaa', am: 'ዓድዋ' } }
    ]
  },
  {
    id: 'somali',
    name: { en: 'Somali', om: 'Somaalee', am: 'ሶማሌ' },
    cities: [
      { id: 'somali_jijiga', name: { en: 'Jijiga', om: 'Jijjiigaa', am: 'ጅጅጋ' } },
      { id: 'somali_gode', name: { en: 'Gode', om: 'Goodee', am: 'ጎዴ' } },
      { id: 'somali_degehabur', name: { en: 'Degehabur', om: 'Dhagaxbuur', am: 'ደገሃቡር' } },
      { id: 'somali_kebri_dahar', name: { en: 'Kebri Dahar', om: 'Qabridahare', am: 'ቀብሪዳሃር' } }
    ]
  },
  {
    id: 'afar',
    name: { en: 'Afar', om: 'Afaar', am: 'ዓፋር' },
    cities: [
      { id: 'afar_semera', name: { en: 'Semera', om: 'Samaraa', am: 'ሰመራ' } },
      { id: 'afar_logia', name: { en: 'Logia', om: 'Logiyaa', am: 'ሎጊያ' } },
      { id: 'afar_asaita', name: { en: 'Asaita', om: 'Asaayitaa', am: 'አሳይታ' } }
    ]
  },
  {
    id: 'sidama',
    name: { en: 'Sidama', om: 'Sidaamaa', am: 'ሲዳማ' },
    cities: [
      { id: 'sidama_hawassa', name: { en: 'Hawassa', om: 'Hawaasaa', am: 'ሀዋሳ' } },
      { id: 'sidama_yirgalem', name: { en: 'Yirgalem', om: 'Yirgaalam', am: 'ይርጋለም' } },
      { id: 'sidama_leku', name: { en: 'Leku', om: 'Lekuu', am: 'ለኩ' } }
    ]
  },
  {
    id: 'central_ethiopia',
    name: { en: 'Central Ethiopia', om: 'Itoophiyaa Wiirtuu', am: 'ማዕከላዊ ኢትዮጵያ' },
    cities: [
      { id: 'central_hossana', name: { en: 'Hossana', om: 'Hosaa\'inaa', am: 'ሆሳዕና' } },
      { id: 'central_welkite', name: { en: 'Welkite', om: 'Walkite', am: 'ወልቂጤ' } },
      { id: 'central_butajira', name: { en: 'Butajira', om: 'Buttaajiiraa', am: 'ቡታጅራ' } },
      { id: 'central_halaba', name: { en: 'Halaba', om: 'Halabaa', am: 'ሃላባ' } }
    ]
  },
  {
    id: 'south_ethiopia',
    name: { en: 'South Ethiopia', om: 'Itoophiyaa Kibbaa', am: 'ደቡብ ኢትዮጵያ' },
    cities: [
      { id: 'south_arba_minch', name: { en: 'Arba Minch', om: 'Arbaa Minc', am: 'አርባ ምንጭ' } },
      { id: 'south_wolaita_sodo', name: { en: 'Wolaita Sodo', om: 'Walaayittaa Soodoo', am: 'ወላይታ ሶዶ' } },
      { id: 'south_dilla', name: { en: 'Dilla', om: 'Dillaa', am: 'ዲላ' } },
      { id: 'south_sawla', name: { en: 'Sawla', om: 'Sawlaa', am: 'ሳውላ' } },
      { id: 'south_jinka', name: { en: 'Jinka', om: 'Jinkaa', am: 'ጂንካ' } }
    ]
  },
  {
    id: 'south_west_ethiopia',
    name: { en: 'South West Ethiopia', om: 'Kibba Lixaa Itoophiyaa', am: 'ደቡብ ምዕራብ ኢትዮጵያ' },
    cities: [
      { id: 'sw_bonga', name: { en: 'Bonga', om: 'Bongaa', am: 'ቦንጋ' } },
      { id: 'sw_mizan_teferi', name: { en: 'Mizan Teferi', om: 'Mizaan Tafarii', am: 'ሚዛን ተፈሪ' } },
      { id: 'sw_tepi', name: { en: 'Tepi', om: 'Tepii', am: 'ተፒ' } }
    ]
  },
  {
    id: 'benishangul_gumuz',
    name: { en: 'Benishangul-Gumuz', om: 'Banishaangul-Gumuz', am: 'ቤኒሻንጉል ጉሙዝ' },
    cities: [
      { id: 'bg_asosa', name: { en: 'Asosa', om: 'Aasosaa', am: 'አሶሳ' } },
      { id: 'bg_metekel', name: { en: 'Metekel', om: 'Metekel', am: 'መተከል' } }
    ]
  },
  {
    id: 'gambela',
    name: { en: 'Gambela', om: 'Gambellaa', am: 'ጋምቤላ' },
    cities: [
      { id: 'gambela_city', name: { en: 'Gambela City', om: 'Magaalaa Gambellaa', am: 'ጋምቤላ ከተማ' } },
      { id: 'gambela_itang', name: { en: 'Itang', om: 'Itaang', am: 'ኢታንግ' } }
    ]
  },
  {
    id: 'harari',
    name: { en: 'Harari', om: 'Hararii', am: 'ሐረሪ' },
    cities: [
      { id: 'harari_jugol', name: { en: 'Harar Jugol', om: 'Harar Jugol', am: 'ሐረር ጁጎል' } },
      { id: 'harari_erinqe', name: { en: 'Erinqe', om: 'Erinqe', am: 'እሪንቄ' } }
    ]
  },
  {
    id: 'dire_dawa',
    name: { en: 'Dire Dawa', om: 'Dirree Dawaa', am: 'ድሬዳዋ' },
    cities: [
      { id: 'dd_city', name: { en: 'Dire Dawa City', om: 'Magaalaa Dirree Dawaa', am: 'ድሬዳዋ ከተማ' } },
      { id: 'dd_sabian', name: { en: 'Sabian', om: 'Saabiyaan', am: 'ሳቢያን' } },
      { id: 'dd_kebele_01', name: { en: 'Kebele 01', om: 'Ganda 01', am: 'ቀበሌ 01' } }
    ]
  }
];

export function getLocalizedLocationName(
  locationIdOrName: string,
  lang: 'en' | 'om' | 'am' = 'en'
): string {
  if (!locationIdOrName || locationIdOrName === 'All' || locationIdOrName === 'all' || locationIdOrName === 'All Ethiopia') {
    if (lang === 'om') return '🌍 Guutuu Itoophiyaa';
    if (lang === 'am') return '🌍 መላው ኢትዮጵያ';
    return '🌍 All Ethiopia';
  }

  // Check region
  for (const region of ETHIOPIA_LOCATIONS) {
    if (
      region.id.toLowerCase() === locationIdOrName.toLowerCase() ||
      region.name.en.toLowerCase() === locationIdOrName.toLowerCase() ||
      region.name.om.toLowerCase() === locationIdOrName.toLowerCase() ||
      region.name.am.toLowerCase() === locationIdOrName.toLowerCase()
    ) {
      const name = region.name[lang] || region.name.en;
      return region.id === 'all' ? `🌍 ${name}` : `📍 ${name}`;
    }
    // Check cities
    for (const city of region.cities) {
      if (
        city.id.toLowerCase() === locationIdOrName.toLowerCase() ||
        city.name.en.toLowerCase() === locationIdOrName.toLowerCase() ||
        city.name.om.toLowerCase() === locationIdOrName.toLowerCase() ||
        city.name.am.toLowerCase() === locationIdOrName.toLowerCase()
      ) {
        return `📍 ${city.name[lang] || city.name.en}`;
      }
    }
  }

  return `📍 ${locationIdOrName}`;
}

export function matchesLocationFilter(propertyLocation: string, selectedLocation: string): boolean {
  if (
    !selectedLocation ||
    selectedLocation === 'All' ||
    selectedLocation === 'all' ||
    selectedLocation === 'All Ethiopia' ||
    selectedLocation === 'Guutuu Itoophiyaa' ||
    selectedLocation === 'መላው ኢትዮጵያ'
  ) {
    return true;
  }
  if (!propertyLocation) return false;

  const propLoc = propertyLocation.toLowerCase();
  const selLoc = selectedLocation.toLowerCase();

  // Substring match
  if (propLoc.includes(selLoc)) return true;

  // Check region match
  for (const region of ETHIOPIA_LOCATIONS) {
    if (
      region.id.toLowerCase() === selLoc ||
      region.name.en.toLowerCase() === selLoc ||
      region.name.om.toLowerCase() === selLoc ||
      region.name.am.toLowerCase() === selLoc
    ) {
      // Check region name matches propertyLocation
      if (
        propLoc.includes(region.name.en.toLowerCase()) ||
        propLoc.includes(region.name.om.toLowerCase()) ||
        propLoc.includes(region.name.am.toLowerCase())
      ) {
        return true;
      }

      // Check if propertyLocation contains any city in this region
      for (const city of region.cities) {
        if (
          propLoc.includes(city.name.en.toLowerCase()) ||
          propLoc.includes(city.name.om.toLowerCase()) ||
          propLoc.includes(city.name.am.toLowerCase())
        ) {
          return true;
        }
      }
    }

    // Check city match
    for (const city of region.cities) {
      if (
        city.id.toLowerCase() === selLoc ||
        city.name.en.toLowerCase() === selLoc ||
        city.name.om.toLowerCase() === selLoc ||
        city.name.am.toLowerCase() === selLoc
      ) {
        if (
          propLoc.includes(city.name.en.toLowerCase()) ||
          propLoc.includes(city.name.om.toLowerCase()) ||
          propLoc.includes(city.name.am.toLowerCase())
        ) {
          return true;
        }
      }
    }
  }

  return false;
}
