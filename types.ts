
export enum PlanType {
  EVENT = 'Event',
  ROUTINE = 'Routine',
  GOAL = 'Goal',
  REMINDER = 'Reminder'
}

export enum PlanStatus {
  UPCOMING = 'Upcoming',
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum Priority {
  NORMAL = 'Normal',
  IMPORTANT = 'Important'
}

export enum Visibility {
  ALL = 'All family members',
  SELECTED = 'Selected members'
}

export enum Role {
  PARENT = 'Parent',
  CHILD = 'Child'
}

export interface FamilyMember {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

export interface FamilyPlan {
  id: string;
  title: string;
  type: PlanType;
  description: string;
  startDate: string;
  startTime: string;
  endTime?: string;
  repeat: 'One-time' | 'Daily' | 'Weekly' | 'Monthly';
  participants: string[]; // IDs
  reminder: string;
  priority: Priority;
  visibility: Visibility;
  status: PlanStatus;
  createdBy: string; // Member ID
  isApproved: boolean;
}

export type MessageType = 'text' | 'image' | 'voice' | 'system';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  type: MessageType;
  status?: 'sent' | 'delivered' | 'read';
  mediaUrl?: string;
  isStarred?: boolean;
  replyToId?: string;
}

export type ChatType = 'individual' | 'group' | 'ai';

export interface Chat {
  id: string;
  name: string;
  type: ChatType;
  participants: string[]; // IDs
  avatar: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export type StatusType = 'text' | 'image' | 'video';

export interface StatusReaction {
  emoji: string;
  userId: string;
}

export interface StatusUpdate {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  type: StatusType;
  content: string; // Text or URL
  backgroundColor?: string; // For text type
  timestamp: Date;
  viewers: string[]; // User IDs
  reactions: StatusReaction[];
}
