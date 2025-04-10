export interface TestUser {
  id: string;
  name: string;
  email: string;
  calendarId: number;
}

export interface TestEvent {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  calendarId: number;
  participants?: string[];
  recurrence?: string;
}

export interface TestGroup {
  id: number;
  title: string;
  description: string;
  members: TestGroupMember[];
  events: TestEvent[];
}

export interface TestGroupMember {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface TestSavingPlan {
  id: number;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  transactions: TestTransaction[];
}

export interface TestTransaction {
  id: number;
  amount: number;
  date: string;
  description: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
}

export interface TestCelebrationPlan {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  budget: number;
  venue: string;
  food: string;
  decorator: string;
  entertainment: string;
  participants: string[];
}

export const testUser: TestUser = {
  id: 'test-user-123',
  name: 'Test User',
  email: 'test@example.com',
  calendarId: 1
};

export const testEvents: TestEvent[] = [
  {
    id: 2,
    title: 'Project Review',
    description: 'Review project progress',
    startTime: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    calendarId: 1,
    participants: ['sarah@example.com']
  }
];

export const testGroups: TestGroup[] = [
  {
    id: 1,
    title: "Family",
    description: "This is the best family!",
    members: [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "ADMIN"
      },
      {
        id: 2,
        name: "Sarah Smith",
        email: "sarah@example.com",
        role: "MEMBER"
      },
      {
        id: 3,
        name: "Mike Johnson",
        email: "mike@example.com",
        role: "MEMBER"
      }
    ],
    events: [
      {
        id: 1,
        title: "Team Meeting",
        description: "Weekly team sync with development team",
        startTime: (() => {
          const date = new Date();
          date.setHours(10, 0, 0, 0);
          return date.toISOString();
        })(),
        endTime: (() => {
          const date = new Date();
          date.setHours(11, 0, 0, 0);
          return date.toISOString();
        })(),
        calendarId: 1,
        participants: ['mike@example.com']
      },
      {
        id: 2,
        title: "Client Presentation",
        description: "Present quarterly results",
        startTime: (() => {
          const date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
          date.setHours(14, 0, 0, 0);
          return date.toISOString();
        })(),
        endTime: (() => {
          const date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
          date.setHours(15, 0, 0, 0);
          return date.toISOString();
        })(),
        calendarId: 1,
        participants: ['john@example.com']
      },
      {
        id: 3,
        title: "Project Planning",
        description: "Plan next sprint",
        startTime: (() => {
          const date = new Date(new Date().getTime() + 48 * 60 * 60 * 1000);
          date.setHours(9, 30, 0, 0);
          return date.toISOString();
        })(),
        endTime: (() => {
          const date = new Date(new Date().getTime() + 48 * 60 * 60 * 1000);
          date.setHours(10, 30, 0, 0);
          return date.toISOString();
        })(),
        calendarId: 1,
        participants: ['sarah@example.com']
      }
    ]
  }
];

export const testSavingPlans: TestSavingPlan[] = [
  {
    id: 1,
    title: 'New Car Fund',
    description: 'Saving for a new car',
    targetAmount: 25000,
    currentAmount: 5000,
    deadline: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    transactions: [
      {
        id: 1,
        amount: 1000,
        date: new Date().toISOString(),
        description: 'Initial deposit',
        type: 'DEPOSIT'
      },
      {
        id: 2,
        amount: 500,
        date: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Monthly savings',
        type: 'DEPOSIT'
      },
      {
        id: 3,
        amount: 250,
        date: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Monthly savings',
        type: 'WITHDRAWAL'
      }
    ]
  }
];

export const testCelebrationPlans: TestCelebrationPlan[] = [
  {
    id: 1,
    title: 'Birthday',
    description: '30th Birthday Celebration',
    startTime: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    budget: 2000,
    venue: 'Local Event Space',
    food: 'Catering by Local Restaurant',
    decorator: 'Party Decor Co.',
    entertainment: 'Live Band',
    participants: ['test@example.com', 'john@example.com', 'sarah@example.com']
  }
]; 