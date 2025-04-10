"use client";
import { useCallback, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { EventResizeDoneArg } from "@fullcalendar/interaction";
import { useAppSelector } from "@/app/redux";
import Modal from "@/components/Modal/page";
import { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import { 
  useGetAuthUserQuery, 
  useGetUserQuery, 
  useGetEventCalendarQuery, 
  useDeleteEventMutation, 
  useUpdateEventMutation,
  useGetCelebrationPlansByUserQuery,
} from "@/state/api";
import { testUser, testEvents, testCelebrationPlans } from "@/data/testData";
import Link from "next/link";
import ChatBot from './ChatBot';
import { X } from "lucide-react";

// Helper function to adjust test event dates relative to today
const adjustTestEventDates = (events: typeof testEvents) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

  return events.map((event, index) => {
    let start = new Date();
    let end = new Date();

    // Distribute test events around today
    if (index === 0) { // Today
      start.setHours(10, 0, 0, 0);
      end.setHours(11, 0, 0, 0);
    } else if (index === 1) { // Tomorrow
      start.setDate(today.getDate() + 1);
      start.setHours(12, 0, 0, 0);
      end.setDate(today.getDate() + 1);
      end.setHours(13, 0, 0, 0);
    } else { // Day after tomorrow
      start.setDate(today.getDate() + 2);
      start.setHours(14, 0, 0, 0);
      end.setDate(today.getDate() + 2);
      end.setHours(15, 0, 0, 0);
    }

    return {
      ...event,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };
  });
};

// Add onViewChange to CalendarComponentProps
interface CalendarComponentProps {
  onViewChange?: (viewType: string) => void;
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({ onViewChange }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | undefined>(undefined);
  const [isServerOnline, setIsServerOnline] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoEvents, setDemoEvents] = useState<any[]>([]);
  const [eventToDelete, setEventToDelete] = useState<{ id: number; title: string } | null>(null);
  
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  
  const [deleteEvent] = useDeleteEventMutation();
  const [updateEvent] = useUpdateEventMutation();

  const { data: authData, isLoading: isAuthLoading, isError: isAuthError } = useGetAuthUserQuery({});
  const cognitoId = authData?.user?.userId;
  const { data: user, isLoading: isUserLoading, isError: isUserError } = useGetUserQuery(cognitoId ?? "", { 
    skip: !cognitoId
  });
  const isAuthenticated = !!user;

  const { data: events, refetch, isError: isEventsError } = useGetEventCalendarQuery(
    user?.calendarId as number, 
    { 
      skip: !isAuthenticated || !user?.calendarId
    }
  );

  const { data: celebrationPlans, isError: isCelebrationPlansError } = useGetCelebrationPlansByUserQuery(
    user?.id ? String(user?.id) : "", 
    { 
      skip: !isAuthenticated || !user?.id
    }
  );

  useEffect(() => {
    const demoMode = !isAuthenticated && !isAuthLoading && !isUserLoading;
    setIsDemoMode(demoMode);

    if (demoMode) {
      const adjustedTestEvents = adjustTestEventDates(testEvents);
      // Combine adjusted test events and test celebration plans for demo
      const demoFormattedEvents = adjustedTestEvents.map(event => ({
        id: event.id.toString(),
        title: event.title,
        start: event.startTime,
        end: event.endTime,
        // Standardize extendedProps for demo events
        extendedProps: {
            type: 'event',
            description: event.description,
            participants: event.participants,
        },
        backgroundColor: '#3788d8',
        borderColor: '#3788d8',
      }));
      const demoFormattedPlans = testCelebrationPlans.map(plan => ({
        id: `plan-${plan.id}`,
        title: `🎉 ${plan.title}`,
        start: plan.startTime,
        end: plan.endTime,
        // Standardize extendedProps for demo plans
        extendedProps: {
            type: 'plan',
            description: plan.description,
            budget: plan.budget,
            venue: plan.venue,
            food: plan.food,
            decorator: plan.decorator,
            entertainment: plan.entertainment,
            participants: plan.participants,
        },
        backgroundColor: '#10B981',
        borderColor: '#10B981',
      }));
      setDemoEvents([...demoFormattedEvents, ...demoFormattedPlans]);
    } else {
      // Reset demo events if authenticated
      setDemoEvents([]);
    }
  }, [isAuthenticated, isAuthLoading, isUserLoading]);

  // Determine events to display based on auth status
  const displayEvents = isDemoMode
    ? demoEvents
    : (events || []).map((event) => ({
        id: event.id.toString(),
        title: event.title,
        start: event.startTime ? new Date(event.startTime).toISOString() : new Date().toISOString(),
        end: event.endTime ? new Date(event.endTime).toISOString() : new Date().toISOString(),
        extendedProps: {
          type: 'event',
          description: event.description,
          originalData: event,
        },
        backgroundColor: '#3788d8',
        borderColor: '#3788d8',
      })) .concat(
      // Map authenticated user's celebration plans
      (celebrationPlans || []).map((plan) => ({
        id: `plan-${plan.id}`,
        title: `🎉 ${plan.title}`,
        start: new Date(plan.startTime).toISOString(),
        end: new Date(plan.endTime).toISOString(),
        extendedProps: {
          type: 'plan',
          description: plan.description,
          originalData: plan, // Keep original data if needed
        },
        backgroundColor: '#10B981',
        borderColor: '#10B981',
      })) as any[]
    );

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    if (isDemoMode) {
      alert("Please sign in or sign up to add events.");
      return;
    }
    console.log("Selected Date Info from FullCalendar:", selectInfo);
  
    const startDateTime = new Date(selectInfo.startStr);
    let endDateTime = new Date(selectInfo.endStr);
  
    if (selectInfo.allDay) {
      endDateTime.setDate(endDateTime.getDate() - 1);
    }
  
    console.log("Final Adjusted End DateTime:", endDateTime.toISOString());
  
    setSelectedDate({
      ...selectInfo,
      startStr: startDateTime.toISOString(),
      endStr: endDateTime.toISOString(),
    });
  
    setModalOpen(true);
  }, [isDemoMode]);
  
  
  const handleEventDrop = useCallback(async (dropInfo: EventDropArg) => {
    if (isDemoMode) {
      alert("Please sign in or sign up to modify events.");
      dropInfo.revert(); // Revert the drag operation
      return;
    }
    const { event } = dropInfo;
  
    if (!event.start) {
      console.error("Event start date is null, cannot update event.");
      return;
    }
  
    const updatedEvent = {
      id: Number(event.id),
      startTime: event.start.toISOString(),
      endTime: event.end ? event.end.toISOString() : event.start.toISOString(),
    };
  
    console.log("Updating event via drag-and-drop:", updatedEvent);
  
    try {
      await updateEvent(updatedEvent).unwrap();
      console.log("Event updated successfully");
    } catch (error) {
      console.error("Failed to update event:", error);
      alert("Failed to update event. Please try again.");
    }
  }, [isDemoMode, updateEvent]);  

  const handleEventResize = useCallback(async (resizeInfo: EventResizeDoneArg) => {
    if (isDemoMode) {
      alert("Please sign in or sign up to modify events.");
      resizeInfo.revert(); // Revert the resize operation
      return;
    }
    const { event } = resizeInfo;
  
    if (!event.start || !event.end) {
      console.error("Event start or end date is null, cannot update event.");
      return;
    }
  
    const updatedEvent = {
      id: Number(event.id),
      startTime: event.start.toISOString(),
      endTime: event.end.toISOString(), // The resized end time
    };
  
    console.log("Updating event via resize:", updatedEvent);
  
    try {
      await updateEvent(updatedEvent).unwrap();
      console.log("Event updated successfully");
    } catch (error) {
      console.error("Failed to update event:", error);
      alert("Failed to update event. Please try again.");
    }
  }, [isDemoMode, updateEvent]);
  

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    if (isDemoMode) {
      const props = clickInfo.event.extendedProps;
      const title = clickInfo.event.title;
      const start = clickInfo.event.start;
      const end = clickInfo.event.end;
      alert(`Demo ${props.type === 'plan' ? 'Plan' : 'Event'}: ${title}\nDescription: ${props.description || 'N/A'}\nStart: ${start}\nEnd: ${end}`);
      return;
    }

    // Check if the event is a celebration plan
    const isCelebrationPlan = clickInfo.event.id.startsWith('plan-');
    if (isCelebrationPlan) {
      alert("Celebration plans cannot be deleted from the calendar. Please use the Celebration Plans page to manage them.");
      return;
    }

    // Log event details to console for debugging
    console.log("Event details:", {
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      extendedProps: clickInfo.event.extendedProps,
    });

    // Set the event to be deleted and show the deletion modal
    setEventToDelete({
      id: Number(clickInfo.event.id),
      title: clickInfo.event.title
    });
  }, [isDemoMode]);

  // Adjust handleModalSubmit to match ModalProps expectation (add calendarId)
  const handleModalSubmit = async ({
    title,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
  }: {
    // These types match the form state, not necessarily ModalProps onSubmit directly
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  }) => {
    // This function is called ONLY when adding a new event via date selection
    if (isDemoMode) {
        alert("Please sign in or sign up to add events.");
        return;
    }
    if (!user?.calendarId) {
      alert("User does not have an associated calendar.");
      return;
    }

    const eventData = {
      // id is undefined here because we are creating, not updating
      title,
      description,
      startTime: new Date(`${startDate}T${startTime}:00`).toISOString(),
      endTime: new Date(`${endDate}T${endTime}:00`).toISOString(),
      calendarId: user.calendarId, // Include calendarId
    };

    console.log("Creating event with data:", eventData);

    try {
      // Creating a new event
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/event`, {
        method: "POST",
        headers: {
           "Content-Type": "application/json",
           // Add Authorization header if needed
         },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      console.log("Event created successfully.");
      await refetch(); // Refetch events after creation
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. See console for details.")
    }

    setModalOpen(false);
    setSelectedDate(undefined); // Reset selected date after submit
  };

  const calendarClassNames = `w-[150vh] h-[80vh] ${
    isDarkMode ? "bg-black-300 text-white dark-mode-calendar" : "bg-grey-300 text-black"
  }`;
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Callback for FullCalendar view change
  const handleDatesSet = (arg: { view: { type: string } }) => {
    if (onViewChange) {
      onViewChange(arg.view.type);
    }
  };

  // Define a basic onEventCreate handler
  const handleChatEventCreate = async (event: any) => {

    console.log("Event created via ChatBot (needs integration):", event);
    await refetch();
  };

  const handleConfirmDelete = useCallback(async () => {
    if (!eventToDelete || isDemoMode) return;
    
    try {
      console.log("Deleting event:", eventToDelete.id);
      await deleteEvent(eventToDelete.id).unwrap();
      console.log("Event deleted successfully");
      // Remove the event from the calendar
      const eventToRemove = document.querySelector(`[data-event-id="${eventToDelete.id}"]`);
      if (eventToRemove) {
        eventToRemove.remove();
      }
      await refetch();
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      setEventToDelete(null);
    }
  }, [deleteEvent, eventToDelete, isDemoMode, refetch]);

  const handleCancelDelete = () => {
    setEventToDelete(null);
  };

  return (
    <div className="relative mx-auto w-[95%]">
      <div className={`w-full h-[60vh] ${
        isDarkMode ? "bg-black-300 text-white dark-mode-calendar" : "bg-grey-300 text-black"
      }`}>
        {isDemoMode && (
          <div className="mt-4 mb-4 p-3 text-center bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
            Showing Demo Data. <Link href="#" className="font-bold underline">Sign in</Link> or <Link href="#" className="font-bold underline">Sign up</Link> to manage your calendar.
          </div>
        )}
        {!isServerOnline && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p className="font-bold">Demo Mode</p>
            <p>You are currently viewing demo data. To activate the live server with AWS EC2 and RDS, please let me know if you'd like to review the project!</p>
            <p className="mt-2">AWS services are not free, so the project is currently running in demo mode to save costs.</p>
            <p className="mt-2">For more information about the project, please check out the video at: <a href="https://github.com/developersbm/Calendar" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">GitHub Repository</a></p>
          </div>
        )}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={!isDemoMode}
          editable={!isDemoMode}
          locales={allLocales}
          locale="en"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          titleFormat={{ year: "numeric", month: "long" }}
          events={displayEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventColor={isDarkMode ? "#374151" : "#2563EB"}
          themeSystem="bootstrap5"
          longPressDelay={150}
          eventLongPressDelay={200}
          selectLongPressDelay={150}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          height={"auto"}
          contentHeight={"auto"}
          dayMaxEventRows={true}
          datesSet={handleDatesSet}
        />
        <ChatBot onEventCreate={handleChatEventCreate} onEventsUpdated={refetch} />
      </div>
      {/* Add the deletion confirmation modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Confirm Deletion</h2>
              <button
                onClick={handleCancelDelete}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 text-center">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete the event 
                <strong className="text-gray-900 dark:text-white mx-1">{eventToDelete.title}</strong>?
                <br />
                <span className="text-sm text-red-600 dark:text-red-400">(This action cannot be undone)</span>
              </p>
            </div>

            <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Keep the existing Modal component */}
      {isModalOpen && selectedDate && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedEvent(null);
            setSelectedDate(undefined);
          }}
          onSubmit={handleModalSubmit}
          selectedDateRange={selectedDate ? { start: selectedDate.startStr, end: selectedDate.endStr } : undefined}
        />
      )}
    </div>
  );
};

export default CalendarComponent;