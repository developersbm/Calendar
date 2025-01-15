"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/app/redux";

const SettingsPage = () => {
  const [user] = useState({
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    membership: "Premium",
    createdAt: "2023-01-01",
    updatedAt: "2024-01-09",
  });

  // const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  return (
    <div className={`transition-transform duration-300 ${isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"}`}>
      <div className="flex flex-col w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        {/* User Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold">User Information</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Membership:</strong> {user.membership}</p>
          <p><strong>Account Created At:</strong> {user.createdAt}</p>
        </div>

        {/* Update Info Section */}
        <div>
          <h2 className="text-lg font-semibold">Update Information</h2>
          <input 
            type="text" 
            placeholder="Enter new email"
            className="border p-2 mb-4"
          />
          <button className="bg-blue-500 text-white py-2 px-6">Update Email</button>
        </div>

        {/* Additional Settings Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Settings</h2>
          <div>
            <label htmlFor="darkMode" className="inline-flex items-center">
              <input 
                type="checkbox" 
                id="darkMode"
                className="form-checkbox"
              />
              <span className="ml-2">Enable Dark Mode</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
