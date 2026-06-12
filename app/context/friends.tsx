import React, { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import tryFetch from '../lib/api';
import { useAuth } from './AuthContext';

export type FriendUser = {
  id: string;
  name: string;
  handle: string;
  avatar?: string | null;
};

type FriendsContextType = {
  friends: FriendUser[];
  recommendations: FriendUser[];
  searchUsers: (query: string) => FriendUser[];
  addFriend: (user: FriendUser) => Promise<void>;
  isFriend: (id: string) => boolean;
};

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

const mapFriendUser = (row: any): FriendUser => ({
  id: String(row.id ?? row.user_id),
  name: row.name ?? row.user_name ?? '',
  handle: row.handle ?? row.email ?? '',
  avatar: row.avatar ?? row.icon_image ?? null,
});

export function FriendsProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [recommendations, setRecommendations] = useState<FriendUser[]>([]);

  const friendIds = useMemo(() => new Set(friends.map((friend) => friend.id)), [friends]);

  useEffect(() => {
    if (!token) {
      setFriends([]);
      setRecommendations([]);
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const [friendsRes, usersRes] = await Promise.all([
          tryFetch('/api/friends'),
          tryFetch('/api/friends/recommendations'),
        ]);

        if (!mounted) return;

        if (friendsRes.ok) {
          const friendsData: any = await friendsRes.json();
          setFriends(Array.isArray(friendsData.friends) ? friendsData.friends.map(mapFriendUser) : []);
        }

        if (usersRes.ok) {
          const recommendationsData: any = await usersRes.json();
          setRecommendations(Array.isArray(recommendationsData.users) ? recommendationsData.users.map(mapFriendUser) : []);
        }
      } catch (e) {
        console.warn('friends fetch failed', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  const searchUsers = (query: string) => {
    const normalized = query.trim().toLowerCase();
    const pool = recommendations.filter((user) => !friendIds.has(user.id));
    if (!normalized) return pool;
    return pool.filter((user) => {
      if (friendIds.has(user.id)) return false;
      return (
        user.name.toLowerCase().includes(normalized) ||
        user.handle.toLowerCase().includes(normalized)
      );
    });
  };

  const addFriend = async (user: FriendUser) => {
    if (friendIds.has(user.id)) return;

    const previousFriends = friends;
    const previousRecommendations = recommendations;
    const nextFriend = { ...user };

    setFriends((prev) => (prev.some((friend) => friend.id === user.id) ? prev : [...prev, nextFriend]));
    setRecommendations((prev) => prev.filter((item) => item.id !== user.id));

    try {
      const res = await tryFetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_user_id: Number(user.id) }),
      });

      if (!res.ok) {
        throw new Error((await res.text()) || 'フレンド追加に失敗しました');
      }
    } catch (e) {
      setFriends(previousFriends);
      setRecommendations(previousRecommendations);
      throw e;
    }
  };

  const isFriend = (id: string) => friendIds.has(id);

  return (
    <FriendsContext.Provider value={{ friends, recommendations, searchUsers, addFriend, isFriend }}>
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error('useFriends must be used within FriendsProvider');
  return ctx;
}
