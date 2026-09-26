const fs = require('fs');
const content = fs.readFileSync('src/components/keyboard/AmharicKeyboard.tsx', 'utf-8');

// Update handleBlur so it correctly keeps the keyboard toggle visible momentarily
// so the user can click it without it disappearing instantly when focus leaves the input
const oldBlur = `    const handleBlur = (e: FocusEvent) => {
      setTimeout(() => {
        if (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
          setIsInputFocused(false);
          setIsOpen(false);
        }
      }, 150);
    };`;

const newBlur = `    const handleBlur = (e: FocusEvent) => {
      setTimeout(() => {
        if (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
          setIsInputFocused(false);
          // If the keyboard is not open, we hide the toggle button.
          // If the keyboard IS open, we keep it open, but we clear activeInput?
          // No, we want to allow the user to type in the keyboard.
          // In fact, if the keyboard is clicked, focusout is triggered.
          // We don't want to close the keyboard just because focus left the input.
        }
      }, 150);
    };`;

let newContent = content.replace(oldBlur, newBlur);

// Actually, wait, if the user taps outside the keyboard and the input, we want to close the keyboard.
// But if they tap inside the keyboard, we don't.
// Let's add a click outside listener or let's use a simpler approach.
// The toggle button shouldn't disappear immediately, we already have setTimeout(..., 150).

// Let's just remove the `setIsOpen(false)` from blur because it breaks clicking the keyboard.
// Wait, if they click outside, they blur the input. If they click inside the keyboard, they blur the input.
// We must close the keyboard if they click outside BOTH the input and the keyboard.
// The easiest way is a mousedown listener on document.

const focusBlurFix = `  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        const type = (target as HTMLInputElement).type;
        if (!['button', 'submit', 'reset', 'radio', 'checkbox', 'file', 'color', 'date', 'time', 'range'].includes(type)) {
          setActiveInput(target as HTMLInputElement | HTMLTextAreaElement);
          setIsInputFocused(true);

          if (isOpen) {
            if (!target.hasAttribute('data-orig-inputmode')) {
              target.setAttribute('data-orig-inputmode', target.getAttribute('inputMode') || '');
            }
            target.setAttribute('inputMode', 'none');
          }
        }
      }
    };

    const handleBlur = (e: FocusEvent) => {
      setTimeout(() => {
        if (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
          setIsInputFocused(false);
          // We DO NOT setIsOpen(false) here because clicking a keyboard key causes blur.
        }
      }, 150);
    };

    const handleDocumentClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      // If we clicked outside the keyboard and outside any valid input, close it.
      if (isOpen && !target.closest('.amharic-keyboard-container') && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        setIsOpen(false);
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('touchstart', handleDocumentClick);
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('touchstart', handleDocumentClick);
    };
  }, [isOpen]);`;

const focusBlurRegex = /  useEffect\(\(\) => \{\n    const handleFocus = \(e: FocusEvent\) => \{[\s\S]*?  \}, \[isOpen\]\);/;
newContent = newContent.replace(focusBlurRegex, focusBlurFix);

// Make sure the keyboard has the class "amharic-keyboard-container" so we can check it
const keyboardDivRegex = /className="fixed bottom-0 left-0 right-0 z-\[60\] bg-\[#1a1a1f\] border-t border-white\/10 shadow-2xl p-2 pb-6 max-h-\[50vh\] overflow-y-auto overscroll-contain"/;
const newKeyboardDiv = `className="amharic-keyboard-container fixed bottom-0 left-0 right-0 z-[60] bg-[#1a1a1f] border-t border-white/10 shadow-2xl p-2 pb-6 max-h-[50vh] overflow-y-auto overscroll-contain"`;
newContent = newContent.replace(keyboardDivRegex, newKeyboardDiv);

// Toggle button needs the class too
const toggleBtnRegex = /className="fixed bottom-4 right-4 z-\[9999\] bg-amber-500 hover:bg-amber-400 text-black p-3 rounded-full shadow-lg shadow-black\/50 transition-transform active:scale-95 flex items-center justify-center border-2 border-\[#07070a\]"/;
const newToggleBtn = `className="amharic-keyboard-container fixed bottom-4 right-4 z-[9999] bg-amber-500 hover:bg-amber-400 text-black p-3 rounded-full shadow-lg shadow-black/50 transition-transform active:scale-95 flex items-center justify-center border-2 border-[#07070a]"`;
newContent = newContent.replace(toggleBtnRegex, newToggleBtn);

fs.writeFileSync('src/components/keyboard/AmharicKeyboard.tsx', newContent);
console.log("Fixed hide behavior");
