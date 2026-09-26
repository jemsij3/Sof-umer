import React, { useState, useEffect, useRef } from 'react';
import { Keyboard as KeyboardIcon, X, Delete, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type LayoutMode = 'amharic' | 'english' | 'numbers';

const amharicBaseChars = [
  ['ሀ', 'ለ', 'ሐ', 'መ', 'ሠ', 'ረ', 'ሰ', 'ሸ', 'ቀ', 'በ'],
  ['ተ', 'ቸ', 'ነ', 'ኘ', 'አ', 'ከ', 'ኸ', 'ወ', 'ዐ', 'ዘ'],
  ['ዠ', 'የ', 'ደ', 'ጀ', 'ገ', 'ጠ', 'ጨ', 'ጰ', 'ጸ', 'ፈ'],
  ['ፐ']
];

const amharicFidelMap: Record<string, string[]> = {
  'ሀ': ['ሀ', 'ሁ', 'ሂ', 'ሃ', 'ሄ', 'ህ', 'ሆ'],
  'ለ': ['ለ', 'ሉ', 'ሊ', 'ላ', 'ሌ', 'ል', 'ሎ'],
  'ሐ': ['ሐ', 'ሑ', 'ሒ', 'ሓ', 'ሔ', 'ሕ', 'ሖ'],
  'መ': ['መ', 'ሙ', 'ሚ', 'ማ', 'ሜ', 'ም', 'ሞ'],
  'ሠ': ['ሠ', 'ሡ', 'ሢ', 'ሣ', 'ሤ', 'ሥ', 'ሦ'],
  'ረ': ['ረ', 'ሩ', 'ሪ', 'ራ', 'ሬ', 'ር', 'ሮ'],
  'ሰ': ['ሰ', 'ሱ', 'ሲ', 'ሳ', 'ሴ', 'ስ', 'ሶ'],
  'ሸ': ['ሸ', 'ሹ', 'ሺ', 'ሻ', 'ሼ', 'ሽ', 'ሾ'],
  'ቀ': ['ቀ', 'ቁ', 'ቂ', 'ቃ', 'ቄ', 'ቅ', 'ቆ'],
  'በ': ['በ', 'ቡ', 'ቢ', 'ባ', 'ቤ', 'ብ', 'ቦ'],
  'ተ': ['ተ', 'ቱ', 'ቲ', 'ታ', 'ቴ', 'ት', 'ቶ'],
  'ቸ': ['ቸ', 'ቹ', 'ቺ', 'ቻ', 'ቼ', 'ች', 'ቾ'],
  'ነ': ['ነ', 'ኑ', 'ኒ', 'ና', 'ኔ', 'ን', 'ኖ'],
  'ኘ': ['ኘ', 'ኙ', 'ኚ', 'ኛ', 'ኜ', 'ኝ', 'ኞ'],
  'አ': ['አ', 'ኡ', 'ኢ', 'ኣ', 'ኤ', 'እ', 'ኦ'],
  'ከ': ['ከ', 'ኩ', 'ኪ', 'ካ', 'ኬ', 'ክ', 'ኮ'],
  'ኸ': ['ኸ', 'ኹ', 'ኺ', 'ኻ', 'ኼ', 'ኽ', 'ኾ'],
  'ወ': ['ወ', 'ዉ', 'ዊ', 'ዋ', 'ዌ', 'ው', 'ዎ'],
  'ዐ': ['ዐ', 'ዑ', 'ዒ', 'ዓ', 'ዔ', 'ዕ', 'ዖ'],
  'ዘ': ['ዘ', 'ዙ', 'ዚ', 'ዛ', 'ዜ', 'ዝ', 'ዞ'],
  'ዠ': ['ዠ', 'ዡ', 'ዢ', 'ዣ', 'ዤ', 'ዥ', 'ዦ'],
  'የ': ['የ', 'ዩ', 'ዪ', 'ያ', 'ዬ', 'ይ', 'ዮ'],
  'ደ': ['ደ', 'ዱ', 'ዲ', 'ዳ', 'ዴ', 'ድ', 'ዶ'],
  'ጀ': ['ጀ', 'ጁ', 'ጂ', 'ጃ', 'ጄ', 'ጅ', 'ጆ'],
  'ገ': ['ገ', 'ጉ', 'ጊ', 'ጋ', 'ጌ', 'ግ', 'ጎ'],
  'ጠ': ['ጠ', 'ጡ', 'ጢ', 'ጣ', 'ጤ', 'ጥ', 'ጦ'],
  'ጨ': ['ጨ', 'ጩ', 'ጪ', 'ጫ', 'ጬ', 'ጭ', 'ጮ'],
  'ጰ': ['ጰ', 'ጱ', 'ጲ', 'ጳ', 'ጴ', 'ጵ', 'ጶ'],
  'ጸ': ['ጸ', 'ጹ', 'ጺ', 'ጻ', 'ጼ', 'ጽ', 'ጾ'],
  'ፈ': ['ፈ', 'ፉ', 'ፊ', 'ፋ', 'ፌ', 'ፍ', 'ፎ'],
  'ፐ': ['ፐ', 'ፑ', 'ፒ', 'ፓ', 'ፔ', 'ፕ', 'ፖ']
};

const englishRows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

const numberRows = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['@', '#', '$', '%', '&', '-', '+', '(', ')'],
  ['=', '*', '"', "'", ':', ';', '!', '?', ',']
];

export function AmharicKeyboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('amharic');
  const [selectedBaseChar, setSelectedBaseChar] = useState<string | null>(null);

  // Track active input element
  const [activeInput, setActiveInput] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        // Exclude specific types that shouldn't use text keyboard
        const type = (target as HTMLInputElement).type;
        if (!['button', 'submit', 'reset', 'radio', 'checkbox', 'file', 'color', 'date', 'time', 'range'].includes(type)) {
          setActiveInput(target as HTMLInputElement | HTMLTextAreaElement);
        }
      }
    };

    const handleBlur = (e: FocusEvent) => {
      // Small delay to allow keyboard clicks to register without losing focus immediately
      setTimeout(() => {
        if (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
           // We keep the last active input for a bit so clicking the keyboard works
        }
      }, 100);
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);


  const setInputValue = (targetInput: HTMLInputElement | HTMLTextAreaElement, newValue: string) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;

    if (targetInput.tagName === 'INPUT' && nativeInputValueSetter) {
      nativeInputValueSetter.call(targetInput, newValue);
    } else if (targetInput.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(targetInput, newValue);
    } else {
      targetInput.value = newValue;
    }

    const event = new Event('input', { bubbles: true });
    targetInput.dispatchEvent(event);
  };

  const insertTextAtCursor = (text: string) => {
    let targetInput = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (!targetInput || (targetInput.tagName !== 'INPUT' && targetInput.tagName !== 'TEXTAREA')) {
      targetInput = activeInput as HTMLInputElement | HTMLTextAreaElement;
    }
    if (!targetInput) return;
    if (targetInput.tagName !== 'INPUT' && targetInput.tagName !== 'TEXTAREA') return;
    if (targetInput.readOnly || targetInput.disabled) return;

    targetInput.focus();

    const start = targetInput.selectionStart || 0;
    const end = targetInput.selectionEnd || 0;
    const value = targetInput.value;

    const newValue = value.slice(0, start) + text + value.slice(end);
    setInputValue(targetInput, newValue);

    const newPos = start + text.length;
    targetInput.setSelectionRange(newPos, newPos);
  };

  const handleClear = () => {
    let targetInput = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (!targetInput || (targetInput.tagName !== 'INPUT' && targetInput.tagName !== 'TEXTAREA')) {
      targetInput = activeInput as HTMLInputElement | HTMLTextAreaElement;
    }
    if (!targetInput) return;
    if (targetInput.readOnly || targetInput.disabled) return;

    targetInput.focus();
    setInputValue(targetInput, '');
  };

  const handleBackspace = () => {
    let targetInput = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (!targetInput || (targetInput.tagName !== 'INPUT' && targetInput.tagName !== 'TEXTAREA')) {
      targetInput = activeInput as HTMLInputElement | HTMLTextAreaElement;
    }
    if (!targetInput) return;
    if (targetInput.readOnly || targetInput.disabled) return;

    targetInput.focus();

    const start = targetInput.selectionStart || 0;
    const end = targetInput.selectionEnd || 0;
    const value = targetInput.value;

    let newValue = value;
    let newPos = start;

    if (start === end && start > 0) {
      newValue = value.slice(0, start - 1) + value.slice(end);
      newPos = start - 1;
    } else if (start !== end) {
      newValue = value.slice(0, start) + value.slice(end);
      newPos = start;
    }

    setInputValue(targetInput, newValue);
    targetInput.setSelectionRange(newPos, newPos);
  };

  const handleEnter = () => {
    let targetInput = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (!targetInput || (targetInput.tagName !== 'INPUT' && targetInput.tagName !== 'TEXTAREA')) {
      targetInput = activeInput as HTMLInputElement | HTMLTextAreaElement;
    }
    if (!targetInput) return;

    if (targetInput.tagName === 'TEXTAREA') {
        insertTextAtCursor('\n');
    } else {
        // Trigger enter keydown event for form submission or next input logic
        targetInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
    }
  };

  const handleKeyPress = (e: React.PointerEvent, char: string) => {
    e.preventDefault(); // Prevent blur
    if (layoutMode === 'amharic' && amharicFidelMap[char]) {
      setSelectedBaseChar(char);
    } else {
      insertTextAtCursor(char);
      setSelectedBaseChar(null);
    }
  };

  const handleVariantPress = (e: React.PointerEvent, char: string) => {
    e.preventDefault();
    insertTextAtCursor(char);
    setSelectedBaseChar(null); // Go back to base chars after selecting variant
  };

  const handleActionPress = (e: React.PointerEvent, action: () => void) => {
    e.preventDefault();
    action();
  };

  // Toggle button rendering
  const renderToggleButton = () => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="fixed bottom-4 right-4 z-50 bg-amber-500 hover:bg-amber-400 text-black p-3 rounded-full shadow-lg shadow-black/50 transition-transform active:scale-95 flex items-center justify-center border-2 border-[#07070a]"
      aria-label="Toggle Keyboard"
    >
      {isOpen ? <X className="w-6 h-6" /> : <KeyboardIcon className="w-6 h-6" />}
    </button>
  );

  return (
    <>
      {renderToggleButton()}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[60] bg-[#1a1a1f] border-t border-white/10 shadow-2xl p-2 pb-6 max-h-[50vh] overflow-y-auto"
            style={{ touchAction: 'none' }} // Prevent scrolling when touching keyboard
          >
            <div className="max-w-3xl mx-auto w-full flex flex-col gap-2">

              {/* Keyboard Controls / Header */}
              <div className="flex justify-between items-center px-1">
                <div className="flex bg-[#2a2a30] rounded-lg p-1 gap-1">
                  <button
                    onPointerDown={(e) => handleActionPress(e, () => { setLayoutMode('amharic'); setSelectedBaseChar(null); })}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${layoutMode === 'amharic' ? 'bg-amber-500 text-black' : 'text-white/70 hover:text-white'}`}
                  >
                    አማርኛ
                  </button>
                  <button
                    onPointerDown={(e) => handleActionPress(e, () => { setLayoutMode('english'); setSelectedBaseChar(null); })}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${layoutMode === 'english' ? 'bg-amber-500 text-black' : 'text-white/70 hover:text-white'}`}
                  >
                    EN
                  </button>
                  <button
                    onPointerDown={(e) => handleActionPress(e, () => { setLayoutMode('numbers'); setSelectedBaseChar(null); })}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${layoutMode === 'numbers' ? 'bg-amber-500 text-black' : 'text-white/70 hover:text-white'}`}
                  >
                    123
                  </button>
                </div>
                <button
                  onPointerDown={(e) => handleActionPress(e, () => setIsOpen(false))}
                  className="p-2 text-white/50 hover:text-white transition-colors"
                >
                  <CornerDownLeft className="w-5 h-5" />
                </button>
              </div>

              {/* Keyboard Grid */}
              <div className="flex flex-col gap-2 p-1">
                {/* Variant Popup row (if Amharic char is selected) */}
                <AnimatePresence>
                  {selectedBaseChar && layoutMode === 'amharic' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-center gap-1.5 p-2 bg-[#2a2a30] rounded-lg mb-2 overflow-x-auto"
                    >
                      {amharicFidelMap[selectedBaseChar].map((char, idx) => (
                        <button
                          key={idx}
                          onPointerDown={(e) => handleVariantPress(e, char)}
                          className="min-w-[40px] h-12 bg-[#3a3a40] hover:bg-amber-500 hover:text-black text-white text-xl rounded-md flex items-center justify-center transition-colors shadow-sm font-serif cursor-pointer active:scale-95"
                        >
                          {char}
                        </button>
                      ))}
                      <button
                        onPointerDown={(e) => handleActionPress(e, () => setSelectedBaseChar(null))}
                        className="ml-auto min-w-[40px] h-12 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-md flex items-center justify-center transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Keys */}
                {!selectedBaseChar && layoutMode === 'amharic' && amharicBaseChars.map((row, rowIndex) => (
                  <div key={`amh-row-${rowIndex}`} className="flex justify-center gap-1">
                    {row.map((char, charIndex) => (
                      <button
                        key={charIndex}
                        onPointerDown={(e) => handleKeyPress(e, char)}
                        className="flex-1 max-w-[45px] h-12 bg-[#2a2a30] hover:bg-[#3a3a40] text-white text-xl sm:text-2xl rounded-md flex items-center justify-center shadow-sm font-serif cursor-pointer active:scale-95"
                      >
                        {char}
                      </button>
                    ))}
                    {rowIndex === 2 && (
                       <button
                         onPointerDown={(e) => handleActionPress(e, handleBackspace)}
                         className="flex-[1.5] max-w-[60px] h-12 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-md flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
                       >
                         <Delete className="w-6 h-6" />
                       </button>
                    )}
                  </div>
                ))}

                {layoutMode === 'english' && englishRows.map((row, rowIndex) => (
                  <div key={`eng-row-${rowIndex}`} className="flex justify-center gap-1">
                    {row.map((char, charIndex) => (
                      <button
                        key={charIndex}
                        onPointerDown={(e) => handleKeyPress(e, char)}
                        className="flex-1 max-w-[45px] h-12 bg-[#2a2a30] hover:bg-[#3a3a40] text-white text-xl rounded-md flex items-center justify-center shadow-sm cursor-pointer active:scale-95 uppercase"
                      >
                        {char}
                      </button>
                    ))}
                     {rowIndex === 2 && (
                       <button
                         onPointerDown={(e) => handleActionPress(e, handleBackspace)}
                         className="flex-[1.5] max-w-[60px] h-12 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-md flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
                       >
                         <Delete className="w-6 h-6" />
                       </button>
                    )}
                  </div>
                ))}

                {layoutMode === 'numbers' && numberRows.map((row, rowIndex) => (
                  <div key={`num-row-${rowIndex}`} className="flex justify-center gap-1">
                    {row.map((char, charIndex) => (
                      <button
                        key={charIndex}
                        onPointerDown={(e) => handleKeyPress(e, char)}
                        className="flex-1 max-w-[45px] h-12 bg-[#2a2a30] hover:bg-[#3a3a40] text-white text-xl rounded-md flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
                      >
                        {char}
                      </button>
                    ))}
                     {rowIndex === 2 && (
                       <button
                         onPointerDown={(e) => handleActionPress(e, handleBackspace)}
                         className="flex-[1.5] max-w-[60px] h-12 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-md flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
                       >
                         <Delete className="w-6 h-6" />
                       </button>
                    )}
                  </div>
                ))}

                {/* Bottom Action Row (Space, Clear, etc) */}
                <div className="flex justify-center gap-1 mt-1">
                   {/* Layout Switcher (optional redundancy) or Period */}
                   <button
                    onPointerDown={(e) => handleKeyPress(e, '.')}
                    className="flex-1 max-w-[45px] h-12 bg-[#2a2a30] hover:bg-[#3a3a40] text-white text-xl rounded-md flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
                  >
                    .
                  </button>

                  <button
                    onPointerDown={(e) => handleActionPress(e, handleClear)}
                    className="flex-[1.5] h-12 bg-[#2a2a30] hover:bg-[#3a3a40] text-white rounded-md flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
                  >
                    <span className="text-white/60 uppercase text-xs tracking-widest font-bold">Clear</span>
                  </button>
                  <button
                    onPointerDown={(e) => handleKeyPress(e, ' ')}
                    className="flex-[3] h-12 bg-[#2a2a30] hover:bg-[#3a3a40] text-white rounded-md flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
                  >
                    <span className="text-white/30 uppercase text-xs tracking-widest font-bold">Space</span>
                  </button>

                  <button
                    onPointerDown={(e) => handleActionPress(e, handleEnter)}
                    className="flex-1 max-w-[60px] h-12 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-md flex items-center justify-center shadow-sm cursor-pointer active:scale-95"
                  >
                    Enter
                  </button>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
