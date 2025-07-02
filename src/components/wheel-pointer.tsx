
"use client";

const WheelPointer = () => {
  return (
    <>
      {/* Left Pointer */}
      <svg
        className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 text-primary drop-shadow-lg -translate-x-1/2 z-10"
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="100,50 25,0 25,100" />
      </svg>
      {/* Right Pointer */}
      <svg
        className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 text-primary drop-shadow-lg translate-x-1/2 z-10"
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon points="0,50 75,0 75,100" />
      </svg>
    </>
  );
};

export default WheelPointer;
