import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react';

export type FriendUser = {
  id: string;
  name: string;
  handle: string;
};

type FriendsContextType = {
  friends: FriendUser[];
  searchUsers: (query: string) => FriendUser[];
  addFriend: (user: FriendUser) => void;
  isFriend: (id: string) => boolean;
};

const suggestions: FriendUser[] = [
  { id: '1', name: 'たくみ', handle: '@takumi_0210' },
  { id: '2', name: 'みさき', handle: '@misaki_0701' },
  { id: '3', name: 'ゆうと', handle: '@yuto_1204' },
  { id: '4', name: 'さやか', handle: '@sayaka_0909' },
];

const defaultFriends: FriendUser[] = [
  { id: '2', name: 'みさき', handle: '@misaki_0701' },
];

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export function FriendsProvider({ children }: { children: ReactNode }) {
  const [friends, setFriends] = useState<FriendUser[]>(defaultFriends);

  const friendIds = useMemo(() => new Set(friends.map((friend) => friend.id)), [friends]);

  const searchUsers = (query: string) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return suggestions.filter((user) => !friendIds.has(user.id));
    return suggestions.filter((user) => {
      if (friendIds.has(user.id)) return false;
      return (
        user.name.toLowerCase().includes(normalized) ||
        user.handle.toLowerCase().includes(normalized)
      );
    });
  };

  const addFriend = (user: FriendUser) => {
    setFriends((prev) => (prev.some((friend) => friend.id === user.id) ? prev : [...prev, user]));
  };

  const isFriend = (id: string) => friendIds.has(id);

  return (
    <FriendsContext.Provider value={{ friends, searchUsers, addFriend, isFriend }}>
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error('useFriends must be used within FriendsProvider');
  return ctx;
}
