
"use client";

const WheelPointer = () => {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-12 w-12 drop-shadow-lg translate-x-1/2 z-10 origin-bottom animate-wobble">
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

export default WheelPointer;
