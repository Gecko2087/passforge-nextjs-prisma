import React from "react";

export const Logo = ({ className = "h-10" }: { className?: string }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 180 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="PassForge Logo"
        >
            {/* Icon */}
            <g transform="translate(0, 4)">
                <rect width="32" height="32" rx="8" fill="#0F172A" />
                <path
                    d="M16 6L6 10V17C6 23 10.5 28 16 29.5C21.5 28 26 23 26 17V10L16 6Z"
                    fill="#1E293B"
                    stroke="#22D3EE"
                    strokeWidth="2"
                />
                <circle cx="16" cy="15" r="3" fill="#22D3EE" />
                <path d="M14.5 17H17.5L17 23H15L14.5 17Z" fill="#22D3EE" />
            </g>

            {/* Text */}
            <text
                x="42"
                y="28"
                fill="#374151"
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="24"
                fontWeight="bold"
                letterSpacing="-0.5"
            >
                PassForge
            </text>
        </svg>
    );
};
