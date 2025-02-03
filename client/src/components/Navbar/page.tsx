"use client";

import React from "react";
import { Menu, Moon, Settings, Sun, User, Bell } from "lucide-react";
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

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const { data: authData } = useGetAuthUserQuery({});
  const userId = authData?.user?.userId;

  const { data: user } = useGetUserQuery(userId ?? "", {
    skip: !userId,
  });
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
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
    {/* <button
        onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
        className={
          isDarkMode
            ? `rounded p-2 dark:hover:bg-gray-700`
            : `rounded p-2 hover:bg-gray-100`
        }
      >
      <Bell className="h-6 w-6 cursor-pointer dark:text-white" />
      </button> */}
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
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            Sign Up / Sign In
          </Link>
        </div>
      )}
    </div>
    </div>
  );
};

export default Navbar;
