import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setError("Enter your email and password to continue.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/login",
        form,
      );

      console.log(response.data);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      alert("Login Successful!");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen flex bg-ink">
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-ink text-paper">
        <div className="max-w-sm">
          <p className="font-display text-3xl font-semibold leading-tight">
            Know where every dollar went, without the spreadsheet.
          </p>
          <p className="text-paper/60 mt-4 text-sm">
            Ledger keeps a running account of your spending so month-end never
            surprises you.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-paper p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <span className="font-display text-2xl font-semibold text-ink">
              Ledger
            </span>
            <h1 className="font-display text-xl text-ink mt-4">Welcome back</h1>
            <p className="text-sm text-slate mt-1">
              Sign in to see your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-slate">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="you@example.com"
                className="input mt-1"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-slate">Password</span>

              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="••••••••"
                  className="input w-full pr-16"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-moss font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" className="btn-primary w-full">
              Sign In
            </button>
          </form>

          <p className="text-sm text-slate mt-6 text-center">
            New here?{" "}
            <Link to="/register" className="text-moss font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
