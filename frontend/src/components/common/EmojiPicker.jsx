import { useState, useRef, useEffect } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';

export default function EmojiPicker({ onEmojiSelect, trigger }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <Smile size={20} />
          </button>
        )}
      </div>
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 z-50">
          <Picker
            data={data}
            onEmojiSelect={(emoji) => { onEmojiSelect(emoji.native); setIsOpen(false); }}
            theme="dark"
            set="native"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )}
    </div>
  );
}
