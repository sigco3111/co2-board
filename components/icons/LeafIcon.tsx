
import React from 'react';

export const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10z" />
    <path d="M12 2a7 7 0 0 1 7 7h2a10 10 0 0 0-10-9z" />
    <path d="M7 12a5 5 0 0 1 5-5h2a8 8 0 0 0-8 8z" />
  </svg>
);
