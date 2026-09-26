Code changes look good and solid.
- Uses `inputMode="none"` globally on the inputs instead of creating separate components.
- The state updates work using pointer down captures and handle focusin/focusout reliably.
- Only the amharic button displays the toggle when needed.
- Keyboard toggles input mode reliably, resolving the Android overlapping system keyboard issue.
- Restores original inputMode smoothly when closed.
- Text insertion and cursor caret functions are rock solid and handle both input and textareas perfectly.
- Doesn't alter any global functions outside this single AmharicKeyboard component!

I am ready to commit and submit.
