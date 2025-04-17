import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Users, Smile, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { EmojiPicker } from '../components/EmojiPicker';
import { UserProfile } from '../components/UserProfile';
import { ModeratorControls } from '../components/ModeratorControls';

type ChatGroup = {
  id: string;
  name: string;
  description: string;
  is_moderated: boolean;
};

type ChatMessage = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_email?: string;
  is_deleted?: boolean;
};

type TypingUser = {
  user_id: string;
  user_email: string;
};

type UserProfileData = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

const CommunityChat = () => {
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfileData>>({});
  const [isModerator, setIsModerator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();

  useEffect(() => {
    const fetchGroups = async () => {
      const { data, error } = await supabase
        .from('chat_groups')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching groups:', error);
      } else {
        setGroups(data);
        if (data.length > 0 && !selectedGroup) {
          setSelectedGroup(data[0]);
        }
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup && user) {
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*, user:users(email)')
          .eq('group_id', selectedGroup.id)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching messages:', error);
        } else {
          setMessages(data.map(message => ({
            ...message,
            user_email: message.user?.email
          })));
        }
      };

      const fetchUserProfiles = async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*');

        if (!error && data) {
          const profiles = data.reduce((acc, profile) => ({
            ...acc,
            [profile.id]: profile
          }), {});
          setUserProfiles(profiles);
        }
      };

      const checkModeratorStatus = async () => {
        const { data, error } = await supabase
          .from('chat_moderators')
          .select('*')
          .eq('user_id', user.id)
          .eq('group_id', selectedGroup.id)
          .single();

        setIsModerator(!!data && !error);
      };

      fetchMessages();
      fetchUserProfiles();
      checkModeratorStatus();

      // Subscribe to new messages
      const messageSubscription = supabase
        .channel('chat_messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `group_id=eq.${selectedGroup.id}`
        }, async payload => {
          const { data: userData } = await supabase
            .from('users')
            .select('email')
            .eq('id', payload.new.user_id)
            .single();

          setMessages(prev => [...prev, {
            ...payload.new as ChatMessage,
            user_email: userData?.email
          }]);
        })
        .subscribe();

      // Subscribe to typing indicators
      const typingSubscription = supabase
        .channel(`typing_${selectedGroup.id}`)
        .on('broadcast', { event: 'typing' }, payload => {
          setTypingUsers(prev => {
            const exists = prev.some(u => u.user_id === payload.payload.user_id);
            if (!exists) {
              return [...prev, payload.payload as TypingUser];
            }
            return prev;
          });

          setTimeout(() => {
            setTypingUsers(prev => 
              prev.filter(u => u.user_id !== payload.payload.user_id)
            );
          }, 2000);
        })
        .subscribe();

      return () => {
        messageSubscription.unsubscribe();
        typingSubscription.unsubscribe();
      };
    }
  }, [selectedGroup, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = async () => {
    if (!selectedGroup || !user) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      supabase
        .channel(`typing_${selectedGroup.id}`)
        .send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: user.id,
            user_email: user.email
          }
        });
    }, 500);
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup || !user) return;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content: newMessage,
        group_id: selectedGroup.id,
        user_id: user.id
      });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, is_deleted: true } : msg
    ));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50/80 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to access the community chat.</p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
          >
            Sign In
          </button>
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Chat</h1>
        <p className="text-gray-600 mt-2">Connect with others and share experiences</p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
        <div className="grid grid-cols-4 h-[600px]">
          {/* Groups Sidebar */}
          <div className="col-span-1 border-r border-gray-200/80 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-pink-600" />
              <h2 className="font-semibold">Support Groups</h2>
            </div>
            <div className="space-y-2">
              {groups.map(group => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedGroup?.id === group.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium flex items-center gap-2">
                    {group.name}
                    {group.is_moderated && (
                      <Shield className="w-4 h-4 text-blue-500" title="Moderated group" />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {group.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-3 flex flex-col bg-gradient-to-b from-blue-50/50 to-white">
            {selectedGroup ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200/80 bg-white/50 backdrop-blur-sm">
                  <h2 className="font-semibold">{selectedGroup.name}</h2>
                  <p className="text-sm text-gray-500">{selectedGroup.description}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.user_id === user.id ? 'justify-end' : 'justify-start'
                      } ${message.is_deleted ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-start gap-2 max-w-[70%]">
                        <button
                          onClick={() => setSelectedUserId(message.user_id)}
                          className="flex-shrink-0"
                        >
                          <img
                            src={userProfiles[message.user_id]?.avatar_url || 'https://via.placeholder.com/40'}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full"
                          />
                        </button>
                        <div
                          className={`rounded-lg p-3 ${
                            message.user_id === user.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100'
                          }`}
                        >
                          <div className="text-sm mb-1 flex justify-between gap-2">
                            <button
                              onClick={() => setSelectedUserId(message.user_id)}
                              className="font-medium hover:underline"
                            >
                              {userProfiles[message.user_id]?.display_name || message.user_email || 'Anonymous'}
                            </button>
                            <span className="text-xs opacity-75">
                              {format(new Date(message.created_at), 'h:mm a')}
                            </span>
                          </div>
                          <div>
                            {message.is_deleted ? (
                              <em>This message has been deleted</em>
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                        {isModerator && !message.is_deleted && (
                          <ModeratorControls
                            groupId={selectedGroup.id}
                            messageId={message.id}
                            onDelete={() => handleDeleteMessage(message.id)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {typingUsers.length > 0 && (
                    <div className="text-sm text-gray-500 italic">
                      {typingUsers
                        .filter(u => u.user_id !== user.id)
                        .map(u => userProfiles[u.user_id]?.display_name || u.user_email)
                        .join(', ')}{' '}
                      {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200/80 bg-white/50 backdrop-blur-sm">
                  <div className="flex gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Smile className="w-6 h-6 text-gray-500" />
                      </button>
                      {showEmojiPicker && (
                        <EmojiPicker
                          onSelect={handleEmojiSelect}
                          onClose={() => setShowEmojiPicker(false)}
                        />
                      )}
                    </div>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleTyping}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a group to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedUserId && (
        <UserProfile
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};

export default CommunityChat;