const fs = require('fs');
const content = fs.readFileSync('src/components/keyboard/AmharicKeyboard.tsx', 'utf-8');

const oldBlur = `    const handleBlur = (e: FocusEvent) => {
      setTimeout(() => {
        if (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
          setIsInputFocused(false);
        }
      }, 150);
    };`;

const newBlur = `    const handleBlur = (e: FocusEvent) => {
      setTimeout(() => {
        if (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
          setIsInputFocused(false);
          setIsOpen(false);
        }
      }, 150);
    };`;

fs.writeFileSync('src/components/keyboard/AmharicKeyboard.tsx', content.replace(oldBlur, newBlur));
console.log("Fixed blur");
