"use client";

import { useState } from 'react';
import CalendarComponent from '@/components/CalendarComponent/CalendarComponent';

const CalendarScreen = () => {
  const [currentView, setCurrentView] = useState('dayGridMonth');

  const containerHeight = currentView === 'dayGridMonth' ? 'h-[70vh]' : 'h-[160vh]';

  return (
    <div className={containerHeight}>
      <div className="flex justify-center items-center ">
          <CalendarComponent onViewChange={setCurrentView} />
      </div>
    </div>
  );
};

export default CalendarScreen;
