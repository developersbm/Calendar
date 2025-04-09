"use client";

import { useRouter } from "next/navigation";
import {
  useGetAuthUserQuery,
  useGetUserQuery,
  useGetUsersQuery,
  useGetCelebrationPlansByUserQuery,
  useAddCelebrationPlanMemberMutation,
  useDeleteCelebrationPlanMutation,
  useRemoveCelebrationPlanMemberMutation,
} from "@/state/api";
import Image from "next/image";
import { ChevronUp, ChevronDown, Trash2, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import * as testData from "../../data/testData";
import Link from "next/link";
import CelebrationPlanModal from "../add-plan/page";

interface PlanToDelete {
    id: number;
    title: string;
}

const CelebrationPlansPage = () => {
  const router = useRouter();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<PlanToDelete | null>(null);

  // Fetch authenticated user and all users
  const { data: users } = useGetUsersQuery();
  const { data: authData, isLoading: isAuthLoading } = useGetAuthUserQuery({});
  const cognitoId = authData?.user.userId;
  const { data: user, isLoading: isUserLoading } = useGetUserQuery(cognitoId ?? "", {
    skip: !cognitoId,
  });
  const isAuthenticated = !!user;
  const userId = user?.id;

  // Fetch celebration plans of the user only if authenticated
  const { data: allCelebrationPlans = [], refetch: refetchCelebrationPlans, isLoading: isPlansLoading, error } =
  useGetCelebrationPlansByUserQuery(userId ? String(userId) : "", { skip: !isAuthenticated || !userId });

  const [displayPlans, setDisplayPlans] = useState<any[]>([]);

  const [filteredCelebrationPlans, setFilteredCelebrationPlans] = useState<any[]>([]);

  useEffect(() => {
    const demo = !isAuthenticated && !isAuthLoading && !isUserLoading;
    setIsDemoMode(demo);
    if (demo) {
      setDisplayPlans(testData.testCelebrationPlans);
      setFilteredCelebrationPlans(testData.testCelebrationPlans);
    } else {
      setDisplayPlans(allCelebrationPlans);

      setFilteredCelebrationPlans([]); 
    }
  }, [isAuthenticated, isAuthLoading, isUserLoading, allCelebrationPlans]);

  useEffect(() => {
    if (isDemoMode) return;

    const fetchAllMembersAndFilterPlans = async () => {
      if (!userId || isPlansLoading || !displayPlans.length) return;

      try {
        const planMemberPromises = displayPlans.map(async (plan) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/celebrationPlanMember/${plan.id}/members`);
          if (!response.ok) throw new Error(`Failed to fetch members for plan ${plan.id}`);
          const members = await response.json();
          return { plan, members };
        });

        const plansWithMembers = await Promise.all(planMemberPromises);

        const userPlans = plansWithMembers
        .filter(({ members }) => members.some((member: { userId: number }) => member.userId === userId))
        .map(({ plan }) => plan);

        setFilteredCelebrationPlans(userPlans);
      } catch (error) {
        console.error("Error fetching plan members:", error);
      }
    };

    fetchAllMembersAndFilterPlans();
  }, [displayPlans, userId, isPlansLoading, isDemoMode]);

  // Fetch members of each celebration plan
  const [membersByPlan, setMembersByPlan] = useState<Record<number, any[]>>({});
  const [addMemberPlan, setAddMemberPlan] = useState<number | null>(null);
  const [planDetailsById, setPlanDetailsById] = useState<Record<number, any>>({});
  const [email, setEmail] = useState("");

  const [deletePlan] = useDeleteCelebrationPlanMutation();
  const [addMember] = useAddCelebrationPlanMemberMutation();
  const [removeMember] = useRemoveCelebrationPlanMemberMutation();
  const [expandedPlans, setExpandedPlans] = useState<Record<number, boolean>>({});

  // Fetch plan details logic
  useEffect(() => {
    const fetchAllPlanDetails = async () => {
      if (!displayPlans.length) return;

      try {
        const detailsPromises = displayPlans.map(async (plan) => {

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/celebrationPlan/${plan.id}`);
          if (!response.ok) {

            if (!isDemoMode) {
               throw new Error(`Failed to fetch plan ${plan.id}`);
            } else {
              console.warn(`Demo mode: Skipping details fetch for non-existent test plan ID ${plan.id}`);
              return { id: plan.id, details: plan };
            }
          }
          return { id: plan.id, details: await response.json() };
        });

        const details = await Promise.all(detailsPromises);
        const detailsMap = details.reduce((acc, { id, details }) => {
          acc[id] = details;
          return acc;
        }, {} as Record<number, any>);

        setPlanDetailsById(detailsMap);
      } catch (error) {
        console.error("Error fetching plan details:", error);
      }
    };

    fetchAllPlanDetails();
  }, [displayPlans, isDemoMode]);
  
  const togglePlan = async (planId: number) => {
    setExpandedPlans((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  
    if (!expandedPlans[planId]) {
      await fetchMembersForPlan(planId);
      await fetchPlanDetails(planId);
    }
  };
  
  const fetchPlanDetails = async (planId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/celebrationPlan/${planId}`);
      if (response.ok) {
        const planDetails = await response.json();
        setPlanDetailsById((prev) => ({ ...prev, [planId]: planDetails }));
      } else {
        console.error("Error fetching plan details:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const fetchMembersForPlan = async (planId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/celebrationPlanMember/${planId}/members`);
      if (response.ok) {
        const members = await response.json();
        setMembersByPlan((prev) => ({ ...prev, [planId]: members }));
      } else {
        console.error("Error fetching members:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };  

  const toggleAddMember = (planId: number) => {
    if (isDemoMode) {
      alert("Please sign in or sign up to manage plans.");
      return;
    }
    setAddMemberPlan((prev) => (prev === planId ? null : planId));
    setEmail("");
  };

  const handleAddMember = async (planId: number) => {
    if (isDemoMode) {
      alert("Please sign in or sign up to manage plans.");
      return;
    }
    if (!email.trim()) return alert("Please enter an email.");
    try {
      await addMember({ planId, email, role: "Participant" }).unwrap();
      setAddMemberPlan(null);
      setEmail("");
  
      await refetchCelebrationPlans();
      await fetchMembersForPlan(planId);
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member.");
    }
  };  

  const handleDeletePlan = (plan: { id: number; title: string }) => {
    if (isDemoMode) {
      alert("Please sign in or sign up to manage plans.");
      return;
    }
    setPlanToDelete(plan);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete || isDemoMode) return;

    try {
      await deletePlan(planToDelete.id).unwrap();
      refetchCelebrationPlans();
    } catch (error: any) {
      console.error("Error deleting plan:", error);
      alert(`Failed to delete plan: ${error.data?.message || "Unknown error"}`);
    } finally {
      setPlanToDelete(null);
    }
  };

  // Function to cancel deletion and close the modal
  const handleCancelDelete = () => {
    setPlanToDelete(null);
  };

  const handleRemoveMember = async (planId: number, memberId: number) => {
    if (isDemoMode) {
      alert("Please sign in or sign up to manage plans.");
      return;
    }
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeMember({ planId, userId: memberId }).unwrap();
  
      await refetchCelebrationPlans();
      await fetchMembersForPlan(planId);
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member.");
    }
  };  

  // Function to open the modal
  const handleOpenModal = () => {
    if (isDemoMode) {
      alert("Please sign in or sign up to create plans.");
      return;
    }
    setIsModalOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Function to refetch plans after modal creates one
  const handlePlanCreated = () => {
    refetchCelebrationPlans();
  };

  if ((isAuthLoading || isUserLoading || isPlansLoading) && !isDemoMode) {
    return <p className="text-center text-gray-500">Loading your celebration plans...</p>;
  }

  if (error && !isDemoMode) {
    return (
      <p className="text-center text-red-500">
        Error loading celebration plans
      </p>
    );
  }
  return (
    <div className="p-4 dark:bg-gray-900 dark:text-white min-h-screen">
      {isDemoMode && (
        <div className="mb-4 p-3 text-center bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
          Showing Demo Data. <Link href="/auth" className="font-bold underline">Sign in</Link> or <Link href="/auth" className="font-bold underline">Sign up</Link> to manage your plans.
        </div>
      )}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">
          {isDemoMode ? "Demo Celebration Plans" : "Your Celebration Plans"}
        </h1>
        <button
          onClick={handleOpenModal}
          className={`text-white px-4 py-2 rounded-lg shadow-md transition ${isDemoMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={isDemoMode}
        >
          + Create Celebration Plan
        </button>
      </div>
      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Organize and manage all the details for your important celebrations, from birthdays to anniversaries.
      </p>
  
      {filteredCelebrationPlans.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">{isDemoMode ? 'No demo plans available.' : 'You have no celebration plans.'}</p>
      ) : (
        <div className="space-y-4">
          {filteredCelebrationPlans.map((plan) => {
            const planDetails = planDetailsById[plan.id] || plan;
            const members = membersByPlan[plan.id] || [];
            const isExpanded = expandedPlans[plan.id];
    
            return (
              <div key={plan.id} className="border rounded-lg shadow-md bg-white dark:bg-gray-800 overflow-hidden">
                <div className="p-4 flex items-center justify-between border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <h2 className="text-xl font-semibold">{planDetails.title}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeletePlan(plan)}
                      className={`p-1 rounded-full ${isDemoMode ? 'text-gray-400 cursor-not-allowed' : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900'}`}
                      disabled={isDemoMode}
                      aria-label="Delete Plan"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => togglePlan(plan.id)}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                      aria-label={`Toggle details for ${plan.title}`}
                    >
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </button>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <DetailItem label="Start" value={new Date(planDetails.startTime).toLocaleDateString()} />
                    <DetailItem label="End" value={new Date(planDetails.endTime).toLocaleDateString()} />
                    <DetailItem label="Budget" value={`$${planDetails.budget?.toLocaleString() || 'N/A'}`} />
                    <DetailItem label="Venue" value={planDetails.venue?.name || planDetails.venue || 'N/A'} />
                    <DetailItem label="Food" value={planDetails.food?.type || planDetails.food || 'N/A'} />
                    <DetailItem label="Decorator" value={planDetails.decorator?.name || planDetails.decorator || 'N/A'} />
                    <DetailItem label="Entertainment" value={planDetails.entertainment?.name || planDetails.entertainment || 'N/A'} />
                 </div>
  
                {isExpanded && (
                   <div className="p-4 border-t text-gray-500 dark:text-gray-400">
                     <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-200">Members</h3>
                     {isDemoMode ? (
                       <p className="text-sm text-gray-500">Member management disabled in demo mode.</p>
                     ) : (
                       <> 
                         {members.length === 0 ? (
                           <p className="text-sm text-gray-500">(No members added yet)</p>
                         ) : (
                           <ul className="space-y-2 mb-4">
                             {members.map((member) => {
                                const participant = users?.find((u) => u.id === member.userId);
                                if (!participant) return null;
                                return (
                                  <li key={participant.id} className="flex items-center justify-between gap-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                      <Image src="/profile.png" alt="" width={24} height={24} className="rounded-full" />
                                      <span>{participant.name} ({participant.email}) - <span className="font-medium">{member.role}</span></span>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveMember(plan.id, participant.id)}
                                      className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                                      aria-label={`Remove ${participant.name}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </li>
                                );
                             })}
                           </ul>
                         )}
                         <div className="mt-2 pt-2 border-t dark:border-gray-600">
                            <button
                              onClick={() => toggleAddMember(plan.id)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              {addMemberPlan === plan.id ? 'Cancel' : '+ Add Member'}
                            </button>
                            {addMemberPlan === plan.id && (
                              <div className="mt-2 flex gap-2 items-center">
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="Member email"
                                  className="p-2 border rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white flex-grow text-sm"
                                />
                                <button
                                  onClick={() => handleAddMember(plan.id)}
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
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Render the Modal */} 
      <CelebrationPlanModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        userId={userId} 
        onPlanCreated={handlePlanCreated} 
      />

      {/* Render the Delete Confirmation Modal */} 
      {planToDelete && (
          <ConfirmationModal 
              isOpen={!!planToDelete} 
              onClose={handleCancelDelete} 
              onConfirm={handleConfirmDelete} 
              planTitle={planToDelete.title} 
          />
      )}
    </div>
  );  
};

// Helper component for displaying details
const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <span className="font-semibold text-gray-600 dark:text-gray-400">{label}:</span>
    <span className="ml-2 text-gray-800 dark:text-gray-200">{value}</span>
  </div>
);

// --- Confirmation Modal Component ---
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planTitle: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, planTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Confirm Deletion</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the celebration plan 
            <strong className="text-gray-900 dark:text-white mx-1">{planTitle}</strong>?
            <br />
            <span className="text-sm text-red-600 dark:text-red-400">(This action cannot be undone)</span>
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 rounded-md shadow-sm transition duration-150 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md shadow-sm transition duration-150 ease-in-out"
          >
            Delete Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default CelebrationPlansPage;
