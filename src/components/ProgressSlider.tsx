import React, { useState, useRef, useEffect } from "react";

interface ProgressSliderProps {
  value?: number;
  max?: number;
  onChange?: (value: number) => void;
  isPlaying?: boolean;
  isAdjustable?: boolean;
  playbackProgress?: number;
}

const ProgressSlider: React.FC<ProgressSliderProps> = ({
  value = 0,
  max = 100,
  onChange = () => {},
  isPlaying = false,
  isAdjustable = true,
  playbackProgress = 0,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<number>(value);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Update current value when external value changes (for playback progress)
  useEffect(() => {
    if (!isDragging) {
      setCurrentValue(isPlaying ? playbackProgress : value);
    }
  }, [value, playbackProgress, isPlaying, isDragging]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateValue(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updateValue(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateValue(e.touches[0] as Touch);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    updateValue(e.touches[0]);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const updateValue = (
    event: MouseEvent | React.MouseEvent<HTMLDivElement> | Touch
  ) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = (percentage / 100) * max;

    setCurrentValue(newValue);
    onChange(newValue);
  };

  // Add global event listeners for mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  const progressPercentage = (currentValue / max) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="relative">
        <div
          ref={sliderRef}
          className="relative h-1 rounded-full cursor-pointer overflow-hidden"
          style={{
            background: "linear-gradient(90deg, #ffffff 0%, #e5e7eb 100%)",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              width: `${progressPercentage}%`,
              background: "linear-gradient(90deg, #8CBE41 0%, #0D1E40D1 100%)",
              transition: isDragging ? "none" : "width 0.15s ease-out",
            }}
          />
        </div>
        {isAdjustable && (
          <div
            className={`absolute top-1/2 w-4 h-4 bg-[#01796F] rounded-full shadow-lg cursor-grab active:cursor-grabbing transform -translate-y-1/2 ${
              isDragging ? "scale-110 shadow-xl" : "hover:scale-105"
            }`}
            style={{
              left: `${progressPercentage}%`,
              marginLeft: "-8px",
              boxShadow: isDragging
                ? "0 8px 25px rgba(20, 184, 166, 0.4), 0 0 0 3px rgba(20, 184, 166, 0.2)"
                : "0 4px 12px rgba(0, 0, 0, 0.15)",
              transition: isDragging ? "none" : "transform 0.15s ease-out, box-shadow 0.15s ease-out",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProgressSlider;
