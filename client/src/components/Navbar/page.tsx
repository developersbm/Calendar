"use client";

import React, { useState, useEffect } from "react";
import { Menu, Moon, Settings, Sun, User, Bell, X } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import Image from "next/image";
import profile from "../../../public/profile.png";
import { useGetAuthUserQuery, useGetUserQuery } from "@/state/api";
import { signOut } from "aws-amplify/auth";

interface User {
  id: number;
  name: string;
  email: string;
  cognitoId: string;
  membershipId: number;
  calendarId?: number;
  profilePicture?: string;
}

const ServerStatusModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Server Status</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            The server is currently inactive. Please contact the project owner to activate it.
          </p>
        </div>
        <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isServerActive, setIsServerActive] = useState(true);

  const { data: authData } = useGetAuthUserQuery({});
  const userId = authData?.user?.userId;

  const { data: user } = useGetUserQuery(userId ?? "", {
    skip: !userId,
  });

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/health`);
        const data = await response.json();
        setIsServerActive(response.ok && data.status === "ok");
      } catch (error) {
        console.error("Error checking server status:", error);
        setIsServerActive(false);
      }
    };
    checkServerStatus();
    
    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleAuthClick = (e: React.MouseEvent) => {
    if (!isServerActive) {
      e.preventDefault();
      setIsServerModalOpen(true);
    }
  };

  return (
    <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-black">
      <div className="flex items-center gap-8">
        {!isSidebarCollapsed ? null : (
          <button
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          >
            <Menu className="h-8 w-8 hover:text-gray-500 dark:text-white" />
          </button>
        )}
      </div>
      {/* Navbar User Info */}
      <div className="flex items-center">
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className={
            isDarkMode
              ? `rounded p-2 dark:hover:bg-gray-700`
              : `rounded p-2 hover:bg-gray-100`
          }
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6 cursor-pointer dark:text-white" />
          ) : (
            <Moon className="h-6 w-6 cursor-pointer dark:text-white" />
          )}
        </button>
        <Link
          href="/settings"
          className={
            isDarkMode
              ? `h-min w-min rounded p-2 dark:hover:bg-gray-700`
              : `h-min w-min rounded p-2 hover:bg-gray-100`
          }
        >
          <Settings className="h-6 w-6 cursor-pointer dark:text-white" />
        </Link>
        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>

        {/* If the user is authenticated, show their profile and sign out */}
        {user ? (
          <div className="hidden items-center justify-between md:flex">
            <div className="align-center flex h-9 w-9 justify-center">
              <Image
                src={profile}
                alt={"Profile"}
                width={100}
                height={50}
                className="h-full rounded-full object-cover"
              />
              <User className="h-6 w-6 cursor-pointer self-center rounded-full dark:text-white" />
            </div>
            <span className="mx-3 text-gray-800 dark:text-white">{user.name}</span>

            {/* Sign-out button */}
            <Link
              href={"/auth"}
              onClick={handleSignOut}
              className="ml-2 rounded p-2 text-red-400 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Sign Out
            </Link>
          </div>
        ) : (
          // If not authenticated, show "Sign In" and "Create Account" buttons
          <div className="flex gap-2">
            <Link
              href="/auth"
              onClick={handleAuthClick}
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Sign Up / Sign In
            </Link>
          </div>
        )}
      </div>
      <ServerStatusModal 
        isOpen={isServerModalOpen} 
        onClose={() => setIsServerModalOpen(false)} 
      />
    </div>
  );
};

export default Navbar;
