"use client";

import { useGetUsersQuery, useGetGroupsQuery, useGetGroupMembersQuery } from "@/state/api";
import Image from "next/image";
import { ChevronUp, ChevronDown } from "lucide-react"; // Make sure you have react-feather installed
import React, { useState } from "react";

const GroupsPage = () => {
  const { data: users } = useGetUsersQuery();
  const { data: groups } = useGetGroupsQuery();
  const { data: groupMembers } = useGetGroupMembersQuery();

  const userId = 1; // Assuming user ID is 1 for now

  const user = users?.find((user) => user.id === userId);

  // Filter groups the user belongs to
  const userGroups = groupMembers
    ?.filter((gm) => gm.userId === userId && gm.status === "Active")
    .map((gm) => groups?.find((g) => g.id === gm.groupId)) || [];

  // State for managing expanded groups
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <div className="container mx-auto p-6 dark:bg-black dark:text-white">
      <h1 className="text-2xl font-bold mb-4">Your Groups</h1>

      {userGroups.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">You are not part of any groups.</p>
      ) : (
        userGroups.map((group) => (
          <div
            key={group?.id}
            className="border rounded-lg p-4 mb-4 shadow-md bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">{group?.title}</h2>
              <button
                onClick={() => toggleGroup(group?.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
                aria-label={`Toggle members for ${group?.title}`}
              >
                {expandedGroups[group?.id] ? (
                  <ChevronUp className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                )}
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{group?.description}</p>

            {expandedGroups[group?.id] && (
              <div>
                <h3 className="text-lg font-medium mb-2">Members:</h3>
                <ul className="list-disc ml-6">
                  {groupMembers
                    ?.filter((gm) => gm.groupId === group?.id)
                    .map((gm) => {
                      const member = users?.find((user) => user.id === gm.userId);
                      return (
                        <li
                          key={member?.id}
                          className="flex items-center gap-2 mb-2 text-gray-800 dark:text-gray-100"
                        >
                          <Image
                            src={member?.profilePicture || "/profile.png"}
                            alt={""}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                          <span>{member?.name}</span>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default GroupsPage;
