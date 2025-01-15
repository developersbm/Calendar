"use client";
import { useCallback, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import allLocales from "@fullcalendar/core/locales-all";
import { useAppSelector } from "@/app/redux";
import { useCreateEventMutation } from "@/state/api";
import Modal from "@/components/Modal/page";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";

const CalendarComponent = () => {
  // const [currentEvents, setCurrentEvents] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [createEvent] = useCreateEventMutation();
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | undefined>(undefined);

  // const handleEvents = useCallback((events: any[]) => {
  //   setCurrentEvents(events);
  // }, []);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo);
    setModalOpen(true);
  }, []);

  const handleModalSubmit = async ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => {
    if (selectedDate) {
      const calendarApi = selectedDate.view.calendar;

      const eventToSave = {
        title,
        description,
        startTime: selectedDate.startStr,
        endTime: selectedDate.endStr,
        calendarId: 1,
      };

      try {
        const newEvent = await createEvent(eventToSave).unwrap();
        calendarApi.addEvent({
          id: newEvent.id.toString(),
          title: newEvent.title,
          start: newEvent.startTime,
          end: newEvent.endTime,
        });
      } catch (error) {
        console.error("Error creating event:", error);
        alert("Failed to save the event. Please try again.");
      }
    }
    setModalOpen(false);
  };

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    if (window.confirm(`Delete ${clickInfo.event.title}`)) {
      clickInfo.event.remove();
    }
  }, []);

  const calendarClassNames = `w-[200vh] h-[80vh] ${
    isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
  }`;

  return (
    <div className={calendarClassNames}>
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
          right: "today,dayGridMonth,dayGridWeek",
        }}
        // eventsSet={handleEvents}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventColor={isDarkMode ? "#4B5563" : "#2563EB"}
        themeSystem="bootstrap5"
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
