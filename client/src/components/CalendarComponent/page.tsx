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
import { DateSelectArg } from "@fullcalendar/core/index.js";

const CalendarComponent = () => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [createEvent] = useCreateEventMutation();

  const handleEvents = useCallback((events) => {
    setCurrentEvents(events);
  }, []);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo);
    setModalOpen(true);
  }, []);  

  const handleModalSubmit = async ({ title, description }) => {
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
          calendarId: 1,
          createdAt: "2024-11-21T08:30:00Z",
          updatedAt: "2024-11-21T08:30:00Z"
        });
      } catch (error) {
        console.error("Error creating event:", error);
        alert("Failed to save the event. Please try again.");
      }
    }
    setModalOpen(false);
  };

  const handleEventClick = useCallback((clickInfo) => {
    if (window.confirm(`Delete ${clickInfo.event.title}`)) {
      clickInfo.event.remove();
    }
  }, []);

  const calendarClassNames = `w-[200vh] h-[80vh] ${
    isDarkMode ? "dark" : "grey"
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
          right: "today,dayGridMonth,timeGridWeek",
        }}
        eventsSet={handleEvents}
        select={handleDateSelect}
        eventClick={handleEventClick}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        selectedDateRange={
          selectedDate
            ? { start: selectedDate.startStr, end: selectedDate.endStr }
            : null
        }
      />
    </div>
  );
};

export default CalendarComponent;
