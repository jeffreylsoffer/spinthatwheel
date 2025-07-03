
"use client";
import React from 'react';

const WheelPointer = () => {
  return (
    <div className="absolute -right-4 top-1/2 -translate-y-1/2 h-12 w-12 drop-shadow-lg z-10">
      <svg
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <polygon points="0,50 75,0 75,100" />
      </svg>
    </div>
  );
};

export default React.memo(WheelPointer);
