import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon, SendIcon, FaceSmileIcon, PencilIcon } from './IconComponents';
import type { DirectMessage } from '../types';

const getConversationId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('--');
};

const formatTimestamp = (timestamp: number): string => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffSeconds = Math.round((now.getTime() - messageDate.getTime()) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSeconds < 60) return `${diffSeconds} ثانیه`;
    if (diffMinutes < 60) return `${diffMinutes} دقیقه`;
    if (diffHours < 24) return `${diffHours} ساعت`;
    if (diffDays === 1) return 'دیروز';
    if (diffDays < 7) return `${diffDays} روز`;
    return messageDate.toLocaleDateString('fa-IR');
};


const Messenger: React.FC = () => {
    const { currentUser, friends, directMessages, sendMessage, unreadCounts, markConversationAsRead, addSimulatedReply, toggleReaction, editMessage } = useAuth();
    const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [reactingTo, setReactingTo] = useState<number | null>(null);
    const [editingMessage, setEditingMessage] = useState<{id: number, text: string} | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];


    const conversations = useMemo(() => {
        if (!currentUser) return [];

        const convos = friends
            .filter(friend => friend.status === 'accepted')
            .map(friend => {
                const conversationId = getConversationId(currentUser.emailOrPhone, friend.id);
                const messages = directMessages[conversationId] || [];
                const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                return {
                    friendId: friend.id,
                    lastMessage: lastMessage,
                };
            });

        // Sort by timestamp of last message, descending
        convos.sort((a, b) => {
            const timeA = a.lastMessage?.timestamp || 0;
            const timeB = b.lastMessage?.timestamp || 0;
            return timeB - timeA;
        });

        return convos;
    }, [currentUser, friends, directMessages]);

    const activeConversationMessages = useMemo(() => {
        if (!currentUser || !selectedFriend) return [];
        const conversationId = getConversationId(currentUser.emailOrPhone, selectedFriend);
        return directMessages[conversationId] || [];
    }, [currentUser, selectedFriend, directMessages]);
    
    // Mark conversation as read when it's selected or new messages arrive in it
    useEffect(() => {
        if (selectedFriend) {
            markConversationAsRead(selectedFriend);
        }
    }, [selectedFriend, directMessages, markConversationAsRead]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversationMessages]);
    
    useEffect(() => {
        // Automatically select the first friend in the sorted list if none is selected
        if (!selectedFriend && conversations.length > 0) {
            setSelectedFriend(conversations[0].friendId);
        }
    }, [conversations, selectedFriend]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !selectedFriend) return;
        try {
            const friendToReply = selectedFriend;
            await sendMessage(friendToReply, message);
            setMessage('');
            
            // Simulate a reply after 1.5 seconds
            setTimeout(() => {
                addSimulatedReply(friendToReply);
            }, 1500);

        } catch (error) {
            console.error("Failed to send message:", error);
            // Handle error UI if needed
        }
    };
    
    const handleSaveEdit = () => {
        if(!editingMessage || !currentUser || !selectedFriend) return;
        const conversationId = getConversationId(currentUser.emailOrPhone, selectedFriend);
        editMessage(conversationId, editingMessage.id, editingMessage.text);
        setEditingMessage(null);
    };

    if (!currentUser) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <p className="text-muted-foreground">لطفاً برای استفاده از پیام‌رسان وارد شوید.</p>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-6 py-8">
            <div className="h-[calc(100vh-150px)] max-h-[800px] flex flex-row-reverse bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                {/* Conversations List */}
                <div className="w-1/3 border-l border-border flex flex-col">
                    <div className="p-4 border-b border-border">
                        <h1 className="text-xl font-bold text-foreground">گفتگوها</h1>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {conversations.length > 0 ? conversations.map(convo => {
                            const conversationId = getConversationId(currentUser.emailOrPhone, convo.friendId);
                            const count = unreadCounts[conversationId] || 0;
                            return (
                                <button
                                    key={convo.friendId}
                                    onClick={() => setSelectedFriend(convo.friendId)}
                                    className={`w-full text-right p-4 flex items-center gap-3 transition-colors ${
                                        selectedFriend === convo.friendId ? 'bg-primary/10' : 'hover:bg-accent'
                                    }`}
                                >
                                    <UserCircleIcon className="w-10 h-10 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-card-foreground truncate">{convo.friendId}</p>
                                            {count > 0 && (
                                                <span className="me-2 flex-shrink-0 bg-primary text-primary-foreground text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                                    {count}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <p className="text-sm text-muted-foreground truncate flex-grow">
                                                {convo.lastMessage 
                                                    ? `${convo.lastMessage.sender === currentUser.emailOrPhone ? 'شما: ' : ''}${convo.lastMessage.message}`
                                                    : 'هنوز پیامی نیست.'}
                                            </p>
                                            {convo.lastMessage && (
                                                <p className="text-xs text-muted-foreground flex-shrink-0 mr-2">
                                                    {formatTimestamp(convo.lastMessage.timestamp)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )
                        }) : (
                            <p className="text-muted-foreground text-center p-6">هنوز دوستی ندارید. از پروفایل خود دوستانتان را اضافه کنید.</p>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="w-2/3 flex flex-col">
                    {selectedFriend ? (
                        <>
                            <div className="p-4 border-b border-border flex items-center gap-3">
                                <UserCircleIcon className="w-10 h-10 text-muted-foreground" />
                                <h2 className="text-lg font-bold text-foreground">{selectedFriend}</h2>
                            </div>
                            <div className="flex-grow p-6 overflow-y-auto bg-background/50">
                                <div className="space-y-1">
                                    {activeConversationMessages.map(msg => {
                                        const isMyMessage = msg.sender === currentUser.emailOrPhone;
                                        const isEditing = editingMessage?.id === msg.id;
                                        const canEdit = isMyMessage && (Date.now() - msg.timestamp) < 60000;

                                        return (
                                        <div key={msg.id}>
                                            <div className={`flex items-end gap-2 max-w-lg group ${
                                                    isMyMessage ? 'mr-auto flex-row-reverse' : 'ml-auto'
                                                }`}
                                            >
                                                <div className="relative">
                                                    {reactingTo === msg.id && (
                                                        <div 
                                                            className={`absolute z-10 flex gap-1 bg-card p-2 rounded-full shadow-lg border border-border ${isMyMessage ? 'left-0 -top-12' : 'right-0 -top-12'}`}
                                                            onMouseLeave={() => setReactingTo(null)}
                                                        >
                                                            {EMOJI_REACTIONS.map(emoji => (
                                                                <button
                                                                    key={emoji}
                                                                    onClick={() => {
                                                                        const conversationId = getConversationId(currentUser!.emailOrPhone, selectedFriend!);
                                                                        toggleReaction(conversationId, msg.id, emoji);
                                                                        setReactingTo(null);
                                                                    }}
                                                                    className="text-2xl hover:scale-125 transition-transform"
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                     {isEditing ? (
                                                        <div className="w-72">
                                                            <textarea
                                                                value={editingMessage.text}
                                                                onChange={e => setEditingMessage({...editingMessage, text: e.target.value})}
                                                                className="w-full text-sm bg-background p-2 rounded border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                                                            />
                                                            <div className="flex justify-end gap-2 mt-1">
                                                                <button onClick={() => setEditingMessage(null)} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80">لغو</button>
                                                                <button onClick={handleSaveEdit} className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90">ذخیره</button>
                                                            </div>
                                                        </div>
                                                     ) : (
                                                        <div
                                                            className={`rounded-2xl px-4 py-2.5 ${
                                                                isMyMessage
                                                                    ? 'bg-primary text-primary-foreground rounded-bl-none'
                                                                    : 'bg-muted text-card-foreground rounded-br-none'
                                                            }`}
                                                        >
                                                            <p>{msg.message}</p>
                                                        </div>
                                                     )}
                                                </div>
                                                
                                                <div className="transition-opacity opacity-0 group-hover:opacity-100 self-center flex gap-1">
                                                    {!isEditing && canEdit && (
                                                        <button
                                                            onClick={() => setEditingMessage({id: msg.id, text: msg.message})}
                                                            className="p-1.5 rounded-full text-muted-foreground hover:bg-accent"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setReactingTo(reactingTo === msg.id ? null : msg.id)}
                                                        className="p-1.5 rounded-full text-muted-foreground hover:bg-accent"
                                                    >
                                                        <FaceSmileIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                                <div className={`flex gap-1.5 mt-1 ${isMyMessage ? 'justify-start ms-2' : 'justify-end me-10'}`}>
                                                    {Object.entries(msg.reactions).map(([emoji, users]) => 
                                                        users.length > 0 ? (
                                                            <button
                                                                key={emoji}
                                                                onClick={() => {
                                                                    const conversationId = getConversationId(currentUser!.emailOrPhone, selectedFriend!);
                                                                    toggleReaction(conversationId, msg.id, emoji);
                                                                }}
                                                                className={`flex items-center bg-accent px-2 py-0.5 rounded-full shadow-sm border ${users.includes(currentUser!.emailOrPhone) ? 'border-primary' : 'border-transparent'} text-xs`}
                                                            >
                                                                <span className="text-sm">{emoji}</span>
                                                                <span className="mr-1 font-semibold text-foreground">{users.length}</span>
                                                            </button>
                                                        ) : null
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )})}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                            <div className="p-4 bg-card border-t border-border">
                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        placeholder="پیام خود را بنویسید..."
                                        className="flex-1 bg-background px-4 py-3 rounded-full border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                                        autoComplete="off"
                                    />
                                    <button type="submit" className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50" disabled={!message.trim()}>
                                        <SendIcon className="w-6 h-6" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-center">
                            <div className="text-muted-foreground">
                                <h2 className="text-xl font-semibold">به پیام‌رسان خوش آمدید</h2>
                                <p>یک دوست را برای شروع گفتگو انتخاب کنید.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messenger;