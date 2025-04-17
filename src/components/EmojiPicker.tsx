import React from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

type EmojiPickerProps = {
  onSelect: (emoji: any) => void;
  onClose: () => void;
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  return (
    <div className="absolute bottom-full mb-2">
      <div className="relative">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="relative z-10">
          <Picker
            data={data}
            onEmojiSelect={onSelect}
            theme="light"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      </div>
    </div>
  );
};