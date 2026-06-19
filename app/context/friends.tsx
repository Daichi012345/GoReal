import React, { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import tryFetch from '../lib/api';
import { useAuth } from './AuthContext';

export type FriendUser = {
  id: string;
  name: string;
  handle: string;
  avatar?: string | null;
};

export type FriendRequest = {
  id: string;
  status: string;
  requester: FriendUser;
  created_at: string;
};

type FriendsContextType = {
  friends: FriendUser[];
  recommendations: FriendUser[];
  incomingRequests: FriendRequest[];
  searchUsers: (query: string) => FriendUser[];
  addFriend: (user: FriendUser) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  isFriend: (id: string) => boolean;
  isPending: (id: string) => boolean;
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
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [pendingOutgoingIds, setPendingOutgoingIds] = useState<Set<string>>(new Set());

  const friendIds = useMemo(() => new Set(friends.map((friend) => friend.id)), [friends]);
  const pendingIds = useMemo(() => new Set(pendingOutgoingIds), [pendingOutgoingIds]);

  useEffect(() => {
    if (!token) {
      setFriends([]);
      setRecommendations([]);
      setIncomingRequests([]);
      setPendingOutgoingIds(new Set());
      return;
    }

    let mounted = true;

    (async () => {
      try {
        const [friendsRes, usersRes, sentRes] = await Promise.all([
          tryFetch('/api/friends'),
          tryFetch('/api/friends/recommendations'),
          tryFetch('/api/friend-requests/sent'),
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

        if (sentRes.ok) {
          const sentData: any = await sentRes.json();
          if (Array.isArray(sentData.requests)) {
            setPendingOutgoingIds(new Set(sentData.requests.map((request: any) => String(request.receiver?.id || request.receiver_user_id || ''))));
          }
        }

        const incomingRes = await tryFetch('/api/friend-requests/incoming');
        if (incomingRes.ok) {
          const incomingData: any = await incomingRes.json();
          if (Array.isArray(incomingData.requests)) {
            setIncomingRequests(incomingData.requests.map((request: any) => ({
              id: String(request.id),
              status: String(request.status),
              requester: mapFriendUser(request.requester),
              created_at: String(request.created_at),
            })));
          }
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
    const pool = recommendations.filter((user) => !friendIds.has(user.id) && !pendingIds.has(user.id));
    if (!normalized) return pool;
    return pool.filter((user) => {
      if (friendIds.has(user.id) || pendingIds.has(user.id)) return false;
      return (
        user.name.toLowerCase().includes(normalized) ||
        user.handle.toLowerCase().includes(normalized)
      );
    });
  };

  const addFriend = async (user: FriendUser) => {
    if (friendIds.has(user.id) || pendingIds.has(user.id)) return;

    const previousRecommendations = recommendations;

    setRecommendations((prev) => prev.filter((item) => item.id !== user.id));
    setPendingOutgoingIds((prev) => {
      const next = new Set(prev);
      next.add(user.id);
      return next;
    });

    try {
      const res = await tryFetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_user_id: Number(user.id) }),
      });

      if (!res.ok) {
        throw new Error((await res.text()) || 'フレンド追加に失敗しました');
      }

      const data = await res.json();
      if (data.accepted && data.friend) {
        const nextFriend = { ...user };
        setFriends((prev) => (prev.some((friend) => friend.id === user.id) ? prev : [...prev, nextFriend]));
        setPendingOutgoingIds((prev) => {
          const next = new Set(prev);
          next.delete(user.id);
          return next;
        });
      }
    } catch (e) {
      setRecommendations(previousRecommendations);
      setPendingOutgoingIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
      throw e;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const res = await tryFetch(`/api/friend-requests/${requestId}/accept`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error((await res.text()) || '承認に失敗しました');
      }
      const updatedRequests = incomingRequests.filter((request) => request.id !== requestId);
      setIncomingRequests(updatedRequests);
      const requestAccepted = incomingRequests.find((request) => request.id === requestId);
      if (requestAccepted) {
        setFriends((prev) => (prev.some((friend) => friend.id === requestAccepted.requester.id) ? prev : [...prev, requestAccepted.requester]));
      }
    } catch (err) {
      console.warn('acceptFriendRequest failed', err);
      throw err;
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const res = await tryFetch(`/api/friend-requests/${requestId}/reject`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error((await res.text()) || '拒否に失敗しました');
      }
      setIncomingRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (err) {
      console.warn('rejectFriendRequest failed', err);
      throw err;
    }
  };

  const isFriend = (id: string) => friendIds.has(id);
  const isPending = (id: string) => pendingIds.has(id);

  return (
    <FriendsContext.Provider value={{ friends, recommendations, incomingRequests, searchUsers, addFriend, acceptFriendRequest, rejectFriendRequest, isFriend, isPending }}>
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error('useFriends must be used within FriendsProvider');
  return ctx;
}
