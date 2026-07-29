import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError("Fill in every field.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/signup",
        form,
      );

      console.log(response.data);

      toast.success("Registration Successful!");

      navigate("/");
    } catch (err) {
      console.log(err);

      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-6">
       <ToastContainer />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-semibold text-ink">
            Ledger
          </span>
          <h1 className="font-display text-xl text-ink mt-4">
            Create your account
          </h1>
          <p className="text-sm text-slate mt-1">Takes less than a minute.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white rounded-card border border-black/5 shadow-card p-6"
        >
          <label className="block">
            <span className="text-xs font-medium text-slate">Full name</span>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              className="input mt-1"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={handleChange("email")}
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full">
            Create Account
          </button>
        </form>

        <p className="text-sm text-slate mt-6 text-center">
          Already have an account?{" "}
          <Link to="/" className="text-moss font-medium">
            Sign In
          </Link>
        </p>
       
      </div>
    </div>
  );
}
