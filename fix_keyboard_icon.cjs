const fs = require('fs');
const content = fs.readFileSync('src/components/keyboard/AmharicKeyboard.tsx', 'utf-8');

const regex = /\{isOpen \? <X className="w-6 h-6" \/> : <KeyboardIcon className="w-6 h-6" \/>\}/g;

const match = content.match(regex);
if (match) {
  const newContent = content.replace(regex, '{isOpen ? <X className="w-6 h-6" /> : <KeyboardIcon className="w-6 h-6" />}');
  fs.writeFileSync('src/components/keyboard/AmharicKeyboard.tsx', newContent);
  console.log("No need to change icons");
} else {
  console.log("Couldn't find the icon bit");
}
