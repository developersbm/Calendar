"use client"; // ✅ This tells Next.js that this is a client component

import React, { useState, useMemo } from "react";
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
import {
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useDeleteAllTransactionsMutation,
  useGetUserQuery,
} from "@/state/api";
import { useGetAuthUserQuery } from "@/state/api";

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip);

export default function SavingPlans() {
  const [amount, setAmount] = useState("");

  // Fetch transactions from API
  const { data: authData } = useGetAuthUserQuery({});
  let cognitoId = authData?.user?.userId;

  const { data: user } = useGetUserQuery(cognitoId ?? "", { skip: !cognitoId });
  let userId = Number(user?.id);

  const { data: transactions = [], refetch } = useGetTransactionsQuery(userId ?? "", { skip: !userId });
  const [addTransaction] = useAddTransactionMutation();
  const [deleteAllTransactions] = useDeleteAllTransactionsMutation();

  // Compute total balance
  const totalBalance = useMemo(() => {
    return transactions.reduce((total, t) => total + (t.type === "Deposit" ? t.amount : -t.amount), 0);
  }, [transactions]);

  // Handle adding a transaction (Deposit or Withdraw)
  const handleAddTransaction = async (type: "Deposit" | "Withdraw") => {
    if (!amount || !userId) return;

    try {
      await addTransaction({ userId, type, amount: parseFloat(amount) }).unwrap();
      setAmount("");
      refetch();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  // Handle clearing all transactions
  const handleClearTransactions = async () => {
    if (!userId) return;
    if (!confirm("Are you sure you want to clear all transactions? This action cannot be undone.")) return;

    try {
      await deleteAllTransactions(userId).unwrap();
      refetch();
    } catch (error) {
      console.error("Error clearing transactions:", error);
    }
  };

  // Prepare data for the chart
  const chartData = {
    labels: transactions.map((t) => new Date(t.date).toLocaleDateString()),
    datasets: [
      {
        label: "Savings Progress",
        data: transactions.reduce((acc: number[], t) => {
          const newTotal = acc.length ? acc[acc.length - 1] + (t.type === "Deposit" ? t.amount : -t.amount) : t.amount;
          return [...acc, newTotal];
        }, []),
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgba(59, 130, 246, 1)",
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-black min-h-screen flex flex-col space-y-6">
      <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Saving Plans</h1>

      {/* Total Balance */}
      <div className="text-center text-lg font-semibold text-gray-700 dark:text-white">
        Total Balance: ${totalBalance.toFixed(2)}
      </div>

      {/* Savings Graph */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Savings Progress</h2>
        <div className="h-48 w-full">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {/* Add Savings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Add Savings</h2>
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
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Deposit
          </button>
          <button
            onClick={() => handleAddTransaction("Withdraw")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <details>
          <summary className="text-lg font-bold text-gray-800 dark:text-white">Recent Transactions</summary>
          <ul className="mt-4 space-y-2">
            {transactions.slice(-5).reverse().map((transaction, index) => (
              <li key={index} className="flex justify-between py-2 items-center">
                <span
                  className={`font-semibold ${
                    transaction.type === "Deposit"
                      ? "text-green-500 dark:text-green-400"
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {transaction.type}
                </span>
                <span className="text-gray-800 dark:text-white">${transaction.amount.toFixed(2)}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </details>

        {/* Clear All Transactions Button */}
        <button
          onClick={handleClearTransactions}
          className="mt-4 px-4 py-2 text-red-600 font-bold rounded w-full hover:text-red-700"
        >
          Clear All Transactions
        </button>
      </div>
    </div>
  );
}
