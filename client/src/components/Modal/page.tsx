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
  }) => void;
  selectedDateRange?: { start: string; end: string };
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, selectedDateRange }) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [calendarId, setCalendarId] = React.useState<number>(1);
  const [startDate, setStartDate] = React.useState(selectedDateRange?.start || "");
  const [endDate, setEndDate] = React.useState(selectedDateRange?.end || "");

  React.useEffect(() => {
    if (selectedDateRange) {
      const { start, end } = selectedDateRange;
  
      // Check if this is a single-day selection
      const isSingleDay =
        new Date(end).getTime() <= new Date(start).getTime() + 24 * 60 * 60 * 1000;
  
      setStartDate(start);
  
      if (isSingleDay) {
        setEndDate(start);
      } else {
        // Subtract one day from the end date
        const adjustedEndDate = new Date(new Date(end).getTime() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]; // Convert back to `YYYY-MM-DD` format
        setEndDate(adjustedEndDate);
      }
    }
  }, [selectedDateRange]);  

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      calendarId,
      startDate,
      endDate,
    });
    setTitle("");
    setDescription("");
    setCalendarId(1);
    setStartDate("");
    setEndDate("");
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
                End Date
                <input
                  type="date"
                  className="border p-2 rounded w-full dark:bg-gray-700 dark:text-white"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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