import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  User,
  Group,
  GroupMember,
  Calendar,
  Event,
  Template,
  SavingPlan,
  Notification,
} from "./interface";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async(headers) => {
      const session = await fetchAuthSession();
      const { accessToken } = session.tokens ?? {};
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
      return headers;
    }
  }),
  reducerPath: "api",
  tagTypes: [
    "Memberships",
    "Users",
    "Groups",
    "Calendars",
    "Events",
    "Notifications",
    "Templates",
    "SavingPlans",
    "GroupMembers",
  ],
  endpoints: (build) => ({
    // Memberships update (Free or Premium)

    // Users
    getAuthUser: build.query({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const user = await getCurrentUser();
          const session = await fetchAuthSession();
          if (!session) throw new Error("No session found");
          const { userSub } = session;

          const userDetailsResponse = await fetchWithBQ(`users/${userSub}`);
          const userDetails = userDetailsResponse.data as User;

          return { data: { user, userSub, userDetails } };
        } catch (error) {
          return { error: error.message || "Could not fetch user data" };
        }
      },
    }),
    getUsers: build.query<User[], void>({
      query: () => "user",
      providesTags: ["Users"],
    }),
    createUser: build.mutation<User, Partial<User>>({
      query: (user) => ({
        url: "users",
        method: "POST",
        body: user,
      }),
      invalidatesTags: ["Users"],
    }),

    // Groups
    getGroups: build.query<Group[], void>({
      query: () => "group",
      providesTags: ["Groups"],
    }),
    createGroup: build.mutation<Group, Partial<Group>>({
      query: (group) => ({
        url: "group",
        method: "POST",
        body: group,
      }),
      invalidatesTags: ["Groups"],
    }),

    // Get all group members
    getGroupMembers : build.query<GroupMember[], void>({
      query: () => "groupMember",
      providesTags: ["GroupMembers"]
    }),

    // Calendars (Calendar is creates as soon as user registers)
    getCalendars: build.query<Calendar[], void>({
      query: () => "calendars",
      providesTags: ["Calendars"],
    }),
    createCalendar: build.mutation<Calendar, Partial<Calendar>>({
      query: (calendar) => ({
        url: "calendars",
        method: "POST",
        body: calendar,
      }),
      invalidatesTags: ["Calendars"],
    }),

    // Events (CRUD)
    getEvents: build.query<Event[], void>({
      query: () => "events",
      providesTags: ["Events"],
    }),
    createEvent: build.mutation<Event, Partial<Event>>({
      query: (event) => ({
        url: "events",
        method: "POST",
        body: event,
      }),
      invalidatesTags: ["Events"],
    }),

    // Notifications
    getNotifications: build.query<Notification[], void>({
      query: () => "notifications",
      providesTags: ["Notifications"],
    }),
    createNotification: build.mutation<Notification, Partial<Notification>>({
      query: (notification) => ({
        url: "notifications",
        method: "POST",
        body: notification,
      }),
      invalidatesTags: ["Notifications"],
    }),

    // Templates (CRUD)
    getTemplates: build.query<Template[], void>({
      query: () => "template",
      providesTags: ["Templates"],
    }),
    createTemplate: build.mutation<Template, Partial<Template>>({
      query: (template) => ({
        url: "templates",
        method: "POST",
        body: template,
      }),
      invalidatesTags: ["Templates"],
    }),

    // Saving Plans (CRUD)
    getSavingPlans: build.query<SavingPlan[], void>({
      query: () => "saving-plans",
      providesTags: ["SavingPlans"],
    }),
    createSavingPlan: build.mutation<SavingPlan, Partial<SavingPlan>>({
      query: (savingPlan) => ({
        url: "saving-plans",
        method: "POST",
        body: savingPlan,
      }),
      invalidatesTags: ["SavingPlans"],
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useGetGroupsQuery,
  useCreateGroupMutation,
  useGetGroupMembersQuery,
  useGetCalendarsQuery,
  useCreateCalendarMutation,
  useGetEventsQuery,
  useCreateEventMutation,
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useGetTemplatesQuery,
  useCreateTemplateMutation,
  useGetSavingPlansQuery,
  useCreateSavingPlanMutation,
} = api;
