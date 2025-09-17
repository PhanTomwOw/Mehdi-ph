import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon, SparklesIcon, UserPlusIcon, ChatBubbleLeftRightIcon, ClockIcon } from './IconComponents';
import type { SportComplex, AISuggestion } from '../types';
import type { View } from '../App';
import { getAIComplexSuggestions } from '../services/geminiService';
import Spinner from './Spinner';

interface ProfileProps {
    onBack: () => void;
    complexes: SportComplex[];
    setCurrentView: (view: View) => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack, complexes, setCurrentView }) => {
    const { currentUser, friends, addFriend } = useAuth();
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);

    const [friendId, setFriendId] = useState('');
    const [friendError, setFriendError] = useState('');
    const [friendSuccess, setFriendSuccess] = useState('');

    const handleGetSuggestions = async () => {
        if (!currentUser) return;
        setIsSuggesting(true);
        setSuggestionError(null);
        setSuggestions([]);
        try {
            const result = await getAIComplexSuggestions(currentUser, complexes);
            setSuggestions(result);
        } catch (error) {
            setSuggestionError("Sorry, we couldn't generate suggestions at this time.");
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleAddFriend = async (e: React.FormEvent) => {
        e.preventDefault();
        setFriendError('');
        setFriendSuccess('');
        try {
            await addFriend(friendId);
            setFriendSuccess(`Friend request sent to ${friendId}!`);
            setFriendId('');
        } catch (err: any) {
            setFriendError(err.message || 'Could not add friend.');
        }
    };

    if (!currentUser) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <h1 className="text-2xl text-foreground">Please log in to view your profile.</h1>
                <button onClick={onBack} className="mt-4 text-primary font-semibold hover:underline">
                    &larr; Back to all complexes
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <button onClick={onBack} className="mb-8 text-primary font-semibold hover:underline">
                &larr; Back to all complexes
            </button>
            <div className="max-w-4xl mx-auto">
                <div className="bg-card border border-border rounded-2xl shadow-xl p-8 text-center mb-8">
                    <UserCircleIcon className="w-24 h-24 mx-auto text-muted-foreground/50 mb-4" />
                    <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                    <p className="text-lg text-muted-foreground mt-4">
                        Welcome back, <span className="font-semibold text-primary">{currentUser.emailOrPhone}</span>!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Friends Section */}
                    <div className="bg-card border border-border rounded-2xl shadow-xl p-6">
                         <h2 className="text-2xl font-bold text-foreground mb-4">Friends</h2>
                         <form onSubmit={handleAddFriend} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={friendId}
                                onChange={e => setFriendId(e.target.value)}
                                placeholder="Enter friend's email or phone"
                                className="flex-1 bg-background px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button type="submit" className="p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                <UserPlusIcon className="w-5 h-5" />
                            </button>
                         </form>
                         {friendError && <p className="text-sm text-destructive mb-2">{friendError}</p>}
                         {friendSuccess && <p className="text-sm text-primary mb-2">{friendSuccess}</p>}

                         <div className="space-y-2 max-h-48 overflow-y-auto">
                            {friends.length > 0 ? friends.map(friend => (
                                <div key={friend.id} className={`flex justify-between items-center bg-muted p-3 rounded-lg ${friend.status === 'pending' ? 'opacity-70' : ''}`}>
                                    <p className="text-card-foreground font-medium truncate">{friend.id}</p>
                                    {friend.status === 'accepted' ? (
                                        <button onClick={() => setCurrentView({name: 'messenger'})} className="p-2 rounded-full hover:bg-accent text-muted-foreground" aria-label={`Chat with ${friend.id}`}>
                                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <ClockIcon className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-xs font-semibold text-muted-foreground">Pending</span>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <p className="text-muted-foreground text-center py-4">You haven't added any friends yet.</p>
                            )}
                         </div>
                    </div>

                    {/* Booking History Section */}
                    <div className="bg-card border border-border rounded-2xl shadow-xl p-6">
                         <h2 className="text-2xl font-bold text-foreground mb-4">Booking History</h2>
                         <div className="text-center bg-muted p-6 rounded-lg">
                            <p className="text-muted-foreground">You have no past bookings.</p>
                            <p className="text-sm text-muted-foreground/80 mt-1">Book a time slot and it will appear here!</p>
                        </div>
                    </div>
                </div>

                {/* AI Suggestions Section */}
                <div className="bg-card border border-border rounded-2xl shadow-xl p-6 mt-8">
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center">
                       <SparklesIcon className="w-6 h-6 mr-2 text-primary" />
                       AI-Powered Suggestions
                    </h2>
                    <div className="bg-muted p-6 rounded-lg flex flex-col min-h-[150px]">
                        <div className="flex-grow">
                            { !isSuggesting && suggestions.length === 0 && !suggestionError && (
                                 <p className="text-muted-foreground mb-4">Based on your profile, we can suggest the best complexes for you.</p>
                            )}

                            {isSuggesting && <Spinner />}

                            {suggestionError && (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
                                    {suggestionError}
                                </div>
                            )}
                            
                            {!isSuggesting && suggestions.length > 0 && (
                                <div className="space-y-4 text-left">
                                    {suggestions.map((suggestion, index) => (
                                        <div key={index} className="p-4 bg-background border border-border rounded-xl shadow-sm transition-shadow hover:shadow-md">
                                            <p className="text-lg font-bold text-primary">{suggestion.name}</p>
                                            <p className="text-sm text-foreground/80 mt-1.5">{suggestion.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {!isSuggesting && (
                            <button 
                                onClick={handleGetSuggestions}
                                className="w-full mt-4 bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                            >
                                {suggestions.length > 0 ? 'Refresh Suggestions' : 'Get Suggestions'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;