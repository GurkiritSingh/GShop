export function Logo({ size = 36 }: { size?: number }) {
  const scale = size / 36;
  return (
    <svg
      width={size * 3.2}
      height={size}
      viewBox="0 0 115 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="GShop logo"
    >
      {/* Cart icon integrated into the G */}
      <g transform="translate(0, 2)">
        {/* G shape with cart handle */}
        <path
          d="M16 0C7.2 0 0 7.2 0 16s7.2 16 16 16c6.2 0 11.6-3.5 14.2-8.7"
          stroke="url(#gshop-grad1)"
          strokeWidth={3.2 * scale}
          strokeLinecap="round"
          fill="none"
        />
        {/* Cart shelf inside G */}
        <line
          x1="14" y1="16"
          x2="30" y2="16"
          stroke="url(#gshop-grad1)"
          strokeWidth={3.2 * scale}
          strokeLinecap="round"
        />
        {/* Cart handle */}
        <path
          d="M30 16v10"
          stroke="url(#gshop-grad1)"
          strokeWidth={3.2 * scale}
          strokeLinecap="round"
        />
        {/* Cart wheels */}
        <circle cx="12" cy="31" r="2.5" fill="#818cf8" />
        <circle cx="24" cy="31" r="2.5" fill="#818cf8" />
        {/* Small items in cart */}
        <rect x="13" y="10" rx="1.5" ry="1.5" width="5" height="5" fill="#34d399" opacity="0.9" />
        <rect x="20" y="8" rx="1.5" ry="1.5" width="5" height="7" fill="#6366f1" opacity="0.7" />
      </g>

      {/* "Shop" text */}
      <text
        x="38"
        y="27"
        fontFamily="'Inter', system-ui, sans-serif"
        fontSize="26"
        fontWeight="800"
        letterSpacing="-1"
        fill="white"
      >
        Shop
      </text>

      {/* Price tag accent */}
      <g transform="translate(101, 4)">
        <rect x="0" y="0" width="13" height="18" rx="3" fill="#34d399" />
        <circle cx="6.5" cy="6" r="2" fill="white" opacity="0.9" />
        <line x1="3" y1="11" x2="10" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4" y1="14" x2="9" y2="14" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      </g>

      <defs>
        <linearGradient id="gshop-grad1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
    </svg>
  );
}
