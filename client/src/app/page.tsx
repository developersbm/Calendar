"use client";

import { Calendar, Users, CircleDollarSign, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useGetAuthUserQuery, useGetUserQuery } from "@/state/api";

export default function Home() {
  const { data: authData, isLoading: isAuthLoading } = useGetAuthUserQuery({});
  const cognitoId = authData?.user?.userId;
  const { data: user, isLoading: isUserLoading } = useGetUserQuery(cognitoId ?? "", {
    skip: !cognitoId,
  });
  const isAuthenticated = !!user;
  const isLoading = isAuthLoading || isUserLoading;

  if (isLoading) {
    return <p className="p-10 text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="p-10 space-y-10">
      {/* Hero Section */}
      {isAuthenticated && (
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Welcome!
        </h1>
        <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
          Your one-stop solution for organizing plans, keeping track of events with a calendar, saving plans, and more.
        </p>
      </section>
      )}
      {!isAuthenticated && (
        <section className="p-6 border-l-4 border-yellow-400 bg-yellow-50 dark:bg-gray-800 dark:border-yellow-600 rounded-md shadow-md">
          <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-3">
            Demo Mode Active
          </h2>
          <div className="space-y-2 text-yellow-700 dark:text-yellow-200">
             <p>You are currently viewing demo data. Features like adding or modifying data are disabled.</p>
             <p>To activate an account please contact: <a href="mailto:sbastida04@gmail.com" className="font-bold hover:underline">sbastida04@gmail.com</a></p>
             <p className="mt-4">
              For additional information / documentation and a video walkthrough, please check out the 
              <a 
                href="https://github.com/developersbm/Timely" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold hover:underline ml-1"
              >
                 GitHub Repository
               </a>.
            </p>
          </div>
        </section>
      )}

      {/* Services Overview */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-6">
          {/* Calendar */}
          <div className="text-center p-8 border rounded-xl shadow-lg bg-white dark:bg-gray-800">
            <Calendar size={48} className="mx-auto text-blue-500" />
            <h3 className="mt-6 text-2xl font-semibold text-gray-800 dark:text-white">Calendar</h3>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
              View, add, or delete calendar events.
            </p>
            <Link href="/calendar" className="mt-6 inline-block text-blue-600 dark:text-blue-400 text-lg font-medium">
              Learn more →
            </Link>
          </div>

          {/* Celebration Plan */}
          <div className="text-center p-8 border rounded-xl shadow-lg bg-white dark:bg-gray-800">
            <PartyPopper size={48} className="mx-auto text-green-500" />
            <h3 className="mt-6 text-2xl font-semibold text-gray-800 dark:text-white">Celebration Plan</h3>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
              Access celebration plans for your events and add participants!
            </p>
            <Link href="/celebrationPlans" className="mt-6 inline-block text-blue-600 dark:text-blue-400 text-lg font-medium">
              Explore Celebration Plan →
            </Link>
          </div>

          {/* Groups */}
          <div className="text-center p-8 border rounded-xl shadow-lg bg-white dark:bg-gray-800">
            <Users size={48} className="mx-auto text-purple-500" />
            <h3 className="mt-6 text-2xl font-semibold text-gray-800 dark:text-white">Groups</h3>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
              Join or create groups for collaboration and shared calendars.
            </p>
            <Link href="/groups" className="mt-6 inline-block text-blue-600 dark:text-blue-400 text-lg font-medium">
              Join Groups →
            </Link>
          </div>

          {/* Savings */}
          <div className="text-center p-8 border rounded-xl shadow-lg bg-white dark:bg-gray-800">
            <CircleDollarSign size={48} className="mx-auto text-yellow-500" />
            <h3 className="mt-6 text-2xl font-semibold text-gray-800 dark:text-white">Savings</h3>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
              Plan and manage your savings efficiently.
            </p>
            <Link href="/savingPlans" className="mt-6 inline-block text-blue-600 dark:text-blue-400 text-lg font-medium">
              Start Saving →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
