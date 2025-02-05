"use client";
import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import timeGridPlugin from "@fullcalendar/timegrid";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { useAppSelector } from "@/app/redux";
import Modal from "@/components/Modal/page";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import {
  useGetGroupsQuery,
  useGetEventCalendarQuery,
  useDeleteEventMutation,
} from "@/state/api";

interface EventParticipant {
  userId: number;
  status: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    description?: string;
    recurrence?: string;
    calendarId: number;
    participants?: EventParticipant[];
  };
}

const GroupCalendarComponent = () => {
  const { groupId } = useParams();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | undefined>(undefined);
  const [deleteEvent] = useDeleteEventMutation();

  // Fetch the group using group ID
  const { data: group } = useGetGroupsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data: data?.find((g) => g.id === Number(groupId)),
    }),
  });

  // Fetch events for the group's calendar
  const { data: groupEvents, refetch } = useGetEventCalendarQuery(group?.calendarId ?? 0, {
    skip: !group?.calendarId,
  });

  // Update events when data changes
  useEffect(() => {
    if (groupEvents) {
      setEvents(
        groupEvents.map((event) => ({
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
      );
    }
  }, [groupEvents]);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    console.log("Selected Date Info from FullCalendar:", selectInfo);
  
    const startDateTime = new Date(selectInfo.startStr);
    const endDateTime = new Date(selectInfo.endStr);

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
    if (!group?.calendarId) {
      alert("Group does not have an associated calendar.");
      return;
    }

    const eventData = {
      title,
      description,
      startTime: new Date(`${startDate}T${startTime}:00`).toISOString(),
      endTime: new Date(`${endDate}T${endTime}:00`).toISOString(),
      calendarId: group.calendarId,
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

    // Refetch events after adding a new one
    console.log("Refetching events...");
    await refetch();
  };

  const handleEventClick = useCallback(
    async (clickInfo: EventClickArg) => {
      if (window.confirm(`Delete event "${clickInfo.event.title}"?`)) {
        try {
          console.log("Deleting event:", clickInfo.event.id);

          await deleteEvent(Number(clickInfo.event.id)).unwrap();
          console.log("Event deleted successfully");

          // Remove from UI
          setEvents((prev) => prev.filter((event) => event.id !== clickInfo.event.id));

          await refetch();
        } catch (error) {
          console.error("Failed to delete event:", error);
          alert("Failed to delete event. Please try again.");
        }
      }
    },
    [deleteEvent, refetch]
  );

  return (
    <div className={`w-[150vh] h-[60vh] ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
      <h2 className="text-xl font-bold">{group?.title}'s Calendar</h2>
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
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventColor={isDarkMode ? "#4B5563" : "#2563EB"}
        themeSystem="bootstrap5"

        longPressDelay={150}
        eventLongPressDelay={200}
        selectLongPressDelay={150}
      />
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSubmit={handleModalSubmit} />
    </div>
  );
};

export default GroupCalendarComponent;
