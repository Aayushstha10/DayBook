import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const Transaction = lazy(() => import("./pages/Transaction.jsx"));
const Room = lazy(() => import("./pages/Room.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* Public */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Protected */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/transaction"
            element={<Transaction />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          {/* ROOM */}
          <Route
            path="/room"
            element={<Room />}
          />

          <Route
            path="/room/:roomId"
            element={<Room />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </Suspense>
  );
}