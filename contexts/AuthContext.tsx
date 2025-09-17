import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import type { User, Friend, DirectMessage } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (emailOrPhone: string, password?: string) => Promise<void>;
  register: (emailOrPhone: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  
  // Favorites
  favorites: number[];
  toggleFavorite: (complexId: number) => void;
  isFavorite: (complexId: number) => boolean;

  // Social
  friends: Friend[];
  directMessages: { [conversationId: string]: DirectMessage[] };
  addFriend: (friendId: string) => Promise<void>;
  sendMessage: (receiverId: string, message: string) => Promise<void>;
  toggleReaction: (conversationId: string, messageId: number, emoji: string) => void;
  editMessage: (conversationId: string, messageId: number, newText: string) => void;

  // Notifications
  unreadCounts: { [conversationId: string]: number };
  markConversationAsRead: (friendId: string) => void;
  addSimulatedReply: (fromFriendId: string) => void;
  totalUnreadCount: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to create a consistent conversation ID
const getConversationId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('--');
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Favorites State
  const [favorites, setFavorites] = useState<number[]>([]);
  
  // Social State
  const [friends, setFriends] = useState<Friend[]>([]);
  const [directMessages, setDirectMessages] = useState<{ [key: string]: DirectMessage[] }>({});
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});


  const getStorageKey = (user: User | null, key: string) => {
    if (!user) return `${key}_guest`;
    return `${key}_${user.emailOrPhone}`;
  };

  useEffect(() => {
    // Simulate checking for a logged-in user in localStorage
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      }
    } catch (error) {
        console.error("Failed to parse user from local storage", error);
        localStorage.removeItem('currentUser');
    }
    setIsLoading(false);
  }, []);

  // Load user-specific data (favorites, friends, messages) on mount and when user changes
  useEffect(() => {
    try {
        const favKey = getStorageKey(currentUser, 'favorites');
        const friendsKey = getStorageKey(currentUser, 'friends');
        const dmsKey = getStorageKey(currentUser, 'dms');
        const unreadKey = getStorageKey(currentUser, 'unread');

        const storedFavorites = localStorage.getItem(favKey);
        const storedFriends = localStorage.getItem(friendsKey);
        const storedDms = localStorage.getItem(dmsKey);
        const storedUnread = localStorage.getItem(unreadKey);

        setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
        setFriends(storedFriends ? JSON.parse(storedFriends) : []);
        setDirectMessages(storedDms ? JSON.parse(storedDms) : {});
        setUnreadCounts(storedUnread ? JSON.parse(storedUnread) : {});

    } catch (error) {
        console.error("Failed to parse user data from local storage", error);
        setFavorites([]);
        setFriends([]);
        setDirectMessages({});
        setUnreadCounts({});
    }
  }, [currentUser]);

  // Simulated login function
  const login = async (emailOrPhone: string, password?: string): Promise<void> => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    if (storedUsers[emailOrPhone]) {
        const user: User = { emailOrPhone };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        throw new Error('کاربر یافت نشد یا رمز عبور اشتباه است.');
    }
  };

  // Simulated register function
  const register = async (emailOrPhone: string, password?: string): Promise<void> => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    if (storedUsers[emailOrPhone]) {
        throw new Error('کاربری با این ایمیل یا شماره تلفن قبلاً ثبت‌نام کرده است.');
    }
    
    storedUsers[emailOrPhone] = { password };
    localStorage.setItem('users', JSON.stringify(storedUsers));
    
    const user: User = { emailOrPhone };
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const toggleFavorite = (complexId: number) => {
    setFavorites(prevFavorites => {
        const newFavorites = prevFavorites.includes(complexId)
            ? prevFavorites.filter(id => id !== complexId)
            : [...prevFavorites, complexId];
        
        try {
            const key = getStorageKey(currentUser, 'favorites');
            localStorage.setItem(key, JSON.stringify(newFavorites));
        } catch (error) {
            console.error("Failed to save favorites to local storage", error);
        }
        return newFavorites;
    });
  };

  const isFavorite = (complexId: number): boolean => {
    return favorites.includes(complexId);
  };
  
  const addFriend = async (friendId: string): Promise<void> => {
    if (!currentUser || friendId === currentUser.emailOrPhone) {
      throw new Error("شما نمی‌توانید خودتان را به عنوان دوست اضافه کنید.");
    }
    if (friends.some(f => f.id === friendId)) {
        throw new Error("شما قبلاً این کاربر را اضافه کرده‌اید یا درخواست دوستی فرستاده‌اید.");
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    if (!storedUsers[friendId]) {
        throw new Error("کاربر یافت نشد.");
    }
    
    setFriends(prevFriends => {
        // For demo, new friends are added as 'pending'. In a real app,
        // you might have another user accept this.
        const newFriend: Friend = { id: friendId, status: 'pending' };
        const newFriends = [...prevFriends, newFriend];
        try {
            const key = getStorageKey(currentUser, 'friends');
            localStorage.setItem(key, JSON.stringify(newFriends));
        } catch (error) {
            console.error("Failed to save friends to local storage", error);
        }
        return newFriends;
    });
  };

  const sendMessage = async (receiverId: string, message: string): Promise<void> => {
    if (!currentUser) throw new Error("برای ارسال پیام باید وارد شوید.");

    const newMessage: DirectMessage = {
        id: Date.now(),
        sender: currentUser.emailOrPhone,
        receiver: receiverId,
        message,
        timestamp: Date.now(),
    };
    
    setDirectMessages(prevDms => {
        const conversationId = getConversationId(currentUser.emailOrPhone, receiverId);
        const updatedConversation = [...(prevDms[conversationId] || []), newMessage];
        const newDms = { ...prevDms, [conversationId]: updatedConversation };

        try {
            const key = getStorageKey(currentUser, 'dms');
            localStorage.setItem(key, JSON.stringify(newDms));
        } catch (error) {
            console.error("Failed to save direct messages to local storage", error);
        }
        return newDms;
    });
  };

  const toggleReaction = (conversationId: string, messageId: number, emoji: string) => {
    if (!currentUser) return;

    setDirectMessages(prevDms => {
        const currentConversation = prevDms[conversationId];
        if (!currentConversation) return prevDms;

        const updatedConversation = currentConversation.map(message => {
            if (message.id === messageId) {
                const reactions = { ...(message.reactions || {}) };
                const usersWhoReacted = reactions[emoji] || [];
                const currentUserEmail = currentUser.emailOrPhone;

                if (usersWhoReacted.includes(currentUserEmail)) {
                    // User is removing their reaction
                    reactions[emoji] = usersWhoReacted.filter(user => user !== currentUserEmail);
                    if (reactions[emoji].length === 0) {
                        delete reactions[emoji];
                    }
                } else {
                    // User is adding a reaction
                    reactions[emoji] = [...usersWhoReacted, currentUserEmail];
                }

                return { ...message, reactions };
            }
            return message;
        });

        const newDms = { ...prevDms, [conversationId]: updatedConversation };

        try {
            const key = getStorageKey(currentUser, 'dms');
            localStorage.setItem(key, JSON.stringify(newDms));
        } catch (error) {
            console.error("Failed to save reactions to local storage", error);
        }
        return newDms;
    });
  };
  
  const editMessage = (conversationId: string, messageId: number, newText: string) => {
     if (!currentUser) return;
     setDirectMessages(prevDms => {
        const currentConversation = prevDms[conversationId];
        if (!currentConversation) return prevDms;
        
        const updatedConversation = currentConversation.map(msg => 
            (msg.id === messageId && msg.sender === currentUser.emailOrPhone)
                ? { ...msg, message: newText }
                : msg
        );
        
        const newDms = { ...prevDms, [conversationId]: updatedConversation };

        try {
            const key = getStorageKey(currentUser, 'dms');
            localStorage.setItem(key, JSON.stringify(newDms));
        } catch (error) {
            console.error("Failed to save edited message to local storage", error);
        }
        return newDms;
     });
  };


  const addSimulatedReply = (fromFriendId: string) => {
    if(!currentUser) return;
    
    const reply: DirectMessage = {
        id: Date.now(),
        sender: fromFriendId,
        receiver: currentUser.emailOrPhone,
        message: `عالیه! این یک پاسخ خودکار است.`,
        timestamp: Date.now(),
    };
    
    const conversationId = getConversationId(currentUser.emailOrPhone, fromFriendId);

    setDirectMessages(prevDms => {
        const newDms = { ...prevDms };
        newDms[conversationId] = [...(newDms[conversationId] || []), reply];
        try {
            const key = getStorageKey(currentUser, 'dms');
            localStorage.setItem(key, JSON.stringify(newDms));
        } catch (error) { console.error("Failed to save dms", error); }
        return newDms;
    });

    setUnreadCounts(prevCounts => {
        const newCounts = { ...prevCounts };
        newCounts[conversationId] = (newCounts[conversationId] || 0) + 1;
        try {
            const key = getStorageKey(currentUser, 'unread');
            localStorage.setItem(key, JSON.stringify(newCounts));
        } catch (error) { console.error("Failed to save unread counts", error); }
        return newCounts;
    });
  };

  const markConversationAsRead = (friendId: string) => {
    if(!currentUser) return;
    const conversationId = getConversationId(currentUser.emailOrPhone, friendId);
    
    setUnreadCounts(prev => {
        if (!prev[conversationId]) return prev;
        const newCounts = {...prev};
        delete newCounts[conversationId];
        try {
            const key = getStorageKey(currentUser, 'unread');
            localStorage.setItem(key, JSON.stringify(newCounts));
        } catch (error) {
            console.error("Failed to save unread counts to local storage", error);
        }
        return newCounts;
    });
  };

  const totalUnreadCount = useMemo(() => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  }, [unreadCounts]);


  const value = {
    currentUser,
    login,
    register,
    logout,
    isLoading,
    favorites,
    toggleFavorite,
    isFavorite,
    friends,
    directMessages,
    addFriend,
    sendMessage,
    toggleReaction,
    editMessage,
    unreadCounts,
    markConversationAsRead,
    addSimulatedReply,
    totalUnreadCount,
  };

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};