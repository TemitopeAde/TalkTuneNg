import { useEffect, useRef, useState } from "react";

export const useProgressSlider = () => {

  const [sliderValue, setSliderValue] = useState<number>(25);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);

  // Simulate music playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackProgress((prev: number) => {
          const newValue = prev + 0.5;
          if (newValue >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return newValue;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSliderChange = (value: number): void => {
    setSliderValue(value);
    if (isPlaying) {
      setPlaybackProgress(value);
    }
  };

  const togglePlayback = (): void => {
    if (!isPlaying && playbackProgress >= 100) {
      setPlaybackProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const resetProgress = (): void => {
    setPlaybackProgress(0);
    setSliderValue(0);
    setIsPlaying(false);
  };

  return {
    value: sliderValue,
    isPlaying,
    playbackProgress,
    handleSliderChange,
    togglePlayback,
    resetProgress,
  };
};
