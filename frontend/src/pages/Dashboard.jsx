import { useMemo, useState } from "react";
import AddExpense from "../components/AddExpense";
import Transcation from "../components/Transcation";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Expense Dashboard</h1>

          <p className="text-gray-500 mt-1">Manage your daily expenses</p>
        </div>

        <div>
          <AddExpense></AddExpense>
        </div>
      </div>
      <div>
        <Transcation />
      </div>
    </div>
  );
}
