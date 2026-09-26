const fs = require('fs');
let content = fs.readFileSync('src/components/keyboard/AmharicKeyboard.tsx', 'utf-8');

// I also need to ensure that when isOpen goes from true to false, we remove the inputMode="none"
// from all inputs so the normal keyboard can be used again.

const fixRemoveInputMode = `
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
  }, [isOpen]);
`;

// It looks like I already added this in my previous edits. Let's verify it's there.
// If it is, then the keyboard toggle and hiding behaviour should be fully correct.
