import React from 'react';
import type { TimeSlot, SportComplex } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  complex: SportComplex | null;
  timeSlot: TimeSlot | null;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onConfirm, complex, timeSlot }) => {
  if (!isOpen || !complex || !timeSlot) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity">
      <div className="bg-card rounded-xl shadow-2xl p-8 m-4 max-w-md w-full transform transition-all scale-100 border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-4">تایید رزرو شما</h2>
        <p className="text-card-foreground mb-2">
          شما در حال رزرو یک سانس در <span className="font-semibold text-primary">{complex.name}</span> هستید.
        </p>
        <div className="bg-muted p-4 rounded-lg my-6">
            <p className="text-muted-foreground"><span className="font-semibold text-foreground">زمان:</span> {timeSlot.time}</p>
            <p className="text-muted-foreground mt-1"><span className="font-semibold text-foreground">آدرس:</span> {complex.address}</p>
        </div>
        <p className="text-sm text-muted-foreground mb-6">یک تاییدیه به حساب شما ارسال خواهد شد. لطفاً از صحت اطلاعات خود اطمینان حاصل کنید.</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-secondary-foreground bg-secondary hover:bg-secondary/80 transition-colors"
          >
            لغو
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
          >
            تایید رزرو
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;