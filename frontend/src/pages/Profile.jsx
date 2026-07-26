import { useState } from "react";

export default function Profile() {
  const [form, setForm] = useState("");
  const [saved, setSaved] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
  };
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white rounded-card border border-black/5 shadow-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-moss text-white flex items-center justify-center font-display text-xl font-semibold">
            {user?.name
              ?.split(" ")
              .map((word) => word.charAt(0))
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink">
              {user?.name}
            </p>
            <p className="text-sm text-slate">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name">
            <input
              type="text"
              value={user?.name}
              onChange={handleChange("name")}
              className="input"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={user?.email}
              onChange={handleChange("email")}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Currency">
              <select
                value={form.currency}
                onChange={handleChange("currency")}
                className="input"
              >
                {/* <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option> */}
                <option value="NPR">NPR (रु)</option>
              </select>
            </Field>
            <Field label="Timezone">
              <select
                value={form.timezone}
                onChange={handleChange("timezone")}
                className="input"
              >
                {/* <option value="America/New_York">Eastern Time</option>
                <option value="America/Los_Angeles">Pacific Time</option> */}
                <option value="Asia/Kathmandu">Kathmandu</option>
                {/* <option value="Europe/London">London</option> */}
              </select>
            </Field>
          </div>

          {/* <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary">
              Save changes
            </button>
            {saved && <span className="text-sm text-moss">Saved.</span>}
          </div> */}
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
