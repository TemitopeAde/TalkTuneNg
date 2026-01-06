"use client"
import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Plus, ChevronLeft, ChevronRight, Mic, Loader2 } from "lucide-react";
import Image from "next/image";
import UploadScript from "@/components/UploadScript";
import { useStore } from "@/hooks/useStore";
import Project from "@/components/Project";
import { useScripts } from "@/hooks/scripts/useScript";
import AudioPlayerRow from "@/components/AudioPlayerRow";
import { toast } from "sonner";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

interface Script {
  id: string;
  projectName: string;
  language: string;
  content: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadMode: string;
  audioFileName?: string;
  audioFileSize?: number;
  audioFileUrl?: string;
  audioGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VoiceModel {
  id: string;
  name: string;
  category: string;
  gender?: string;
  age?: string;
  accent?: string;
  image?: string;
}

const Page: React.FC = () => {
  const { onOpen } = useStore();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [voiceModels, setVoiceModels] = useState<VoiceModel[]>([]);
  const [loadingVoices, setLoadingVoices] = useState<boolean>(true);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const SCRIPTS_PER_PAGE = 20;
  const { data, isLoading, error, refetch } = useScripts({ page: currentPage, limit: SCRIPTS_PER_PAGE });

  const scripts: Script[] = data?.data?.scripts || [];
  const pagination = data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalScripts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const handleAddVoice = (voiceModelId?: string) => {
    onOpen("modal", <UploadScript selectedVoiceModelId={voiceModelId} />);
  };

  const openProject = (script: Script) => {
    onOpen("modal", <Project script={script} />);
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) setCurrentPage((prev) => prev + 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getPaginationText = () => {
    const start = (pagination.currentPage - 1) * SCRIPTS_PER_PAGE + 1;
    const end = Math.min(pagination.currentPage * SCRIPTS_PER_PAGE, pagination.totalScripts || 0);
    return `${start}-${end} of ${pagination.totalScripts}`;
  };

  useEffect(() => {
    const fetchVoiceModels = async () => {
      try {
        // YarnGPT Voice Models
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

        setVoiceModels(yarnGptModels);
      } catch (err) {
        console.error("Error loading YarnGPT voice models:", err);
        toast.error("Failed to load voice models");
      } finally {
        setLoadingVoices(false);
      }
    };

    fetchVoiceModels();
  }, []);

  const handlePlayVoice = async (voiceId: string) => {
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
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-8">
        <h2 className="text-base md:text-2xl font-bold text-white">Explore Our Innovative AI Voice Models</h2>

        <div className="flex items-start md:items-center justify-between flex-col md:flex-row mb-6 w-full">
          <div className="flex items-center space-x-4 my-6 w-full">
            <button className="px-5 md:px-10 py-3 text-sm md:text-base whitespace-nowrap border border-[#6b952a] text-white rounded-sm hover:bg-green-500/10 transition-colors">
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </span>
              ) : (
                `${pagination.totalScripts} Voice Overs`
              )}
            </button>

            <button
              onClick={() => handleAddVoice()}
              className="px-5 md:px-10 py-3 bg-white text-slate-900 rounded-sm hover:bg-gray-100 transition-colors md:text-base whitespace-nowrap  font-medium"
            >
              Add Voice Over
            </button>
          </div>

          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
            <Mic className="w-6 h-6 text-slate-900" />
          </div>
        </div>

        {/* Voice Models Slider */}
        <div className="mb-8">
          {loadingVoices ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="relative w-full h-[280px]">
                  <div className="w-full h-full bg-slate-700 rounded-lg animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : voiceModels.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No voice models available</p>
            </div>
          ) : (
            <Splide
              options={{
                type: "loop",
                perPage: 4,
                perMove: 1,
                gap: "1rem",
                pagination: false,
                arrows: true,
                breakpoints: {
                  1536: { perPage: 4 },
                  1280: { perPage: 3 },
                  1024: { perPage: 3 },
                  768: { perPage: 2 },
                  640: { perPage: 1 },
                },
              }}
              aria-label="Voice Models"
            >
              {voiceModels.map((model) => (
                <SplideSlide key={model.id}>
                  <div className="relative group h-[280px]">
                    <div className="relative w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg overflow-hidden">

                      {/* Voice model avatar with image or initials */}
                      <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                        {model.image ? (
                          <Image
                            src={model.image}
                            alt={model.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <span className="text-6xl font-bold text-white">
                            {model.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </span>
                        )}
                      </div>

                      {/* Overlay with model info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center relative overflow-hidden border border-white/20">
                            <Mic className="w-6 h-6 text-white relative z-10" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-base mb-1">{model.name}</h3>
                            {model.gender && (
                              <p className="text-slate-200 text-xs capitalize">
                                {model.gender} {model.age && `• ${model.age}`}
                              </p>
                            )}
                          </div>
                        </div>

                        {model.accent && (
                          <p className="text-slate-300 text-xs mb-3">{model.accent}</p>
                        )}

                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => handleAddVoice(model.id)}
                            className="bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex justify-center items-center hover:bg-white/30 transition-colors border border-white/30"
                            title="Use this voice"
                          >
                            <Plus className="w-5 h-5 text-white" />
                          </button>

                          <button
                            onClick={() => handlePlayVoice(model.id)}
                            disabled={playingVoiceId === model.id}
                            className="w-10 h-10 bg-green-700 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 shadow-lg"
                            title="Preview voice"
                          >
                            {playingVoiceId === model.id ? (
                              <Pause fill="currentColor" className="w-5 h-5 text-white" />
                            ) : (
                              <Play fill="currentColor" className="w-5 h-5 text-white ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </SplideSlide>
              ))}
            </Splide>
          )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-6">Recent Projects</h3>

      {isLoading ? (
        <div className="rounded-lg border border-[#6b952a] py-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-slate-400 text-sm font-medium">
                  <th className="text-left px-6 pb-4">Voiceover Name</th>
                  <th className="text-left px-6 pb-4">Recordings</th>
                  <th className="text-right px-6 pb-4">Date</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {Array.from({ length: SCRIPTS_PER_PAGE }, (_, i) => i + 1).map((index) => (
                  <tr key={index} className="border-b border-slate-500/50 last:border-b-0 animate-pulse">
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
                        <div className="h-5 w-32 bg-slate-600 rounded"></div>
                      </div>
                    </td>

                    <td className="px-6 py-3 w-[200px]">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-600 rounded-full"></div>
                        <div className="h-2 w-[200px] max-md:w-[100px] bg-slate-600 rounded-full"></div>
                      </div>
                    </td>

                    <td className="px-6 py-3 text-right">
                      <div className="h-5 w-24 bg-slate-600 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500 p-6 text-center">
          <p className="text-red-500">{error instanceof Error ? error.message : "An error occurred"}</p>
          <button onClick={() => refetch()} className="mt-4 px-6 py-2 bg-white text-slate-900 rounded-sm hover:bg-gray-100">
            Retry
          </button>
        </div>
      ) : scripts.length === 0 ? (
        <div className="rounded-lg border border-[#6b952a] p-12 text-center">
          <p className="text-gray-400 text-lg">No projects found</p>
          <p className="text-gray-500 text-sm mt-2">Click "Add Voice Over" to create your first project</p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-[#6b952a] py-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-slate-400 text-sm font-medium">
                    <th className="text-left px-6 pb-4">Voiceover Name</th>
                    <th className="text-left px-6 pb-4">Recordings</th>
                    <th className="text-right px-6 pb-4">Date</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {scripts.map((script) => (
                    <tr key={script.id} className="border-b border-slate-500/50 last:border-b-0">
                      <td className="px-6 py-3">
                        <div onClick={() => openProject(script)} className="flex cursor-pointer items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-600 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-medium">
                              {getInitials(script.projectName)}
                            </div>
                          </div>
                          <span className="text-white font-medium whitespace-nowrap">{script.projectName}</span>
                        </div>
                      </td>

                      <td className="px-6 py-3">
                        {script.audioGenerated && script.audioFileUrl ? (
                          <AudioPlayerRow audioUrl={script.audioFileUrl} audioFileName={script.audioFileName || undefined} />
                        ) : (
                          <span className="text-slate-400 text-sm">No audio</span>
                        )}
                      </td>

                      <td className="px-6 py-3 whitespace-nowrap text-slate-400 text-sm text-right">{formatDate(script.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center font-semibold justify-center space-x-4 mt-6 pt-4 border-t border-slate-700/50">
            <span className="text-slate-100 text-sm">{getPaginationText()}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={!pagination.hasPrevPage}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6 text-slate-100" />
              </button>

              <button
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-6 h-6 text-slate-100" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
