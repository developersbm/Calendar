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
import ChatBot from "./ChatBot";
import { X } from "lucide-react";

const CalendarComponent = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | undefined>(undefined);
  const [eventToDelete, setEventToDelete] = useState<{ id: number; title: string } | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  
  const [deleteEvent] = useDeleteEventMutation();
  const [updateEvent] = useUpdateEventMutation();

  const { data: authData } = useGetAuthUserQuery({});
  const userId = authData?.user?.userId;

  const { data: user, isError: isUserError } = useGetUserQuery(userId ?? "", { skip: !userId });

  const { data: events, refetch } = useGetEventCalendarQuery(user?.calendarId as number, { skip: !user?.calendarId });

  const formattedEvents = events
  ? events.map((event) => ({
      id: event.id.toString(),
      title: event.title,
      start: event.startTime ? new Date(event.startTime).toISOString() : new Date().toISOString(),
      end: event.endTime ? new Date(event.endTime).toISOString() : new Date().toISOString(),
      extendedProps: {
        description: event.description,
        recurrence: event.recurrence,
        calendarId: event.calendarId,
        participants: event.participants,
      },
    }))
  : [];

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    console.log("Selected Date Info from FullCalendar:", selectInfo);
  
    const startDateTime = new Date(selectInfo.startStr);
    let endDateTime = new Date(selectInfo.endStr);
  
    if (selectInfo.allDay) {
      // FullCalendar treats end as exclusive, so subtract a day to match user intent
      endDateTime.setDate(endDateTime.getDate() - 1);
    }
  
    console.log("Final Adjusted End DateTime:", endDateTime.toISOString());
  
    setSelectedDate({
      ...selectInfo,
      startStr: startDateTime.toISOString(),
      endStr: endDateTime.toISOString(),
    });
  
    setModalOpen(true);
  }, []);
  
  
  const handleEventDrop = useCallback(async (dropInfo: EventDropArg) => {
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
  }, [updateEvent]);  

  const handleEventResize = useCallback(async (resizeInfo: EventResizeDoneArg) => {
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
  }, [updateEvent]);
  

  const handleModalSubmit = async ({
    title,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
  }: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  }) => {
    if (!user?.calendarId) {
      alert("User does not have an associated calendar.");
      return;
    }
  
    const eventData = {
      id: selectedEvent?.event.id ? Number(selectedEvent.event.id) : undefined, // Convert ID to number
      title,
      description,
      startTime: new Date(`${startDate}T${startTime}:00`).toISOString(),
      endTime: new Date(`${endDate}T${endTime}:00`).toISOString(),
      calendarId: user.calendarId,
    };
  
    try {
      if (selectedEvent) {
        // Updating an existing event
        await updateEvent(eventData).unwrap();
        console.log("Event updated successfully");
      } else {
        // Creating a new event
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
        console.log("Event created successfully.");
      }
    } catch (error) {
      console.error("Error updating/creating event:", error);
    }
  
    setModalOpen(false);
    await refetch();
  };
  

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    if (isDemoMode) {
      const props = clickInfo.event.extendedProps;
      const title = clickInfo.event.title;
      const start = clickInfo.event.start;
      const end = clickInfo.event.end;
      alert(`Demo ${props.type === 'plan' ? 'Plan' : 'Event'}: ${title}\nDescription: ${props.description || 'N/A'}\nStart: ${start}\nEnd: ${end}`);
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
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      setEventToDelete(null);
    }
  }, [deleteEvent, eventToDelete, isDemoMode]);

  const handleCancelDelete = () => {
    setEventToDelete(null);
  };

  const { data: celebrationPlans } = useGetCelebrationPlansByUserQuery(user?.id ? String(user?.id) : "", { skip: !user?.id });

  const formattedCelebrationPlans = celebrationPlans
    ? celebrationPlans.map((plan) => ({
        id: `plan-${plan.id}`,
        title: `🎉 ${plan.title}`,
        start: new Date(plan.startTime).toISOString(),
        end: new Date(plan.endTime).toISOString(),
        extendedProps: {
          description: plan.description,
          budget: plan.budget,
          venue: plan.venue,
          food: plan.food,
          decorator: plan.decorator,
          entertainment: plan.entertainment,
        },
      }))
    : [];

  const allEvents = [...formattedEvents, ...formattedCelebrationPlans];

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

  const handleChatBotEventCreate = async (event: any) => {
    if (!user?.calendarId) {
      alert("User does not have an associated calendar.");
      return;
    }

    const eventData = {
      title: event.title,
      description: event.description || "",
      startTime: new Date(event.startTime).toISOString(),
      endTime: new Date(event.endTime).toISOString(),
      calendarId: user.calendarId,
    };

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
      console.log("Event created successfully from chatbot.");
      await refetch();
    } catch (error) {
      console.error("Error creating event from chatbot:", error);
    }
  };

  useEffect(() => {
    // Set demo mode if user is not authenticated
    setIsDemoMode(!user);
  }, [user]);

  return (
    <div className="relative">
      <div className={calendarClassNames}>
        {isUserError && <p className="text-red-500">Failed to fetch user information.</p>}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          editable={true}
          locales={allLocales}
          locale="en"
          headerToolbar={{
            left: "title",
            right: "prev,next,today,dayGridMonth,timeGridWeek,timeGridDay",
          }}
          titleFormat={{ year: "numeric", month: "long" }}
          events={allEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventColor={isDarkMode ? "#374151" : "#2563EB"}
          themeSystem="bootstrap5"
          longPressDelay={150}
          eventLongPressDelay={200}
          selectLongPressDelay={150}
          height={"auto"}
          contentHeight={"auto"}
          dayMaxEventRows={true}
        />
        <ChatBot onEventCreate={handleChatBotEventCreate} />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        selectedDateRange={
          selectedEvent?.event.start
            ? {
                start: selectedEvent.event.start.toISOString(),
                end: selectedEvent.event.end?.toISOString() || selectedEvent.event.start.toISOString(),
              }
            : selectedDate
            ? {
                start: selectedDate.startStr,
                end: selectedDate.endStr,
              }
            : undefined
        }
      />
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
    </div>
  );
};

export default CalendarComponent;