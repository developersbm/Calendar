"use client"
import { useParams } from "next/navigation";
import GroupCalendarComponent from "@/components/GroupCalendarComponent/page";
import { useState } from "react";

const GroupCalendarScreen = () => {
  const params = useParams();
  const groupId = params?.groupId;

  const [currentView, setCurrentView] = useState('dayGridMonth');

  const containerHeight = currentView === 'dayGridMonth' ? 'h-[200vh]' : 'h-[280vh]';

  if (!groupId) return <p>Loading...</p>;

  return (
    <div className={containerHeight}>
      <div className="flex justify-center items-center">
        <GroupCalendarComponent groupId={Number(groupId)} onViewChange={setCurrentView} />
      </div>
    </div>
  );
};

export default GroupCalendarScreen;
