import { useNavigate } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 md:px-8">

        {/* Left Side */}
        <div className="flex items-center gap-3">

          {/* Hamburger (Mobile Only) */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* User */}
          <div className="w-10 h-10 rounded-full bg-moss text-white flex items-center justify-center font-semibold uppercase">
            {user?.name?.charAt(0)}
          </div>

          <div className="hidden sm:block">
            <p className="text-xs text-gray-500">Welcome</p>
            <h2 className="font-semibold text-gray-800">
              {user?.name}
            </h2>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm md:text-base px-3 md:px-5 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}