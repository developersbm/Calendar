"use client";

import { Calendar, Layers3, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-8 space-y-8">
      {/* Hero Section */}
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          Welcome to Plan It!
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
          Your one-stop solution for organizing events, saving plans, and more.
        </p>
      </section>

      {/* Services Overview */}
      <section>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          <div className="text-center p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800">
            <Calendar size={32} className="mx-auto text-blue-500" />
            <h3 className="mt-4 text-xl text-gray-800 dark:text-white">Calendar</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              View, add, or delete calendar events.
            </p>
            <Link href="/calendar" className="mt-4 inline-block text-blue-600 dark:text-blue-400">
              Learn more
            </Link>
          </div>

          <div className="text-center p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800">
            <Layers3 size={32} className="mx-auto text-green-500" />
            <h3 className="mt-4 text-xl text-gray-800 dark:text-white">Templates</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Access pre-made templates for your events and saving plans.
            </p>
            <Link href="/templates" className="mt-4 inline-block text-blue-600 dark:text-blue-400">
              Explore Templates
            </Link>
          </div>

          <div className="text-center p-6 border rounded-lg shadow-md bg-white dark:bg-gray-800">
            <Users size={32} className="mx-auto text-purple-500" />
            <h3 className="mt-4 text-xl text-gray-800 dark:text-white">Groups</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Join or create groups for collaboration and shared events.
            </p>
            <Link href="/groups" className="mt-4 inline-block text-blue-600 dark:text-blue-400">
              Join Groups
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
