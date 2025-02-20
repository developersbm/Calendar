"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetAuthUserQuery, useGetUserQuery, useGetCelebrationPlansByUserQuery, useGetCelebrationPlanMembersQuery } from "@/state/api";
import { ChevronUp, ChevronDown, PlusCircle } from "lucide-react";

const CelebrationPlanScreen = () => {
  const router = useRouter();
  const { data: authData } = useGetAuthUserQuery({});
  let userId = authData?.user.userId;

  const { data: user } = useGetUserQuery(userId ?? "", {
    skip: !userId,
  });

  const { data: celebrationPlanMembers } = useGetCelebrationPlanMembersQuery();
  const { data: celebrationPlans } = useGetCelebrationPlansByUserQuery();

  const userPlans =
    celebrationPlanMembers
      ?.filter((member) => member.userId === user?.id && member.status === "Accepted")
      .map((member) => celebrationPlans?.find((plan) => plan.id === Number(member.planId))) || [];

  const [expandedPlans, setExpandedPlans] = useState<Record<number, boolean>>({});

  const togglePlan = (planId: number) => {
    setExpandedPlans((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  return (
    <div className="container mx-auto p-6 dark:bg-black dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Celebration Plans</h1>
        <button
          onClick={() => router.push("/add-plan")}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition flex items-center gap-2"
        >
          <PlusCircle className="w-5 h-5" /> Add Plan
        </button>
      </div>

      {userPlans.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">You have no celebration plans.</p>
      ) : (
        userPlans.map((plan) => {
          if (!plan) return null;

          return (
            <div key={plan.id} className="border rounded-lg p-4 mb-4 shadow-md bg-white dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">{plan.title}</h2>
                <button
                  onClick={() => togglePlan(plan.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
                  aria-label={`Toggle details for ${plan.title}`}
                >
                  {expandedPlans[plan.id] ? (
                    <ChevronUp className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-800 dark:text-gray-100" />
                  )}
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{plan.description}</p>

              {expandedPlans[plan.id] && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Details:</h3>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm text-gray-800 dark:text-white overflow-x-auto">
                    {JSON.stringify(plan, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default CelebrationPlanScreen;
