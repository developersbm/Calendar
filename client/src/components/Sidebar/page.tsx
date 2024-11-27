"use client";

import { useGetUsersQuery, useGetGroupsQuery, useGetGroupMembersQuery, useGetTemplatesQuery } from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  Layers3,
  LucideIcon,
  User,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import profile from "../../../public/profile.png"

const Sidebar = () => {
const [showGroups, setShowGroups] = useState(true);
const [showTemplate, setShowTemplate] = useState(true);

const { data: users } = useGetUsersQuery();
const { data: groups } = useGetGroupsQuery();
const { data: templates } = useGetTemplatesQuery();
const { data: groupMembers } = useGetGroupMembersQuery();

const dispatch = useAppDispatch();
const isSidebarCollapsed = useAppSelector(
  (state) => state.global.isSidebarCollapsed,
);

const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl
  transition-all duration-300 h-full z-40 dark:bg-black overflow-y-auto bg-white
  ${isSidebarCollapsed ? "w-0 hidden" : "w-64"}
`;

const user = users?.find((user) => user.id === 1);

// Filter groups the user belongs to
const userGroups =
  groupMembers
    ?.filter((gm) => gm.userId === user?.id && gm.status === "Active")
    .map((gm) => groups?.find((g) => g.id === gm.groupId)) || [];

// Filter groups the user belongs to
const userTemplates =
  templates
    ?.filter((tp) => tp.ownerId === user?.id) || [];


return (
  <div className={sidebarClassNames}>
    <div className="flex h-[100%] w-full flex-col justify-start">
      {/* TOP LOGO */}
      <div className="z-50 flex min-h-[56px] w-64 items-center justify-between bg-white px-6 pt-3 dark:bg-black">
        <div className="text-xl font-bold text-gray-800 dark:text-white">
          PLAN IT
        </div>
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
      {/* TEAM */}
      {user ? (
        <div className="flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700">
          <Image
            src={profile}
            alt=""
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h3 className="text-md font-bold tracking-wide dark:text-gray-200">
              Welcome, {user.name}!
            </h3>
            <p className="text-xs text-gray-500">Email: {user.email}</p>
          </div>
        </div>
      ) : (
        <p className="px-8 py-4 text-sm text-gray-500">
          User with ID 1 not found.
        </p>
      )}
      {/* NAVBAR LINKS */}
      <nav className="z-10 w-full">
        <SidebarLink icon={Home} label="Home" href="/" />
        <SidebarLink icon={Briefcase} label="Calendar" href="/calendar" />
        <SidebarLink icon={Users} label="Saving Plans" href="/savingPlans" />
      </nav>

      {/* Groups LINKS */}
      <button
        onClick={() => setShowGroups((prev) => !prev)}
        className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
      >
        <span className="">Groups</span>
        {showGroups ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>
      {/* GROUPS LIST */}
      {showGroups && userGroups?.length > 0 && (
      <div className="flex flex-col">
        {userGroups.map((group) =>
          group ? (
            <SidebarLink
              key={group.id}
              icon={Briefcase}
              label={group.title}
              href={`/groups/${group.id}`}
            />
          ) : null
        )}
      </div>
      )}
      {/* TEMPLATES LINKS */}
      <button
        onClick={() => setShowTemplate((prev) => !prev)}
        className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
      >
        <span className="">Templates</span>
        {showTemplate ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>
      {showTemplate && userTemplates.length > 0 && (
        <div>
        {userTemplates.map((template) => (
          <SidebarLink
            key={template.id}
            icon={Layers3}
            label={template.title}
            href={`/template/${template.id}`}
          />
        ))}
      </div>
      )}
    </div>
    <div className="z-10 mt-32 flex w-full flex-col items-center gap-4 bg-white px-8 py-4 dark:bg-black md:hidden">
      <div className="flex w-full items-center">
        <button
          className="self-start rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 md:block"
        >
          Sign out
        </button>
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
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href} className="w-full">
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${
          isActive ? "bg-gray-100 text-white dark:bg-gray-600" : ""
        } justify-start px-8 py-3`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-[100%] w-[5px] bg-blue-200" />
        )}

        <Icon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
        <span className={`font-medium text-gray-800 dark:text-gray-100`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

export default Sidebar;