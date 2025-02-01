"use client";
import { useCallback, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { useAppSelector } from "@/app/redux";
import Modal from "@/components/Modal/page";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { useGetAuthUserQuery, useGetUserQuery, useGetEventCalendarQuery, useDeleteEventMutation } from "@/state/api";

const CalendarComponent = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | undefined>(undefined);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [deleteEvent]  = useDeleteEventMutation();

  const { data: authData } = useGetAuthUserQuery({});
  const userId = authData?.user?.userId;

  const { data: user, isError: isUserError } = useGetUserQuery(userId ?? "", {
    skip: !userId,
  });

  const { data: events, refetch } = useGetEventCalendarQuery(user?.calendarId as number, {
    skip: !user?.calendarId,
  });  

  const formattedEvents = events
  ? events.map((event) => ({
      id: event.id.toString(),
      title: event.title,
      start: new Date(event.startTime).toISOString(),
      end: new Date(event.endTime).toISOString(),
      extendedProps: {
        description: event.description,
        recurrence: event.recurrence,
        calendarId: event.calendarId,
        participants: event.participants,
      },
    }))
  : [];

  console.log("Formatted events for FullCalendar:", formattedEvents);
const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
  console.log("Selected Date Info from FullCalendar:", selectInfo);

  const startDateTime = new Date(selectInfo.startStr);
  const endDateTime = new Date(selectInfo.endStr);

  const isSingleDay = startDateTime.toISOString().split("T")[0] === endDateTime.toISOString().split("T")[0];

  if (isSingleDay) {
    endDateTime.setHours(23, 59);
  }

  console.log("Final Adjusted End DateTime:", endDateTime.toISOString());

  setSelectedDate({
    ...selectInfo,
    startStr: startDateTime.toISOString(),
    endStr: endDateTime.toISOString(),
  });

  setModalOpen(true);
}, []);

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
  
    try {
      const eventData = {
        title,
        description,
        startTime: new Date(`${startDate}T${startTime}:00`).toISOString(),
        endTime: new Date(`${endDate}T${endTime}:00`).toISOString(),
        calendarId: user.calendarId,
      };      
  
      console.log("Submitting event:", eventData);
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create event");
      }
  
      console.log("Event created successfully.");
      
      setModalOpen(false);
      
      console.log("Refetching events...");
      await refetch();
  
    } catch (_error) {
      alert("Failed to create event. Please try again.");
    }
  };

  const handleEventClick = useCallback(async (clickInfo: EventClickArg) => {
    if (window.confirm(`Delete event "${clickInfo.event.title}"?`)) {
      try {    
        clickInfo.event.remove();
      } catch (_error) {
        alert("Failed to delete event. Please try again.");
      }
    }
  }, [deleteEvent]);  

  const calendarClassNames = `w-[200vh] h-[80vh] ${
    isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
  }`;

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
          left: "prev,next",
          center: "title",
          right: "today,dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={formattedEvents}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventColor={isDarkMode ? "#4B5563" : "#2563EB"}
        themeSystem="bootstrap5"

        longPressDelay={0}
        eventLongPressDelay={0}
        selectLongPressDelay={0}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        selectedDateRange={
          selectedDate
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
