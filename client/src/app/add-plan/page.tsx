"use client";

import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  Calendar,
  MapPin,
  Utensils,
  Paintbrush,
  Music,
  DollarSign,
  X
} from "lucide-react";
import { useCreateCelebrationPlanMutation } from "@/state/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface EventOption {
  name: string;
  icon: JSX.Element;
  fields: string[];
}

interface DetailsData {
  [key: string]: {
    [field: string]: string | number;
  };
}

interface CelebrationPlanPayload {
    title: string;
    description: string;
    userId: number;
    startTime: string;
    endTime: string;
    budget: number;
    venue?: { name: string; location: string; price: number };
    food?: { type: string; items: string; price: number };
    decorator?: { name: string; theme: string; price: number };
    entertainment?: { name: string; style: string; price: number };
}

interface OptionalSection {
  name: string;
  icon: JSX.Element;
  fields: string[];
}

interface CelebrationPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | undefined;
  onPlanCreated: () => void;
}

const CelebrationPlanModal: React.FC<CelebrationPlanModalProps> = ({ isOpen, onClose, userId, onPlanCreated }) => {
  const [planName, setPlanName] = useState<string>("");
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<EventOption>({
    name: "Date",
    icon: <Calendar size={32} />,
    fields: ["Event Date Start", "Event Date End"],
  });
  const [detailsData, setDetailsData] = useState<DetailsData>({});
  const [disabledOptions, setDisabledOptions] = useState<{ [key: string]: boolean }>({
    Venue: true,
    Food: true,
    Decorator: true,
    "Host/DJ": true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
        setPlanName("");
        setStartDate(null);
        setEndDate(null);
        setTotalPrice(0);
        setDetailsData({});
        setDisabledOptions({ Venue: true, Food: true, Decorator: true, "Host/DJ": true });
        setIsSubmitting(false);
    }
  }, [isOpen]);

  const [createCelebrationPlan, { isLoading: isMutationLoading }] = useCreateCelebrationPlanMutation();

  const eventOptions: EventOption[] = [
    { name: "Venue", icon: <MapPin size={32} />, fields: ["Venue Details", "Location", "Price"] },
    { name: "Food", icon: <Utensils size={32} />, fields: ["Food Details", "Items", "Price"] },
    { name: "Decorator", icon: <Paintbrush size={32} />, fields: ["Decorator Details", "Theme", "Price"] },
    { name: "Host/DJ", icon: <Music size={32} />, fields: ["Host/DJ Details", "Style", "Price"] },
  ];

  const handleFieldChange = (category: string, fieldName: string, value: string) => {
    setDetailsData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [fieldName]: value,
      },
    }));
  };

  const handleCheckboxChange = (optionName: string) => {
    const isCurrentlyDisabled = disabledOptions[optionName];
    setDisabledOptions((prev) => ({
      ...prev,
      [optionName]: !isCurrentlyDisabled,
    }));
    if (isCurrentlyDisabled) {
       setDetailsData(prev => ({ ...prev, [optionName]: {} }));
    } 
  };

  useEffect(() => {
    let newTotalPrice = 0;
    Object.keys(detailsData).forEach((category) => {
      if (!disabledOptions[category] && detailsData[category]["Price"]) {
        newTotalPrice += Number(detailsData[category]["Price"]) || 0;
      }
    });
    setTotalPrice(newTotalPrice);
  }, [detailsData, disabledOptions]);

  const handleSavePlan = async () => {
    if (!userId) {
      alert("User information not available. Cannot save plan.");
      return;
    }
    if (!planName.trim() || !startDate || !endDate) {
      alert("Please enter the Plan Name and select both Start and End Dates.");
      return;
    }
    if (startDate > endDate) {
       alert("End Date must be after Start Date.");
       return;
    }

    setIsSubmitting(true);

    const planData: CelebrationPlanPayload = {
      title: planName.trim(),
      description: "User-created celebration plan",
      userId: userId,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      budget: totalPrice,
    };

    eventOptions.forEach(option => {
      const sectionName = option.name;
      if (!disabledOptions[sectionName] && detailsData[sectionName]) {
          const details = detailsData[sectionName];
          const price = Number(details["Price"] || 0);
          switch (sectionName) {
              case "Venue":
                  planData.venue = { name: String(details["Venue Details"] || ""), location: String(details["Location"] || ""), price };
                  break;
              case "Food":
                  planData.food = { type: String(details["Food Details"] || ""), items: String(details["Items"] || ""), price };
                  break;
              case "Decorator":
                  planData.decorator = { name: String(details["Decorator Details"] || ""), theme: String(details["Theme"] || ""), price };
                  break;
              case "Host/DJ":
                  planData.entertainment = { name: String(details["Host/DJ Details"] || ""), style: String(details["Style"] || ""), price };
                  break;
          }
      }
    });

    console.log("Submitting Plan Data (Modal):", planData);
    try {
      await createCelebrationPlan(planData).unwrap();
      onPlanCreated();
      onClose();
    } catch (error) {
      console.error("Error saving celebration plan:", error);
      alert("Failed to save the celebration plan.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Create New Celebration Plan</h1>
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close modal"
            >
                <X size={24} />
            </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 md:p-8">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                Fill in the details below to organize your event.
            </p>

            <section className="mb-6 border-b dark:border-gray-700 pb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Core Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="modal-planName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Name *</label>
                        <input
                            type="text"
                            id="modal-planName"
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                            placeholder="E.g., John's 30th Birthday Bash"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div></div>
                    <div>
                        <label htmlFor="modal-startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date & Time *</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            showTimeSelect
                            dateFormat="Pp"
                            placeholderText="Select start date & time"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="modal-endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date & Time *</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate || undefined}
                            showTimeSelect
                            dateFormat="Pp"
                            placeholderText="Select end date & time"
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                        />
                    </div>
                </div>
            </section>

            <section className="mb-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Optional Details</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Select components to include. Prices entered contribute to the budget.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {eventOptions.map((option) => (
                    <div key={option.name} className="p-3 border dark:border-gray-700 rounded-lg ">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-blue-500 dark:text-blue-400">{option.icon}</span>
                                <h3 className="text-md font-medium text-gray-800 dark:text-gray-100">{option.name}</h3>
                            </div>
                            <input
                                type="checkbox"
                                checked={!disabledOptions[option.name]}
                                onChange={() => handleCheckboxChange(option.name)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-500 cursor-pointer"
                            />
                        </div>
                        {!disabledOptions[option.name] && (
                        <div className="space-y-3 pt-3 border-t dark:border-gray-600">
                            {option.fields.map((field) => (
                            <div key={field}>
                                <label htmlFor={`modal-${option.name}-${field}`} className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                                {field}{field.toLowerCase().includes('price') ? ' ($':''}{field.toLowerCase().includes('price') ? ')':''}
                                </label>
                                <input
                                    type={field.toLowerCase().includes('price') ? 'number' : 'text'}
                                    id={`modal-${option.name}-${field}`}
                                    value={detailsData[option.name]?.[field] || ""}
                                    onChange={(e) => handleFieldChange(option.name, field, e.target.value)}
                                    min={field.toLowerCase().includes('price') ? "0" : undefined}
                                    step={field.toLowerCase().includes('price') ? "0.01" : undefined}
                                    placeholder={`Enter ${field}`}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                    ))}
                </div>
            </section>
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
            <div className="text-md font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <DollarSign size={18} />
                Estimated Budget: ${totalPrice.toFixed(2)}
            </div>
            <button
                onClick={handleSavePlan}
                disabled={isSubmitting || isMutationLoading}
                className={`px-6 py-2 font-semibold rounded-lg shadow-md text-white transition duration-150 ease-in-out ${
                    (isSubmitting || isMutationLoading)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                }`}
            >
                {isSubmitting || isMutationLoading ? 'Saving...' : 'Save Celebration Plan'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CelebrationPlanModal;