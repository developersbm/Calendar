export interface Membership {
    id: number;
    type: string; // Free or Premium
    users?: User[];
  }
  
  export interface User {
    id: number;
    name: string;
    email: string;
    cognitoId: string;
    membershipId: number;
    membership?: Membership;
    calendarId: number;
    calendar?: Calendar;
    createdAt: string;
    updatedAt: string;
  
    groupMemberships?: GroupMember[];
    eventParticipants?: EventParticipant[];
    notifications?: Notification[];
    auditLogs?: AuditLog[];
  }
  
  export interface Group {
    id: number;
    title: string;
    description?: string;
    iconUrl: string;
    createdAt: string;
    updatedAt: string;
    members?: GroupMember[];
    calendarId: number;
    calendar?: Calendar;
  }
  
  export interface GroupMember {
    groupId: number;
    userId: number;
    role: string; // Admin, Member
    status: string; // Active, Pending, Left
    group?: Group;
    user?: User;
  }
  
  export interface Calendar {
    id: number;
    ownerId: number;
    ownerType: string; // User or Group
    description?: string;
    createdAt: string;
    updatedAt: string;
    events?: Event[];
  
    users?: User[];
    groups?: Group[];
  }
  
  export interface Event {
    id: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    recurrence?: string; // Recurring event type (daily, weekly, monthly)
    endRecurrence?: string; // End date for recurrence
    calendarId: number;
    calendar?: Calendar;
    createdAt: string;
    updatedAt: string;
    participants?: EventParticipant[];
  }
  
  export interface EventParticipant {
    eventId: number;
    userId: number;
    status: string; // Accepted, Declined, Pending
    event?: Event;
    user?: User;
  }

  export interface CelebrationPlan {
    title: string;
    description: string;
    userId: number;
    startTime: string;
    endTime: string;
    budget: number;
    venue?: {
      name: string;
      location: string;
      price: number;
    };
    food?: {
      type: string;
      items: string;
      price: number;
    };
    decorator?: {
      name: string;
      theme: string;
      price: number;
    };
    entertainment?: {
      name: string;
      style: string;
      price: number;
    };
  }

  export interface CelebrationPlanMember {
      planId: number;
      userId: number;
      role: string; // Organizer, Guest, Vendor, etc.
      status: string; // Pending, Accepted, Declined
      plan?: CelebrationPlan;
      user?: User;
  }

  export interface Venue {
      id: number;
      name: string;
      location: string;
      price: number;
      celebrationPlan?: CelebrationPlan;
  }

  export interface Food {
      id: number;
      type: string;
      items: Record<string, string>;
      price: number;
      celebrationPlan?: CelebrationPlan;
  }

  export interface Decorator {
      id: number;
      name: string;
      theme?: string;
      price: number;
      celebrationPlan?: CelebrationPlan;
  }

  export interface Entertainment {
      id: number;
      name: string;
      style: string;
      price: number;
      celebrationPlan?: CelebrationPlan;
  }
  
  export interface SavingPlan {
    id: number;
    templateId: number;
    goalAmount: number;
    currentBalance: number;
    frequency: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Transaction {
    id: number;
    ownerId: number;
    type: string;
    amount: number;
    date: string;
  }
  
  export interface Notification {
    id: number;
    userId: number;
    type: string; // Event Invitation, Friend Request, Saving Plan Reminder
    status: string; // Read, Unread
    createdAt: string;
    user?: User;
  }
  
  export interface AuditLog {
    id: number;
    actionType: string; // Create, Update, Delete
    entityType: string; // User, Group, Event, etc.
    userId: number;
    details?: Record<string, string>;
    timestamp: string;
    user?: User;
  }  