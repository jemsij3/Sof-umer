/**
 * Sof Umer - High-Accuracy Amharic (Ge'ez/Ethiopic) Phonetic Transliterator
 * Converts phonetic Latin typing from native mobile/desktop keyboards into accurate Ge'ez script.
 */

// Consonant families: [1st (e), 2nd (u), 3rd (i), 4th (a), 5th (ie), 6th (base), 7th (o), 8th (wa)]
const CONSONANT_FAMILIES: Record<string, string[]> = {
  'h':   ['ሀ', 'ሁ', 'ሂ', 'ሃ', 'ሄ', 'ህ', 'ሆ', 'ኋ'],
  'hh':  ['ሐ', 'ሑ', 'ሒ', 'ሓ', 'ሔ', 'ሕ', 'ሖ', 'ሗ'],
  'hhh': ['ኀ', 'ኁ', 'ኂ', 'ኃ', 'ኄ', 'ኅ', 'ኆ', 'ኋ'],
  'l':   ['ለ', 'ሉ', 'ሊ', 'ላ', 'ሌ', 'ል', 'ሎ', 'ሏ'],
  'm':   ['መ', 'ሙ', 'ሚ', 'ማ', 'ሜ', 'ም', 'ሞ', 'ሟ'],
  'r':   ['ረ', 'ሩ', 'ሪ', 'ራ', 'ሬ', 'ር', 'ሮ', 'ሯ'],
  's':   ['ሰ', 'ሱ', 'ሲ', 'ሳ', 'ሴ', 'ስ', 'ሶ', 'ሷ'],
  'ss':  ['ሠ', 'ሡ', 'ሢ', 'ሣ', 'ሤ', 'ሥ', 'ሦ', 'ሧ'],
  'sh':  ['ሸ', 'ሹ', 'ሺ', 'ሻ', 'ሼ', 'ሽ', 'ሾ', 'ሿ'],
  'q':   ['ቀ', 'ቁ', 'ቂ', 'ቃ', 'ቄ', 'ቅ', 'ቆ', 'ቋ'],
  'b':   ['በ', 'ቡ', 'ቢ', 'ባ', 'ቤ', 'ብ', 'ቦ', 'ቧ'],
  'v':   ['ቨ', 'ቩ', 'ቪ', 'ቫ', 'ቬ', 'ቭ', 'ቮ', 'ቯ'],
  't':   ['ተ', 'ቱ', 'ቲ', 'ታ', 'ቴ', 'ት', 'ቶ', 'ቷ'],
  'th':  ['ተ', 'ቱ', 'ቲ', 'ታ', 'ቴ', 'ት', 'ቶ', 'ቷ'],
  'ch':  ['ቸ', 'ቹ', 'ቺ', 'ቻ', 'ቼ', 'ች', 'ቾ', 'ቿ'],
  'c':   ['ቸ', 'ቹ', 'ቺ', 'ቻ', 'ቼ', 'ች', 'ቾ', 'ቿ'],
  'n':   ['ነ', 'ኑ', 'ኒ', 'ና', 'ኔ', 'ን', 'ኖ', 'ኗ'],
  'gn':  ['ኘ', 'ኙ', 'ኚ', 'ኛ', 'ኜ', 'ኝ', 'ኞ', 'ኟ'],
  'ny':  ['ኘ', 'ኙ', 'ኚ', 'ኛ', 'ኜ', 'ኝ', 'ኞ', 'ኟ'],
  'k':   ['ከ', 'ኩ', 'ኪ', 'ካ', 'ኬ', 'ክ', 'ኮ', 'ኳ'],
  'kh':  ['ኸ', 'ኹ', 'ኺ', 'ኻ', 'ኼ', 'ኽ', 'ኾ', 'ዃ'],
  'w':   ['ወ', 'ዉ', 'ዊ', 'ዋ', 'ዌ', 'ው', 'ዎ', 'ዏ'],
  'z':   ['ዘ', 'ዙ', 'ዚ', 'ዛ', 'ዜ', 'ዝ', 'ዞ', 'ዟ'],
  'zh':  ['ዠ', 'ዡ', 'ዢ', 'ዣ', 'ዤ', 'ዥ', 'ዦ', 'ዧ'],
  'y':   ['የ', 'ዩ', 'ዪ', 'ያ', 'ዬ', 'ይ', 'ዮ', 'ዯ'],
  'd':   ['ደ', 'ዱ', 'ዲ', 'ዳ', 'ዴ', 'ድ', 'ዶ', 'ዷ'],
  'j':   ['ጀ', 'ጁ', 'ጂ', 'ጃ', 'ጄ', 'ጅ', 'ጆ', 'ጇ'],
  'g':   ['ገ', 'ጉ', 'ጊ', 'ጋ', 'ጌ', 'ግ', 'ጎ', 'ጓ'],
  'tt':  ['ጠ', 'ጡ', 'ጢ', 'ጣ', 'ጤ', 'ጥ', 'ጦ', 'ጧ'],
  "t'":  ['ጠ', 'ጡ', 'ጢ', 'ጣ', 'ጤ', 'ጥ', 'ጦ', 'ጧ'],
  'T':   ['ጠ', 'ጡ', 'ጢ', 'ጣ', 'ጤ', 'ጥ', 'ጦ', 'ጧ'],
  'tch': ['ጨ', 'ጩ', 'ጪ', 'ጫ', 'ጬ', 'ጭ', 'ጮ', 'ጯ'],
  "ch'": ['ጨ', 'ጩ', 'ጪ', 'ጫ', 'ጬ', 'ጭ', 'ጮ', 'ጯ'],
  'C':   ['ጨ', 'ጩ', 'ጪ', 'ጫ', 'ጬ', 'ጭ', 'ጮ', 'ጯ'],
  'ts':  ['ጸ', 'ጹ', 'ጺ', 'ጻ', 'ጼ', 'ጽ', 'ጾ', 'ጿ'],
  'tz':  ['ፀ', 'ፁ', 'ፂ', 'ፃ', 'ፄ', 'ፅ', 'ፆ', 'ፇ'],
  'tss': ['ፀ', 'ፁ', 'ፂ', 'ፃ', 'ፄ', 'ፅ', 'ፆ', 'ፇ'],
  'f':   ['ፈ', 'ፉ', 'ፊ', 'ፋ', 'ፌ', 'ፍ', 'ፎ', 'ፏ'],
  'p':   ['ፐ', 'ፑ', 'ፒ', 'ፓ', 'ፔ', 'ፕ', 'ፖ', 'ፗ'],
  'P':   ['ጰ', 'ጱ', 'ጲ', 'ጳ', 'ጴ', 'ጵ', 'ጶ', 'ጷ'],
  "p'":  ['ጰ', 'ጱ', 'ጲ', 'ጳ', 'ጴ', 'ጵ', 'ጶ', 'ጷ'],
};

// Independent vowels at the start of syllables or words
const INDEPENDENT_VOWELS: Array<{ key: string; char: string; len: number }> = [
  { key: 'aa', char: 'ኣ', len: 2 },
  { key: 'ee', char: 'ኢ', len: 2 },
  { key: 'oo', char: 'ኡ', len: 2 },
  { key: 'ou', char: 'ኡ', len: 2 },
  { key: 'ie', char: 'ኤ', len: 2 },
  { key: 'ey', char: 'ኤ', len: 2 },
  { key: 'ea', char: 'ኤ', len: 2 },
  { key: 'ay', char: 'አይ', len: 2 },
  { key: 'a',  char: 'አ', len: 1 },
  { key: 'u',  char: 'ኡ', len: 1 },
  { key: 'i',  char: 'ኢ', len: 1 },
  { key: 'o',  char: 'ኦ', len: 1 },
  { key: 'e',  char: 'እ', len: 1 },
];

// Ethiopic punctuation
const PUNCTUATION: Record<string, string> = {
  '.': '።',
  ',': '፣',
  ';': '፤',
  ':': '፥',
  ':-': '፦',
  '?-': '፧',
};

// High-fidelity phonetic word dictionary
const PHONETIC_DICTIONARY: Record<string, string> = {
  'ethiopia': 'ኢትዮጵያ',
  'ethiopiya': 'ኢትዮጵያ',
  'ityopya': 'ኢትዮጵያ',
  'ityopia': 'ኢትዮጵያ',
  'itiyopya': 'ኢትዮጵያ',
  'ameseginalehu': 'አመሰግናለሁ',
  'amesegnalehu': 'አመሰግናለሁ',
  'ameseginalew': 'አመሰግናለሁ',
  'amesegnalew': 'አመሰግናለሁ',
  'amesegenalehu': 'አመሰግናለሁ',
  'selam': 'ሰላም',
  'selame': 'ሰላሜ',
  'selamena': 'ሰላምና',
  'dehna': 'ደህና',
  'dehina': 'ደህና',
  'tenayistillign': 'ጤና ይስጥልኝ',
  'tenayistilign': 'ጤና ይስጥልኝ',
  'oromia': 'ኦሮሚያ',
  'oromya': 'ኦሮሚያ',
  'addis ababa': 'አዲስ አበባ',
  'addisababa': 'አዲስ አበባ',
  'umer': 'ኡመር',
  'sof': 'ሶፍ',
  'sofi': 'ሶፊ',
  'tsehay': 'ፀሐይ',
  'chigir': 'ችግር',
  'bet': 'ቤት',
  'habesha': 'ሐበሻ',
  'ishi': 'እሺ',
  'eshi': 'እሺ',
  'new': 'ነው',
  'aydelem': 'አይደለም',
};

// Ordered consonant lookup keys (longest digraphs checked first)
const CONSONANT_KEYS = [
  'tch', "ch'", 'tss', 'hhh',
  'sh', 'ch', 'zh', 'ny', 'gn', 'kh', 'th', 'ph', 'ts', 'tz', 'tt', "t'", "p'", 'hh', 'ss',
  'h', 'l', 'm', 'r', 's', 'q', 'b', 'v', 't', 'c', 'n', 'k', 'w', 'z', 'y', 'd', 'j', 'g', 'f', 'p',
  'T', 'C', 'P'
];

interface ContextState {
  latinWord: string;
  ethiopicWord: string;
  anchor: number;
}

export class AmharicTransliterator {
  private contexts: Map<string, ContextState> = new Map();

  public getOrCreateContext(id: string): ContextState {
    let ctx = this.contexts.get(id);
    if (!ctx) {
      ctx = { latinWord: '', ethiopicWord: '', anchor: 0 };
      this.contexts.set(id, ctx);
    }
    return ctx;
  }

  public resetContext(id: string): void {
    const ctx = this.contexts.get(id);
    if (ctx) {
      ctx.latinWord = '';
      ctx.ethiopicWord = '';
      ctx.anchor = 0;
    }
  }

  public destroyContext(id: string): void {
    this.contexts.delete(id);
  }

  /**
   * Converts a single phonetic word/token into accurate Ge'ez script.
   */
  public convertWord(raw: string): string {
    if (!raw) return '';
    const lower = raw.toLowerCase();

    // Check whole-word phonetic dictionary first
    if (PHONETIC_DICTIONARY[lower]) {
      return PHONETIC_DICTIONARY[lower];
    }

    let i = 0;
    let res = '';

    while (i < raw.length) {
      const remaining = raw.slice(i);
      const remainingLower = remaining.toLowerCase();

      // 1. Punctuation
      if (PUNCTUATION[remaining[0]]) {
        res += PUNCTUATION[remaining[0]];
        i++;
        continue;
      }

      // 2. Non-Latin characters (preserve existing Ethiopic, digits, or symbols)
      if (!/^[a-zA-Z'"]/.test(remaining[0])) {
        res += remaining[0];
        i++;
        continue;
      }

      // 3. Epenthetic / Phonetic syllable shortcuts (e.g. 'gina' in ameseginalehu)
      if (remainingLower.startsWith('gina') || remainingLower.startsWith('ginal')) {
        res += 'ግና';
        i += 4;
        continue;
      }
      if (remainingLower.startsWith('gin')) {
        res += 'ግን';
        i += 3;
        continue;
      }

      // 4. Special 'ethiopia' sub-match
      if (remainingLower.startsWith('ethiopia')) {
        res += 'ኢትዮጵያ';
        i += 8;
        continue;
      }

      // 5. Special 'io' -> 'ዮ' following a consonant (e.g. Ethio...)
      if (res.length > 0 && remainingLower.startsWith('io')) {
        res += 'ዮ';
        i += 2;
        continue;
      }

      // 6. Consonant matching
      const cMatch = this.findConsonantMatch(remaining, remainingLower);
      if (cMatch) {
        i += cMatch.keyLen;
        const after = raw.slice(i).toLowerCase();
        const vMatch = this.findVowelMatch(after);
        if (vMatch) {
          res += cMatch.family[vMatch.order];
          i += vMatch.vowelLen;
        } else {
          // 6th order base consonant (Sadis)
          res += cMatch.family[5];
        }
        continue;
      }

      // 7. Independent vowel matching
      const indV = this.findIndependentVowel(remainingLower);
      if (indV) {
        res += indV.char;
        i += indV.keyLen;
        continue;
      }

      // 8. Fallback
      res += remaining[0];
      i++;
    }

    return res;
  }

  private findConsonantMatch(remaining: string, remainingLower: string): { keyLen: number; family: string[] } | null {
    for (const key of CONSONANT_KEYS) {
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        if (remaining.startsWith(key)) {
          return { keyLen: 1, family: CONSONANT_FAMILIES[key] };
        }
      } else if (remainingLower.startsWith(key.toLowerCase())) {
        return { keyLen: key.length, family: CONSONANT_FAMILIES[key] };
      }
    }
    return null;
  }

  private findVowelMatch(after: string): { order: number; vowelLen: number } | null {
    const list: Array<{ key: string; order: number; len: number }> = [
      { key: 'wa', order: 7, len: 2 },
      { key: 'oa', order: 7, len: 2 },
      { key: 'ua', order: 7, len: 2 },
      { key: 'ie', order: 4, len: 2 },
      { key: 'ey', order: 4, len: 2 },
      { key: 'ee', order: 4, len: 2 },
      { key: 'oo', order: 1, len: 2 },
      { key: 'ou', order: 1, len: 2 },
      { key: 'aa', order: 3, len: 2 },
      { key: 'e',  order: 0, len: 1 },
      { key: 'u',  order: 1, len: 1 },
      { key: 'i',  order: 2, len: 1 },
      { key: 'a',  order: 3, len: 1 },
      { key: 'o',  order: 6, len: 1 },
    ];
    for (const item of list) {
      if (after.startsWith(item.key)) {
        return { order: item.order, vowelLen: item.len };
      }
    }
    return null;
  }

  private findIndependentVowel(remainingLower: string): { char: string; keyLen: number } | null {
    for (const item of INDEPENDENT_VOWELS) {
      if (remainingLower.startsWith(item.key)) {
        return { char: item.char, keyLen: item.len };
      }
    }
    return null;
  }

  /**
   * One-shot stateless transliteration of text (e.g. pasted strings).
   */
  public transliterateText(text: string): string {
    if (!text) return '';
    return text.split(/([ \t\n\r]+)/).map(token => {
      if (/^[ \t\n\r]+$/.test(token)) return token;
      return this.convertWord(token);
    }).join('');
  }

  /**
   * Interactive keystroke processor.
   * Handles character-by-character typing, backspace, multi-character paste, and editing anywhere in text.
   */
  public processChange(
    contextId: string,
    newValue: string,
    previousValue: string
  ): { value: string; cursorPosition: number } {
    const ctx = this.getOrCreateContext(contextId);

    if (newValue === previousValue) {
      return { value: newValue, cursorPosition: newValue.length };
    }

    // Compute prefix and suffix diff
    let preLen = 0;
    const maxPre = Math.min(previousValue.length, newValue.length);
    while (preLen < maxPre && previousValue[preLen] === newValue[preLen]) {
      preLen++;
    }

    let sufLen = 0;
    const maxSuf = Math.min(previousValue.length, newValue.length) - preLen;
    while (sufLen < maxSuf && previousValue[previousValue.length - 1 - sufLen] === newValue[newValue.length - 1 - sufLen]) {
      sufLen++;
    }

    const inserted = newValue.slice(preLen, newValue.length - sufLen);

    // 1. Deletion / Backspace
    if (inserted.length === 0) {
      this.resetContext(contextId);
      return { value: newValue, cursorPosition: preLen };
    }

    // 2. Whitespace typed: finalize word and reset context
    if (/^[ \t\n\r]+$/.test(inserted)) {
      this.resetContext(contextId);
      return { value: newValue, cursorPosition: preLen + inserted.length };
    }

    // 3. Punctuation typed
    if (PUNCTUATION[inserted]) {
      this.resetContext(contextId);
      const pChar = PUNCTUATION[inserted];
      const resVal = newValue.slice(0, preLen) + pChar + newValue.slice(newValue.length - sufLen);
      return { value: resVal, cursorPosition: preLen + pChar.length };
    }

    // 4. Native Ethiopic characters pasted or typed via native Amharic keyboard
    if (/^[\u1200-\u137F]+$/.test(inserted)) {
      this.resetContext(contextId);
      return { value: newValue, cursorPosition: preLen + inserted.length };
    }

    // 5. Multi-character paste of Latin text
    if (inserted.length > 1) {
      this.resetContext(contextId);
      const convertedPaste = this.transliterateText(inserted);
      const tail = newValue.slice(newValue.length - sufLen);
      const resVal = newValue.slice(0, preLen) + convertedPaste + tail;
      return { value: resVal, cursorPosition: preLen + convertedPaste.length };
    }

    // 6. Interactive single Latin character typing
    if (preLen === ctx.anchor && ctx.latinWord.length > 0) {
      ctx.latinWord += inserted;
    } else {
      ctx.latinWord = inserted;
      ctx.ethiopicWord = '';
    }

    const newEthiopic = this.convertWord(ctx.latinWord);
    const oldEthiopicLen = ctx.ethiopicWord.length;
    const replaceStart = preLen - oldEthiopicLen;
    const head = newValue.slice(0, Math.max(0, replaceStart));
    const tail = newValue.slice(newValue.length - sufLen);

    const resVal = head + newEthiopic + tail;
    const newCursor = head.length + newEthiopic.length;

    ctx.ethiopicWord = newEthiopic;
    ctx.anchor = newCursor;

    return { value: resVal, cursorPosition: newCursor };
  }
}

export const sharedTransliterator = new AmharicTransliterator();
