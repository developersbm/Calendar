"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Home,
  PartyPopper,
  LucideIcon,
  X,
  Search,
  LogOut,
  CircleDollarSign,
  CalendarDays,
  UsersRound,
  
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import profile from "../../../public/profile.png";
import {
  useGetAuthUserQuery,
  useGetGroupMembersQuery,
  useGetGroupsQuery,
  useGetUserQuery,
} from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { signOut } from "aws-amplify/auth";

const Sidebar = () => {
  const [showGroups, setShowGroups] = useState(true);

  const { data: authData } = useGetAuthUserQuery({});
  const userId = authData?.user?.userId;

  const { data: user, isLoading: isUserLoading } = useGetUserQuery(userId ?? "", {
    skip: !userId,
  });

  const { data: groups, refetch: refetchSidebarGroups } = useGetGroupsQuery();
  const { data: groupMembers } = useGetGroupMembersQuery();

  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const sidebarClassNames = `fixed top-0 left-0 flex flex-col h-full z-40 transition-transform duration-300 
    shadow-xl dark:bg-black bg-white overflow-y-auto
    ${isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"}
    w-64
  `;

  const userGroups = groupMembers
    ?.filter((gm) => gm.userId === user?.id && gm.status === "Active")
    .map((gm) => groups?.find((g) => g.id === gm.groupId)) || [];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-[100%] w-full flex-col justify-start">
        {/* TOP LOGO */}
        <div className="z-50 flex min-h-[56px] w-64 items-center justify-between bg-white px-6 pt-3 dark:bg-black">
          <div className="text-xl font-bold text-gray-800 dark:text-white">TIMELY</div>
          {isSidebarCollapsed ? null : (
            <button
              className="py-3"
              onClick={() => {
                dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
              }}
            >
              <X className="h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white" />
            </button>
          )}
        </div>

        {/* USER */}
        {isUserLoading ? (
          <p className="px-8 py-4 text-sm text-gray-500">Loading user data...</p>
        ) : user ? (
          <div className="flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
            <Image src={profile} alt="" width={40} height={40} className="rounded-full" />
            <div>
              <h3 className="text-md font-bold tracking-wide dark:text-gray-200">Welcome, {user.name}!</h3>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-10 py-4 text-sm text-gray-500">
            <p className="mb-2 text-center">Sign in to access personalized features</p>
          </div>
        )}

        {/* NAVBAR LINKS */}
        <nav className="z-10 w-full">
          <SidebarLink icon={Home} label="Home" href="/" />
          <SidebarLink icon={CalendarDays} label="Calendar" href="/calendar" />
          <SidebarLink icon={CircleDollarSign} label="Savings" href="/savingPlans" />
          <SidebarLink icon={PartyPopper} label="Celebration Plans" href="/celebrationPlans" />
        </nav>
        
        {/* GROUPS */}
        <button
          onClick={() => setShowGroups((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span>Groups</span>
          {showGroups ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
        {showGroups && (
          <div>
            {userGroups.map((group, index) => (
              <SidebarLink
                key={group?.id || `group-${index}`}
                icon={UsersRound}
                label={group?.title || "Unnamed Group"}
                href={`/group-calendar/${group?.id || `group-${index}`}`}
              />
            ))}
            <Link
              href="/groups"
              className="flex w-full items-center gap-3 px-8 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Search className="h-6 w-6" />
              <span className="font-medium">View Groups</span>
            </Link>
          </div>
        )}

        {/* Sign-out button for small screens */}
        {user && (
          <div className="block md:hidden">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-8 py-3 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut className="h-6 w-6" />
              <Link href="/auth" className="font-medium">Sign Out</Link>
            </button>
          </div>
        )}


      {/* About Us */}
      <div className="mt-auto">
        <Link href="/aboutUs">
            <button
              className="flex w-full items-center gap-3 px-8 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >About Us
            </button>
        </Link>        
      </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${
          isActive ? "bg-gray-100 text-white dark:bg-gray-600" : ""
        } justify-start px-8 py-3`}
      >
        {isActive && <div className="absolute left-0 top-0 h-[100%] w-[5px] bg-blue-200" />}
        <Icon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
        <span className={`font-medium text-gray-800 dark:text-gray-100`}>{label}</span>
      </div>
    </Link>
  );
};

export default Sidebar;