# Event Planner App - Database Schema (Optimized for Scalability)

This document outlines the database schemas for the Event Planner App, designed for optimal scalability and robust functionality. The app allows users to manage personal and group calendars, plan events, and utilize templates for structured planning while supporting flexible memberships.

## Database Schemas

### Membership
Defines user membership levels and their associated limits.
- **Attributes**:
  - Membership ID: Primary key
  - Type: `Free` or `Premium`
  - Limits:
    - Max number of templates
    - Max number of groups
    - Max number of active saving plans
  - Linked Tables: 
    - **User**: Users are assigned a membership level.

---

### User
Represents individual users, their settings, and relationships.
- **Attributes**:
  - User ID: Primary key
  - Name, Email: Basic contact details
  - Auth Provider: Managed via Cognito
  - Calendar ID: Foreign key linked to the `Calendar` table
  - Membership ID: Foreign key linked to the `Membership` table
  - Created At / Updated At: Timestamps for tracking
  - Groups List: References the `Groups` table
- **Relationships**:
  - A user can belong to multiple groups.

---

### Groups
Manages group details and relationships.
- **Attributes**:
  - Group ID: Primary key
  - Title: Required
  - Description: Optional
  - Icon/Image: Required
  - Created At / Updated At: Timestamps for tracking
- **Relationships**:
  - Members: Many-to-many relationship with `User` via a `GroupMembers` join table.
  - Group Calendar: References a shared `Calendar`.

#### GroupMembers (Join Table)
Defines the relationship between groups and users.
- **Attributes**:
  - Group ID: Foreign key referencing `Groups`
  - User ID: Foreign key referencing `User`
  - Role: Admin, Member
  - Status: Active, Pending, Left

---

### Calendar
Manages individual and shared calendars.
- **Attributes**:
  - Calendar ID: Primary key
  - Owner ID: Foreign key referencing `User` or `Groups`
  - Type: User or Group
  - Description: Optional
  - Created At / Updated At: Timestamps
- **Relationships**:
  - Linked to `Events` via a one-to-many relationship.

---

### Events
Stores details about events.
- **Attributes**:
  - Event ID: Primary key
  - Title: Required
  - Description: Optional
  - Start Time / End Time: Required for scheduling
  - Host ID: Foreign key referencing `User` or `Group`
  - Calendar ID: Foreign key referencing `Calendar`
  - Created At / Updated At: Timestamps
- **Relationships**:
  - Each event is linked to a calendar and optionally tied to a group or user.

#### EventParticipants
Tracks user participation in events.
- **Attributes**:
  - Event ID: Foreign key referencing `Events`
  - User ID: Foreign key referencing `User`
  - Status: Accepted, Declined, Pending

---

### Templates
Provides reusable structures for planning events.
- **Attributes**:
  - Template ID: Primary key
  - Title: Required
  - Description: Optional
  - Owner ID: Foreign key referencing `User`
  - Elements: JSON structure for custom elements (e.g., Venue, Food, Budget)
  - Created At / Updated At: Timestamps
- **Relationships**:
  - Linked to `SavingPlans` for financial goals.

---

### Saving Plans
Tracks savings for user goals, often tied to templates.
- **Attributes**:
  - Saving Plan ID: Primary key
  - Linked Template ID: Foreign key referencing `Templates`
  - Goal Amount: Target savings
  - Current Balance: Tracks deposits
  - Frequency: Savings schedule (e.g., $50/month)
  - Created At / Updated At: Timestamps
- **Relationships**:
  - Each plan is linked to a template and belongs to a user.

---

## Additional Optimizations

### Notifications
Track notifications for user interactions such as event invitations or saving plan reminders.
- **Attributes**:
  - Notification ID: Primary key
  - User ID: Foreign key referencing `User`
  - Type: Event Invitation, Saving Plan Reminder
  - Status: Read, Unread
  - Created At: Timestamp
- **Relationships**:
  - Notifications are linked to users and relevant events or requests.

### Audit Logs
Track changes for analytics and debugging.
- **Attributes**:
  - Log ID: Primary key
  - Action Type: Create, Update, Delete
  - Entity Type: User, Group, Event, etc.
  - User ID: Foreign key referencing `User`
  - Timestamp: When the action occurred

---

## Functionalities

### Groups
- View Availability: Combines member calendars and highlights overlaps.
- Attendance Tracking: Track which users accepted or declined group events.

### Notifications
- Alert users for pending actions, such as accepting an event or completing a saving deposit.

### Templates
- Enhanced Flexibility: JSON elements allow dynamic customization of template components.

### Saving Plans
- Progress Tracking: Enable real-time updates and alerts for reaching financial goals.