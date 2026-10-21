/** Speak an assistant reply through the browser's built-in speech synthesis. */
export function speakAssistantReply(text: string) {
  const reply = text.trim();
  if (!reply || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  const synthesis = window.speechSynthesis;
  synthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(reply);
  utterance.lang = navigator.language || 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.onstart = () => window.dispatchEvent(new Event('voxa-speech-start'));
  utterance.onend = () => window.dispatchEvent(new Event('voxa-speech-end'));
  utterance.onerror = () => window.dispatchEvent(new Event('voxa-speech-end'));

  synthesis.speak(utterance);
}
