import React, { useState, useMemo } from 'react';
import type { SportComplex, TimeSlot, Review, ChatMessage, SupportTicket } from '../types';
import { LocationIcon, StarIcon, ClockIcon, SparklesIcon, UserCircleIcon, SendIcon, SupportIcon, EnvelopeIcon, DevicePhoneMobileIcon, PencilIcon, TrashIcon, HeartIcon } from './IconComponents';
import BookingModal from './BookingModal';
import { summarizeReviews } from '../services/geminiService';
import Spinner from './Spinner';
import Toast from './Toast';
import { useAuth } from '../contexts/AuthContext';

interface SportComplexDetailProps {
  complex: SportComplex;
  onBack: () => void;
}

const initialTicketState: SupportTicket = {
    name: '',
    contact: '',
    subject: 'مشکل تجهیزات',
    message: '',
    method: 'Email',
};

const SportComplexDetail: React.FC<SportComplexDetailProps> = ({ complex, onBack }) => {
    const { isFavorite, toggleFavorite } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(complex.availableTimeSlots);
    
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [userComment, setUserComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    
    const [aiSummary, setAiSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState<{ id: number; text: string } | null>(null);


    const [toast, setToast] = useState({ show: false, message: '' });

    const [ticket, setTicket] = useState<SupportTicket>(initialTicketState);
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
    
    const favorited = isFavorite(complex.id);

    const { averageRating, totalRatings } = useMemo(() => {
        const hasBaseRating = typeof complex.rating === 'number';
        const baseRating = hasBaseRating ? complex.rating : 0;

        const totalFromReviews = reviews.reduce((acc, review) => acc + review.rating, 0);
        const totalRatingSum = baseRating + totalFromReviews;
        const totalCount = (hasBaseRating ? 1 : 0) + reviews.length;

        if (totalCount === 0) {
            return { averageRating: null, totalRatings: 0 };
        }

        const avg = totalRatingSum / totalCount;
        return { averageRating: avg, totalRatings: totalCount };
    }, [reviews, complex.rating]);

    const handleTimeSlotClick = (slot: TimeSlot) => {
        if (!slot.isBooked) {
            setSelectedTimeSlot(slot);
            setIsModalOpen(true);
        }
    };

    const handleConfirmBooking = () => {
        if(selectedTimeSlot){
            const updatedSlots = timeSlots.map(slot => 
                slot.time === selectedTimeSlot.time ? { ...slot, isBooked: true } : slot
            );
            setTimeSlots(updatedSlots);
            setToast({ show: true, message: 'رزرو تایید شد!' });
        }
        setIsModalOpen(false);
        setSelectedTimeSlot(null);
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (userRating === 0 || !userComment.trim()) {
            alert("لطفا امتیاز و نظر خود را وارد کنید.");
            return;
        }
        setIsSubmittingReview(true);
        setTimeout(() => {
            const newReview: Review = { rating: userRating, comment: userComment };
            setReviews(prevReviews => [newReview, ...prevReviews]);
            setUserRating(0);
            setHoverRating(0);
            setUserComment('');
            setIsSubmittingReview(false);
        }, 500);
    };

    const handleGenerateSummary = async () => {
        setIsSummarizing(true);
        setAiSummary('');
        try {
            const summary = await summarizeReviews(reviews);
            setAiSummary(summary);
        } catch (error) {
            console.error("Error generating summary:", error);
            setAiSummary("متاسفانه، در حال حاضر نتوانستیم خلاصه‌ای ایجاد کنیم. لطفاً بعداً دوباره امتحان کنید.");
        } finally {
            setIsSummarizing(false);
        }
    };
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const message: ChatMessage = {
            id: Date.now(),
            user: 'شما', // In a real app, this would be the logged-in user
            message: newMessage,
            timestamp: Date.now(),
        };

        setChatMessages(prev => [...prev, message]);
        setNewMessage('');
    };
    
    const handleDeleteMessage = (messageId: number) => {
        setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
    };

    const handleStartEdit = (message: ChatMessage) => {
        setEditingMessage({ id: message.id, text: message.message });
    };

    const handleCancelEdit = () => {
        setEditingMessage(null);
    };

    const handleConfirmEdit = () => {
        if (!editingMessage) return;
        setChatMessages(prev =>
            prev.map(msg =>
                msg.id === editingMessage.id ? { ...msg, message: editingMessage.text } : msg
            )
        );
        setEditingMessage(null);
    };

    const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTicket(prev => ({ ...prev, [name]: value }));
    };

    const handleTicketSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingTicket(true);
        console.log("Submitting ticket:", ticket);

        // Simulate API call
        setTimeout(() => {
            setToast({ show: true, message: `تیکت از طریق ${ticket.method === 'Email' ? 'ایمیل' : 'پیامک'} ارسال شد!` });
            setIsSubmittingTicket(false);
            setTicket(initialTicketState);
        }, 1500);
    };

    return (
        <div className="container mx-auto px-6 py-12">
            <Toast 
                show={toast.show} 
                message={toast.message} 
                onClose={() => setToast({ show: false, message: '' })} 
            />
             <button onClick={onBack} className="mb-8 text-primary font-semibold hover:underline">
                بازگشت به لیست مجموعه‌ها &larr;
            </button>
            <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border">
                <div className="grid grid-cols-1 md:grid-cols-5">
                    <div className="md:col-span-3">
                        <img src={complex.imageUrl} alt={complex.name} className="w-full h-64 md:h-full object-cover"/>
                    </div>
                    <div className="md:col-span-2 p-8">
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-3xl font-bold text-foreground">{complex.name}</h1>
                            <button
                                onClick={() => toggleFavorite(complex.id)}
                                className={`p-3 rounded-full transition-colors duration-200 flex-shrink-0 ${favorited ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-secondary hover:bg-accent'}`}
                                aria-label={favorited ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                            >
                                <HeartIcon className="w-6 h-6" filled={favorited} />
                            </button>
                        </div>
                        <div className="flex items-center my-3 text-lg">
                           {averageRating !== null ? (
                                <>
                                    <StarIcon className="w-6 h-6 text-yellow-400 ms-2" />
                                    <span className="font-bold text-card-foreground">{averageRating.toFixed(1)}</span>
                                    <span className="text-muted-foreground mr-2">({totalRatings} امتیاز)</span>
                                </>
                            ) : (
                                <span className="text-muted-foreground">هنوز امتیازی ثبت نشده</span>
                            )}
                        </div>
                        <div className="flex items-start text-card-foreground my-4">
                            <LocationIcon className="w-5 h-5 ms-3 mt-1 text-muted-foreground flex-shrink-0" />
                            <span>{complex.address}</span>
                        </div>
                        <p className="text-muted-foreground mt-4 leading-relaxed">{complex.description}</p>
                        
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-card-foreground mb-3">ورزش‌های موجود</h3>
                             <div className="flex flex-wrap gap-2">
                                {complex.sports.map(sport => (
                                    <span key={sport} className="bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-full">{sport}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-8 border-t border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center"><ClockIcon className="w-7 h-7 ms-3 text-primary"/>سانس‌های موجود</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {timeSlots.map(slot => (
                             <button
                                key={slot.time}
                                onClick={() => handleTimeSlotClick(slot)}
                                disabled={slot.isBooked}
                                className={`p-4 rounded-lg text-center font-semibold transition-all duration-200 border-2
                                    ${slot.isBooked 
                                        ? 'bg-muted text-muted-foreground cursor-not-allowed border-muted' 
                                        : 'bg-transparent border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg'
                                    }`}
                            >
                                {slot.time}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-foreground mb-6">نظرات کاربران</h2>
                    
                    {reviews.length >= 2 && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
                            <h3 className="text-xl font-semibold text-primary mb-3 flex items-center">
                                <SparklesIcon className="w-6 h-6 ms-2" />
                                خلاصه‌سازی نظرات با هوش مصنوعی
                            </h3>
                            {isSummarizing ? (
                                <Spinner size="md" />
                            ) : aiSummary ? (
                                <p className="text-primary/90 whitespace-pre-wrap">{aiSummary}</p>
                            ) : (
                                <>
                                    <p className="text-primary/90 mb-4">یک خلاصه سریع از نظرات دیگران درباره این مجموعه دریافت کنید.</p>
                                    <button
                                        onClick={handleGenerateSummary}
                                        disabled={isSummarizing}
                                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
                                    >
                                        {isSummarizing ? <><Spinner size="sm" className="ms-2" /> در حال خلاصه‌سازی...</> : <>ایجاد خلاصه</>}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    <div className="bg-card p-8 rounded-2xl border border-border mb-8">
                        <h3 className="text-xl font-semibold text-foreground mb-4">نظر خود را ثبت کنید</h3>
                        <form onSubmit={handleSubmitReview}>
                            <div className="flex items-center mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        className={`text-3xl transition-colors ${ (hoverRating || userRating) >= star ? 'text-yellow-400' : 'text-muted-foreground/50'}`}
                                        onClick={() => setUserRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        ★
                                    </button>
                                ))}
                                <span className="mr-4 text-muted-foreground">{userRating > 0 ? `${userRating}/5` : 'امتیاز شما'}</span>
                            </div>
                            <textarea
                                value={userComment}
                                onChange={(e) => setUserComment(e.target.value)}
                                placeholder="جزئیات تجربه خود را در این مکان به اشتراک بگذارید"
                                rows={4}
                                className="w-full p-4 bg-background rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                            ></textarea>
                            <button 
                                type="submit" 
                                disabled={isSubmittingReview}
                                className="mt-4 bg-foreground text-background py-2 px-6 rounded-lg font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                {isSubmittingReview ? 'در حال ارسال...' : 'ثبت نظر'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-card p-8 rounded-2xl border border-border">
                        <h3 className="text-xl font-semibold text-foreground mb-4">نظرات کاربران</h3>
                         {reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map((review, index) => (
                                    <div key={index} className="flex items-start">
                                        <UserCircleIcon className="w-10 h-10 text-muted-foreground ms-4" />
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                 {[...Array(5)].map((_, i) => (
                                                    <StarIcon key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-muted-foreground/30'}`} />
                                                ))}
                                            </div>
                                            <p className="text-card-foreground mt-2">{review.comment}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">اولین نفری باشید که نظر خود را ثبت می‌کند!</p>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-8">
                   <div className="bg-card p-6 rounded-2xl border border-border sticky top-28">
                        <h2 className="text-2xl font-bold text-foreground mb-6">چت گروهی</h2>
                        <div className="h-96 bg-background rounded-lg p-4 flex flex-col space-y-4 overflow-y-auto mb-4 border border-input">
                           {chatMessages.length > 0 ? chatMessages.map(msg => {
                                const isEditing = editingMessage?.id === msg.id;
                                const canEdit = (Date.now() - msg.timestamp) < 60000; // 60 seconds
                                return(
                                    <div key={msg.id} className="group flex items-start text-sm">
                                        <UserCircleIcon className="w-8 h-8 text-muted-foreground ms-3 flex-shrink-0" />
                                        <div className="flex-1 bg-muted rounded-lg p-3">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-card-foreground">{msg.user}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            {isEditing ? (
                                                <div className="mt-2">
                                                    <textarea 
                                                        value={editingMessage.text}
                                                        onChange={e => setEditingMessage({...editingMessage, text: e.target.value})}
                                                        className="w-full text-sm bg-background p-2 rounded border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                                                        rows={2}
                                                    />
                                                    <div className="flex justify-end gap-2 mt-1">
                                                        <button onClick={handleCancelEdit} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80">لغو</button>
                                                        <button onClick={handleConfirmEdit} className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90">ذخیره</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-card-foreground mt-1">{msg.message}</p>
                                            )}
                                        </div>
                                         {!isEditing && (
                                            <div className="mr-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                {canEdit && (
                                                    <button onClick={() => handleStartEdit(msg)} className="p-1.5 rounded-full hover:bg-accent text-muted-foreground"><PencilIcon className="w-4 h-4" /></button>
                                                )}
                                                <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 rounded-full hover:bg-accent text-muted-foreground"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                         )}
                                    </div>
                                )
                            }) : (
                                 <div className="flex-1 flex items-center justify-center">
                                    <p className="text-muted-foreground text-center">هنوز پیامی وجود ندارد. گفتگو را شروع کنید!</p>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="پیدا کردن هم‌تیمی..."
                                className="flex-1 bg-background px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button type="submit" className="bg-primary text-primary-foreground p-3 rounded-lg hover:bg-primary/90 transition-colors">
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </form>
                    </div>

                    <div className="bg-card p-6 rounded-2xl border border-border">
                         <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                            <SupportIcon className="w-7 h-7 ms-3 text-primary" />
                            تماس و پشتیبانی
                         </h2>
                         <form onSubmit={handleTicketSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-card-foreground" htmlFor="name">نام کامل</label>
                                <input type="text" id="name" name="name" value={ticket.name} onChange={handleTicketChange} required className="mt-1 w-full bg-background px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                             <div>
                                <label className="text-sm font-medium text-card-foreground" htmlFor="contact">تماس (ایمیل یا تلفن)</label>
                                <input type="text" id="contact" name="contact" value={ticket.contact} onChange={handleTicketChange} required className="mt-1 w-full bg-background px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-card-foreground" htmlFor="subject">موضوع</label>
                                <select id="subject" name="subject" value={ticket.subject} onChange={handleTicketChange} className="mt-1 w-full bg-background px-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring">
                                    <option>مشکل تجهیزات</option>
                                    <option>سوال در مورد رزرو</option>
                                    <option>بازخورد عمومی</option>
                                    <option>سایر</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-card-foreground" htmlFor="message">پیام</label>
                                <textarea id="message" name="message" value={ticket.message} onChange={handleTicketChange} rows={4} required className="mt-1 w-full bg-background p-4 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-card-foreground">روش اطلاع‌رسانی</label>
                                <div className="mt-2 flex gap-4">
                                    <label className="flex items-center p-3 border border-input rounded-lg has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer">
                                        <input type="radio" name="method" value="Email" checked={ticket.method === 'Email'} onChange={handleTicketChange} className="sr-only" />
                                        <EnvelopeIcon className="w-5 h-5 ms-2 text-primary" />
                                        <span className="text-sm font-medium">ایمیل</span>
                                    </label>
                                     <label className="flex items-center p-3 border border-input rounded-lg has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer">
                                        <input type="radio" name="method" value="SMS" checked={ticket.method === 'SMS'} onChange={handleTicketChange} className="sr-only" />
                                        <DevicePhoneMobileIcon className="w-5 h-5 ms-2 text-primary" />
                                        <span className="text-sm font-medium">پیامک</span>
                                    </label>
                                </div>
                            </div>
                            <button type="submit" disabled={isSubmittingTicket} className="w-full mt-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex justify-center items-center">
                                {isSubmittingTicket ? <Spinner size="sm" /> : 'ارسال تیکت'}
                            </button>
                         </form>
                    </div>

                </div>
            </div>

            <BookingModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onConfirm={handleConfirmBooking}
                complex={complex}
                timeSlot={selectedTimeSlot}
            />
        </div>
    );
};

export default SportComplexDetail;