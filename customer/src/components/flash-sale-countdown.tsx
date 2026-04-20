import React, { useEffect, useState } from "react";

interface FlashSaleCountdownProps {
  initialMinutes: number;
}

export const FlashSaleCountdown: React.FC<FlashSaleCountdownProps> = ({
  initialMinutes,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const pad = (num: number) => num.toString().padStart(2, "0");
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <span className="bg-red-100 text-red-600 font-bold px-2 py-1 rounded text-sm">
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
};
