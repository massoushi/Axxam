export type Conversation = {
  id: string;
  propertyId: string | null;
  bookingId: string | null;
  clientId: string;
  hostId: string;
  lastMessageAt: string;
  createdAt: string;
  propertyName?: string | null;
  propertyImg?: string | null;
  clientName?: string | null;
  hostName?: string | null;
  lastMessage?: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type Review = {
  id: string;
  bookingId: string;
  propertyId: string;
  clientId: string;
  rating: number;
  comment: string;
  createdAt: string;
  clientName?: string | null;
};

export type AppNotification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link: string;
  readAt: string | null;
  createdAt: string;
};
