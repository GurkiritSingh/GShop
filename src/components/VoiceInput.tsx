import { useState, useRef, useCallback } from 'react';
import type { GroceryCategory } from '../types';

interface VoiceInputProps {
  onAddItem: (name: string, category: GroceryCategory, quantity?: number) => void;
}

// Parse spoken text into shopping items
// Handles things like "3 bananas and 2 pints of milk and bread"
function parseSpokenItems(text: string): { name: string; quantity: number }[] {
  const items: { name: string; quantity: number }[] = [];

  // Split by "and", commas, "also", "plus"
  const parts = text
    .toLowerCase()
    .split(/\s*(?:,|\band\b|\balso\b|\bplus\b|\bthen\b)\s*/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const part of parts) {
    // Match patterns like "3 bananas", "a loaf of bread", "some milk", "dozen eggs"
    let quantity = 1;
    let name = part;

    // "a dozen X" or "dozen X"
    const dozenMatch = name.match(/^(?:a\s+)?dozen\s+(.+)/);
    if (dozenMatch) {
      quantity = 12;
      name = dozenMatch[1];
    }

    // "a couple of X" / "couple X"
    const coupleMatch = name.match(/^(?:a\s+)?couple\s+(?:of\s+)?(.+)/);
    if (coupleMatch) {
      quantity = 2;
      name = coupleMatch[1];
    }

    // "a few X"
    const fewMatch = name.match(/^(?:a\s+)?few\s+(.+)/);
    if (fewMatch) {
      quantity = 3;
      name = fewMatch[1];
    }

    // "NUMBER X" (e.g. "3 bananas", "10 eggs")
    const numMatch = name.match(/^(\d+)\s+(.+)/);
    if (numMatch) {
      quantity = parseInt(numMatch[1], 10);
      name = numMatch[2];
    }

    // Strip leading "a ", "an ", "some ", "of ", "pint of", "pack of", "bag of", "tin of", "box of", "bottle of", "loaf of"
    name = name
      .replace(/^(?:a|an|some|the)\s+/, '')
      .replace(/^(?:pint|pack|bag|tin|box|bottle|jar|can|carton|loaf|bunch|head|packet|tub)s?\s+(?:of\s+)?/, '')
      .trim();

    if (name.length > 0) {
      items.push({ name, quantity });
    }
  }

  return items;
}

export function VoiceInput({ onAddItem }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAdded, setLastAdded] = useState<string[]>([]);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.lang = 'en-GB';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onresult = (event: unknown) => {
      const e = event as SpeechRecognitionEvent;
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalTranscript += t + ' ';
        } else {
          interim = t;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
      // Process final transcript
      if (finalTranscript.trim()) {
        const parsed = parseSpokenItems(finalTranscript);
        const added: string[] = [];
        for (const item of parsed) {
          onAddItem(item.name, 'other', item.quantity);
          added.push(item.quantity > 1 ? `${item.quantity}x ${item.name}` : item.name);
        }
        setLastAdded(added);
        setTimeout(() => setLastAdded([]), 4000);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setTranscript('');
    setLastAdded([]);
  }, [isSupported, onAddItem]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  if (!isSupported) {
    return null; // Don't show anything if browser doesn't support speech
  }

  return (
    <div className="voice-input">
      <button
        className={`voice-btn ${listening ? 'active' : ''}`}
        onClick={listening ? stopListening : startListening}
        title={listening ? 'Stop listening' : 'Add items by voice'}
      >
        <span className="voice-icon">{listening ? '⏹' : '🎤'}</span>
        <span className="voice-label">
          {listening ? 'Tap to stop' : 'Voice input'}
        </span>
      </button>

      {listening && (
        <div className="voice-listening">
          <div className="voice-pulse"></div>
          <p className="voice-hint">
            Say your items, e.g. "3 bananas, milk, a loaf of bread and eggs"
          </p>
          {transcript && (
            <p className="voice-transcript">{transcript}</p>
          )}
        </div>
      )}

      {lastAdded.length > 0 && (
        <div className="voice-added">
          Added: {lastAdded.join(', ')}
        </div>
      )}
    </div>
  );
}

// Type declarations for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}
