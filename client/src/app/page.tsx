"use client";

import { Calendar, Users, CircleDollarSign, PartyPopper } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-10 space-y-10">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Welcome to Plan It!
        </h1>
        <p className="mt-6 text-xl text-gray-600 dark:text-gray-300">
          Your one-stop solution for organizing plans, keeping track of events with a calendar, saving plans, and more.
        </p>
      </section>

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

          {/* Savings (New) */}
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
