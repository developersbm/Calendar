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

const CalendarComponent = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | undefined>(undefined);
  
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
  

  const handleEventDelete = useCallback(async (clickInfo: EventClickArg) => {
    if (window.confirm(`Delete event "${clickInfo.event.title}"?`)) {
      try {
        console.log("Deleting event:", clickInfo.event.id);
        await deleteEvent(Number(clickInfo.event.id)).unwrap();
        console.log("Event deleted successfully");
        clickInfo.event.remove();
      } catch (error) {
        console.error("Failed to delete event:", error);
        alert("Failed to delete event. Please try again.");
      }
    }
  }, [deleteEvent]);

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

  return (
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
        eventClick={handleEventDelete}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        eventColor={isDarkMode ? "#374151" : "#2563EB"}
        themeSystem="bootstrap5"
        longPressDelay={150}
        eventLongPressDelay={200}
        selectLongPressDelay={150}

        height={isMobile ? "auto" : undefined}
        contentHeight={isMobile ? "auto" : undefined}
        aspectRatio={isMobile ? undefined : 1.5}
        dayMaxEventRows={true}
      />
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
    </div>
  );
};

export default CalendarComponent;