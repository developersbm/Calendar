"use client";

import React from "react";
import { useAppSelector } from "@/app/redux";
import { useGetAuthUserQuery, useGetUserQuery } from "@/state/api";

const SettingsPage = () => {
  const { data: authData, isLoading: isAuthLoading } = useGetAuthUserQuery({});
  const userId = authData?.user?.userId;

  const { data: user, isLoading: isUserLoading } = useGetUserQuery(userId ?? "", {
    skip: !userId,
  });

  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  if (isAuthLoading || isUserLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className={`transition-transform duration-300 ${isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"}`}>
      <div className="flex flex-col w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        {/* User Information */}
        {user ? (
          <div className="mb-8">
            <h2 className="text-lg font-semibold">User Information</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Account Created:</strong> {user.createdAt}</p>
          </div>
        ) : (
          <p>User information not available.</p>
        )}

      </div>
    </div>
  );
};

export default SettingsPage;
