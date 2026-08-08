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
    <div className="bg-slate-100 max-w-xl space-y-6">
      <div className="bg-white rounded-card border border-black/5 shadow-card p-6">
        <div className="flex items-center gap-4 mb-6">
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
                <option value="NPR">NPR (रु)</option>
              </select>
            </Field>
            <Field label="Timezone">
              <select
                value={form.timezone}
                onChange={handleChange("timezone")}
                className="input"
              >
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
