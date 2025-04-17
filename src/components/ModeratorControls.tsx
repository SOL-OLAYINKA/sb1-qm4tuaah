import React from 'react';
import { Shield, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ModeratorControlsProps = {
  groupId: string;
  messageId: string;
  onDelete: () => void;
};

export const ModeratorControls: React.FC<ModeratorControlsProps> = ({
  groupId,
  messageId,
  onDelete,
}) => {
  const handleDelete = async () => {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_deleted: true })
      .eq('id', messageId)
      .eq('group_id', groupId);

    if (!error) {
      onDelete();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDelete}
        className="p-1 text-red-500 hover:bg-red-100 rounded"
        title="Delete message"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};