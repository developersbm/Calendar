"use client";
import { useCallback, useState } from "react";
import FullCalendar, {
  DateSelectArg,
  EventApi,
  EventClickArg
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import allLocales from "@fullcalendar/core/locales-all";
import interactionPlugin from "@fullcalendar/interaction";
import { useAppSelector } from "@/app/redux";

const CalendarComponent = () => {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const handleEvents = useCallback(
    (events: EventApi[]) => setCurrentEvents(events),
    []
  );

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    let title = prompt("Grab")?.trim();
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
    if (title) {
      calendarApi.addEvent({
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    if (window.confirm(`Delete ${clickInfo.event.title}`)) {
      clickInfo.event.remove();
    }
  }, []);

  // Conditionally apply dark mode styles based on the redux state
  const calendarClassNames = `w-[80vh] h-[50vh] ${
    isDarkMode ? "dark" : "grey"
  }`;

  return (
    <div className={calendarClassNames}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        editable={true}
        locales={allLocales}
        locale="en"
        eventsSet={handleEvents}
        select={handleDateSelect}
        eventClick={handleEventClick}
      />
    </div>
  );
};

export default CalendarComponent;
