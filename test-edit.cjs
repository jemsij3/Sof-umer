const fs = require('fs');
const content = fs.readFileSync('src/components/keyboard/AmharicKeyboard.tsx', 'utf-8');

// Find the spot to insert our new hooks
// We can just replace the existing useEffect for focusin/focusout

const newHooks = `
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        const type = (target as HTMLInputElement).type;
        if (!['button', 'submit', 'reset', 'radio', 'checkbox', 'file', 'color', 'date', 'time', 'range'].includes(type)) {
          setActiveInput(target as HTMLInputElement | HTMLTextAreaElement);

          if (isOpen) {
            if (!target.hasAttribute('data-orig-inputmode')) {
              target.setAttribute('data-orig-inputmode', target.getAttribute('inputMode') || '');
            }
            target.setAttribute('inputMode', 'none');
          }
        }
      }
    };

    document.addEventListener('focusin', handleFocus);

    return () => {
      document.removeEventListener('focusin', handleFocus);
    };
  }, [isOpen]);

  useEffect(() => {
    const handlePointerDown = (e: Event) => {
      if (!isOpen) return;
      const target = e.target as HTMLElement;
      let el: HTMLElement | null = target;
      while (el && el !== document.body) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          const type = (el as HTMLInputElement).type;
          if (!['button', 'submit', 'reset', 'radio', 'checkbox', 'file', 'color', 'date', 'time', 'range'].includes(type)) {
            if (!el.hasAttribute('data-orig-inputmode')) {
              el.setAttribute('data-orig-inputmode', el.getAttribute('inputMode') || '');
            }
            el.setAttribute('inputMode', 'none');
          }
          break;
        }
        el = el.parentElement;
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('touchstart', handlePointerDown, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (activeInput) {
        if (!activeInput.hasAttribute('data-orig-inputmode')) {
          activeInput.setAttribute('data-orig-inputmode', activeInput.getAttribute('inputMode') || '');
        }
        activeInput.setAttribute('inputMode', 'none');
        activeInput.blur();
        setTimeout(() => {
          if (activeInput) activeInput.focus();
        }, 10);
      }
    } else {
      const inputs = document.querySelectorAll('input[data-orig-inputmode], textarea[data-orig-inputmode]');
      inputs.forEach(input => {
        const orig = input.getAttribute('data-orig-inputmode');
        if (orig) {
          input.setAttribute('inputMode', orig);
        } else {
          input.removeAttribute('inputMode');
        }
        input.removeAttribute('data-orig-inputmode');
      });

      // If there's an active input when we close, refocus it so the native keyboard comes up.
      if (activeInput && document.activeElement === activeInput) {
        activeInput.blur();
        setTimeout(() => {
          if (activeInput) activeInput.focus();
        }, 10);
      }
    }
  }, [isOpen, activeInput]);
`;

// Replace the old useEffect with the new ones
const startRegex = /  useEffect\(\(\) => \{\n    const handleFocus = \(e: FocusEvent\) => \{/g;
const match = startRegex.exec(content);

if (match) {
  const startIndex = match.index;
  // find the end of this useEffect (which ends with `  }, []);`)
  const endRegex = /  \}, \[\]\);\n/g;
  endRegex.lastIndex = startIndex;
  const endMatch = endRegex.exec(content);
  if (endMatch) {
    const endIndex = endMatch.index + endMatch[0].length;
    const newContent = content.substring(0, startIndex) + newHooks + content.substring(endIndex);
    fs.writeFileSync('src/components/keyboard/AmharicKeyboard.tsx.new', newContent);
    console.log("Success");
  } else {
    console.log("Could not find end of useEffect");
  }
} else {
  console.log("Could not find start of useEffect");
}
