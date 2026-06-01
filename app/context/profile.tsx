import React, { createContext, ReactNode, useContext, useState } from 'react';

type Profile = {
  name: string;
  handle: string;
  avatar?: any;
};

type ProfileContextType = {
  profile: Profile;
  setProfile: (p: Partial<Profile>) => void;
};

const defaultProfile: Profile = {
  name: 'はるな',
  handle: '@haruna_0114',
  avatar: require('@/assets/images/icon.jpg'),
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile>(defaultProfile);

  const setProfile = (p: Partial<Profile>) => setProfileState((prev) => ({ ...prev, ...p }));

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
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
