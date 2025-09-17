import React, { useState } from 'react';
import { generateTeamBuildingPost } from '../services/geminiService';
import { UsersIcon, CalendarIcon } from './IconComponents';
import Spinner from './Spinner';

const TeamBuilder: React.FC = () => {
  const [sport, setSport] = useState('فوتسال');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('به دنبال بازیکنان خوب برای یک بازی دوستانه هستم.');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedPost('');
    try {
      const post = await generateTeamBuildingPost(sport, time, message);
      setGeneratedPost(post);
    } catch (error) {
      console.error(error);
      setGeneratedPost("در ایجاد پست شما خطایی روی داد. لطفا دوباره تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-background py-16">
        <div className="container mx-auto px-6">
             <div className="text-center mb-12">
                <UsersIcon className="w-16 h-16 mx-auto text-primary mb-4" />
                <h1 className="text-4xl font-bold text-foreground">تیم خود را بسازید</h1>
                <p className="text-lg text-muted-foreground mt-2">برای بازی بعدی خود در تبریز هم‌تیمی پیدا کنید.</p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="bg-card border border-border p-8 rounded-2xl">
                    <h2 className="text-2xl font-semibold text-card-foreground mb-6">جزئیات را وارد کنید</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="sport" className="block text-sm font-medium text-card-foreground mb-1">ورزش</label>
                            <select id="sport" value={sport} onChange={e => setSport(e.target.value)} className="w-full px-4 py-3 bg-card rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring">
                                <option>فوتسال</option>
                                <option>والیبال</option>
                                <option>بسکتبال</option>
                                <option>تنیس</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-card-foreground mb-1">تاریخ و ساعت</label>
                            <input type="text" id="time" value={time} onChange={e => setTime(e.target.value)} placeholder="مثلاً فردا ساعت ۵ عصر" required className="w-full px-4 py-3 bg-card rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                         <div>
                            <label htmlFor="message" className="block text-sm font-medium text-card-foreground mb-1">پیام شما</label>
                            <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="مثلاً سطح مهارت، نوع بازی..." required className="w-full px-4 py-3 bg-card rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-ring"></textarea>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:bg-primary/50">
                           {isLoading ? 'در حال ایجاد...' : 'ایجاد آگهی'}
                        </button>
                    </form>
                </div>
                <div className="bg-card border border-border p-8 rounded-2xl min-h-[300px]">
                    <h2 className="text-2xl font-semibold text-card-foreground mb-6">پست آگهی شما</h2>
                    {isLoading && <Spinner size="lg" />}
                    {generatedPost && (
                         <div className="bg-muted p-6 rounded-lg shadow-inner relative">
                            <p className="text-muted-foreground whitespace-pre-wrap">{generatedPost}</p>
                            <button onClick={handleCopy} className="absolute top-4 left-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm hover:bg-secondary/80">
                               {copied ? 'کپی شد!' : 'کپی'}
                            </button>
                        </div>
                    )}
                    {!isLoading && !generatedPost && (
                        <div className="text-center py-10 text-muted-foreground">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-2" />
                            <p>پست ایجاد شده شما در اینجا نمایش داده خواهد شد.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default TeamBuilder;