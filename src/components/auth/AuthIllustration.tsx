type Props = {
  src?: string
  alt: string
}

export default function AuthIllustration({ src, alt }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="max-h-[560px] w-full max-w-[640px] object-contain"
      />
    )
  }

  return <AdminIllustration alt={alt} />
}

function AdminIllustration({ alt }: { alt: string }) {
  return (
    <svg
      role="img"
      aria-label={alt}
      viewBox="0 0 600 540"
      className="h-auto w-full max-w-[600px]"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background decorative shapes */}
      <circle cx="500" cy="80" r="130" fill="#FF5B03" opacity="0.08" />
      <circle cx="80" cy="460" r="90" fill="#FF5B03" opacity="0.06" />

      {/* Dotted accent — top left */}
      <g fill="#FF5B03" opacity="0.35">
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <circle
              key={`${row}-${col}`}
              cx={32 + col * 14}
              cy={60 + row * 14}
              r={2}
            />
          )),
        )}
      </g>

      {/* Floating product tag — top left */}
      <g transform="translate(50, 200)">
        <rect
          x="0"
          y="0"
          width="100"
          height="44"
          rx="10"
          fill="white"
          stroke="#e5e7eb"
        />
        <rect
          x="0"
          y="0"
          width="100"
          height="44"
          rx="10"
          fill="black"
          opacity="0.03"
        />
        <circle cx="16" cy="22" r="6" fill="#FF5B03" />
        <text
          x="13"
          y="26"
          fontSize="9"
          fontWeight="700"
          fill="white"
          fontFamily="Inter, system-ui, sans-serif"
        >
          $
        </text>
        <rect x="32" y="14" width="50" height="6" rx="3" fill="#1f2937" />
        <rect x="32" y="26" width="38" height="5" rx="2.5" fill="#d1d5db" />
      </g>

      {/* Main dashboard card */}
      <g transform="translate(110, 80)">
        {/* Shadow */}
        <rect
          x="4"
          y="6"
          width="400"
          height="300"
          rx="16"
          fill="black"
          opacity="0.06"
        />
        {/* Window */}
        <rect
          x="0"
          y="0"
          width="400"
          height="300"
          rx="16"
          fill="white"
          stroke="#e5e7eb"
        />

        {/* Top bar */}
        <rect x="0" y="0" width="400" height="36" rx="16" fill="#f9fafb" />
        <rect x="0" y="18" width="400" height="18" fill="#f9fafb" />
        <line x1="0" y1="36" x2="400" y2="36" stroke="#e5e7eb" />
        <circle cx="20" cy="18" r="4" fill="#ef4444" />
        <circle cx="36" cy="18" r="4" fill="#fbbf24" />
        <circle cx="52" cy="18" r="4" fill="#22c55e" />
        <rect x="160" y="12" width="120" height="12" rx="6" fill="#e5e7eb" />

        {/* Sidebar */}
        <rect x="0" y="36" width="84" height="264" fill="#f9fafb" />
        <line x1="84" y1="36" x2="84" y2="300" stroke="#e5e7eb" />

        {/* Logo block in sidebar */}
        <rect x="16" y="50" width="52" height="14" rx="4" fill="#FF5B03" />

        {/* Sidebar nav items */}
        <g>
          <rect x="12" y="84" width="60" height="20" rx="6" fill="#FF5B03" opacity="0.12" />
          <rect x="20" y="91" width="44" height="6" rx="3" fill="#FF5B03" />
          <rect x="12" y="112" width="60" height="18" rx="6" fill="transparent" />
          <rect x="20" y="119" width="40" height="5" rx="2.5" fill="#9ca3af" />
          <rect x="20" y="143" width="48" height="5" rx="2.5" fill="#9ca3af" />
          <rect x="20" y="167" width="36" height="5" rx="2.5" fill="#9ca3af" />
          <rect x="20" y="191" width="44" height="5" rx="2.5" fill="#9ca3af" />
          <rect x="20" y="215" width="40" height="5" rx="2.5" fill="#9ca3af" />
        </g>

        {/* Main content area */}
        {/* Title */}
        <rect x="104" y="56" width="120" height="12" rx="6" fill="#1f2937" />
        <rect x="104" y="74" width="180" height="6" rx="3" fill="#d1d5db" />

        {/* KPI cards */}
        <g transform="translate(104, 100)">
          <rect
            x="0"
            y="0"
            width="88"
            height="52"
            rx="10"
            fill="#fff7ed"
            stroke="#fed7aa"
          />
          <circle cx="14" cy="14" r="6" fill="#FF5B03" />
          <rect x="10" y="28" width="40" height="10" rx="5" fill="#1f2937" />
          <rect x="10" y="42" width="24" height="5" rx="2.5" fill="#9ca3af" />

          <rect
            x="98"
            y="0"
            width="88"
            height="52"
            rx="10"
            fill="#eff6ff"
            stroke="#bfdbfe"
          />
          <circle cx="112" cy="14" r="6" fill="#3b82f6" />
          <rect x="108" y="28" width="40" height="10" rx="5" fill="#1f2937" />
          <rect x="108" y="42" width="32" height="5" rx="2.5" fill="#9ca3af" />

          <rect
            x="196"
            y="0"
            width="88"
            height="52"
            rx="10"
            fill="#f0fdf4"
            stroke="#bbf7d0"
          />
          <circle cx="210" cy="14" r="6" fill="#22c55e" />
          <rect x="206" y="28" width="40" height="10" rx="5" fill="#1f2937" />
          <rect x="206" y="42" width="28" height="5" rx="2.5" fill="#9ca3af" />
        </g>

        {/* Bar chart */}
        <g transform="translate(104, 170)">
          <line x1="0" y1="100" x2="288" y2="100" stroke="#e5e7eb" />
          <line x1="0" y1="70" x2="288" y2="70" stroke="#f3f4f6" strokeDasharray="2 3" />
          <line x1="0" y1="40" x2="288" y2="40" stroke="#f3f4f6" strokeDasharray="2 3" />
          {[
            { x: 8, h: 42 },
            { x: 44, h: 62 },
            { x: 80, h: 78 },
            { x: 116, h: 52 },
            { x: 152, h: 70 },
            { x: 188, h: 92 },
            { x: 224, h: 74 },
            { x: 260, h: 86 },
          ].map((b) => (
            <g key={b.x}>
              <rect
                x={b.x}
                y={100 - b.h}
                width="20"
                height={b.h}
                rx="3"
                fill="#FF5B03"
              />
              <rect
                x={b.x}
                y={100 - b.h - 6}
                width="20"
                height="6"
                fill="#3b82f6"
                opacity="0.7"
              />
            </g>
          ))}
        </g>
      </g>

      {/* Live stream phone — front layer, overlapping bottom right */}
      <g transform="translate(380, 280)">
        {/* Shadow */}
        <rect
          x="6"
          y="8"
          width="140"
          height="220"
          rx="22"
          fill="black"
          opacity="0.12"
        />
        {/* Phone body */}
        <rect
          x="0"
          y="0"
          width="140"
          height="220"
          rx="22"
          fill="#111827"
        />
        {/* Screen */}
        <rect
          x="6"
          y="6"
          width="128"
          height="208"
          rx="16"
          fill="#FF5B03"
        />
        {/* Subtle gradient/overlay using opacity */}
        <rect
          x="6"
          y="6"
          width="128"
          height="208"
          rx="16"
          fill="black"
          opacity="0.12"
        />

        {/* Notch */}
        <rect x="55" y="6" width="30" height="6" rx="3" fill="#111827" />

        {/* LIVE badge */}
        <g transform="translate(14, 22)">
          <rect x="0" y="0" width="48" height="20" rx="10" fill="#ef4444" />
          <circle cx="11" cy="10" r="3" fill="white" />
          <text
            x="20"
            y="14"
            fontSize="10"
            fontWeight="700"
            fill="white"
            fontFamily="Inter, system-ui, sans-serif"
          >
            LIVE
          </text>
        </g>

        {/* Viewer pill */}
        <g transform="translate(80, 22)">
          <rect x="0" y="0" width="46" height="20" rx="10" fill="black" opacity="0.4" />
          <circle cx="10" cy="10" r="3" fill="white" />
          <text
            x="18"
            y="14"
            fontSize="10"
            fontWeight="600"
            fill="white"
            fontFamily="Inter, system-ui, sans-serif"
          >
            234
          </text>
        </g>

        {/* Play / avatar circle */}
        <circle cx="70" cy="108" r="28" fill="white" opacity="0.92" />
        <polygon points="62,96 62,120 84,108" fill="#FF5B03" />

        {/* Chat bubbles */}
        <g transform="translate(14, 158)">
          <rect x="0" y="0" width="90" height="14" rx="7" fill="white" opacity="0.95" />
          <rect x="6" y="4" width="60" height="6" rx="3" fill="#1f2937" />

          <rect x="0" y="20" width="70" height="14" rx="7" fill="white" opacity="0.85" />
          <rect x="6" y="24" width="50" height="6" rx="3" fill="#1f2937" />

          <rect x="0" y="40" width="100" height="14" rx="7" fill="white" opacity="0.95" />
          <rect x="6" y="44" width="76" height="6" rx="3" fill="#FF5B03" />
        </g>
      </g>

      {/* Floating peso coin — bottom left */}
      <g transform="translate(120, 420)">
        <circle cx="0" cy="0" r="24" fill="white" stroke="#e5e7eb" />
        <circle cx="0" cy="0" r="24" fill="#FF5B03" opacity="0.08" />
        <text
          x="0"
          y="6"
          fontSize="20"
          fontWeight="700"
          fill="#FF5B03"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
        >
          $
        </text>
      </g>
    </svg>
  )
}
