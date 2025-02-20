"use client";
import { useCallback, useState, useMemo, useEffect } from "react";
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
  useGetMembersByGroupQuery,
} from "@/state/api";

const GroupCalendarComponent = ({ groupId }: { groupId: number }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventClickArg | null>(null);
  const [selectedDate, setSelectedDate] = useState<DateSelectArg | undefined>(undefined);

  const { data: groupMembers } = useGetMembersByGroupQuery(groupId, { skip: !groupId });
  
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  
  const [deleteEvent] = useDeleteEventMutation();
  const [updateEvent] = useUpdateEventMutation();

  const { data: authData } = useGetAuthUserQuery({});
  const userId = authData?.user?.userId;

  const { data: user, isError: isUserError } = useGetUserQuery(userId ?? "", { skip: !userId });

  const { refetch } = useGetEventCalendarQuery(user?.calendarId as number, { skip: !user?.calendarId });
  
  const memberColors = useMemo(() => {
    const colors = ["#bd1c14", "#21bd14", "#085090", "#370890", "#900871"];
    const assignedColors: Record<number, string> = {};
  
    groupMembers?.forEach((member, index) => {
      assignedColors[member.userId] = colors[index % colors.length];
    });
  
    return assignedColors;
  }, [groupMembers]);  

  // 🎯 Combine and format all events
  const allGroupEvents = groupMembers
  ? groupMembers.flatMap((member) =>
      member.events?.map((event) => ({
        id: event.id.toString(),
        title: `${member.name} - ${event.title}`,
        start: new Date(event.startTime).toISOString(),
        end: new Date(event.endTime).toISOString(),
        color: memberColors[member.userId],
        extendedProps: {
          description: event.description,
          recurrence: event.recurrence,
          participants: event.participants,
        },
      })) || []
    )
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
    const eventOwnerId = event.extendedProps?.ownerId;
  
    if (eventOwnerId !== user?.id) {
      alert("You can only edit your own events.");
      dropInfo.revert(); // Revert the drop
      return;
    }
  
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
  }, [updateEvent, user?.id]);

  const handleEventResize = useCallback(async (resizeInfo: EventResizeDoneArg) => {
    const { event } = resizeInfo;
    const eventOwnerId = event.extendedProps?.ownerId;
  
    if (eventOwnerId !== user?.id) {
      alert("You can only edit your own events.");
      resizeInfo.revert(); // Revert the resize
      return;
    }
  
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
  }, [updateEvent, user?.id]);
  
  

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
    const isCelebrationPlanEvent = clickInfo.event.id.startsWith("plan-");
  
    if (isCelebrationPlanEvent) {
      alert("You cannot delete celebration plan events.");
      return;
    }
  
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

  const [celebrationPlansResults, setCelebrationPlansResults] = useState<Record<number, any[]>>({});

  useEffect(() => {
    const fetchCelebrationPlans = async () => {
      if (!groupMembers || groupMembers.length === 0) {
        console.warn("No group members available, skipping celebration plan fetch.");
        return;
      }
  
      console.log("Fetching celebration plans for group members:", groupMembers);
  
      try {
        const plans = await Promise.all(
          groupMembers.map(async (member) => {
            if (!member.userId) {
              console.warn(`Skipping member with missing userId:`, member);
              return { userId: null, plans: [] };
            }
  
            const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/celebrationPlan/user/${member.userId}`;
            console.log(`Fetching celebration plans for user ${member.userId} from: ${apiUrl}`);
  
            try {
              const response = await fetch(apiUrl);
              if (!response.ok) {
                console.warn(`Failed to fetch celebration plans for user ${member.userId}: ${response.statusText}`);
                return { userId: member.userId, plans: [] }; // Handle failure without stopping execution
              }
  
              const plansData = await response.json();
              return { userId: member.userId, plans: plansData };
            } catch (fetchError) {
              console.error(`Network error while fetching celebration plans for user ${member.userId}:`, fetchError);
              return { userId: member.userId, plans: [] };
            }
          })
        );
  
        // Ensure we only store valid data
        const plansMap = plans.reduce((acc, result) => {
          if (result.userId) acc[result.userId] = result.plans;
          return acc;
        }, {} as Record<number, any[]>);
  
        console.log("Fetched celebration plans:", plansMap);
        setCelebrationPlansResults(plansMap);
      } catch (error) {
        console.error("Error fetching celebration plans:", error);
      }
    };
  
    fetchCelebrationPlans();
  }, [groupMembers]);  

  
  const allCelebrationPlans = useMemo(() => {
    return Object.values(celebrationPlansResults).flat();
  }, [celebrationPlansResults]);  
  
  const formattedCelebrationPlans = useMemo(() => {
    const uniqueCelebrationPlans = new Map<number, { 
      id: number; 
      title: string; 
      startTime: string; 
      endTime: string; 
      users: number[]; 
      description?: string;
      budget?: number;
      venue?: any;
      food?: any;
      decorator?: any;
      entertainment?: any;
    }>();
  
    // Iterate over all users' celebration plans
    Object.entries(celebrationPlansResults).forEach(([userId, plans]) => {
      plans.forEach((plan: any) => {
        if (!uniqueCelebrationPlans.has(plan.id)) {
          uniqueCelebrationPlans.set(plan.id, { ...plan, users: [Number(userId)] });
        } else {
          uniqueCelebrationPlans.get(plan.id)!.users.push(Number(userId));
        }
      });
    });
  
    return Array.from(uniqueCelebrationPlans.values()).map((plan) => {
      const usersInPlan = plan.users || [];
      const isSharedPlan = usersInPlan.length > 1;
      const color = isSharedPlan ? "#FFD700" : memberColors[usersInPlan[0]] || "#000000";
  
      return {
        id: `plan-${plan.id}`,
        title: `🎉 ${usersInPlan.map((uid: number) => 
          groupMembers?.find((m) => m.userId === uid)?.name || "Unknown"
        ).join(", ")} - ${plan.title}`,
        start: new Date(plan.startTime).toISOString(),
        end: new Date(plan.endTime).toISOString(),
        color,
        extendedProps: {
          description: plan.description,
          budget: plan.budget,
          venue: plan.venue,
          food: plan.food,
          decorator: plan.decorator,
          entertainment: plan.entertainment,
        },
      };
    });
  }, [celebrationPlansResults, memberColors, groupMembers]);
  
  const allEvents = [...allGroupEvents, ...formattedCelebrationPlans];

  const calendarClassNames = `w-[150vh] h-[60vh] ${
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
        eventColor={isDarkMode ? "#4B5563" : "#2563EB"}
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

export default GroupCalendarComponent;