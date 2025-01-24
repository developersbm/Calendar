"use client";

import React from "react";
import "@aws-amplify/ui-react/styles.css";
import AuthProvider from "../authProvider";
import DashboardWrapper from "../dashboardWrapper";


const AuthPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-102">
        <AuthProvider>
            <DashboardWrapper>
                {children}
            </DashboardWrapper>
        </AuthProvider>
      </div>
    </div>
  );
};

export default AuthPage;
