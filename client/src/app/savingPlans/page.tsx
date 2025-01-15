"use client";

import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip);

interface Transaction {
  type: "Deposit" | "Withdraw";
  amount: number;
  date: string;
}

export default function SavingPlans() {
  const [goal, setGoal] = useState(1000); // Default saving goal
  const [amount, setAmount] = useState(""); // Amount to save
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [
      {
        label: "Savings Progress",
        data: [] as number[],
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.2)", // Light blue
        borderColor: "rgba(59, 130, 246, 1)", // Dark blue
      },
    ],
  });

  const totalSaved = transactions.reduce((acc, transaction) => {
    return transaction.type === "Deposit" ? acc + transaction.amount : acc - transaction.amount;
  }, 0);

  const goalReached = totalSaved >= goal;

  // Handle adding a transaction
  const handleAddTransaction = (type: "Deposit" | "Withdraw") => {
    if (!amount) return;
    const newTransaction: Transaction = {
      type,
      amount: parseFloat(amount),
      date: new Date().toISOString().split("T")[0], // Current date
    };
    setTransactions([newTransaction, ...transactions]);
    setAmount("");
  };

  // Update chart data dynamically based on transactions
  useEffect(() => {
    const cumulativeSavings: number[] = [];
    let total = 0;
    const labels = transactions.map((t) => t.date).reverse();

    transactions.reverse().forEach((transaction) => {
      total += transaction.type === "Deposit" ? transaction.amount : -transaction.amount;
      cumulativeSavings.push(total);
    });

    setChartData({
      labels: labels.length ? labels : ["Start"],
      datasets: [
        {
          label: "Savings Progress",
          data: cumulativeSavings.length ? cumulativeSavings : [0],
          fill: true,
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "rgba(59, 130, 246, 1)",
        },
      ],
    });
  }, [transactions]);

  return (
    <div className="p-6 bg-gray-100 dark:bg-black min-h-screen flex flex-col space-y-6">
      <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
        Saving Plans
      </h1>

      {/* Savings Graph */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
          Savings Progress
        </h2>
        <div className="h-48 w-full">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Saving Goal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Set Your Saving Goal
        </h2>
        <div className="flex items-center space-x-4">
          <label className="text-gray-800 dark:text-white font-medium">
            Goal ($):
          </label>
          <input
            type="number"
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
            className="p-2 border rounded w-24 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="mt-2 text-gray-800 dark:text-white">
          {goalReached ? (
            <p className="text-green-500 font-semibold">Congratulations! You've reached your savings goal.</p>
          ) : (
            <p className="text-yellow-500">You're ${goal - totalSaved} away from your goal.</p>
          )}
        </div>
      </div>

      {/* Add Savings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Add Savings
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount ($)"
            className="p-2 border rounded w-full sm:w-40 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => handleAddTransaction("Deposit")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 active:scale-95 dark:bg-green-600 dark:hover:bg-green-700 transition duration-300"
          >
            Deposit
          </button>
          <button
            onClick={() => handleAddTransaction("Withdraw")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 active:scale-95 dark:bg-red-600 dark:hover:bg-red-700 transition duration-300"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <details>
          <summary className="text-lg font-bold text-gray-800 dark:text-white">
            Recent Transactions
          </summary>
          <ul className="mt-4 space-y-2">
            {transactions.map((transaction, index) => (
              <li
                key={index}
                className="flex justify-between py-2 items-center"
              >
                <span
                  className={`font-semibold ${
                    transaction.type === "Deposit"
                      ? "text-green-500 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {transaction.type}
                </span>
                <span className="text-gray-800 dark:text-white">
                  ${transaction.amount.toFixed(2)}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {transaction.date}
                </span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
