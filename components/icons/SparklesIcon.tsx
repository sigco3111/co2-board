
import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="m12 3-1.9 4.8-4.8 1.9 4.8 1.9 1.9 4.8 1.9-4.8 4.8-1.9-4.8-1.9Z" />
    <path d="M5 21v-2" />
    <path d="M5 5V3" />
    <path d="M21 5v2" />
    <path d="M3 12H1" />
    <path d="M21 12h2" />
    <path d="m18.4 18.4-.8-.8" />
    <path d="m6.4 6.4-.8-.8" />
    <path d="m18.4 5.6-.8.8" />
    <path d="m6.4 17.6-.8.8" />
  </svg>
);
