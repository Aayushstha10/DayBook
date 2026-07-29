import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  let user = null;

  try {
    const userData = localStorage.getItem("user");

    if (userData && userData !== "undefined") {
      user = JSON.parse(userData);
    }
  } catch (error) {
    console.error("Invalid user data:", error);
    localStorage.removeItem("user");
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logout successfully!");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4 md:px-8">
          <div className="flex items-center gap-3">
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

            {user?.picture ? (
              <img
                src={user.picture}
                alt={user?.name || "User"}
                className="w-10 h-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold uppercase">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}

            <div className="hidden sm:block">
              <p className="text-xs text-gray-500">Welcome</p>
              <h2 className="font-semibold text-gray-800">
                {user?.name || "User"}
              </h2>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </header>
    </>
  );
}
