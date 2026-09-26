const fs = require('fs');
const content = fs.readFileSync('src/components/keyboard/AmharicKeyboard.tsx', 'utf-8');

// We will add a 'isInputFocused' state to track if an input is currently focused.
// We also need to add focusout listener to clear it if focus leaves entirely.

let newContent = content.replace(
  `  const [activeInput, setActiveInput] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);`,
  `  const [activeInput, setActiveInput] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);`
);

// In the first useEffect, add handleBlur
const useEffectRegex = /  useEffect\(\(\) => \{\n    const handleFocus = \(e: FocusEvent\) => \{[\s\S]*?    document\.addEventListener\('focusin', handleFocus\);\n    return \(\) => \{\n      document\.removeEventListener\('focusin', handleFocus\);\n    \};\n  \}, \[isOpen\]\);/;

const newUseEffect = `  useEffect(() => {
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
        }
      }, 150);
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, [isOpen]);`;

newContent = newContent.replace(useEffectRegex, newUseEffect);

// In renderToggleButton, only return if isOpen || isInputFocused
const renderToggleRegex = /  const renderToggleButton = \(\) => \([\s\S]*?  \);/;
const newRenderToggle = `  const renderToggleButton = () => {
    if (!isOpen && !isInputFocused) return null;
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        onPointerDown={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
        className="fixed bottom-4 right-4 z-[9999] bg-amber-500 hover:bg-amber-400 text-black p-3 rounded-full shadow-lg shadow-black/50 transition-transform active:scale-95 flex items-center justify-center border-2 border-[#07070a]"
        aria-label="Toggle Keyboard"
      >
        {isOpen ? <X className="w-6 h-6" /> : <KeyboardIcon className="w-6 h-6" />}
      </button>
    );
  };`;

newContent = newContent.replace(renderToggleRegex, newRenderToggle);

fs.writeFileSync('src/components/keyboard/AmharicKeyboard.tsx', newContent);
console.log("Updated visibility");
