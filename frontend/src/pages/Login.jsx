import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm({
      ...form,
      [field]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      const response = await axios.post(
        "https://daybook-j903.onrender.com/api/login",
        form,
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", response.data.user.role);

      toast.success("Login Successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid email or password.";

      setError(message);
      toast.error(message);
    }
  };

 const handleGoogleSuccess = async (credentialResponse) => {
  setError("");

  try {
    const response = await axios.post(
      "https://daybook-j903.onrender.com/api/auth/google",
      {
        token: credentialResponse.credential,
      }
    );

    console.log("Google Login Response:", response.data);

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("role", response.data.user.role);

    toast.success("Login Successful!");

    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  } catch (err) {
    const message =
      err.response?.data?.message || "Google sign-in failed.";

    setError(message);
    toast.error(message);
  }
};

  const handleGoogleError = () => {
    toast.error("Google sign-in failed.");
  };

  return (
    <div className="min-h-screen flex bg-ink">
      <ToastContainer />

      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-ink text-paper">
        <div className="max-w-sm">
          <p className="font-display text-3xl font-semibold leading-tight">
            Track every rupee you spend, effortlessly.
          </p>

          <p className="text-paper/60 mt-4 text-sm">
            Daybook keeps your expenses organized, helping you stay on top of
            your budget every day
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-paper p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <span className="font-display text-2xl font-semibold text-ink">
              Daybook
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

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-ink/10" />
            <span className="text-xs text-slate">or</span>
            <div className="h-px flex-1 bg-ink/10" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              width="320"
            />
          </div>

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
