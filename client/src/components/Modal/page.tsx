import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    calendarId: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
  }) => void;
  selectedDateRange?: { start: string; end: string };
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, selectedDateRange }) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [calendarId, setCalendarId] = React.useState<number>(1);
  const [startDate, setStartDate] = React.useState(selectedDateRange?.start.split("T")[0] || "");
  const [endDate, setEndDate] = React.useState(selectedDateRange?.end.split("T")[0] || "");
  const [startTime, setStartTime] = React.useState(selectedDateRange?.start.split("T")[1]?.slice(0, 5) || "");
  const [endTime, setEndTime] = React.useState(selectedDateRange?.end.split("T")[1]?.slice(0, 5) || "");

  React.useEffect(() => {
    if (selectedDateRange) {
      const { start, end } = selectedDateRange;
  
      let startDateTime = new Date(start);
      let endDateTime = new Date(end);
  
      console.log("📌 Original Selected Date Range:", start, end);
      console.log("🕒 Parsed Start DateTime:", startDateTime.toISOString());
      console.log("🕒 Parsed End DateTime Before Fix:", endDateTime.toISOString());
  
      const isSingleDay = startDateTime.toDateString() === endDateTime.toDateString();

      if (isSingleDay) {
        endDateTime.setDate(endDateTime.getDate() - 1);
      }
  
      const startTimeFormatted = startDateTime.toISOString().split("T")[1]?.slice(0, 5);
      const endTimeFormatted = endDateTime.toISOString().split("T")[1]?.slice(0, 5);
  
      const isFullDayEvent = startTimeFormatted === "00:00" && endTimeFormatted === "00:00";
  
      if (isFullDayEvent) {
        console.log("🛠 Full-day event detected! Adjusting endDate.");
        endDateTime.setDate(endDateTime.getDate() - 1);
      }
  
      console.log("✅ Final Adjusted End DateTime:", endDateTime.toISOString());
  
      setStartDate(startDateTime.toISOString().split("T")[0]);
      setStartTime(startTimeFormatted || "00:00");
  
      setEndDate(endDateTime.toISOString().split("T")[0]);
      setEndTime(endTimeFormatted || "23:59");
    }
  }, [selectedDateRange]);
  
  

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(`${startDate}T${startTime}`) > new Date(`${endDate}T${endTime}`)) {
      alert("End date and time must be after start date and time.");
      return;
    }

    onSubmit({
      title,
      description,
      calendarId,
      startDate,
      endDate,
      startTime,
      endTime,
    });

    setTitle("");
    setDescription("");
    setCalendarId(1);
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Add New Event</h2>
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            className="border p-2 rounded dark:bg-gray-700 dark:text-white"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="border p-2 rounded dark:bg-gray-700 dark:text-white"
            placeholder="Event Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <label className="text-sm font-medium dark:text-gray-300">
            Start Date
            <input
              type="date"
              className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium dark:text-gray-300">
            Start Time
            <input
              type="time"
              className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium dark:text-gray-300">
            End Date
            <input
              type="date"
              className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </label>
          <label className="text-sm font-medium dark:text-gray-300">
            End Time
            <input
              type="time"
              className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
