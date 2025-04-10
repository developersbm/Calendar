"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
  TimeScale,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useDeleteAllTransactionsMutation,
  useGetUserQuery,
} from "@/state/api";
import { useGetAuthUserQuery } from "@/state/api";
import * as testData from "../../data/testData";
import Link from "next/link";
import { PlusCircle, MinusCircle, Trash2, TrendingUp, DollarSign, X } from "lucide-react";

// Register Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip, TimeScale);

export default function SavingPlans() {
  const [amount, setAmount] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [transactionsToDelete, setTransactionsToDelete] = useState(false);

  // Fetch transactions from API
  const { data: authData, isLoading: isAuthLoading } = useGetAuthUserQuery({});
  const cognitoId = authData?.user?.userId;
  const { data: user, isLoading: isUserLoading } = useGetUserQuery(cognitoId ?? "", { skip: !cognitoId });
  const isAuthenticated = !!user;
  let userId = Number(user?.id);

  // Fetch real transactions only if authenticated
  const { data: transactions = [], refetch } = useGetTransactionsQuery(userId ?? "", { skip: !isAuthenticated || !userId });
  const [addTransaction] = useAddTransactionMutation();
  const [deleteAllTransactions] = useDeleteAllTransactionsMutation();

  // Determine which transactions to display
  const displayTransactions = useMemo(() => {
    return isDemoMode ? testData.testSavingPlans[0].transactions : transactions;
  }, [isDemoMode, transactions]);

  // Update demo mode status
  useEffect(() => {
    const demo = !isAuthenticated && !isAuthLoading && !isUserLoading;
    setIsDemoMode(demo);
  }, [isAuthenticated, isAuthLoading, isUserLoading]);

  // Compute total balance based on displayed transactions
  const totalBalance = useMemo(() => {
    return displayTransactions.reduce((total: number, t) => {
      const isDeposit = t.type === "DEPOSIT" || t.type === "Deposit";
      return total + (isDeposit ? Number(t.amount) : -Number(t.amount));
    }, 0);
  }, [displayTransactions]);

  // Handle adding a transaction (Deposit or Withdraw)
  const handleAddTransaction = async (type: "Deposit" | "Withdraw") => {
    if (isDemoMode) {
      alert("Please sign in or sign up to manage savings.");
      return;
    }
    if (!amount || !userId) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }

    try {
      await addTransaction({ 
        userId, 
        type,
        amount: numericAmount 
      }).unwrap();
      setAmount("");
      refetch();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction. Please try again.");
    }
  };

  // Handle clearing all transactions
  const handleClearTransactions = async () => {
    if (isDemoMode) {
      alert("Please sign in or sign up to manage savings.");
      return;
    }
    if (!userId) return;
    setTransactionsToDelete(true);
  };

  const handleConfirmClear = async () => {
    if (!userId) return;
    
    try {
      await deleteAllTransactions(userId).unwrap();
      refetch();
    } catch (error) {
      console.error("Error clearing transactions:", error);
      alert("Failed to clear transactions. Please try again.");
    } finally {
      setTransactionsToDelete(false);
    }
  };

  const handleCancelClear = () => {
    setTransactionsToDelete(false);
  };

  // Prepare data for the chart based on displayed transactions
  const sortedTransactions = useMemo(() => {
    return [...displayTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [displayTransactions]);

  const groupedData = useMemo(() => {
    if (displayTransactions.length === 0) return { dates: [], totals: [] };

    let runningTotal = 0;
    const cumulativeData: { date: string; total: number }[] = [];

    sortedTransactions.forEach((t) => {
      const isDeposit = t.type === "DEPOSIT" || t.type === "Deposit";
      runningTotal += isDeposit ? Number(t.amount) : -Number(t.amount);
      cumulativeData.push({ date: new Date(t.date).toISOString().split("T")[0], total: runningTotal });
    });

    if (cumulativeData.length === 1) {
        const firstDate = new Date(cumulativeData[0].date);
        const dayBefore = new Date(firstDate);
        dayBefore.setDate(firstDate.getDate() - 1);
        return {
            dates: [dayBefore.toISOString().split('T')[0], cumulativeData[0].date],
            totals: [0, cumulativeData[0].total]
        };
    }

    return {
        dates: cumulativeData.map(d => d.date),
        totals: cumulativeData.map(d => d.total)
    };
  }, [sortedTransactions, displayTransactions.length]);

  const chartData = {
    labels: groupedData.dates,
    datasets: [
      {
        label: "Savings Progress",
        data: groupedData.totals,
        fill: false,
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderColor: "rgba(59, 130, 246, 1)",
        tension: 0.1,
      },
    ],
  };

  const recentTransactions = useMemo(() => {
    return [...displayTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [displayTransactions]);

  if (isAuthLoading || isUserLoading) {
      return <p className="p-6 text-center text-gray-500">Loading...</p>;
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col space-y-6">
      {isDemoMode && (
        <div className="mb-4 p-3 text-center bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
          Showing Demo Data. <Link href="#" className="font-bold underline">Sign in</Link> or <Link href="#" className="font-bold underline">Sign up</Link> to manage your savings.
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
          <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center justify-center gap-2"><DollarSign size={20}/> Total Balance</h2>
          <p className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">${totalBalance.toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={20}/> Savings Progress</h2>
            <div className="flex-grow h-80 md:h-96 w-full">
              <Line data={chartData} options={{
                   responsive: true, 
                   maintainAspectRatio: false, 
                   plugins: { 
                       tooltip: { 
                           callbacks: { 
                               label: function(context) { 
                                   let label = context.dataset.label || '';
                                   if (label) { label += ': '; }
                                   if (context.parsed.y !== null) {
                                       label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                                   }
                                   return label;
                               }
                           }
                       }
                    }
               }} />
            </div>
          </div>

          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col">
              <div className="p-6 border-b dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Manage Savings</h2>
                <div className="space-y-4">
                    <div className="relative">
                        <label htmlFor="savingsAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                        <div className="flex items-center">
                            <span className="absolute left-3 text-gray-500 dark:text-gray-400">$</span>
                            <input
                                type="number"
                                id="savingsAmount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="pl-7 p-2 border border-gray-300 rounded-md shadow-sm w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                disabled={isDemoMode}
                                min="0" step="0.01"
                            />
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button
                        onClick={() => handleAddTransaction("Deposit")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-md transition-colors ${isDemoMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                        disabled={isDemoMode}
                        >
                        <PlusCircle size={18} /> Deposit
                        </button>
                        <button
                        onClick={() => handleAddTransaction("Withdraw")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-white rounded-md transition-colors ${isDemoMode ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                        disabled={isDemoMode}
                        >
                        <MinusCircle size={18} /> Withdraw
                        </button>
                    </div>
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Transactions</h2>
                <div className="flex-grow">
                    {displayTransactions.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                            {isDemoMode ? "No demo transactions available." : "No transactions recorded yet."}
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700 -mx-6 px-6">
                        {recentTransactions.map((transaction, index) => (
                            <li key={index} className="flex flex-wrap justify-between items-center py-3 gap-2">
                                <span className={`font-semibold text-sm ${ 
                                  (transaction.type === "Deposit" || transaction.type === "DEPOSIT") 
                                    ? "text-green-600 dark:text-green-400" 
                                    : "text-red-600 dark:text-red-400" 
                                }`}>
                                    {transaction.type === "DEPOSIT" ? "Deposit" : transaction.type === "WITHDRAW" ? "Withdraw" : transaction.type}
                                </span>
                                <span className="text-md font-medium text-gray-800 dark:text-white">${Number(transaction.amount).toFixed(2)}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(transaction.date).toLocaleDateString()} - {new Date(transaction.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit'})}
                                </span>
                            </li>
                        ))}
                        </ul>
                    )}
                </div>
                
                {!isDemoMode && displayTransactions.length > 0 && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-700 text-center">
                        <button
                            onClick={handleClearTransactions}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isDemoMode ? 'text-gray-400 bg-gray-200 cursor-not-allowed' : 'text-red-600 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900 dark:hover:bg-red-800'}`}
                            disabled={isDemoMode}
                        >
                            <Trash2 size={16} className="inline mr-1"/> Clear All Transactions
                        </button>
                    </div>
                )}
              </div>
          </div>
      </div> 

      {/* Add the confirmation modal for clearing transactions */}
      {transactionsToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Confirm Clear All</h2>
              <button
                onClick={handleCancelClear}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 text-center">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to clear all transactions?
                <br />
                <span className="text-sm text-red-600 dark:text-red-400">(This action cannot be undone)</span>
              </p>
            </div>

            <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
              <button
                onClick={handleCancelClear}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
