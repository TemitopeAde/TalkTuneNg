import { ChevronDown, ChevronLeft, Edit3, Play, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import ProgressSlider from "./ProgressSlider";
import PrimaryBtn from "./buttons/PrimaryBtn";
import { useHighlighter } from "@/hooks/useHighlighter";
import { useStore } from "@/hooks/useStore";
import Project from "./Project";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Script, VoiceSettings } from "@/types";
import { updateScript } from "@/actions/updateScript";
import { useUserStore } from "@/store/useUserStore";
import { generateAudio } from "@/actions/generateAudio";
import { useSession } from "next-auth/react";

interface EditProjectProps {
  script: Script;
  voiceSettings?: VoiceSettings;
  voiceModelId?: string;
}

const EditProject = ({ script, voiceSettings: initialVoiceSettings, voiceModelId }: EditProjectProps) => {
  const [model, setModel] = useState<string | undefined>();
  const [openSettings, setOpenSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(script.audioFileUrl);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { onOpen, onClose } = useStore();
  const { user } = useUserStore();
  const { data: session } = useSession();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [voiceModelImage, setVoiceModelImage] = useState<string>("/images/dummy2.png");

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(
    initialVoiceSettings || {
      gender: "MALE",
      age: "YOUNG_ADULT",
      language: "english",
      mood: "ANXIOUS",
    }
  );

  const [controls, setControls] = useState({
    pitch: 30,
    tone: 30,
    volume: 50,
    speed: 60,
  });

  const {
    isHighlighting,
    currentHighlight,
    handleSelection,
    toggleHighlighting,
    clearHighlight,
    updateHighlightedText,
  } = useHighlighter();

  const [update, setUpdate] = useState("");
  const [projectName, setProjectName] = useState(script.projectName);
  const [articleContent, setArticleContent] = useState(script.content);
  const [audioProgress, setAudioProgress] = useState<number>(0);

  useEffect(() => {
    if (currentHighlight) {
      setUpdate(currentHighlight);
    } else {
      setUpdate("");
    }
  }, [currentHighlight]);

  // Setup audio time tracking for word highlighting
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        setAudioProgress(progress);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const handleBack = () => {
    onOpen("modal", <Project script={script} />);
  };

  const handleUpdateHighlight = () => {
    setOpenSettings(false);
    if (!currentHighlight || !update.trim()) return;

    const updatedContent = articleContent.replace(
      currentHighlight,
      update.trim()
    );
    setArticleContent(updatedContent);

    updateHighlightedText(update.trim());

    setUpdate("");
  };

  const handleReset = () => {
    clearHighlight();
    setUpdate("");
  };

  const handleToggleHighlight = () => {
    setOpenSettings(false);

    // Pause audio when entering highlighting mode
    if (!isHighlighting && audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      toast.info("Audio paused - highlighting mode enabled");
    }

    toggleHighlighting();
  };

  const handleOpenSettings = () => {
    if (currentHighlight) {
      return toast.info("Save your highlight before you open the settings");
    }
    setOpenSettings(!openSettings);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSliderChange = (value: number) => {
    if (!audioRef.current) return;
    const time = (value / 100) * duration;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleGenerateAudio = async () => {
    if (!articleContent.trim()) {
      toast.error("Please enter some content to generate audio");
      return;
    }

    setIsGeneratingAudio(true);

    try {
      const result = await generateAudio(
        articleContent,
        voiceSettings,
        script.id,
        voiceModelId
      );

      if (result.success && result.audioFileUrl) {
        setAudioUrl(result.audioFileUrl);
        toast.success("Audio generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate audio");
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      toast.error("An error occurred while generating audio");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleSave = async () => {
    // Check if user is logged in via JWT or NextAuth
    const isAuthenticated = user?.id || session?.user;

    if (!isAuthenticated) {
      toast.error("You must be logged in to save changes");
      return;
    }

    // Get the user ID from either auth method
    const userId = user?.id || parseInt(session?.user?.id || "0");

    if (currentHighlight) {
      toast.info("Please save or cancel your current highlight before saving the project");
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateScript({
        scriptId: script.id,
        userId: userId,
        projectName: projectName,
        content: articleContent,
      });

      if (result.success && result.data) {
        // Update the script object with new data
        const updatedScript = {
          ...script,
          projectName: result.data.projectName,
          content: result.data.content,
          audioFileUrl: audioUrl,
          audioGenerated: !!audioUrl,
          updatedAt: result.data.updatedAt.toString(),
        };

        toast.success("Script saved successfully!");

        // Close the editor
        onClose();
      } else {
        toast.error(result.error || "Failed to save script");
      }
    } catch (error) {
      console.error("Error saving script:", error);
      toast.error("An error occurred while saving the script");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  // Load voice model image based on voiceModelId
  useEffect(() => {
    if (voiceModelId) {
      // YarnGPT Voice Models
      const voiceModels = [
        { id: "idera", image: "/images/models/Idera - Melodic and Gentle.jpeg" },
        { id: "emma", image: "/images/models/Emma - Authoritative & deep.jpeg" },
        { id: "zainab", image: "/images/models/Zainab - soothing & gentle.jpeg" },
        { id: "osagie", image: "/images/models/Osagie - smooth & calm.jpeg" },
        { id: "wura", image: "/images/models/Wura - young & sweet.jpeg" },
        { id: "jude", image: "/images/models/Jude - warm & confident.jpeg" },
        { id: "chinenye", image: "/images/models/Chinenye - Engaging & warm.jpeg" },
        { id: "tayo", image: "/images/models/Tayo - Upbeat, energetic.jpeg" },
        { id: "regina", image: "/images/models/Regina - Mature, warm.jpeg" },
        { id: "femi", image: "/images/models/Femi - rich, assuring.jpeg" },
        { id: "adaora", image: "/images/models/Adaora - warm, engaging.jpeg" },
        { id: "umar", image: "/images/models/Umar - Calm, smooth.jpeg" },
        { id: "mary", image: "/images/models/Mary.jpeg" },
        { id: "nonso", image: "/images/models/Nonso.jpeg" },
        { id: "remi", image: "/images/models/Remi - melodious, warm.jpeg" },
        { id: "adam", image: "/images/models/Adam-deep, clear.jpeg" }
      ];

      const selectedModel = voiceModels.find(model => model.id === voiceModelId);
      if (selectedModel?.image) {
        setVoiceModelImage(selectedModel.image);
      }
    }
  }, [voiceModelId]);

  // Automatically generate audio when script loads if not already generated
  useEffect(() => {
    if (!script.audioGenerated && initialVoiceSettings) {
      handleGenerateAudio();
    }
  }, []);

  return (
    <div className="w-full h-full overflow-hidden mt-4">
      <button
        onClick={handleBack}
        className="mr-6 p-2 m-4 rounded-full bg-gray-700 hover:bg-gray-600"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <div
        style={{
          scrollbarWidth: "none",
        }}
        className="flex-1 overflow-y-auto h-full pb-32 px-4"
      >
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full h-[56px] text-2xl bg-transparent outline-none font-medium"
        />

        <div className="px-4 mb-4 w-full ring-1 mt-6 ring-[#8CBE41] py-2 rounded-md bg-[#8CBE4120] flex space-y-2 flex-col">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleToggleHighlight}
              className={`h-10 w-10 flex-shrink-0 justify-center items-center flex rounded-full transition-colors ${isHighlighting
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-700 hover:bg-gray-600"
                }`}
              title={
                isHighlighting ? "Stop highlighting" : "Start highlighting"
              }
            >
              <Edit3 className="h-5 w-5" />
            </button>

            {isHighlighting && (
              <span className="text-sm text-green-600 font-medium">
                Highlighting mode ON - Select text to edit
              </span>
            )}
          </div>

          <article
            onMouseUp={handleSelection}
            className={`${isHighlighting ? "cursor-text select-text" : ""
              } leading-relaxed`}
          >
            {isPlaying && !isHighlighting ? (
              // Render with word-by-word highlighting when playing
              articleContent.split(' ').map((word, index) => {
                const wordProgress = (index / articleContent.split(' ').length) * 100;
                const isHighlighted = audioProgress >= wordProgress;
                const isBeingRead = audioProgress >= wordProgress && audioProgress < ((index + 1) / articleContent.split(' ').length) * 100;

                return (
                  <span
                    key={index}
                    className={`transition-all duration-200 ${isBeingRead
                        ? 'font-bold text-white bg-green-600/30 px-1 rounded'
                        : isHighlighted
                          ? 'font-semibold text-white'
                          : 'text-white/60 font-normal'
                      }`}
                  >
                    {word}{' '}
                  </span>
                );
              })
            ) : (
              // Normal rendering when not playing
              articleContent
            )}
          </article>
        </div>

        {/* Audio Player Section */}
        <div className="px-4 mb-4 w-full ring-1 ring-[#8CBE41] py-2 rounded-md bg-[#8CBE4120] flex items-center">
          {isGeneratingAudio ? (
            <div className="flex items-center justify-center w-full py-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#8CBE41] mr-2" />
              <span className="text-gray-300">Generating audio...</span>
            </div>
          ) : audioUrl ? (
            <>
              <div className="flex space-x-2 items-center mr-4">
                <div className="relative h-12 w-12 flex-shrink flex">
                  <Image
                    src={voiceModelImage}
                    alt="Voice Model"
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <button
                  onClick={handlePlayPause}
                  className="w-6 h-6 mr-3 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <Play fill="currentColor" className="w-3 h-3 text-white ml-0.5" />
                </button>
              </div>
              <ProgressSlider
                value={(currentTime / duration) * 100 || 0}
                max={100}
                onChange={handleSliderChange}
                isPlaying={isPlaying}
                playbackProgress={(currentTime / duration) * 100 || 0}
              />
              <audio ref={audioRef} src={audioUrl} className="hidden" />
            </>
          ) : (
            <div className="flex items-center justify-center w-full py-2">
              <span className="text-gray-400">No audio generated yet</span>
            </div>
          )}

          <button
            onClick={handleOpenSettings}
            className="p-2 ml-2 rounded-full bg-gray-700 hover:bg-gray-600"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7H6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 17H9"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18 17H21"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 7H21"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 7C6 6.06812 6 5.60218 6.15224 5.23463C6.35523 4.74458 6.74458 4.35523 7.23463 4.15224C7.60218 4 8.06812 4 9 4C9.93188 4 10.3978 4 10.7654 4.15224C11.2554 4.35523 11.6448 4.74458 11.8478 5.23463C12 5.60218 12 6.06812 12 7C12 7.93188 12 8.39782 11.8478 8.76537C11.6448 9.25542 11.2554 9.64477 10.7654 9.84776C10.3978 10 9.93188 10 9 10C8.06812 10 7.60218 10 7.23463 9.84776C6.74458 9.64477 6.35523 9.25542 6.15224 8.76537C6 8.39782 6 7.93188 6 7Z"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M12 17C12 16.0681 12 15.6022 12.1522 15.2346C12.3552 14.7446 12.7446 14.3552 13.2346 14.1522C13.6022 14 14.0681 14 15 14C15.9319 14 16.3978 14 16.7654 14.1522C17.2554 14.3552 17.6448 14.7446 17.8478 15.2346C18 15.6022 18 16.0681 18 17C18 17.9319 18 18.3978 17.8478 18.7654C17.6448 19.2554 17.2554 19.6448 16.7654 19.8478C16.3978 20 15.9319 20 15 20C14.0681 20 13.6022 20 13.2346 19.8478C12.7446 19.6448 12.3552 19.2554 12.1522 18.7654C12 18.3978 12 17.9319 12 17Z"
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
          </button>
        </div>

        {openSettings && (
          <div className="md:mb-20 space-y-4">
            {/* Voice Settings */}
            <div className="px-4 py-3 w-full ring-1 ring-[#8CBE41] rounded-md bg-[#8CBE4120]">
              <h3 className="font-semibold text-white mb-3">Voice Settings</h3>

              <div className="space-y-3">
                {/* Gender */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Gender</label>
                  <select
                    value={voiceSettings.gender}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, gender: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/10 rounded border border-[#8CBE41] text-white outline-none"
                  >
                    <option value="MALE" className="bg-gray-800">Male</option>
                    <option value="FEMALE" className="bg-gray-800">Female</option>
                    <option value="KID" className="bg-gray-800">Kid</option>
                  </select>
                </div>

                {/* Age */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Age</label>
                  <select
                    value={voiceSettings.age}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, age: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/10 rounded border border-[#8CBE41] text-white outline-none"
                  >
                    <option value="CHILD" className="bg-gray-800">Child</option>
                    <option value="TEENAGER" className="bg-gray-800">Teenager</option>
                    <option value="YOUNG_ADULT" className="bg-gray-800">Young Adult</option>
                    <option value="ELDERLY_45_65" className="bg-gray-800">Elderly (45-65)</option>
                    <option value="OLD_70_PLUS" className="bg-gray-800">Old (70+)</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Language</label>
                  <select
                    value={voiceSettings.language}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, language: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/10 rounded border border-[#8CBE41] text-white outline-none"
                  >
                    <option value="english" className="bg-gray-800">English</option>
                    <option value="french" className="bg-gray-800">French</option>
                    <option value="spanish" className="bg-gray-800">Spanish</option>
                    <option value="german" className="bg-gray-800">German</option>
                    <option value="italian" className="bg-gray-800">Italian</option>
                    <option value="portuguese" className="bg-gray-800">Portuguese</option>
                    <option value="chinese" className="bg-gray-800">Chinese</option>
                    <option value="arabic" className="bg-gray-800">Arabic</option>
                    <option value="hindi" className="bg-gray-800">Hindi</option>
                    <option value="hausa" className="bg-gray-800">Hausa</option>
                    <option value="japanese" className="bg-gray-800">Japanese</option>
                    <option value="korean" className="bg-gray-800">Korean</option>
                    <option value="russian" className="bg-gray-800">Russian</option>
                  </select>
                </div>

                {/* Mood */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Mood</label>
                  <select
                    value={voiceSettings.mood}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, mood: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white/10 rounded border border-[#8CBE41] text-white outline-none"
                  >
                    <option value="ANGRY" className="bg-gray-800">Angry</option>
                    <option value="HAPPY" className="bg-gray-800">Happy</option>
                    <option value="ANXIOUS" className="bg-gray-800">Anxious</option>
                    <option value="DRAMA" className="bg-gray-800">Drama</option>
                    <option value="SURPRISED" className="bg-gray-800">Surprised</option>
                    <option value="SCARED" className="bg-gray-800">Scared</option>
                    <option value="LAX" className="bg-gray-800">Lax</option>
                    <option value="SAD" className="bg-gray-800">Sad</option>
                    <option value="EXCITED" className="bg-gray-800">Excited</option>
                    <option value="DISAPPOINTED" className="bg-gray-800">Disappointed</option>
                    <option value="STRICT" className="bg-gray-800">Strict</option>
                  </select>
                </div>
              </div>


              <button
                onClick={handleGenerateAudio}
                disabled={isGeneratingAudio}
                className="mt-4 w-full py-2 bg-[#8CBE41] text-white rounded hover:bg-[#7CAD35] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGeneratingAudio ? "Regenerating..." : "Regenerate Audio"}
              </button>
            </div>

            {/* Audio Controls (Pitch, Tone, Volume, Speed - for future enhancement) */}
            <div className="px-4 py-3 w-full ring-1 ring-[#8CBE41] rounded-md bg-[#8CBE4120]">
              <h3 className="font-semibold text-white mb-3">Audio Controls</h3>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-6">
                  <span className="font-semibold min-w-[60px]">Pitch</span>
                  <ProgressSlider
                    value={controls.pitch}
                    onChange={(value) =>
                      setControls((prev) => ({
                        ...prev,
                        pitch: value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center space-x-6">
                  <span className="font-semibold min-w-[60px]">Tone</span>
                  <ProgressSlider
                    value={controls.tone}
                    onChange={(value) =>
                      setControls((prev) => ({
                        ...prev,
                        tone: value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center space-x-6">
                  <span className="font-semibold min-w-[60px]">Volume</span>
                  <ProgressSlider
                    value={controls.volume}
                    onChange={(value) =>
                      setControls((prev) => ({
                        ...prev,
                        volume: value,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center space-x-6">
                  <span className="font-semibold min-w-[60px]">Speed</span>
                  <ProgressSlider
                    value={controls.speed}
                    onChange={(value) =>
                      setControls((prev) => ({
                        ...prev,
                        speed: value,
                      }))
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Note: Audio controls are for display. Use voice settings to regenerate audio.
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 rounded-b-md py-2 w-full justify-center flex bg-background/35 backdrop-blur-sm",
          "max-sm:px-4"
        )}
        style={{
          zIndex: 1000,
        }}
      >
        {currentHighlight ? (
          <div className="w-full max-w-4xl">
            <div className="mx-4 px-4 mb-4 w-auto ring-1 ring-[#8CBE41] py-2 rounded-md bg-[#8CBE4120] flex items-center">
              <input
                className="outline-none bg-transparent w-full"
                value={update}
                onChange={(e) => setUpdate(e.target.value)}
                placeholder="Edit the selected text..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUpdateHighlight();
                  } else if (e.key === "Escape") {
                    handleReset();
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-center space-x-8 mt-5">
              <button
                className="p-4 hover:bg-gray-100/10 rounded-md transition-colors"
                onClick={handleReset}
              >
                <span className="text-gray-300 font-medium">Reset</span>
              </button>
              <button
                className="p-4 hover:bg-green-100/10 rounded-md transition-colors disabled:opacity-50"
                onClick={handleUpdateHighlight}
                disabled={!update.trim() || update.trim() === currentHighlight}
              >
                <span className="font-medium text-green-400">Update</span>
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-gray-400">
                Press Enter to update • Press Escape to cancel
              </span>
            </div>
          </div>
        ) : (
          <PrimaryBtn
            style={{ zIndex: 1000 }}
            label={isSaving ? "Saving..." : "Save"}
            onClick={handleSave}
            containerclass="w-[400px] max-w-full"
            disabled={isSaving}
          />
        )}
      </div>
    </div>
  );
};

export default EditProject;
