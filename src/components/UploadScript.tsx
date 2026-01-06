'use client';

import "react-circular-progressbar/dist/styles.css";

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Upload, Play, ChevronLeft, ChevronRight, Pause } from "lucide-react";
import Image from "next/image";
import { Textarea } from "./ui/textarea";
import PrimaryBtn from "./buttons/PrimaryBtn";
import ProgressSlider from "./ProgressSlider";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { useStore } from "@/hooks/useStore";
import { useUploadScript } from "@/hooks/scripts/useScript";
import { generateAudio } from "@/actions/generateAudio";
import EditProject from "./EditProject";
import { Script, VoiceModel, VoiceSettings } from "@/types"
import { toast } from "sonner";
import { translateText } from "@/utils/translate";
import { useUserStore } from "@/store/useUserStore";
import { useSession } from "next-auth/react";

const percentage = 66;

const tabs = [
  { id: "Manual", label: "Manual" },
  { id: "Upload", label: "Upload" },
];

interface ProjectData {
  name: string;
  language: string;
  content: string;
  script: File | null;
  voiceModelId: string | null;
  voiceSettings: VoiceSettings;
}

interface ApiVoiceModel {
  id: string;
  name: string;
  category: string;
  gender: string;
  age: string;
  accent: string;
  previewUrl: string;
}

interface VoiceModelDisplay {
  id: string;
  name: string;
  description: string;
  image?: string;
}

// Move components outside to prevent re-creation on each render
const ProgressBar = React.memo<{ step: number }>(({ step }) => (
  <div className="flex items-center justify-center mb-8">
    {[1, 2, 3, 4].map((i) => (
      <React.Fragment key={i}>
        <div
          className={`h-1 w-16 rounded-full ${i <= step
            ? "bg-gradient-to-r from-[#8CBE41] to-background"
            : "bg-white"
            }`}
        />
        {i < 4 && <div className="w-4" />}
      </React.Fragment>
    ))}
  </div>
));

const ScrollIndicator = React.memo<{ show: boolean }>(({ show }) => (
  <div
    className={`absolute bottom-0 left-0 right-0 h-20 pointer-events-none transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'
      }`}
    style={{
      background: 'linear-gradient(to top, rgba(13, 30, 64, 0.95), transparent)'
    }}
  >
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
      <ChevronDown className="w-6 h-6 text-white animate-bounce" />
      <span className="text-white text-sm mt-1">Scroll down</span>
    </div>
  </div>
));

const StepOne = React.memo<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectData: ProjectData;
  handleProjectNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLanguageChange: (value: string) => void;
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dragActive: boolean;
  error: string | null;
  setCurrentStep: (step: number) => void;
  projectNameInputRef: React.RefObject<HTMLInputElement | null>;
}>(({
  activeTab,
  setActiveTab,
  projectData,
  handleProjectNameChange,
  handleLanguageChange,
  handleContentChange,
  handleDrag,
  handleDrop,
  handleFileInput,
  dragActive,
  error,
  setCurrentStep,
  projectNameInputRef
}) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Only focus on mount, not on every render
  useEffect(() => {
    if (projectNameInputRef.current && !projectData.name) {
      projectNameInputRef.current.focus();
    }
  }, []); // Empty dependency array - only run on mount

  // Scroll detection
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollIndicator(!isNearBottom);
    };

    // Check initially if content is scrollable
    const checkScrollable = () => {
      const { scrollHeight, clientHeight } = scrollContainer;
      if (scrollHeight <= clientHeight) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };

    checkScrollable();
    scrollContainer.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollable);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [activeTab, projectData]);

  return (
    <div className="w-full mx-auto flex-1 h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-shrink-0 flex justify-between items-center mb-8">
          <div className="flex items-center">
            <button
              onClick={() => setCurrentStep(1)}
              className="mr-6 p-2 rounded-full bg-gray-700 hover:bg-gray-600"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-3xl font-bold text-white">Upload script</h1>
          </div>
          <div className="flex relative bg-gray-700 rounded-sm p-1">
            <div
              className={`absolute top-1 bottom-1 bg-white rounded-sm transition-all duration-300 ease-in-out ${activeTab === "Manual"
                ? "left-1 right-1/2 mr-0.5"
                : "right-1 left-1/2 ml-0.5"
                }`}
            />

            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 px-4 py-2 text-sm rounded-sm transition-colors duration-300 ${activeTab === tab.id
                  ? "text-gray-900"
                  : "text-gray-300 hover:text-white"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-6 mb-6">
          <div className="rounded-[8px] p-[1px] bg-gradient-to-r from-[#8CBE41] to-[#0D1E40]">
            <input
              ref={projectNameInputRef}
              type="text"
              name="add-project"
              placeholder="Enter project name"
              value={projectData.name}
              onChange={handleProjectNameChange}
              autoComplete="off"
              className="h-14 w-full px-4 rounded-[7px] text-white placeholder:text-gray-400 outline-none border-none transition-all duration-200 [&:-webkit-autofill]:!bg-[#475569] [&:-webkit-autofill:hover]:!bg-[#475569] [&:-webkit-autofill:focus]:!bg-[#475569] [&:-webkit-autofill:active]:!bg-[#475569]"
              style={{
                backgroundColor: '#475569 !important',
                backgroundImage: 'none !important',
                boxShadow: 'none !important'
              }}
            />
          </div>

          {/* <Select value={projectData.language} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="french">French</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
              <SelectItem value="german">German</SelectItem>
              <SelectItem value="italian">Italian</SelectItem>
              <SelectItem value="portuguese">Portuguese</SelectItem>
              <SelectItem value="chinese">Chinese</SelectItem>
              <SelectItem value="arabic">Arabic</SelectItem>
              <SelectItem value="hindi">Hindi</SelectItem>
              <SelectItem value="hausa">Hausa</SelectItem>
              <SelectItem value="japanese">Japanese</SelectItem>
              <SelectItem value="korean">Korean</SelectItem>
              <SelectItem value="russian">Russian</SelectItem>
            </SelectContent>
          </Select> */}

          {activeTab === "Manual" ? (
            <div>
              <div className="rounded-[8px] p-[1px] bg-gradient-to-r from-[#8CBE41] to-[#0D1E40]">
                <Textarea
                  placeholder="Enter your script (max 2000 characters)"
                  value={projectData.content}
                  onChange={handleContentChange}
                  autoComplete="off"
                  maxLength={2000}
                  className="min-h-[170px] rounded-[7px] text-white placeholder:text-gray-400 outline-none border-none transition-all duration-200 [&:-webkit-autofill]:!bg-[#475569] [&:-webkit-autofill:hover]:!bg-[#475569] [&:-webkit-autofill:focus]:!bg-[#475569] [&:-webkit-autofill:active]:!bg-[#475569]"
                  style={{
                    backgroundColor: '#475569 !important',
                    backgroundImage: 'none !important',
                    boxShadow: 'none !important'
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 px-1">

                <p className={`text-xs font-medium ${projectData.content.length > 2000
                  ? 'text-red-400'
                  : projectData.content.length > 1800
                    ? 'text-yellow-400'
                    : 'text-gray-400'
                  }`}>
                  {projectData.content.length}/2000
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div
                className={`relative rounded-sm p-8 text-center cursor-pointer transition-colors ${dragActive
                  ? "bg-green-500/10"
                  : "bg-white/20 hover:bg-white/25"
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".txt,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />

                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">
                  {projectData.script
                    ? projectData.script.name
                    : "Upload script in (TXT, DOCX) not exceeding 100mb"}
                </p>
              </div>
              {projectData.script && projectData.content && (
                <div className="flex justify-between items-center mt-2 px-1">

                  <p className={`text-xs font-medium ${projectData.content.length > 2000
                    ? 'text-red-400'
                    : projectData.content.length > 1800
                      ? 'text-yellow-400'
                      : 'text-gray-400'
                    }`}>
                    {projectData.content.length}/2000
                  </p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 w-full flex justify-center pt-4">
        <PrimaryBtn
          label="Proceed"
          onClick={() => {
            if (!projectData.name.trim()) return;
            if (activeTab === "Manual" && !projectData.content.trim()) return;
            if (activeTab === "Upload" && !projectData.script) return;
            setCurrentStep(3);
          }}
          containerclass="w-[400px]"
        />
      </div>
      <ScrollIndicator show={showScrollIndicator} />
    </div >
  );
});

const StepTwo = React.memo<{
  setCurrentStep: (step: number) => void;
  getVisibleItems: () => any[];
  getItemStyles: (position: number) => React.CSSProperties;
  goToPrevious: () => void;
  goToNext: () => void;
  voiceModels: VoiceModelDisplay[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  isLoadingVoices: boolean;
  onProceed: () => void;
  playingVoiceId: string | null;
  onPlayVoice: (voiceId: string) => void;
}>(({
  setCurrentStep,
  getVisibleItems,
  getItemStyles,
  goToPrevious,
  goToNext,
  voiceModels,
  activeIndex,
  setActiveIndex,
  isLoadingVoices,
  onProceed,
  playingVoiceId,
  onPlayVoice
}) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollIndicator(!isNearBottom);
    };

    const checkScrollable = () => {
      const { scrollHeight, clientHeight } = scrollContainer;
      setShowScrollIndicator(scrollHeight > clientHeight);
    };

    checkScrollable();
    scrollContainer.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollable);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [voiceModels, isLoadingVoices]);

  return (
    <div className="max-w-4xl mx-auto h-full flex-1 flex flex-col overflow-hidden relative">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 flex items-center mb-8 w-full justify-start">
          <h1 className="text-3xl font-bold text-white">Select Voice Model</h1>
        </div>

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-6 mb-6 flex flex-col items-center">
          <div className="flex-shrink-0 relative mb-8 w-full">
            {isLoadingVoices ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8CBE41]"></div>
              </div>
            ) : voiceModels.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-400">No voice models available</p>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 relative overflow-x-hidden w-full">
                {getVisibleItems().map((item) => (
                  <div
                    key={`${item.id}-${item.position}`}
                    className="absolute transition-all  duration-500 ease-out cursor-pointer"
                    style={getItemStyles(item.position)}
                    onClick={() => {
                      if (item.position !== 0) {
                        if (item.position === -1) goToPrevious();
                        if (item.position === 1) goToNext();
                      }
                    }}
                  >
                    <div
                      className={`relative rounded-3xl overflow-hidden ${item.position === 0
                        ? "w-[203px] h-[235px]"
                        : "w-[177px] h-[191px]"
                        }`}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center relative">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 300px"
                          />
                        ) : (
                          <span className={`font-bold text-white ${item.position === 0 ? "text-4xl" : "text-3xl"
                            }`}>
                            {item.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        )}
                      </div>

                      {item.position !== 0 && (
                        <div className="absolute inset-0 bg-black/40" />
                      )}

                      {/* Navigation arrows for active item */}
                      {item.position === 0 && voiceModels.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              goToPrevious();
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors border border-white/30 z-10"
                            title="Previous voice"
                          >
                            <ChevronLeft className="w-5 h-5 text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              goToNext();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors border border-white/30 z-10"
                            title="Next voice"
                          >
                            <ChevronRight className="w-5 h-5 text-white" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* {!isLoadingVoices && voiceModels.length > 0 && (
        <div className="flex-shrink-0 flex justify-center mb-8">
          <div className="flex space-x-2">
            {voiceModels.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${activeIndex === index
                  ? "bg-[#01796F] w-9"
                  : "bg-gray-600 hover:bg-gray-500"
                  }`}
              />
            ))}
          </div>
        </div>
      )} */}

          {!isLoadingVoices && voiceModels.length > 0 && (
            <div className="flex-shrink-0 px-4 mb-6 w-[400px] ring-1 ring-[#8CBE41] py-2 rounded-md bg-[#8CBE4120] flex items-center">
              <button
                onClick={() => voiceModels[activeIndex] && onPlayVoice(voiceModels[activeIndex].id)}
                disabled={!voiceModels[activeIndex]}
                className="w-10 h-10 mr-3 flex-shrink-0 bg-black rounded-full flex items-center justify-center transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {playingVoiceId === voiceModels[activeIndex]?.id ? (
                  <Pause fill="currentColor" className="w-4 h-4 text-white" />
                ) : (
                  <Play fill="currentColor" className="w-4 h-4 text-white ml-0.5" />
                )}
              </button>
              <ProgressSlider />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 w-full flex justify-center pt-4">
          <PrimaryBtn
            label="Generate Voiceover"
            onClick={onProceed}
            containerclass="w-[400px]"
            disabled={isLoadingVoices || voiceModels.length === 0}
          />
        </div>
      </div>
      <ScrollIndicator show={showScrollIndicator} />
    </div>
  );
});

const StepThree = React.memo<{
  setCurrentStep: (step: number) => void;
  projectData: ProjectData;
  handleVoiceSettingChange: (setting: keyof VoiceSettings, value: VoiceSettings[keyof VoiceSettings]) => void;
  languageOptions: readonly { value: "Yoruba" | "Hausa" | "Igbo" | "English"; label: string; }[];
}>(({
  setCurrentStep,
  projectData,
  handleVoiceSettingChange,
  languageOptions
}) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollIndicator(!isNearBottom);
    };

    const checkScrollable = () => {
      const { scrollHeight, clientHeight } = scrollContainer;
      setShowScrollIndicator(scrollHeight > clientHeight);
    };

    checkScrollable();
    scrollContainer.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollable);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [projectData]);

  return (
    <div className="w-full mx-auto h-full flex flex-col overflow-hidden relative">
      <div className="flex-shrink-0 flex items-center mb-6">
        <button
          onClick={() => setCurrentStep(2)}
          className="mr-6 p-2 rounded-full bg-gray-700 hover:bg-gray-600"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-3xl font-bold text-white">Choose Language</h1>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-4 mb-6">
        <div>
          <div className="flex items-center mb-4">
            <h3 className="text-white text-lg font-medium">Choose language</h3>
            <ChevronDown className="ml-2 w-5 h-5 text-gray-400" />
          </div>
          <div className="flex space-x-4">
            {languageOptions.map((language) => (
              <button
                key={language.value}
                onClick={() => handleVoiceSettingChange('language', language.value)}
                className={`px-6 py-3 rounded-sm border transition-colors ${projectData.voiceSettings.language === language.value
                  ? "bg-white text-blue-900 border-white"
                  : "bg-gradient-to-r from-[#8CBE4150] to-background text-white border-gray-600"
                  }`}
              >
                {language.label}

              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 w-full justify-center flex pt-4">
        <PrimaryBtn
          onClick={() => setCurrentStep(4)}
          label="Generate Audio Preview"
          containerclass="w-[400px]"
        />
      </div>
      <ScrollIndicator show={showScrollIndicator} />
    </div>
  );
});

const StepFour = React.memo<{
  setCurrentStep: (step: number) => void;
  projectData: ProjectData;
  activeTab: string;
  onGeneratePreview: () => void;
  previewAudio: string | null;
  isGeneratingPreview: boolean;
  previewError: string | null;
}>(({ setCurrentStep, projectData, activeTab, onGeneratePreview, previewAudio, isGeneratingPreview, previewError }) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<any>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollIndicator(!isNearBottom);
    };

    const checkScrollable = () => {
      const { scrollHeight, clientHeight } = scrollContainer;
      setShowScrollIndicator(scrollHeight > clientHeight);
    };

    checkScrollable();
    scrollContainer.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollable);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollable);
    };
  }, [previewAudio, isGeneratingPreview]);

  // Initialize WaveSurfer when audio is available
  useEffect(() => {
    if (previewAudio && waveformRef.current) {
      // Dynamically import WaveSurfer
      import('wavesurfer.js').then((WaveSurfer) => {
        // Destroy existing instance
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }

        // Create new WaveSurfer instance
        wavesurferRef.current = WaveSurfer.default.create({
          container: waveformRef.current!,
          waveColor: '#8CBE41',
          progressColor: '#6b952a',
          cursorColor: '#ffffff',
          barWidth: 2,
          barRadius: 3,
          cursorWidth: 1,
          height: 80,
          barGap: 2,
        });

        // Load audio
        wavesurferRef.current.load(previewAudio);

        // Handle play/pause events
        wavesurferRef.current.on('play', () => setIsPlaying(true));
        wavesurferRef.current.on('pause', () => setIsPlaying(false));
        wavesurferRef.current.on('finish', () => setIsPlaying(false));
      });
    }

    // Cleanup on unmount
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [previewAudio]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="w-full mx-auto h-full flex flex-col overflow-hidden relative">
      <div className="flex-shrink-0 flex items-center mb-8">
        <button
          onClick={() => setCurrentStep(3)}
          className="mr-6 p-2 rounded-full bg-gray-700 hover:bg-gray-600"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-3xl font-bold text-white">Audio Preview</h1>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-6 mb-6">
        {/* Script Preview */}
        <div className="bg-white/10 backdrop-blur-lg rounded-sm p-4">
          <h3 className="text-white text-lg font-medium mb-3">Script Content</h3>
          <div className="bg-white/5 rounded p-3 max-h-32 overflow-y-auto">
            <p className="text-gray-300 text-sm whitespace-pre-wrap">
              {projectData.content || "No content available"}
            </p>
          </div>
        </div>

        {/* Voice Settings Summary */}
        {/* <div className="bg-white/10 backdrop-blur-lg rounded-sm p-4">
          <h3 className="text-white text-lg font-medium mb-3">Voice Settings</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Gender:</span>
              <span className="text-white ml-2">{projectData.voiceSettings.gender}</span>
            </div>
            <div>
              <span className="text-gray-400">Age:</span>
              <span className="text-white ml-2">{projectData.voiceSettings.age}</span>
            </div>
            <div>
              <span className="text-gray-400">Language:</span>
              <span className="text-white ml-2">{projectData.voiceSettings.language}</span>
            </div>
            <div>
              <span className="text-gray-400">Mood:</span>
              <span className="text-white ml-2">{projectData.voiceSettings.mood}</span>
            </div>
          </div>
        </div> */}

        {/* Audio Preview Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-lg font-medium">Audio Preview</h3>
            <PrimaryBtn
              label={isGeneratingPreview ? "Generating..." : "Generate Preview"}
              onClick={onGeneratePreview}
              containerclass="w-auto px-4 py-2 text-sm"
              disabled={isGeneratingPreview}
            />
          </div>

          {previewError && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded mb-4">
              {previewError}
            </div>
          )}

          {previewAudio && (
            <div className="bg-white/5 rounded p-4">
              {/* WaveSurfer Waveform */}
              <div ref={waveformRef} className="mb-4" />

              {/* Play/Pause Button */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  onClick={handlePlayPause}
                  className="w-12 h-12 rounded-full bg-[#8CBE41] hover:bg-[#6b952a] flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white ml-1" />
                  )}
                </button>
              </div>

              <p className="text-gray-400 text-xs mt-4 text-center">
                Preview generated successfully. This is how your script will sound.
              </p>
            </div>
          )}

          {!previewAudio && !isGeneratingPreview && (
            <div className="bg-white/5 rounded p-4 text-center">
              <p className="text-gray-400">Click "Generate Preview" to hear how your script will sound.</p>
            </div>
          )}

          {isGeneratingPreview && (
            <div className="bg-white/5 rounded p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8CBE41] mx-auto mb-2"></div>
              <p className="text-gray-400">Generating audio preview...</p>
            </div>
          )}
        </div>
      </div >

      <div className="flex-shrink-0 w-full justify-center flex pt-4">
        <PrimaryBtn
          onClick={() => setCurrentStep(5)}
          label="Proceed to Upload"
          containerclass="w-[400px]"
          disabled={isGeneratingPreview}
        />
      </div>
      <ScrollIndicator show={showScrollIndicator} />
    </div >
  );
});

const StepFive = React.memo<{
  isLoading: boolean;
  error: string | null;
  success: boolean;
  handleFinalSubmit: () => void;
  onClose: () => void;
}>(({ isLoading, error, success, handleFinalSubmit, onClose }) => (
  <div className="max-w-4xl mx-auto h-full flex-1 flex flex-col overflow-hidden">
    <div className="flex-1 flex flex-col overflow-hidden items-center">
      <div className="flex-1 flex flex-col justify-center items-center">
        <h5 className="text-3xl text-white font-semibold mb-6">
          Processing Your Script
        </h5>
        <div className="w-[150px] h-[150px]">
          <CircularProgressbar
            value={isLoading ? 66 : 100}
            text={isLoading ? `66%` : `100%`}
            styles={buildStyles({
              textSize: "14px",
              pathTransitionDuration: 0.9,
              pathColor: "url(#gradientStroke)",
              textColor: "#fff",
              trailColor: "#d6d6d6",
              backgroundColor: "#3e98c7",
            })}
          />
        </div>

        <div className="ring-1 ring-accent-foreground w-[400px] rounded-sm mt-10 bg-[#2D3E4280] pt-2 pb-1">
          <div className="justify-between items-center flex px-4">
            <span className="font-semibold">
              {isLoading ? 'Uploading Script...' : 'Upload Complete!'}
            </span>
            <span className="text-gray-400 text-sm">1/2</span>
          </div>
          <ProgressSlider isAdjustable={false} value={isLoading ? 70 : 100} />
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded mt-4 w-[400px]">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-400 text-sm bg-green-400/10 p-3 rounded mt-4 w-[400px]">
            Script uploaded successfully!
          </div>
        )}
      </div>
      <div className="flex-shrink-0 w-full flex justify-center pt-6">
        {!isLoading && !success ? (
          <PrimaryBtn
            onClick={handleFinalSubmit}
            label="Upload Script"
            containerclass="w-[410px]"
          />
        ) : success ? (
          <PrimaryBtn
            onClick={onClose}
            label="Done"
            containerclass="w-[410px] bg-green-500 hover:bg-green-600"
          />
        ) : (
          <PrimaryBtn
            onClick={onClose}
            label="Cancel"
            containerclass="w-[410px] bg-red-500 hover:bg-red-600"
          />
        )}
      </div>
    </div>
  </div>
));

interface UploadScriptProps {
  selectedVoiceModelId?: string;
}

const UploadScript: React.FC<UploadScriptProps> = ({ selectedVoiceModelId }) => {
  const [activeTab, setActiveTab] = useState("Manual");
  const [activeIndex, setActiveIndex] = useState(1);
  const { onClose, onOpen } = useStore();
  const { uploadScript, isLoading, error, success } = useUploadScript();
  const projectNameInputRef = useRef<HTMLInputElement>(null);
  const [uploadedScript, setUploadedScript] = useState<Script | null>(null);

  // Voice models state
  const [voiceModels, setVoiceModels] = useState<VoiceModelDisplay[]>([]);
  const [loadingVoices, setLoadingVoices] = useState<boolean>(true);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Get userId from either JWT or NextAuth session
  const { user } = useUserStore();
  const { data: session } = useSession();
  const userId = user?.id || parseInt(session?.user?.id || "0");

  const [currentStep, setCurrentStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const initialProjectData: ProjectData = {
    name: "",
    language: "Yoruba",
    content: "",
    script: null,
    voiceModelId: selectedVoiceModelId || null,
    voiceSettings: {
      gender: "MALE",
      age: "YOUNG_ADULT",
      language: "Yoruba",
      mood: "ANXIOUS",
    },
  };

  const [projectData, setProjectData] = useState<ProjectData>(initialProjectData);

  useEffect(() => {
    const fetchVoiceModels = async () => {
      try {

        const yarnGptModels: VoiceModel[] = [
          {
            id: "idera",
            name: "Idera",
            category: "YarnGPT",
            gender: "Female",
            accent: "Nigerian",
            image: "/images/models/Idera - Melodic and Gentle.jpeg"
          },
          {
            id: "emma",
            name: "Emma",
            category: "YarnGPT",
            gender: "Female",
            accent: "Authoritative, deep",
            image: "/images/models/Emma - Authoritative & deep.jpeg"
          },
          {
            id: "zainab",
            name: "Zainab",
            category: "YarnGPT",
            gender: "Female",
            accent: "Soothing, gentle",
            image: "/images/models/Zainab - soothing & gentle.jpeg"
          },
          {
            id: "osagie",
            name: "Osagie",
            category: "YarnGPT",
            gender: "Male",
            accent: "Smooth, calm",
            image: "/images/models/Osagie - smooth & calm.jpeg"
          },
          {
            id: "wura",
            name: "Wura",
            category: "YarnGPT",
            gender: "Female",
            age: "Young",
            accent: "Sweet",
            image: "/images/models/Wura - young & sweet.jpeg"
          },
          {
            id: "jude",
            name: "Jude",
            category: "YarnGPT",
            gender: "Male",
            accent: "Warm, confident",
            image: "/images/models/Jude - warm & confident.jpeg"
          },
          {
            id: "chinenye",
            name: "Chinenye",
            category: "YarnGPT",
            gender: "Female",
            accent: "Engaging, warm",
            image: "/images/models/Chinenye - Engaging & warm.jpeg"
          },
          {
            id: "tayo",
            name: "Tayo",
            category: "YarnGPT",
            gender: "Male",
            accent: "Upbeat, energetic",
            image: "/images/models/Tayo - Upbeat, energetic.jpeg"
          },
          {
            id: "regina",
            name: "Regina",
            category: "YarnGPT",
            gender: "Female",
            age: "Mature",
            accent: "Warm",
            image: "/images/models/Regina - Mature, warm.jpeg"
          },
          {
            id: "femi",
            name: "Femi",
            category: "YarnGPT",
            gender: "Male",
            accent: "Rich, reassuring",
            image: "/images/models/Femi - rich, assuring.jpeg"
          },
          {
            id: "adaora",
            name: "Adaora",
            category: "YarnGPT",
            gender: "Female",
            accent: "Warm, engaging",
            image: "/images/models/Adaora - warm, engaging.jpeg"
          },
          {
            id: "umar",
            name: "Umar",
            category: "YarnGPT",
            gender: "Male",
            accent: "Calm, smooth",
            image: "/images/models/Umar - Calm, smooth.jpeg"
          },
          {
            id: "mary",
            name: "Mary",
            category: "YarnGPT",
            gender: "Female",
            age: "Young",
            accent: "Energetic",
            image: "/images/models/Mary.jpeg"
          },
          {
            id: "nonso",
            name: "Nonso",
            category: "YarnGPT",
            gender: "Male",
            accent: "Bold, resonant",
            image: "/images/models/Nonso.jpeg"
          },
          {
            id: "remi",
            name: "Remi",
            category: "YarnGPT",
            gender: "Male",
            accent: "Melodious, warm",
            image: "/images/models/Remi - melodious, warm.jpeg"
          },
          {
            id: "adam",
            name: "Adam",
            category: "YarnGPT",
            gender: "Male",
            accent: "Deep, clear",
            image: "/images/models/Adam-deep, clear.jpeg"
          }
        ];

        const voiceModelDisplays: VoiceModelDisplay[] = yarnGptModels.map(model => ({
          id: model.id,
          name: model.name,
          description: `${model.gender || ''} • ${model.accent || ''}`.trim().replace(/^• |• $/, ''),
          image: model.image
        }));

        setVoiceModels(voiceModelDisplays);
      } catch (err) {
        console.error("Error loading YarnGPT voice models:", err);
        toast.error("Failed to load voice models");
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchVoiceModels();
  }, []);

  // Set active index to pre-selected voice model when models are loaded
  useEffect(() => {
    if (selectedVoiceModelId && voiceModels.length > 0) {
      const selectedIndex = voiceModels.findIndex(model => model.id === selectedVoiceModelId);
      if (selectedIndex !== -1) {
        setActiveIndex(selectedIndex);
      }
    }
  }, [selectedVoiceModelId, voiceModels]);

  const getVisibleItems = useCallback(() => {
    if (voiceModels.length === 0) return [];
    const items = [];
    for (let i = -1; i <= 1; i++) {
      const index = (activeIndex + i + voiceModels.length) % voiceModels.length;
      items.push({ ...voiceModels[index], position: i });
    }
    return items;
  }, [activeIndex, voiceModels]);

  const goToPrevious = useCallback(() => {
    if (voiceModels.length === 0) return;
    setActiveIndex(
      (prev) => (prev - 1 + voiceModels.length) % voiceModels.length
    );
  }, [voiceModels.length]);

  const goToNext = useCallback(() => {
    if (voiceModels.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % voiceModels.length);
  }, [voiceModels.length]);

  const getItemStyles = useCallback((position: number) => {
    if (position === 0) {
      return {
        transform: "translateX(0) scale(0.9)",
        zIndex: 10,
        opacity: 1,
      };
    } else if (position === -1) {
      return {
        transform: "translateX(-150px) scale(0.9)",
        zIndex: 5,
        opacity: 0.8,
      };
    } else {
      return {
        transform: "translateX(150px) scale(0.8)",
        zIndex: 5,
        opacity: 0.6,
      };
    }
  }, []);

  const genderOptions = useMemo(() => [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "KID", label: "Kid" }
  ] as const, []);

  const ageOptions = useMemo(() => [
    { value: "CHILD", label: "Child" },
    { value: "TEENAGER", label: "Teenager" },
    { value: "YOUNG_ADULT", label: "Young Adult (20-35)" },
    { value: "ELDERLY_45_65", label: "Elderly (45-65)" },
    { value: "OLD_70_PLUS", label: "Old (70+)" }
  ] as const, []);

  const languageOptions = useMemo(() => [
    { value: "Yoruba", label: "Yoruba" },
    { value: "Hausa", label: "Hausa" },
    { value: "Igbo", label: "Igbo" },
    { value: "English", label: "English" }
  ] as const, []);

  const moodOptions = useMemo(() => [
    { value: "ANGRY", label: "Angry" },
    { value: "HAPPY", label: "Happy" },
    { value: "ANXIOUS", label: "Anxious" },
    { value: "DRAMA", label: "Drama" },
    { value: "SURPRISED", label: "Surprised" },
    { value: "SCARED", label: "Scared" },
    { value: "LAX", label: "Lax" },
    { value: "SAD", label: "Sad" },
    { value: "EXCITED", label: "Excited" },
    { value: "DISAPPOINTED", label: "Disappointed" },
    { value: "STRICT", label: "Strict" }
  ] as const, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const extractFileContent = useCallback(async (file: File) => {
    try {
      if (file.name.endsWith('.txt') || file.type === 'text/plain') {
        // Read text file
        let text = await file.text();

        // Enforce 2000 character limit
        if (text.length > 2000) {
          text = text.substring(0, 2000);
          toast.warning(`File content truncated to 2000 characters (YarnGPT limit)`);
        } else {
          toast.success('File content extracted successfully');
        }

        setProjectData((prev) => ({ ...prev, script: file, content: text }));
      } else if (file.name.endsWith('.docx')) {
        // For .docx files, we need mammoth or similar library
        // For now, just store the file and show a message
        setProjectData((prev) => ({ ...prev, script: file }));
        toast.info('DOCX file uploaded. Content will be extracted on server and truncated to 2000 characters if needed.');
      } else {
        setFileError('Unsupported file type. Please upload .txt or .docx files.');
      }
    } catch (err) {
      console.error('Error reading file:', err);
      setFileError('Failed to read file content');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (
        file.type === "text/plain" ||
        file.name.endsWith(".docx") ||
        file.name.endsWith(".txt")
      ) {
        extractFileContent(file);
      } else {
        setFileError('Please upload a .txt or .docx file');
      }
    }
  }, [extractFileContent]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      extractFileContent(file);
    }
  }, [extractFileContent]);

  const handleProjectNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectData(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleLanguageChange = useCallback((value: string) => {
    setProjectData((prev) => ({
      ...prev,
      language: value,
      // Also update voice settings language to keep them in sync
      voiceSettings: {
        ...prev.voiceSettings,
        language: value as VoiceSettings["language"],
      },
    }));
  }, []);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProjectData(prev => ({ ...prev, content: e.target.value }));
  }, []);

  const handleVoiceSettingChange = useCallback((
    setting: keyof VoiceSettings,
    value: VoiceSettings[keyof VoiceSettings]
  ) => {
    setProjectData((prev) => ({
      ...prev,
      voiceSettings: { ...prev.voiceSettings, [setting]: value },
    }));
    // Clear preview when settings change
    setPreviewAudio(null);
    setPreviewError(null);
  }, []);

  const handleVoiceModelProceed = useCallback(() => {
    // Save the selected voice model ID before proceeding
    if (voiceModels.length > 0 && voiceModels[activeIndex]) {
      setProjectData((prev) => ({
        ...prev,
        voiceModelId: voiceModels[activeIndex].id,
      }));
    }
    setCurrentStep(2);
  }, [voiceModels, activeIndex]);

  const handlePlayVoice = useCallback(async (voiceId: string) => {
    // If clicking on the currently playing voice, pause it
    if (playingVoiceId === voiceId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setPlayingVoiceId(null);
      return;
    }

    try {
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      setPlayingVoiceId(voiceId);

      // First try to get saved preview from database
      const previewResponse = await fetch(`/api/voice-preview/${voiceId}`);

      if (previewResponse.ok) {
        const previewData = await previewResponse.json();
        if (previewData.success && previewData.preview?.audioUrl) {
          // Use saved preview
          const audio = new Audio(previewData.preview.audioUrl);
          currentAudioRef.current = audio;

          audio.onended = () => {
            setPlayingVoiceId(null);
            currentAudioRef.current = null;
          };

          audio.onerror = () => {
            setPlayingVoiceId(null);
            currentAudioRef.current = null;
            toast.error("Failed to play voice preview");
          };

          await audio.play();
          return;
        }
      }

      // Fallback: Generate new preview using TTS API
      toast.info("Generating voice preview...", { duration: 2000 });

      const previewText = "Culture shapes identity, values, and traditions, connecting generations through language, art, and beliefs while fostering understanding, respect, and unity in an increasingly diverse and interconnected world.";

      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: previewText,
          voice: voiceId,
          response_format: "mp3"
        }),
      });

      if (!response.ok) throw new Error("Failed to generate voice preview");

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      // Store reference to the current audio
      currentAudioRef.current = audio;

      audio.onended = () => {
        setPlayingVoiceId(null);
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingVoiceId(null);
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
        toast.error("Failed to play voice preview");
      };

      await audio.play();
    } catch (err) {
      console.error("Error playing voice:", err);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
      toast.error("Failed to play voice preview");
    }
  }, [playingVoiceId]);

  const handleGeneratePreview = useCallback(async () => {
    setIsGeneratingPreview(true);
    setPreviewError(null);

    try {
      const textContent = projectData.content;

      if (!textContent || !textContent.trim()) {
        throw new Error("No content available for preview. Please add text or upload a file.");
      }

      // Generate a short preview (first 200 characters)
      const previewText = textContent.substring(0, 200) + (textContent.length > 200 ? "..." : "");

      // Translate text to selected language
      const selectedLanguage = projectData.voiceSettings.language as 'Yoruba' | 'Hausa' | 'Igbo' | 'English';
      toast.info(`Translating to ${selectedLanguage}...`, { duration: 2000 });
      const translatedText = await translateText(previewText, selectedLanguage);

      // Get the selected voice ID
      const voiceId = projectData.voiceModelId || "idera";

      // Call YarnGPT TTS API directly (no Cloudinary upload for preview)
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: translatedText,
          voice: voiceId,
          response_format: "mp3"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate audio preview");
      }

      // Create audio URL from blob
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      setPreviewAudio(audioUrl);
    } catch (error) {
      console.error('Preview generation error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate preview";
      setPreviewError(errorMessage);
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [activeTab, projectData.content, projectData.voiceModelId, projectData.voiceSettings.language]);

  const resetForm = useCallback(() => {
    setProjectData(initialProjectData);
    setCurrentStep(1);
    setPreviewAudio(null);
    setPreviewError(null);
    setIsGeneratingPreview(false);
    setActiveTab("Manual");
    setUploadedScript(null);
    setFileError("");
  }, [initialProjectData]);

  const handleFinalSubmit = useCallback(async () => {
    try {
      // Validate that we have content
      if (!projectData.content || !projectData.content.trim()) {
        toast.error("Please add content to your script");
        return;
      }

      // Validate that we have a voice model selected
      if (!projectData.voiceModelId) {
        toast.error("Please select a voice model");
        return;
      }

      // Enforce 2000 character limit for YarnGPT API
      let contentToSubmit = projectData.content;
      if (contentToSubmit.length > 2000) {
        contentToSubmit = contentToSubmit.substring(0, 2000);
        toast.warning("Content truncated to 2000 characters for YarnGPT API");
      }

      // Translate text to selected language
      const selectedLanguage = projectData.voiceSettings.language as 'Yoruba' | 'Hausa' | 'Igbo' | 'English';
      toast.info(`Translating to ${selectedLanguage}...`, { duration: 2000 });
      const translatedContent = await translateText(contentToSubmit, selectedLanguage);

      const scriptData = {
        projectName: projectData.name,
        language: projectData.language,
        content: translatedContent, // Use translated content
        mode: activeTab.toLowerCase() as 'manual' | 'upload',
        userId,
        voiceModelId: projectData.voiceModelId, // Include selected voice model
        voiceSettings: projectData.voiceSettings,
        generateAudio: true, // Always generate audio when submitting
        ...(activeTab === "Upload" && projectData.script && {
          fileName: projectData.script.name,
          fileSize: projectData.script.size,
          fileType: projectData.script.type,
        }),
      };

      const result = await uploadScript(scriptData);

      // If upload was successful, convert the response to Script type and open EditProject
      if (result.success && result.data) {
        const script: Script = {
          id: result.data.id,
          projectName: result.data.projectName,
          language: result.data.language,
          content: result.data.content,
          fileName: result.data.fileName,
          fileSize: result.data.fileSize,
          fileType: result.data.fileType,
          uploadMode: result.data.uploadMode,
          audioFileName: undefined,
          audioFileSize: undefined,
          audioFileUrl: undefined,
          audioGenerated: false,
          voiceModelId: projectData.voiceModelId || undefined,
          createdAt: result.data.createdAt,
          updatedAt: result.data.createdAt,
        };

        setUploadedScript(script);

        // Reset form data
        resetForm();

        // Open EditProject with the script, voice settings, and voice model ID
        setTimeout(() => {
          onOpen("modal", <EditProject script={script} voiceSettings={projectData.voiceSettings} voiceModelId={projectData.voiceModelId || undefined} />);
        }, 500);
      }

    } catch (err) {
      console.error('Upload failed:', err);
    }
  }, [projectData, activeTab, userId, uploadScript, onOpen, resetForm]);

  return (
    <div className="h-full py-10 px-6 w-full flex flex-col overflow-hidden">
      <ProgressBar step={currentStep} />
      <svg style={{ height: 0 }}>
        <defs>
          <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8CBE41" />
            <stop offset="100%" stopColor="#0D1E40D1" />
          </linearGradient>
        </defs>
      </svg>

      {currentStep === 1 && (
        <StepTwo
          setCurrentStep={setCurrentStep}
          getVisibleItems={getVisibleItems}
          getItemStyles={getItemStyles}
          goToPrevious={goToPrevious}
          goToNext={goToNext}
          voiceModels={voiceModels}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          isLoadingVoices={loadingVoices}
          onProceed={handleVoiceModelProceed}
          playingVoiceId={playingVoiceId}
          onPlayVoice={handlePlayVoice}
        />
      )}

      {currentStep === 2 && (
        <StepOne
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          projectData={projectData}
          handleProjectNameChange={handleProjectNameChange}
          handleLanguageChange={handleLanguageChange}
          handleContentChange={handleContentChange}
          handleDrag={handleDrag}
          handleDrop={handleDrop}
          handleFileInput={handleFileInput}
          dragActive={dragActive}
          error={fileError}
          setCurrentStep={setCurrentStep}
          projectNameInputRef={projectNameInputRef}
        />
      )}

      {currentStep === 3 && (
        <StepThree
          setCurrentStep={setCurrentStep}
          projectData={projectData}
          handleVoiceSettingChange={handleVoiceSettingChange}
          languageOptions={languageOptions}
        />
      )}

      {currentStep === 4 && (
        <StepFour
          setCurrentStep={setCurrentStep}
          projectData={projectData}
          activeTab={activeTab}
          onGeneratePreview={handleGeneratePreview}
          previewAudio={previewAudio}
          isGeneratingPreview={isGeneratingPreview}
          previewError={previewError}
        />
      )}

      {currentStep === 5 && (
        <StepFive
          isLoading={isLoading}
          error={error}
          success={success}
          handleFinalSubmit={handleFinalSubmit}
          onClose={onClose}
        />
      )}
    </div>
  );
};

export default UploadScript;