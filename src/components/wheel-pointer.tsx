"use client";

const WheelPointer = () => {
  return (
    <div className="absolute -right-4 top-1/2 -translate-y-1/2 h-12 w-12 drop-shadow-lg z-10">
      <svg
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <polygon points="100,50 25,0 25,100" />
      </svg>
    </div>
  );
};

export default WheelPointer;
