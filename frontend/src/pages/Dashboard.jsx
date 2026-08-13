import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import AddExpense from "../components/AddExpense";
import Transcation from "../components/Transcation";
import CreateRoom from "../components/CreateRoom";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.error) {
      toast.error(location.state.error);

      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className=" bg-slate-100 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Expense Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your daily expenses</p>
        </div>

        <div>
          <AddExpense />
        </div>
      </div>

      <div>
        <Transcation />
      </div>
    </div>
  );
}
