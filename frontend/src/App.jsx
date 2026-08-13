import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layout/MainLayout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import Transaction from "./pages/Transaction.jsx";
import Room from "./pages/Room.jsx";

export default function App() {
  return (
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
  );
}