import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp } from './Icons';

const UrgencyBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 animate-gradient">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 animate-pulse" />
            <p className="font-bold text-sm sm:text-base">
              LIMITED TIME: Launch Special - 50% Off First Month
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
            <Clock className="w-4 h-4" />
            <div className="flex items-center gap-1 font-mono font-bold text-sm">
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span>:</span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrgencyBanner;
