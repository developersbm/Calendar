"use client";

import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Calendar,
  MapPin,
  Utensils,
  Paintbrush,
  Music,
  Star,
  Share2,
  Edit2,
  CirclePlus,
} from "lucide-react";
import { useGetAuthUserQuery } from "@/state/api";

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

const AddPlan: React.FC = () => {
  const [templateTitle, setTemplateTitle] = useState<string>("Click to edit event name");
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<EventOption | null>(null);
  const [detailsData, setDetailsData] = useState<DetailsData>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTemplateTitle("");
  };
  
  const handleTitleBlur = () => {
    if (!templateTitle.trim()) {
      setTemplateTitle("Click to edit event name");
    }
    setIsEditingTitle(false);
  };
  

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTemplateTitle(e.target.value);
    
  const { data: authData } = useGetAuthUserQuery({});
  const userId = authData?.userDetails?.id;
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const eventOptions: EventOption[] = [
    { name: "Date", icon: <Calendar size={32} />, fields: ["Event Date"] },
    { name: "Venue", icon: <MapPin size={32} />, fields: ["Venue Name", "Location", "Price"] },
    { name: "Food", icon: <Utensils size={32} />, fields: ["Food Type", "Menu Items", "Price"] },
    { name: "Decorator", icon: <Paintbrush size={32} />, fields: ["Decorator Name", "Theme", "Price"] },
    { name: "Host/DJ", icon: <Music size={32} />, fields: ["Host/DJ Name", "Playlist Style", "Price"] },
  ];

  const handleOptionClick = (option: EventOption) => setSelectedOption(option);

  const handleFieldChange = (fieldName: string, value: string) => {
    setDetailsData((prev) => ({
      ...prev,
      [selectedOption!.name]: {
        ...prev[selectedOption!.name],
        [fieldName]: value.toString(),
      },
    }));
  };
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-black">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-blue-500 z-20 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-64"
        }`}
      >
        <button
          className="p-4 text-white font-bold"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        </button>
        <div className="p-4 text-white">Sidebar Content</div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-grow transition-all duration-300 overflow-hidden ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="max-h-[calc(100vh-5rem)] overflow-y-auto px-4 pb-8">
          {/* Editable Event Name */}
          <div className="flex justify-center items-center mt-8">
            {isEditingTitle ? (
              <input
                type="text"
                value={templateTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                className="text-center text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none dark:text-white"
                autoFocus
              />
            ) : (
              <div className="flex items-center space-x-2">
                <h1
                  onClick={handleTitleClick}
                  className="text-2xl font-bold cursor-pointer text-gray-800 dark:text-white"
                >
                  {templateTitle}
                </h1>
                <Edit2
                  size={20}
                  onClick={handleTitleClick}
                  className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                />
              </div>
            )}
          </div>

          {/* Event Buttons */}
          <div className="flex justify-center space-x-4 mt-6">
            {eventOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => handleOptionClick(option)}
                className={`flex flex-col items-center justify-center w-24 h-24 rounded-lg font-bold text-white ${
                  selectedOption?.name === option.name ? "bg-blue-600" : "bg-blue-500"
                } hover:bg-blue-600 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-800`}
              >
                {option.icon}
                <span className="text-sm">{option.name}</span>
              </button>
            ))}
          </div>

          {/* Selected Option Details */}
          {selectedOption && (
            <div className="w-full max-w-md mt-6 mx-auto p-4 border rounded bg-white dark:bg-gray-800 dark:text-white">
              <h2 className="text-lg font-bold mb-4">{selectedOption.name} Details</h2>
              {selectedOption.name === "Date" ? (
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Event Date</label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date: Date | null) => setSelectedDate(date)}
                    className="block w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                    placeholderText="Select a date"
                  />
                </div>
              ) : (
                selectedOption.fields.map((field, index) => (
                  <div key={index} className="mb-4">
                    <label className="block mb-2 text-sm font-medium">{field}</label>
                    <input
                      type={field === "Price" ? "number" : "text"}
                      value={detailsData[selectedOption.name]?.[field] || ""}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className="block w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                      placeholder={`Enter ${field.toLowerCase()}`}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Menu */}
      <div
        className={`fixed bottom-0 h-16 bg-gray-200 dark:bg-gray-900 w-full flex justify-around items-center z-10 transition-all duration-300 ${
          isSidebarOpen ? "pl-64" : ""
        }`}
      >
        <div className="text-center">
          <p className="font-bold text-gray-800 dark:text-white">Total Money</p>
          <p className="text-green-500 dark:text-green-400">${totalPrice.toFixed(2)}</p>
        </div>
        <button
        className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full hover:bg-green-600 focus:outline-none"
      >
        <CirclePlus size={50} className="text-white" />
      </button>
      </div>
    </div>
  );
};

export default AddPlan;