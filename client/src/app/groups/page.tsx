"use client";

import { useGetAuthUserQuery, useGetUserQuery, useGetUsersQuery, useGetGroupsQuery, useGetGroupMembersQuery, useAddMemberMutation, useCreateGroupMutation, useDeleteGroupMutation, useRemoveMemberMutation } from "@/state/api";
import Image from "next/image";
import { ChevronUp, ChevronDown, Trash2, Users, X } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import GroupModal from "@/components/GroupModal/page";
import { testGroups } from "@/data/testData";
import { useAppSelector } from "@/app/redux";
import Link from "next/link";

interface TestGroupMember {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

interface TestGroupEvent {
  id: number;
  title: string;
  startTime: string;
}

interface TestGroup {
  id: number;
  name: string;
  description: string;
  members: TestGroupMember[];
  events: TestGroupEvent[];
}

const GroupsPage = () => {
  const { data: users } = useGetUsersQuery();
  const { data: groupMembers, refetch: refetchGroupMembers, isLoading: isMembersLoading } = useGetGroupMembersQuery();
  const { data: groups, refetch: refetchGroups, isError: isGroupsError, isLoading: isGroupsLoading } = useGetGroupsQuery();
  
  const { data: authData, isLoading: isAuthLoading } = useGetAuthUserQuery({});
  const cognitoId = authData?.user.userId;

  const { data: user, isLoading: isUserLoading } = useGetUserQuery(cognitoId ?? "", {
    skip: !cognitoId,
  });
  const isAuthenticated = !!user;
  const isLoadingAuth = isAuthLoading || isUserLoading;

  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const demo = !isAuthenticated && !isLoadingAuth;
    setIsDemoMode(demo);
  }, [isAuthenticated, isLoadingAuth]);

  const displayGroups = useMemo(() => {
    return isDemoMode ? testGroups : groups || [];
  }, [isDemoMode, groups]);

  const userGroups = useMemo(() => {
    if (isDemoMode) return [];
    return groupMembers
      ?.filter((gm) => gm.userId === user?.id && gm.status === "Active")
      .map((gm) => groups?.find((g) => g.id === Number(gm.groupId)))
      .filter(Boolean) || [];
  }, [isDemoMode, groupMembers, user?.id, groups]);

  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addMemberGroup, setAddMemberGroup] = useState<number | null>(null); 
  const [email, setEmail] = useState("");
  const [groupToDelete, setGroupToDelete] = useState<{ id: number; name: string } | null>(null);

  const [addMember] = useAddMemberMutation();
  const [createGroup] = useCreateGroupMutation();

  const [deleteGroup] = useDeleteGroupMutation();
  const [removeMember] = useRemoveMemberMutation();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleAddMember = (groupId: number) => {
    if (isDemoMode) {
      alert("Sign in to manage members.");
      return;
    }
    setAddMemberGroup((prev) => (prev === groupId ? null : groupId));
    setEmail("");
  };

  const handleAddMember = async (groupId: number) => {
    if (isDemoMode) return;
    if (!email.trim()) return alert("Please enter an email.");
    try {
      await addMember({ groupId, email }).unwrap();
      setAddMemberGroup(null);
      setEmail("");
      refetchGroupMembers();
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member.");
    }
  };

  const handleCreateGroup = async (title: string, description: string) => {
    if (isDemoMode) return;
    let userId = user?.id;
    if (!userId) {
      alert("User is not authenticated.");
      return;
    }
  
    try {
      await createGroup({ title, description, userId: Number(userId) }).unwrap();
      setIsModalOpen(false);
      refetchGroups();
      refetchGroupMembers();
    } catch (error: any) {
      console.error("Error creating group:", error.data?.message);
      alert(`Failed to create group: ${error.data?.message || "Unknown error"}`);
    }
  };
  
  
  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    if (isDemoMode) return;
    setGroupToDelete({ id: groupId, name: groupName });
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete || isDemoMode) return;
    
    try {
      await deleteGroup(groupToDelete.id).unwrap();
      refetchGroups();
      refetchGroupMembers();
    } catch (error: any) {
      console.error("Error deleting group:", error.data?.message);
      alert(`Failed to delete group: ${error.data?.message || "Unknown error"}`);
    } finally {
      setGroupToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setGroupToDelete(null);
  };

  const handleRemoveMember = async (groupId: number, memberId: number) => {
    if (isDemoMode) return;
    const groupMembersCount = groupMembers?.filter((gm) => gm.groupId === groupId).length;
    if (groupMembersCount === 1 && memberId === user?.id) {
      alert("You cannot remove yourself as you are the only member.");
      return;
    }
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeMember({ groupId, memberId }).unwrap();
      alert("Member removed successfully!");
      refetchGroupMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member.");
    }
  };

  const isLoading = isLoadingAuth || (isAuthenticated && (isGroupsLoading || isMembersLoading));
  if (isLoading) {
    return <p className="p-4 text-center text-gray-500">Loading groups...</p>;
  }

  return (
    <div className={`p-4 ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} min-h-screen`}>
      {isDemoMode && (
        <div className="mb-4 p-3 text-center bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
          Showing Demo Data. <Link href="/auth" className="font-bold underline text-blue-600">Sign in</Link> or <Link href="/auth" className="font-bold underline text-blue-600">Sign up</Link> to manage real groups.
        </div>
      )}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">{isDemoMode ? "Demo Groups" : "Your Groups"}</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`px-4 py-2 rounded text-white ${isDemoMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={isDemoMode}
        >
          + Create Group
        </button>
      </div>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Create or join groups to collaborate and share calendars or plans with others.
      </p>
      
      {displayGroups.length === 0 && !isDemoMode && (
        <p className="text-gray-500">(You are not part of any groups yet)</p>
      )}
      {displayGroups.length === 0 && isDemoMode && (
        <p className="text-gray-500">(No demo groups available)</p>
      )}

      <div className="space-y-4 mt-4">
        {(displayGroups as any[])?.map((group) => {
          const membersToDisplay = isDemoMode ? group.members : groupMembers?.filter(gm => gm.groupId === group.id) || [];
          const memberUsers = isDemoMode ? group.members : membersToDisplay.map((gm: { userId: number }) => users?.find(u => u.id === gm.userId)).filter(Boolean);
          const eventsToDisplay = isDemoMode ? group.events : [];
          const isExpanded = expandedGroups[group.id];

          return (
            <div key={group.id} className="border rounded-lg shadow-md bg-white dark:bg-gray-800 overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-purple-600 dark:text-purple-400"/>
                  <h2 className="text-xl font-semibold">{group.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {!isDemoMode && (
                    <button 
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className={`p-1 rounded-full ${isDemoMode ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900'}`}
                      disabled={isDemoMode}
                      aria-label="Delete group"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                    aria-label={`Toggle details for ${group.name}`}
                  >
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                  </button>
                </div>
              </div>

              {group.description && (
                <div className="p-4 text-sm text-gray-600 dark:text-gray-300">
                  <p>{group.description}</p>
                </div>
              )}
              
              {isExpanded && (
                <div className="p-4 border-t dark:border-gray-700">
                  <div className="mb-4">
                    <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-200">Members ({memberUsers.length})</h3>
                    {isDemoMode ? (
                      <ul className="space-y-2 text-sm pl-2">
                        {memberUsers.map((memberUser: any) => (
                          <li key={memberUser.id} className="flex items-center gap-1.5 text-gray-800 dark:text-gray-100">
                            <Image src="/profile.png" alt="" width={20} height={20} className="rounded-full" />
                            <span>{memberUser.name} ({memberUser.role})</span>
                          </li>
                        ))}
                      </ul>
                    ) : ( 
                      <> 
                        {memberUsers.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400">(No members found)</p>
                        ) : (
                          <ul className="space-y-2 mb-4">
                            {memberUsers.map((memberUser: any) => (
                              <li key={memberUser.id} className="flex items-center justify-between gap-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                  <Image src="/profile.png" alt="" width={24} height={24} className="rounded-full" />
                                  <span>{memberUser.name} ({groupMembers?.find(gm => gm.userId === memberUser.id && gm.groupId === group.id)?.role})</span>
                                </div>
                                {memberUser.id !== user?.id && (
                                  <button 
                                    onClick={() => handleRemoveMember(group.id, memberUser.id)}
                                    className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                                    disabled={isDemoMode}
                                    aria-label="Remove member"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-2 pt-2 border-t dark:border-gray-600">
                          <button
                            onClick={() => toggleAddMember(group.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {addMemberGroup === group.id ? 'Cancel' : '+ Add Member'}
                          </button>
                          {addMemberGroup === group.id && (
                            <div className="mt-2 flex gap-2 items-center">
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Member email"
                                className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white flex-grow text-sm"
                              />
                              <button
                                onClick={() => handleAddMember(group.id)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {isDemoMode && eventsToDisplay.length > 0 && (
                    <div> 
                      <h3 className="text-md font-semibold mb-2 text-gray-700 dark:text-gray-200">Upcoming Events</h3>
                      <ul className="space-y-1 text-sm pl-2 list-disc list-inside text-gray-600 dark:text-gray-300">
                        {eventsToDisplay.map((event: any) => (
                          <li key={event.id}>
                            <span className="font-medium text-gray-800 dark:text-gray-100">{event.title}</span>
                            <span className="ml-2 text-gray-500 dark:text-gray-400">
                              ({new Date(event.startTime).toLocaleDateString()})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isDemoMode && (
        <GroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateGroup} />
      )}

      {groupToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Confirm Deletion</h2>
              <button
                onClick={handleCancelDelete}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-center">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete the group 
                <strong className="text-gray-900 dark:text-white mx-1">{groupToDelete.name}</strong>?
                <br />
                <span className="text-sm text-red-600 dark:text-red-400">(This action cannot be undone)</span>
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                Delete Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
