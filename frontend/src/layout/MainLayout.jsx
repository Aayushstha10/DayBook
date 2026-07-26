import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const titles = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "A quick look at where your money went.",
  },
  "/transactions": {
    title: "Transactions",
    subtitle: "Every expense, searchable and sortable.",
  },
  "/profile": {
    title: "Profile",
    subtitle: "Your account details.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Preferences for how Ledger behaves.",
  },
};

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const meta = titles[location.pathname] || {
    title: "Ledger",
    subtitle: "",
  };

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Navbar */}
        <Navbar
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}