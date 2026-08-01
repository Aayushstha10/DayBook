export default function SearchBar({
  value,
  onChange,
  placeholder = "Search transactions…",
}) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-black/10 rounded-lg pl-9 pr-3 py-2 text-sm text-ink
          placeholder:text-slate-light focus:border-moss focus:ring-1 focus:ring-moss outline-none"
      />
    </div>
  );
}
