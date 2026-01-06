"use client"

import { Flag, Mic, Pause, Play, Spiral } from "@/constants/Icons";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import PrimaryBtn from "./buttons/PrimaryBtn";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";

interface VoiceModel {
  id: string;
  name: string;
  category: string;
  gender?: string;
  age?: string;
  accent?: string;
  image?: string;
}

const Hero = () => {
  const router = useRouter();
  const [voiceModels, setVoiceModels] = useState<VoiceModel[]>([]);
  const [loadingVoices, setLoadingVoices] = useState<boolean>(true);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const previewText = "One fateful evening, as the sun dipped below the horizon, casting a warm glow across the landscape, Elara stumbled upon an old, weathered map tucked inside a hollow tree. The parchment was adorned with cryptic symbols and a faded ink drawing of the mountains. Her heart raced with excitement—this was the call to adventure she had longed for.";

  // Split text into words for animation
  const words = previewText.split(' ');

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
      setAudioProgress(0);
      return;
    }

    try {
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      setLoadingPreview(true);
      setPlayingVoiceId(voiceId);
      setAudioProgress(0);

      // First try to get saved preview from database
      const previewResponse = await fetch(`/api/voice-preview/${voiceId}`);

      if (previewResponse.ok) {
        const previewData = await previewResponse.json();
        if (previewData.success && previewData.preview?.audioUrl) {
          // Use saved preview
          const audio = new Audio(previewData.preview.audioUrl);
          currentAudioRef.current = audio;

          // Track audio progress for text animation
          audio.ontimeupdate = () => {
            if (audio.duration) {
              const progress = (audio.currentTime / audio.duration) * 100;
              setAudioProgress(progress);
            }
          };

          audio.onended = () => {
            setPlayingVoiceId(null);
            currentAudioRef.current = null;
            setAudioProgress(0);
            setLoadingPreview(false);
          };

          audio.onerror = () => {
            setPlayingVoiceId(null);
            currentAudioRef.current = null;
            setAudioProgress(0);
            setLoadingPreview(false);
            toast.error("Failed to play voice preview");
          };

          await audio.play();
          setLoadingPreview(false);
          return;
        }
      }

      // Fallback: Generate new preview using TTS API
      toast.info("Generating voice preview...", { duration: 2000 });

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

      // Track audio progress for text animation
      audio.ontimeupdate = () => {
        if (audio.duration) {
          const progress = (audio.currentTime / audio.duration) * 100;
          setAudioProgress(progress);
        }
      };

      audio.onended = () => {
        setPlayingVoiceId(null);
        currentAudioRef.current = null;
        setAudioProgress(0);
        setLoadingPreview(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingVoiceId(null);
        currentAudioRef.current = null;
        setAudioProgress(0);
        setLoadingPreview(false);
        URL.revokeObjectURL(audioUrl);
        toast.error("Failed to play voice preview");
      };

      await audio.play();
      setLoadingPreview(false);
    } catch (err) {
      console.error("Error playing voice:", err);
      setPlayingVoiceId(null);
      currentAudioRef.current = null;
      setAudioProgress(0);
      setLoadingPreview(false);
      toast.error("Failed to play voice preview");
    }
  };
  return (
    <section className="relative rounded-b-[64px] -top-16 bg-background pb-20 h-full flex w-full px-6 md:px-[100px] overflow-hidden justify-center items-center flex-col text-white">
      <div className="absolute max-md:top-32 md:-mt-56 w-[400px] h-[60vh]">
        <Image src={Mic} fill alt="Mic" className="object-contain" />
      </div>
      <div className="fixed w-full -bottom-20 justify-end flex items-end h-[600px]">
        <Image src={Spiral} alt="Spiral" fill className="object-cover" />
      </div>
      <div
        className="w-1/2 h-[400px] bg-[#A8EF4370] rounded-full absolute -top-20 
             transform blur-[200px] -z-1"
      />
      <div className="flex justify-center  items-center h-full flex-col">
        <div className="flex relative flex-col justify-center gap-4 items-center text-center mt-48">
          <h1 className="text-[32px] md:text-5xl font-bold leading-tight max-w-3xl">
            Effortlessly Create and Elevate Your Audio Projects with Our
            AI-powered Voiceovers
          </h1>
          <p className="mt-4 max-w-xl text-lg text-gray-300">
            Create your voiceover library of natural-sounding voices, languages,
            accents and textures.
          </p>
          <PrimaryBtn onClick={() => router.push("/auth/register")} label="Get Early Access" />
        </div>
      </div>
      <div className="flex flex-col px-4 relative justify-center py-10 mt-64 lg:w-[70vw] items-center md:w-[80vw] max-md:w-[90vw] bg-white/5 ring-[1px] rounded-2xl ring-neutral-400 backdrop-blur-sm">
        <div className="absolute -top-32 w-full px-4">
          {loadingVoices ? (
            // Enhanced skeleton loader
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="relative min-h-[220px] h-[220px] w-full bg-slate-800/60 rounded-md overflow-hidden"
                >
                  {/* Image skeleton with shimmer effect */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-slate-800/60 via-slate-700/60 to-slate-800/60 animate-shimmer"
                    style={{ backgroundSize: '200% 100%' }}
                  />

                  {/* Bottom gradient overlay skeleton */}
                  <div className="absolute bottom-0 w-full p-2 bg-gradient-to-t from-slate-900/80 to-transparent rounded-b-md">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2 flex-1">
                        {/* Name skeleton */}
                        <div className="h-4 bg-slate-700/80 rounded w-24 animate-pulse" />
                        {/* Gender/Age skeleton */}
                        <div className="h-3 bg-slate-700/60 rounded w-32 animate-pulse"
                          style={{ animationDelay: '0.1s' }}
                        />
                      </div>
                      {/* Play button skeleton */}
                      <div className="h-8 w-8 rounded-full bg-slate-700/80 animate-pulse"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : voiceModels.length === 0 ? (
            <div className="text-center py-8 w-full">
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
                  1280: { perPage: 4 },
                  1024: { perPage: 3 },
                  768: { perPage: 2 },
                  640: { perPage: 1 },
                },
              }}
              aria-label="Voice Models"
            >
              {voiceModels.map((model) => (
                <SplideSlide key={model.id}>
                  <div className="relative min-h-[220px] h-[220px] rounded-md overflow-hidden bg-gradient-to-br from-gray-400 to-gray-600">
                    {model.image ? (
                      <Image
                        src={model.image}
                        alt={model.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">
                          {model.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 p-2 flex justify-between items-center gap-2 w-full bg-gradient-to-t from-black/80 to-transparent rounded-b-md">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{model.name}</h4>
                        <h4 className="font-normal text-white/70 capitalize text-sm truncate">
                          {model.gender} {model.age && `• ${model.age}`}
                        </h4>
                      </div>
                      <button
                        onClick={() => handlePlayVoice(model.id)}
                        disabled={loadingPreview && playingVoiceId === model.id}
                        className="h-8 w-8 flex-shrink-0 rounded-full ring-blue-300 bg-background ring-2 justify-center items-center flex hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {loadingPreview && playingVoiceId === model.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : playingVoiceId === model.id ? (
                          <Image
                            src={Pause}
                            alt="Pause"
                            height={12}
                            width={12}
                          />
                        ) : (
                          <Image
                            src={Play}
                            alt="Play"
                            height={12}
                            width={12}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </SplideSlide>
              ))}
            </Splide>
          )}
        </div>

        <div className="mt-20 flex-c0p p-4 flex w-full bg-white/10 backdrop-blur-sm mx-10 rounded-md overflow-hidden">
          <p className="leading-relaxed">
            {words.map((word, index) => {
              const wordProgress = (index / words.length) * 100;
              const isHighlighted = playingVoiceId && audioProgress >= wordProgress;
              const isBeingRead = playingVoiceId && audioProgress >= wordProgress && audioProgress < ((index + 1) / words.length) * 100;

              return (
                <span
                  key={index}
                  className={`transition-all duration-200 ${isBeingRead
                    ? 'font-bold text-white bg-green-600/30 px-1 rounded'
                    : isHighlighted
                      ? 'font-semibold text-white'
                      : 'text-white/40 font-normal'
                    }`}
                >
                  {word}{' '}
                </span>
              );
            })}
          </p>
        </div>

        <div className="flex gap-4 w-full mt-8 flex-wrap">
          <button
            onClick={() => {
              if (playingVoiceId) {
                // If something is playing, pause it
                handlePlayVoice(playingVoiceId);
              } else if (voiceModels.length > 0) {
                // Otherwise, play the first voice model
                handlePlayVoice(voiceModels[0].id);
              }
            }}
            disabled={loadingVoices || voiceModels.length === 0 || loadingPreview}
            className="h-8 w-8 mr-4 flex-shrink-0 rounded-full ring-blue-300 bg-background ring-2 justify-center items-center flex hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loadingPreview ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : playingVoiceId ? (
              <Image src={Pause} alt="Pause" height={12} width={12} />
            ) : (
              <Image src={Play} alt="Play" height={12} width={12} />
            )}
          </button>
          {/* <Image src={Flag} alt="Flag" height={30} width={25} /> */}

          <div className="ring-1 ring-white/20 rounded-[4px] px-2 bg-background text-center flex justify-center items-center">
            <span>Story Telling</span>
          </div>
          <div className="ring-1 ring-white/20 rounded-[4px] px-2 bg-background text-center flex justify-center items-center">
            <span>Horror</span>
          </div>
          <div className="ring-1 ring-white/20 rounded-[4px] px-2 bg-background text-center flex justify-center items-center">
            <span>Drama</span>
          </div>
          <div className="ring-1 ring-white/20 rounded-[4px] px-2 bg-background text-center flex justify-center items-center">
            <span>Calm</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
