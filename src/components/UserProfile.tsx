import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Camera } from 'lucide-react';

type UserProfileProps = {
  userId: string;
  onClose: () => void;
};

type Profile = {
  display_name: string | null;
  avatar_url: string | null;
};

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onClose }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
        setAvatarUrl(data.avatar_url || '');
      }
    };

    fetchProfile();
  }, [userId]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        display_name: displayName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      setProfile({ display_name: displayName, avatar_url: avatarUrl });
      setIsEditing(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={avatarUrl || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
              {isEditing && isOwnProfile && (
                <label className="absolute bottom-0 right-0 bg-pink-600 text-white p-2 rounded-full cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </label>
              )}
            </div>

            {isEditing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-4 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                placeholder="Display Name"
              />
            ) : (
              <h3 className="mt-4 text-xl font-semibold">
                {profile.display_name || 'Anonymous User'}
              </h3>
            )}
          </div>

          {isOwnProfile && (
            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg"
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg"
                >
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};