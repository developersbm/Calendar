"use client";

import React from "react";
import AuthProvider from "../authProvider";

const AuthPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-102">
        <AuthProvider>
          <p>Redirecting...</p>
        </AuthProvider>
      </div>
    </div>
  );
};

export default AuthPage;
