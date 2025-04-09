"use client";

import React from "react";
import { useAppSelector } from "@/app/redux";
import {
  useGetAuthUserQuery,
  useGetUserQuery,
} from "@/state/api";
import { CognitoIdentityProviderClient, DeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";

const SettingsPage = () => {
  const { data: authData, isLoading: isAuthLoading } = useGetAuthUserQuery({});
  const userId = authData?.user?.userId;

  const { data: user, isLoading: isUserLoading } = useGetUserQuery(userId ?? "", {
    skip: !userId,
  });

  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const handleDeleteUser = async () => {
    if (!userId) {
      alert("Unable to delete account: Cognito ID not found.");
      return;
    }

    const confirm = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (confirm) {
      try {
        const cognitoClient = new CognitoIdentityProviderClient({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          },
        });

        const command = new DeleteUserCommand({
          AccessToken: "Fix",
        });

        await cognitoClient.send(command);
        console.log("User deleted from Cognito");

        const response = await fetch(`/users/${userId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          alert("Account deleted successfully.");

        } else {
          const error = await response.json();
          throw new Error(error.message || "Failed to delete user.");
        }
      } catch (error) {
        console.error("Failed to delete user:", userId, error);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  if (isAuthLoading || isUserLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div
      className={`transition-transform duration-300 ${
        isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"
      } dark:bg-black dark:text-white`}
    >
      <div className="flex flex-col w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        {/* User Information */}
        {user ? (
          <div className="mb-8">
            <h2 className="text-lg font-semibold">User Information</h2>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Account Created:</strong> {user.createdAt}
            </p>
          </div>
        ) : (
          <p>User information not available.</p>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;