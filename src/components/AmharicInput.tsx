import React, { useRef, useState, useEffect } from 'react';
import { Fidelify } from 'fidelify';

// Shared fidelify instance
const transliterator = new Fidelify({
  convertPunctuation: true,
  convertNumbers: false,
  allowEnglish: true
});

interface AmharicInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  multiline?: boolean;
  value: string;
  onChange: (e: any) => void;
  className?: string;
}

export const AmharicInput: React.FC<AmharicInputProps> = ({
  multiline = false,
  value,
  onChange,
  className = '',
  ...props
}) => {
  const [isAmharic, setIsAmharic] = useState(false);
  const contextId = useRef(`field-${Math.random()}`).current;
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      transliterator.destroyContext(contextId);
    };
  }, [contextId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isAmharic) {
      // Fidelify processing
      const result = transliterator.processChange(contextId, e.target.value, value);
      const { value: newValue, cursorPosition: newCursorPos } = result;

      // Create a synthetic event to pass to the parent
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: newValue,
          name: props.name
        }
      };

      // Update cursor position - we need to wait a tick for React to update the DOM
      const element = e.target;


      onChange(syntheticEvent);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    } else {
      onChange(e);
    }
  };

  const toggleAmharic = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAmharic(!isAmharic);
    if (!isAmharic) {
      transliterator.resetContext(contextId);
    }
    // keep focus
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const Component = multiline ? 'textarea' : 'input';

  return (
    <div className="relative w-full">
      <Component
        ref={inputRef as any}
        value={value}
        onChange={handleChange}
        className={`${className} ${isAmharic ? 'pr-12' : ''}`}
        {...(props as any)}
      />
      <button
        type="button"
        onClick={toggleAmharic}
        title={isAmharic ? "Disable Amharic typing" : "Enable Amharic typing"}
        className={`absolute right-2 top-2 px-2 py-1 text-xs font-medium rounded shadow-sm transition-colors z-10 ${
          isAmharic
            ? 'bg-blue-600 text-white border-blue-700'
            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
        } border`}
      >
        አማ
      </button>
    </div>
  );
};
