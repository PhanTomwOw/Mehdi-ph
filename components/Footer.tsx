import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card mt-16 border-t border-border">
      <div className="container mx-auto px-6 py-8 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Tabriz SportZone. All rights reserved.</p>
        <p className="text-sm mt-2">Your premier destination for sports reservations in Tabriz.</p>
      </div>
    </footer>
  );
};

export default Footer;