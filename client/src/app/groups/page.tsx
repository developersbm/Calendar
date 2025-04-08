"use client";

import { useGetAuthUserQuery, useGetUserQuery, useGetUsersQuery, useGetGroupsQuery, useGetGroupMembersQuery, useAddMemberMutation, useCreateGroupMutation, useDeleteGroupMutation, useRemoveMemberMutation } from "@/state/api";
import Image from "next/image";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import GroupModal from "@/components/GroupModal/page";
import { testGroups } from "@/data/testData";
import { useAppSelector } from "@/app/redux";

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
  const { data: groupMembers, refetch: refetchGroupMembers } = useGetGroupMembersQuery();
  const { data: groups, isError: isGroupsError } = useGetGroupsQuery();
  
  const { data: authData } = useGetAuthUserQuery({});
  let userId = authData?.user.userId;
  
  const { data: user } = useGetUserQuery(userId ?? "", {
    skip: !userId,
  });

  const userGroups =
    groupMembers
      ?.filter((gm) => gm.userId === user?.id && gm.status === "Active")
      .map((gm) => groups?.find((g) => g.id === Number(gm.groupId))) || [];

  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addMemberGroup, setAddMemberGroup] = useState<number | null>(null); 
  const [email, setEmail] = useState("");

  const [addMember] = useAddMemberMutation();
  const [createGroup] = useCreateGroupMutation();

  const [deleteGroup] = useDeleteGroupMutation();
  const [removeMember] = useRemoveMemberMutation();

  const [isServerOnline, setIsServerOnline] = useState<boolean>(true);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    if (isGroupsError) {
      setIsServerOnline(false);
    }
  }, [isGroupsError]);

  const displayGroups = isServerOnline ? groups : testGroups;

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleAddMember = (groupId: number) => {
    setAddMemberGroup((prev) => (prev === groupId ? null : groupId));
    setEmail("");
  };

  const handleAddMember = async (groupId: number) => {
    if (!email.trim()) return alert("Please enter an email.");
    try {
      await addMember({ groupId, email }).unwrap();
      setAddMemberGroup(null);
      setEmail("");
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member.");
    }
  };

  const handleCreateGroup = async (title: string, description: string) => {
    let userId = user?.id;
    if (!userId) {
      alert("User is not authenticated.");
      return;
    }
  
    try {
      await createGroup({ title, description, userId: Number(userId) }).unwrap();
      setIsModalOpen(false);
      
      await Promise.all([refetchGroupMembers()]);
    } catch (error: any) {
      console.error("Error creating group:", error.data?.message);
      alert(`Failed to create group: ${error.data?.message || "Unknown error"}`);
    }
  };
  
  
  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
  
    try {
      await deleteGroup(groupId).unwrap();
  
      await Promise.all([refetchGroupMembers()]);
    } catch (error: any) {
      console.error("Error deleting group:", error.data?.message);
      alert(`Failed to delete group: ${error.data?.message || "Unknown error"}`);
    }
  };  

  const handleRemoveMember = async (groupId: number, memberId: number) => {
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


  return (
    <div className={`p-4 ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
      {!isServerOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Demo Mode</p>
          <p>You are currently viewing demo data. To activate the live server with AWS EC2 and RDS, please let me know if you'd like to review the project!</p>
          <p className="mt-2">AWS services are not free, so the project is currently running in demo mode to save costs.</p>
          <p className="mt-2">For more information about the project, please check out the video at: <a href="https://github.com/developersbm/Calendar" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">GitHub Repository</a></p>
        </div>
      )}
      
      <h1 className="text-2xl font-bold mb-4">Groups</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(displayGroups as TestGroup[])?.map((group) => (
          <div 
            key={group.id} 
            className={`p-4 rounded-lg shadow ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
            <p className="text-gray-600 mb-4">{group.description}</p>
            <h3 className="font-medium mb-2">Members:</h3>
            <ul className="space-y-2">
              {group.members.map((member) => (
                <li key={member.id} className="flex items-center">
                  <span className="mr-2">{member.role === 'ADMIN' ? '👑' : '👤'}</span>
                  <span>{member.name}</span>
                  <span className="text-gray-500 text-sm ml-2">({member.email})</span>
                </li>
              ))}
            </ul>
            {group.events.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Upcoming Events:</h3>
                <ul className="space-y-2">
                  {group.events.map((event) => (
                    <li key={event.id} className="text-sm">
                      <span className="font-medium">{event.title}</span>
                      <span className="text-gray-500 ml-2">
                        {new Date(event.startTime).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <GroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleCreateGroup} />
    </div>
  );
};

export default GroupsPage;
