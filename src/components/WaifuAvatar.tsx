export function WaifuAvatar() {
  return (
    <svg
      className="waifu-avatar-svg"
      viewBox="0 0 160 200"
      role="img"
      aria-label="看板娘"
    >
      <defs>
        <linearGradient id="waifu-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="waifu-cloth" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="188" rx="42" ry="8" fill="rgba(15,23,42,0.08)" />
      <path
        d="M38 92c6 46 18 70 42 70s36-24 42-70c-10 10-22 16-42 16s-32-6-42-16z"
        fill="url(#waifu-cloth)"
        stroke="#bfdbfe"
        strokeWidth="2"
      />
      <path d="M68 158h24v10c0 6-4 10-12 10s-12-4-12-10z" fill="#93c5fd" />
      <circle cx="80" cy="78" r="44" fill="#ffe8d6" />
      <path
        d="M36 84c-8-32 10-62 44-64 34-2 54 24 50 58-16-18-34-22-50-22s-32 6-44 28z"
        fill="url(#waifu-hair)"
      />
      <path d="M28 92c8 18 8 36 6 48 10-14 16-30 14-50z" fill="#2563eb" />
      <path d="M132 92c-8 18-8 36-6 48-10-14-16-30-14-50z" fill="#2563eb" />
      <circle className="waifu-eye" cx="64" cy="86" r="5.5" fill="#1e3a8a" />
      <circle className="waifu-eye" cx="96" cy="86" r="5.5" fill="#1e3a8a" />
      <circle cx="66" cy="84" r="1.6" fill="#fff" />
      <circle cx="98" cy="84" r="1.6" fill="#fff" />
      <path d="M74 102c4 5 8 5 12 0" fill="none" stroke="#fb7185" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="54" cy="98" r="5" fill="#fda4af" opacity="0.55" />
      <circle cx="106" cy="98" r="5" fill="#fda4af" opacity="0.55" />
      <path d="M48 58c10-8 18-8 22-4" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
