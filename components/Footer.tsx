import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card mt-16 border-t border-border">
      <div className="container mx-auto px-6 py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} اسپورت‌زون تبریز. تمامی حقوق محفوظ است.</p>
        <p className="text-sm mt-2">مقصد اصلی شما برای رزروهای ورزشی در تبریز.</p>
      </div>
    </footer>
  );
};

export default Footer;