import React, { createContext, ReactNode, useContext, useState } from 'react';

type Profile = {
  name: string;
  handle: string;
  avatar?: any;
};

type ProfileContextType = {
  profile: Profile;
  setProfile: (p: Partial<Profile>) => void;
  nextAvatar: () => void;
};

const defaultProfile: Profile = {
  name: 'はるな',
  handle: '@haruna_0114',
  avatar: require('@/assets/images/icon.jpg'),
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(defaultProfile);

  const avatarOptions = [
    require('@/assets/images/icon.jpg'),
    require('@/assets/images/react-logo.png'),
  ];

  const setProfile = (p: Partial<Profile>) => setProfileState((prev) => ({ ...prev, ...p }));

  const nextAvatar = () => {
    setProfileState((prev) => {
      const idx = avatarOptions.findIndex((a) => a === prev.avatar);
      const next = avatarOptions[(idx + 1) % avatarOptions.length];
      return { ...prev, avatar: next };
    });
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, nextAvatar }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}

export default ProfileProvider;
