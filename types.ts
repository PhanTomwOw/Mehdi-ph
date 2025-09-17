
export interface TimeSlot {
  time: string;
  isBooked: boolean;
}

export interface Review {
  rating: number;
  comment: string;
}

export interface ChatMessage {
  id: number;
  user: string;
  message: string;
  timestamp: number;
}

export interface SupportTicket {
  name: string;
  contact: string;
  subject: string;
  message: string;
  method: 'Email' | 'SMS';
}

export interface SportComplex {
  id: number;
  name: string;
  address: string;
  sports: string[];
  description: string;
  imageUrl: string;
  rating: number;
  availableTimeSlots: TimeSlot[];
}

export interface User {
    emailOrPhone: string;
}

export interface AISuggestion {
  name: string;
  reason: string;
}

export interface Friend {
  id: string;
  status: 'accepted' | 'pending';
}

export interface Reaction {
  [emoji: string]: string[]; // Key is the emoji, value is an array of user IDs
}

export interface DirectMessage {
  id: number;
  sender: string;
  receiver: string;
  message: string;
  timestamp: number;
  reactions?: Reaction;
}