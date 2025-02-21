"use client";

import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  Calendar,
  MapPin,
  Utensils,
  Paintbrush,
  Music,
  Edit2,
  CirclePlus,
} from "lucide-react";
import { useGetAuthUserQuery, useCreateCelebrationPlanMutation, useGetUserQuery } from "@/state/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

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
  const [templateTitle, setTemplateTitle] = useState<string>("Click to edit plan name");
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

  const { data: authData } = useGetAuthUserQuery({});
  const cognitoId = authData?.user?.userId;

  const { data: user } = useGetUserQuery(cognitoId ?? "", {
    skip: !cognitoId,
  });

  const userId = user?.id;
  
  const [createCelebrationPlan] = useCreateCelebrationPlanMutation();
  const [disabledOptions, setDisabledOptions] = useState<{ [key: string]: boolean }>({});

  const handleTitleClick = () => {
    if (templateTitle === "Click to edit plan name") {
      setTemplateTitle("");
    }
    setIsEditingTitle(true);
  };
  

  const handleTitleBlur = () => {
    if (!templateTitle.trim()) {
      setTemplateTitle("Click to edit plan name");
    }
    setIsEditingTitle(false);
  };

  interface CelebrationPlan {
    title: string;
    description: string;
    userId: number;
    startTime: string;
    endTime: string;
    budget: number;
    venue?: {
      name: string;
      location: string;
      price: number;
    };
    food?: {
      type: string;
      items: string;
      price: number;
    };
    decorator?: {
      name: string;
      theme: string;
      price: number;
    };
    entertainment?: {
      name: string;
      style: string;
      price: number;
    };
  }

  const router = useRouter();
  
  const handleSavePlan = async () => {
    if (!templateTitle.trim() || !startDate || !endDate) {
      alert("Please enter the event name and select both start and end dates.");
      return;
    }
  
    let calculatedTotalPrice = 0;
    Object.keys(detailsData).forEach((key) => {
      if (!disabledOptions[key] && detailsData[key]["Price"]) {
        calculatedTotalPrice += Number(detailsData[key]["Price"]) || 0;
      }
    });
  
    setTotalPrice(calculatedTotalPrice);
  
    const planData: CelebrationPlan = {
      title: templateTitle.trim(),
      description: "",
      userId: userId ?? 0, // Ensure userId is a number
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      budget: calculatedTotalPrice || 0,
    };
  
    if (!disabledOptions["Venue"] && detailsData["Venue"]) {
      planData.venue = {
        name: String(detailsData["Venue"]["Venue Details"] || ""),
        location: String(detailsData["Venue"]["Location"] || ""),
        price: Number(detailsData["Venue"]["Price"] || 0),
      };
    }
  
    if (!disabledOptions["Food"] && detailsData["Food"]) {
      planData.food = {
        type: String(detailsData["Food"]["Food Details"] || ""),
        items: String(detailsData["Food"]["Items"] || ""),
        price: Number(detailsData["Food"]["Price"] || 0),
      };
    }
  
    if (!disabledOptions["Decorator"] && detailsData["Decorator"]) {
      planData.decorator = {
        name: String(detailsData["Decorator"]["Decorator Details"] || ""),
        theme: String(detailsData["Decorator"]["Theme"] || ""),
        price: Number(detailsData["Decorator"]["Price"] || 0),
      };
    }
  
    if (!disabledOptions["Host/DJ"] && detailsData["Host/DJ"]) {
      planData.entertainment = {
        name: String(detailsData["Host/DJ"]["Host/DJ Details"] || ""),
        style: String(detailsData["Host/DJ"]["Style"] || ""),
        price: Number(detailsData["Host/DJ"]["Price"] || 0),
      };
    }
  
    console.log("Submitting Plan Data:", planData);
  
    try {
      await createCelebrationPlan(planData).unwrap();
      router.push("/celebrationPlans"); // Redirect to /celebrationPlans
    } catch (error) {
      console.error("Error saving celebration plan:", error);
      alert("Failed to save the celebration plan.");
    }
  };  
  

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const eventOptions: EventOption[] = [
    { name: "Date", icon: <Calendar size={32} />, fields: ["Event Date Start", "Event Date End"] },
    { name: "Venue", icon: <MapPin size={32} />, fields: ["Venue Details", "Location", "Price"] },
    { name: "Food", icon: <Utensils size={32} />, fields: ["Food Details", "Items", "Price"] },
    { name: "Decorator", icon: <Paintbrush size={32} />, fields: ["Decorator Details", "Theme", "Price"] },
    { name: "Host/DJ", icon: <Music size={32} />, fields: ["Host/DJ Details", "Style", "Price"] },
  ];

  const handleOptionClick = (option: EventOption) => setSelectedOption(option);

  const handleFieldChange = (fieldName: string, value: string) => {
    setDetailsData((prev) => {
      const newData = {
        ...prev,
        [selectedOption!.name]: {
          ...prev[selectedOption!.name],
          [fieldName]: value.toString(),
        },
      };
  
      // Dynamically update total price when a "Price" field is updated
      let newTotalPrice = 0;
      Object.keys(newData).forEach((category) => {
        if (!disabledOptions[category] && newData[category]["Price"]) {
          newTotalPrice += Number(newData[category]["Price"]) || 0;
        }
      });
  
      setTotalPrice(newTotalPrice);
      return newData;
    });
  };
   
  const handleCheckboxChange = (optionName: string) => {
    setDisabledOptions((prev) => ({
      ...prev,
      [optionName]: !prev[optionName],
    }));
  
    setDetailsData((prev) => {
      const newData = { ...prev };
  
      if (!disabledOptions[optionName]) {
        // Remove the option if disabled
        delete newData[optionName];
  
        // Update total price by removing the disabled option
        const priceToSubtract = Number(prev[optionName]?.["Price"]) || 0;
        setTotalPrice((prevTotal) => prevTotal - priceToSubtract);
      }
  
      return newData;
    });
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
                onChange={(e) => setTemplateTitle(e.target.value)}
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

          {/* Selected Option Details */}{/* Selected Option Details */}
{selectedOption && (
  <div className="w-full max-w-md mt-6 mx-auto p-4 border rounded bg-white dark:bg-gray-800 dark:text-white">
    {selectedOption.name === "Date" ? (
      <>
        {/* Start Date */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Event Date Start</label>
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="block w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            placeholderText="Select start date"
          />
        </div>

        {/* End Date */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">Event Date End</label>
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="block w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            placeholderText="Select end date"
          />
        </div>
      </>
    ) : (
      <>
        {/* Inputs for Other Options */}
        {selectedOption.fields.map((field, index) => (
          <div key={index} className="mb-4">
            <label className="block mb-2 text-sm font-medium">{field}</label>
            <input
              type={field === "Price" ? "number" : "text"}
              value={detailsData[selectedOption.name]?.[field] || ""}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="block w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              placeholder={`Enter ${field.toLowerCase()}`}
              disabled={disabledOptions[selectedOption.name]}
            />
          </div>
        ))}

        {/* Show "Do not include this" checkbox only for non-Date options */}
        {selectedOption.name !== "Date" && (
          <div className="mb-4 flex items-center space-x-2">
            <input
              className="w-5 h-5 cursor-pointer"
              type="checkbox"
              checked={!!disabledOptions[selectedOption.name]}
              onChange={() => handleCheckboxChange(selectedOption.name)}
            />
            <label className="text-sm font-medium">Do not include this</label>
          </div>
        )}
      </>
    )}
  </div>
)}

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
              onClick={handleSavePlan}
              className="flex items-center justify-center w-14 h-14 bg-green-500 rounded-full hover:bg-green-600 focus:outline-none"
            >
              <CirclePlus size={50} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPlan;