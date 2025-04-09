import React, { useState } from "react";
import { X, Users } from "lucide-react";

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => void;
}

const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Group title cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(title, description);
    } catch (error) {
      console.error("Modal submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setDescription("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <Users size={20} /> Create New Group
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="groupTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Group Title *
            </label>
            <input
              id="groupTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="E.g., Family, Work Team, Study Group"
              required
            />
          </div>
          <div>
            <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="groupDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="What is this group for?"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 font-semibold rounded-lg shadow-md text-white transition duration-150 ease-in-out ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;
