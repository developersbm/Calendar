"use client";

import React from "react";
import AuthProvider from "../authProvider";
import { signOut } from "aws-amplify/auth";

const AuthPage = () => {
  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out successfully.");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-102">
        <AuthProvider>
          <p>Redirecting...</p>
          <button onClick={handleSignOut} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Sign Out
          </button>
        </AuthProvider>
      </div>
    </div>
  );
};

export default AuthPage;