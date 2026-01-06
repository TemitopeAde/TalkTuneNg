'use client';

import React from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';


interface AudioPlayerRowProps {
    audioUrl: string;
    audioFileName?: string;
}

const AudioPlayerRow: React.FC<AudioPlayerRowProps> = ({ audioUrl, audioFileName }) => {
    const {
        isPlaying,
        currentTime,
        duration,
        progress,
        isLoading,
        error,
        togglePlay,
        seek,
    } = useAudioPlayer({ audioUrl });

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = (parseFloat(e.target.value) / 100) * duration;
        seek(newTime);
    };

    if (error) {
        return (
            <div className="flex items-center space-x-3">
                <span className="text-red-400 text-sm">Audio error</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-3 w-full max-w-[300px]">
            <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-10 h-10 flex-shrink-0 bg-[#01796F] rounded-full flex items-center justify-center hover:bg-[#02776d] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : isPlaying ? (
                    <Pause fill="currentColor" className="w-4 h-4 text-white" />
                ) : (
                    <Play fill="currentColor" className="w-4 h-4 text-white ml-0.5" />
                )}
            </button>

            <div className="flex-1 flex flex-col space-y-1">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSliderChange}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                        background: `linear-gradient(to right, #01796F ${progress}%, #4B5563 ${progress}%)`,
                    }}
                />
                <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayerRow;