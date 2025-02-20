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
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";

const CelebrationPlansPage = () => {
  const router = useRouter();

  // Fetch authenticated user and all users
  const { data: users } = useGetUsersQuery();
  const { data: authData, isLoading: isAuthLoading } = useGetAuthUserQuery({});
  const cognitoId = authData?.user.userId;

  const { data: user, isLoading: isUserLoading } = useGetUserQuery(cognitoId ?? "", {
    skip: !cognitoId,
  });

  const userId = user?.id;

  // Fetch celebration plans of the user
  const { data: allCelebrationPlans = [], refetch: refetchCelebrationPlans, isLoading: isPlansLoading, error } =
  useGetCelebrationPlansByUserQuery(userId ? String(userId) : "", { skip: !userId });

    const [filteredCelebrationPlans, setFilteredCelebrationPlans] = useState<any[]>([]);

    useEffect(() => {
      const fetchAllMembersAndFilterPlans = async () => {
        if (!userId || isPlansLoading) return;

        try {
          const planMemberPromises = allCelebrationPlans.map(async (plan) => {
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
    }, [allCelebrationPlans, userId, users]);


  // Fetch members of each celebration plan
  const [membersByPlan, setMembersByPlan] = useState<Record<number, any[]>>({});
  const [addMemberPlan, setAddMemberPlan] = useState<number | null>(null);
  const [planDetailsById, setPlanDetailsById] = useState<Record<number, any>>({});
  const [email, setEmail] = useState("");

  const [deletePlan] = useDeleteCelebrationPlanMutation();
  const [addMember] = useAddCelebrationPlanMemberMutation();
  const [removeMember] = useRemoveCelebrationPlanMemberMutation();
  const [expandedPlans, setExpandedPlans] = useState<Record<number, boolean>>({});


  useEffect(() => {
    const fetchAllPlanDetails = async () => {
      if (!allCelebrationPlans.length) return;
  
      try {
        const detailsPromises = allCelebrationPlans.map(async (plan) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/celebrationPlan/${plan.id}`);
          if (!response.ok) throw new Error(`Failed to fetch plan ${plan.id}`);
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
  }, [allCelebrationPlans]);
  
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
    setAddMemberPlan((prev) => (prev === planId ? null : planId));
    setEmail("");
  };

  const handleAddMember = async (planId: number) => {
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

  const handleDeletePlan = async (planId: number) => {
    if (!confirm("Are you sure you want to delete this celebration plan?")) return;
    try {
      await deletePlan(planId).unwrap();
      refetchCelebrationPlans();
    } catch (error: any) {
      console.error("Error deleting plan:", error);
      alert(`Failed to delete plan: ${error.data?.message || "Unknown error"}`);
    }
  };

  const handleRemoveMember = async (planId: number, memberId: number) => {
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

  if (isAuthLoading || isUserLoading || isPlansLoading) {
    return <p className="text-center text-gray-500">Loading your celebration plans...</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-500">
        Error loading celebration plans
      </p>
    );
  }
  return (
    <div className="container mx-auto p-6 dark:bg-black dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Celebration Plans</h1>
        <button
          onClick={() => router.push("/add-plan")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
        >
          + Create Celebration Plan
        </button>
      </div>
  
      {filteredCelebrationPlans.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">You have no celebration plans.</p>
      ) : (
        filteredCelebrationPlans.map((plan) => {
          const planDetails = planDetailsById[plan.id];
  
          return (
            <div key={plan.id} className="border rounded-lg p-4 mb-4 shadow-md bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-semibold">{plan.title}</h2>
                  {planDetails && (
                    <ul className="mt-3 text-gray-700 dark:text-gray-200">
                      <li><strong>Start:</strong> {new Date(planDetails.startTime).toLocaleDateString()}</li>
                      <li><strong>End:</strong> {new Date(planDetails.endTime).toLocaleDateString()}</li>
                      <li><strong>Budget:</strong> ${planDetails.budget.toLocaleString()}</li>

                      {planDetails.venue && (
                        <li><strong>Venue:</strong> {planDetails.venue.name} - {planDetails.venue.location} (${planDetails.venue.price})</li>
                      )}
                      {planDetails.food && (
                        <li><strong>Food:</strong> {planDetails.food.type} - ${planDetails.food.price}</li>
                      )}
                      {planDetails.decorator && (
                        <li><strong>Decorator:</strong> {planDetails.decorator.name} ({planDetails.decorator.theme}) - ${planDetails.decorator.price}</li>
                      )}
                      {planDetails.entertainment && (
                        <li><strong>Host/DJ:</strong> {planDetails.entertainment.name} ({planDetails.entertainment.style}) - ${planDetails.entertainment.price}</li>
                      )}
                    </ul>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <button onClick={() => handleDeletePlan(plan.id)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                    <Trash2 className="h-5 w-5 text-red-700" />
                  </button>
                  <button
                    onClick={() => togglePlan(plan.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
                    aria-label={`Toggle members for ${plan.title}`}
                  >
                    {membersByPlan[plan.id] ? <ChevronUp className="h-5 w-5 text-gray-800 dark:text-gray-100" /> : <ChevronDown className="h-5 w-5 text-gray-800 dark:text-gray-100" />}
                  </button>
                </div>
              </div>
  
              {membersByPlan[plan.id] && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Participants:</h3>
                  <ul className="list-disc ml-6">
                    {membersByPlan[plan.id]?.map((member) => {
                      const participant = users?.find((u) => u.id === member.userId);

                      if (!participant) {
                        return null; // Skip rendering if participant is not found
                      }

                      return (
                        <li key={participant.id} className="flex items-center gap-2 mb-2 text-gray-800 dark:text-gray-100">
                          <Image src={"/profile.png"} alt={""} width={32} height={32} className="rounded-full" />
                          <span>
                            {participant.name} ({member.role})
                            {participant.id === user?.id ? " (You)" : ""}
                          </span>
                          <button onClick={() => handleRemoveMember(plan.id, participant.id)}>
                            <Trash2 className="text-red-500" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>

  
                  <button
                    onClick={() => toggleAddMember(plan.id)}
                    className={`mt-4 px-4 py-2 rounded-md transition ${
                      addMemberPlan === plan.id ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                    } text-white`}
                  >
                    {addMemberPlan === plan.id ? "Cancel" : "+ Add Participant"}
                  </button>
  
                  {addMemberPlan === plan.id && (
                    <div className="mt-2">
                      <input type="email" placeholder="Enter user email" className="border p-2 rounded dark:bg-gray-700 dark:text-white w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <button onClick={() => handleAddMember(plan.id)} className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition w-full">
                        Add Participant
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );  

};

export default CelebrationPlansPage;
