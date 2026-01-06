"use client";

import {
  ArrowLeft,
  ChevronLeft,
  Info,
  MessageCircle,
  Play,
  Pause,
  Share,
  X,
  Loader2,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import ProgressSlider from "./ProgressSlider";
import Image from "next/image";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStore } from "@/hooks/useStore";
import EditProject from "./EditProject";
import { Script } from "@/types";
import { duplicateScript } from "@/actions/duplicateScript";
import { useUserStore } from "@/store/useUserStore";
import { useSession } from "next-auth/react";

interface ProjectProps {
  script: Script;
}

const Project = ({ script }: ProjectProps) => {
  const { onOpen, onClose } = useStore();
  const { user } = useUserStore();
  const { data: session } = useSession();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlayPause = () => {
    if (!audioRef.current || !script.audioFileUrl) return;

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

  const handleSave = async () => {
    if (!script.audioFileUrl) {
      toast.error("No audio to download");
      return;
    }

    try {
      const response = await fetch(script.audioFileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${script.projectName}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Audio downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download audio");
    }
  };

  const handleDuplicate = async () => {
    // Check if user is logged in via JWT or NextAuth
    const isAuthenticated = user?.id || session?.user;

    if (!isAuthenticated) {
      toast.error("You must be logged in to duplicate scripts");
      return;
    }

    // Get the user ID from either auth method
    const userId = user?.id || parseInt(session?.user?.id || "0");

    setIsDuplicating(true);

    try {
      const result = await duplicateScript(script.id, userId);

      if (result.success) {
        toast.success("Script duplicated successfully!");
        // Optionally close the modal or refresh the list
        onClose();
      } else {
        toast.error(result.error || "Failed to duplicate script");
      }
    } catch (error) {
      console.error("Duplicate error:", error);
      toast.error("An error occurred while duplicating the script");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleCopylink = () => {
    const url = `${window.location.origin}/project/${script.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const handleShare = (platform: 'whatsapp' | 'telegram' | 'twitter') => {
    const url = `${window.location.origin}/project/${script.id}`;
    const text = `Check out my voiceover: ${script.projectName}`;

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
    }

    window.open(shareUrl, '_blank');
  };

  const handleEditProject = () => {
    onOpen("modal", <EditProject script={script} voiceModelId={script.voiceModelId} />);
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !script.audioFileUrl) return;

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
  }, [script.audioFileUrl]);

  return (
    <div className="w-full h-full p-4 mt-4">
      <button
        onClick={onClose}
        className="mr-6 p-2 rounded-full bg-gray-700 hover:bg-gray-600"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <h2 className="text-2xl font-medium my-4">{script.projectName}</h2>
      <div className="flex space-x-3 items-center">
        <h5 className="font-semibold text-sm">
          Voiceover time used: 0.50/30.0 hrs
        </h5>
        <Popover>
          <PopoverTrigger>
            <Info className="text-gray-400 h-5 w-5" />
          </PopoverTrigger>
          <PopoverContent align="end" className="bg-gray-600 text-white">
            <div className="flex justify-between pb-2 items-center border-b border-gray-50">
              <span className="font-semibold">Plan Info</span>
              <X className="h-5 w-5" />
            </div>
            <ul>
              <li>
                <span className="text-gray-400 text-xs">
                  Voiceover time remaining
                </span>
                <p className="font-semibold">0.50 / 30.00hrs</p>
              </li>
              <li>
                <span className="text-gray-400 text-xs">Plan expires</span>
                <p className="font-semibold">10th June 2024</p>
              </li>
              <li>
                <span className="text-gray-400 text-xs">Actions</span>
                <div className="flex items-center space-x-2">
                  <p className="font-semibold">Manage Plan</p>
                  <svg
                    width="16"
                    height="17"
                    viewBox="0 0 16 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.7945 6.79396L11.4843 5.47916C10.5403 4.53183 10.1703 4.02222 9.65907 4.20238C9.02167 4.42702 9.23147 5.84445 9.23147 6.32298C8.24047 6.32298 7.21013 6.2349 6.23323 6.41842C3.00839 7.02426 2 9.64337 2 12.4998C2.91273 11.8533 3.82455 11.1645 4.92155 10.8649C6.29091 10.4908 7.82027 10.6693 9.23147 10.6693C9.23147 11.1478 9.02167 12.5653 9.65907 12.7899C10.2383 12.994 10.5403 12.4604 11.4843 11.5131L12.7945 10.1983C13.5982 9.39184 14 8.98864 14 8.49617C14 8.0037 13.5982 7.60044 12.7945 6.79396Z"
                      stroke="white"
                      strokeWidth="1.125"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </li>
            </ul>
          </PopoverContent>
        </Popover>
      </div>

      <div className="px-4 mb-8 w-full ring-1 mt-6 ring-[#8CBE41] py-2 rounded-md bg-[#8CBE4120] flex space-y-2 flex-col">
        <div className="mr-6 h-10 w-10 flex-shrink-0 justify-center items-center flex mb-4 rounded-full bg-gray-700 hover:bg-gray-600">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 15.0057V10.6606C20 9.84276 20 9.43383 19.8478 9.06613C19.6955 8.69843 19.4065 8.40927 18.8284 7.83096L14.0919 3.09236C13.593 2.59325 13.3436 2.3437 13.0345 2.19583C12.9702 2.16508 12.9044 2.13778 12.8372 2.11406C12.5141 2 12.1614 2 11.4558 2C8.21082 2 6.58831 2 5.48933 2.88646C5.26731 3.06554 5.06508 3.26787 4.88607 3.48998C4 4.58943 4 6.21265 4 9.45908V14.0052C4 17.7781 4 19.6645 5.17157 20.8366C6.11466 21.7801 7.52043 21.9641 10 22M13 2.50022V3.00043C13 5.83009 13 7.24492 13.8787 8.12398C14.7574 9.00304 16.1716 9.00304 19 9.00304H19.5"
              stroke="white"
              strokeWidth="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M14.3267 22L13.1155 20.9142C12.3718 20.2475 12 19.9142 12 19.5C12 19.0858 12.3718 18.7525 13.1155 18.0858L14.3267 17M17.6733 22L18.8845 20.9142C19.6282 20.2475 20 19.9142 20 19.5C20 19.0858 19.6282 18.7525 18.8845 18.0858L17.6733 17"
              stroke="white"
              strokeWidth="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <p className="font-medium text-sm whitespace-pre-wrap">
          {script.content}
        </p>
      </div>
      <div className="px-4 mb-8 w-full ring-1 ring-[#8CBE41] py-2 rounded-md bg-[#8CBE4120] flex items-center">
        {script.audioFileUrl ? (
          <>
            <div className="flex space-x-2 items-center mr-4">
              <div className="relative h-12 w-12 flex-shrink flex">
                <Image
                  src={"/images/dummy2.png"}
                  alt="Project"
                  fill
                  className="rounded-full"
                />
              </div>
              <button
                onClick={handlePlayPause}
                className="w-6 h-6 mr-3 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <Pause fill="currentColor" className="w-3 h-3 text-white" />
                ) : (
                  <Play fill="currentColor" className="w-3 h-3 text-white ml-0.5" />
                )}
              </button>
            </div>
            <ProgressSlider
              value={(currentTime / duration) * 100 || 0}
              max={100}
              onChange={handleSliderChange}
              isPlaying={isPlaying}
              playbackProgress={(currentTime / duration) * 100 || 0}
            />
            <audio ref={audioRef} src={script.audioFileUrl} className="hidden" />
          </>
        ) : (
          <div className="flex items-center justify-center w-full py-2">
            <span className="text-gray-400">No audio generated yet</span>
          </div>
        )}
      </div>

      <div className="bg-[#3F4B65] h-[99px] w-full justify-center rounded-md items-center flex space-x-4">
        <div onClick={handleSave}>
          <div className="h-12 w-12 flex-shrink-0 justify-center items-center flex rounded-full bg-gray-700 hover:bg-gray-600 hover:ring-1 ring-gray-300 transition-all duration-300 cursor-pointer">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.09501 10C3.03241 10.457 3 10.9245 3 11.4C3 16.7019 7.02943 21 12 21C16.9705 21 21 16.7019 21 11.4C21 10.9245 20.9675 10.457 20.9049 10"
                stroke="white"
                strokeWidth="1.5"
                stroke-linecap="round"
              />
              <path
                d="M12 13V3M12 13C11.2997 13 9.99153 11.0057 9.5 10.5M12 13C12.7002 13 14.0084 11.0057 14.5 10.5"
                stroke="white"
                strokeWidth="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span className="text-xs font-medium">Save</span>
        </div>
        <Popover>
          <PopoverTrigger>
            <div>
              <div className="h-12 w-12 flex-shrink-0 justify-center items-center flex rounded-full bg-gray-700 hover:bg-gray-600 hover:ring-1 ring-gray-300 transition-all duration-300 cursor-pointer">
                <svg
                  width="25"
                  height="24"
                  viewBox="0 0 25 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.5477 3.05293C19.3697 0.707361 2.98648 6.4532 3.00001 8.551C3.01535 10.9299 9.39809 11.6617 11.1672 12.1581C12.2311 12.4565 12.516 12.7625 12.7613 13.8781C13.8723 18.9305 14.4301 21.4435 15.7014 21.4996C17.7278 21.5892 23.6733 5.342 21.5477 3.05293Z"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M12 12.5L15.5 9"
                    stroke="white"
                    strokeWidth="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium">Share</span>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="bg-[#3F4B65] ring-1 ring-accent-foreground justify-between flex items-center space-x-2"
            align="start"
            side="top"
          >
            <button
              onClick={() => handleShare('telegram')}
              className="flex text-white gap-2 flex-col items-center justify-center hover:opacity-80 transition-opacity"
            >
              <svg
                width="22"
                height="21"
                viewBox="0 0 22 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.2647 1.11528C20.98 0.878413 20.6364 0.723175 20.2704 0.666084C19.9045 0.608994 19.5299 0.652188 19.1866 0.791069L1.26566 8.02642C0.88241 8.1841 0.556176 8.45461 0.33026 8.80204C0.104343 9.14946 -0.0105725 9.55738 0.000764965 9.97165C0.0121025 10.3859 0.149157 10.7869 0.393738 11.1215C0.638319 11.456 0.978859 11.7083 1.37016 11.8448L4.99516 13.1055L7.01566 19.7872C7.04312 19.8764 7.08297 19.9614 7.13404 20.0395C7.14179 20.0515 7.15272 20.0605 7.16096 20.0721C7.21996 20.1545 7.29127 20.2272 7.37239 20.2879C7.39546 20.3055 7.41755 20.322 7.44221 20.3376C7.53714 20.4006 7.64228 20.4466 7.75294 20.4737L7.76478 20.4747L7.77149 20.4776C7.83802 20.4911 7.90574 20.498 7.97364 20.4981C7.98017 20.4981 7.98597 20.4949 7.99244 20.4948C8.0949 20.493 8.19647 20.4754 8.29353 20.4425C8.31611 20.4348 8.33546 20.422 8.35737 20.4127C8.42975 20.3827 8.49832 20.3442 8.56166 20.2981C8.61238 20.2554 8.66312 20.2126 8.71388 20.1699L11.416 17.1866L15.4463 20.3086C15.8011 20.5849 16.2379 20.735 16.6875 20.7354C17.1587 20.7348 17.6154 20.5722 17.9809 20.2749C18.3465 19.9776 18.5987 19.5637 18.6954 19.1026L21.958 3.08599C22.032 2.72551 22.0065 2.35171 21.8844 2.00458C21.7623 1.65745 21.5481 1.35005 21.2647 1.11528ZM8.37016 13.4239C8.2315 13.562 8.13672 13.738 8.0977 13.9297L7.78819 15.4337L7.00413 12.8407L11.0694 10.7237L8.37016 13.4239ZM16.6719 18.7276L11.9092 15.0381C11.71 14.8841 11.46 14.8109 11.2092 14.833C10.9583 14.855 10.725 14.9708 10.5557 15.1572L9.69029 16.1124L9.99613 14.626L17.0791 7.54299C17.2482 7.37415 17.3512 7.15035 17.3695 6.91211C17.3878 6.67388 17.3201 6.43697 17.1788 6.24431C17.0375 6.05164 16.8319 5.91595 16.5992 5.86183C16.3664 5.8077 16.122 5.83871 15.9102 5.94924L5.74491 11.2419L2.02055 9.87896L19.999 2.68655L16.6719 18.7276Z"
                  fill="white"
                />
              </svg>

              <span className="text-sm font-medium">Telegram</span>
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="flex text-white gap-2 flex-col items-center justify-center hover:opacity-80 transition-opacity"
            >
              <svg
                width="22"
                height="19"
                viewBox="0 0 22 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.9924 1.38771C21.9925 1.21107 21.9458 1.03757 21.8571 0.884851C21.7683 0.732137 21.6407 0.605672 21.4871 0.518337C21.3336 0.431002 21.1597 0.385916 20.983 0.38767C20.8064 0.389425 20.6334 0.437958 20.4816 0.528326C19.8963 0.876711 19.2662 1.14351 18.6086 1.32133C17.6696 0.515558 16.472 0.0746293 15.2347 0.0791358C13.8772 0.0806984 12.5735 0.609729 11.5989 1.55452C10.6242 2.49931 10.0548 3.7859 10.011 5.14262C7.335 4.71588 4.90965 3.31914 3.19747 1.21876C3.09431 1.09359 2.96256 0.99507 2.81333 0.931502C2.6641 0.867934 2.50178 0.841183 2.34005 0.853506C2.17841 0.866815 2.02244 0.919299 1.88564 1.00642C1.74884 1.09353 1.63532 1.21266 1.55489 1.35351C1.14242 2.07332 0.90552 2.88026 0.863439 3.70881C0.821358 4.53736 0.975278 5.36416 1.3127 6.12206L1.31075 6.12401C1.1591 6.21741 1.03394 6.34816 0.947255 6.50375C0.860568 6.65935 0.815248 6.83458 0.815629 7.01269C0.813794 7.15961 0.822607 7.30648 0.841999 7.45214C0.944137 8.7104 1.50178 9.88819 2.41036 10.7646C2.34872 10.8821 2.3111 11.0106 2.2997 11.1427C2.2883 11.2748 2.30334 11.4079 2.34395 11.5342C2.74006 12.7683 3.58245 13.8102 4.70626 14.456C3.5645 14.8975 2.33168 15.0515 1.11641 14.9043C0.891482 14.8761 0.66364 14.9251 0.470258 15.0434C0.276876 15.1617 0.129436 15.3422 0.0521248 15.5553C-0.0251868 15.7684 -0.0277799 16.0014 0.0447706 16.2162C0.117321 16.431 0.260708 16.6147 0.451409 16.7373C2.5415 18.0835 4.97509 18.7992 7.46118 18.7988C10.2804 18.8305 13.0311 17.9296 15.2854 16.2363C17.5397 14.5429 19.1711 12.152 19.926 9.43551C20.2791 8.25214 20.4593 7.02398 20.4612 5.78907C20.4612 5.72364 20.4612 5.65626 20.4602 5.58888C20.9823 5.02581 21.3868 4.36418 21.6499 3.64277C21.913 2.92137 22.0294 2.1547 21.9924 1.38771ZM18.6857 4.59962C18.5206 4.79496 18.437 5.04641 18.4523 5.30177C18.4621 5.46677 18.4611 5.63277 18.4611 5.78907C18.4591 6.83261 18.3061 7.87037 18.007 8.87013C17.3905 11.1815 16.0162 13.2192 14.1041 14.6567C12.192 16.0943 9.85286 16.8486 7.46118 16.7988C6.60206 16.7991 5.7459 16.6981 4.9104 16.4981C5.97581 16.1547 6.97199 15.6254 7.85278 14.9346C8.01501 14.8068 8.13373 14.632 8.19267 14.4342C8.2516 14.2363 8.24786 14.025 8.18195 13.8293C8.11605 13.6336 7.99121 13.4632 7.82456 13.3413C7.65791 13.2194 7.45762 13.152 7.25118 13.1484C6.42001 13.1355 5.62631 12.8005 5.03731 12.2139C5.18673 12.1856 5.33517 12.1504 5.48263 12.1084C5.69864 12.0469 5.88767 11.9145 6.01929 11.7325C6.15091 11.5506 6.21745 11.3296 6.2082 11.1052C6.19896 10.8808 6.11446 10.666 5.96831 10.4955C5.82217 10.3249 5.62289 10.2086 5.40255 10.165C4.92009 10.0698 4.4661 9.86451 4.07586 9.56523C3.68563 9.26595 3.36967 8.88071 3.15255 8.43946C3.33328 8.46412 3.51516 8.47944 3.69747 8.48536C3.91405 8.48863 4.12606 8.42293 4.30285 8.29776C4.47963 8.17259 4.61202 7.99444 4.68087 7.78907C4.74685 7.58183 4.74345 7.35873 4.6712 7.1536C4.59894 6.94846 4.46177 6.77249 4.28048 6.65235C3.84063 6.35932 3.48032 5.96177 3.23184 5.4953C2.98335 5.02884 2.85444 4.50802 2.85665 3.97951C2.85665 3.91311 2.8586 3.8467 2.86251 3.78127C5.10377 5.87152 8.01083 7.10371 11.0715 7.26076C11.226 7.26684 11.3799 7.23774 11.5215 7.17566C11.6631 7.11357 11.7887 7.02012 11.8889 6.90236C11.9881 6.78346 12.0583 6.64316 12.0941 6.49251C12.1298 6.34187 12.1301 6.18498 12.0949 6.0342C12.0377 5.79556 12.0085 5.55107 12.008 5.30568C12.0089 4.45021 12.3491 3.63004 12.954 3.02514C13.5589 2.42024 14.3791 2.08001 15.2346 2.07911C15.6747 2.07793 16.1103 2.168 16.5139 2.34365C16.9174 2.5193 17.2802 2.7767 17.5793 3.09962C17.6946 3.2237 17.8398 3.31621 18.001 3.36835C18.1622 3.42049 18.334 3.43053 18.5002 3.39751C18.911 3.31756 19.3159 3.2099 19.7121 3.07525C19.4418 3.62822 19.0964 4.14119 18.6857 4.59962Z"
                  fill="white"
                />
              </svg>
              <span className="text-sm font-medium">Twitter</span>
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex text-white gap-2 flex-col items-center justify-center hover:opacity-80 transition-opacity"
            >
              <svg
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.6 12.8121C14.4 12.7121 13.1 12.1121 12.9 12.0121C12.7 11.9121 12.5 11.9121 12.3 12.1121C12.1 12.3121 11.7 12.9121 11.5 13.1121C11.4 13.3121 11.2 13.3121 11 13.2121C10.3 12.9121 9.6 12.5121 9 12.0121C8.5 11.5121 8 10.9121 7.6 10.3121C7.5 10.1121 7.6 9.91211 7.7 9.81211C7.8 9.71211 7.9 9.51211 8.1 9.41211C8.2 9.31211 8.3 9.11211 8.3 9.01211C8.4 8.91211 8.4 8.71211 8.3 8.61211C8.2 8.51211 7.7 7.31211 7.5 6.81211C7.4 6.11211 7.2 6.11211 7 6.11211C6.9 6.11211 6.7 6.11211 6.5 6.11211C6.3 6.11211 6 6.31211 5.9 6.41211C5.3 7.01211 5 7.71211 5 8.51211C5.1 9.41211 5.4 10.3121 6 11.1121C7.1 12.7121 8.5 14.0121 10.2 14.8121C10.7 15.0121 11.1 15.2121 11.6 15.3121C12.1 15.5121 12.6 15.5121 13.2 15.4121C13.9 15.3121 14.5 14.8121 14.9 14.2121C15.1 13.8121 15.1 13.4121 15 13.0121C15 13.0121 14.8 12.9121 14.6 12.8121ZM17.1 3.71211C13.2 -0.187891 6.9 -0.187891 3 3.71211C-0.2 6.91211 -0.8 11.8121 1.4 15.7121L0 20.8121L5.3 19.4121C6.8 20.2121 8.4 20.6121 10 20.6121C15.5 20.6121 19.9 16.2121 19.9 10.7121C20 8.11211 18.9 5.61211 17.1 3.71211ZM14.4 17.7121C13.1 18.5121 11.6 19.0121 10 19.0121C8.5 19.0121 7.1 18.6121 5.8 17.9121L5.5 17.7121L2.4 18.5121L3.2 15.5121L3 15.2121C0.6 11.2121 1.8 6.21211 5.7 3.71211C9.6 1.21211 14.6 2.51211 17 6.31211C19.4 10.2121 18.3 15.3121 14.4 17.7121Z"
                  fill="white"
                />
              </svg>
              <span className="text-sm font-medium">Whatsapp</span>
            </button>
          </PopoverContent>
        </Popover>

        <div onClick={isDuplicating ? undefined : handleDuplicate}>
          <div className={`h-12 w-12 flex-shrink-0 justify-center items-center flex rounded-full bg-gray-700 hover:bg-gray-600 hover:ring-1 ring-gray-300 transition-all duration-300 ${isDuplicating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
            {isDuplicating ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 15C9 12.1716 9 10.7574 9.87868 9.87868C10.7574 9 12.1716 9 15 9H16C18.8284 9 20.2426 9 21.1213 9.87868C22 10.7574 22 12.1716 22 15V16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15C12.1716 22 10.7574 22 9.87868 21.1213C9 20.2426 9 18.8284 9 16V15Z"
                  stroke="white"
                  strokeWidth="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M16.9999 9C16.9975 6.04291 16.9528 4.51121 16.092 3.46243C15.9258 3.25989 15.7401 3.07418 15.5376 2.90796C14.4312 2 12.7875 2 9.5 2C6.21252 2 4.56878 2 3.46243 2.90796C3.25989 3.07417 3.07418 3.25989 2.90796 3.46243C2 4.56878 2 6.21252 2 9.5C2 12.7875 2 14.4312 2.90796 15.5376C3.07417 15.7401 3.25989 15.9258 3.46243 16.092C4.51121 16.9528 6.04291 16.9975 9 16.9999"
                  stroke="white"
                  strokeWidth="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="text-xs font-medium">{isDuplicating ? 'Duplicating...' : 'Duplicate'}</span>
        </div>

        <div onClick={handleCopylink}>
          <div className="h-12 w-12 flex-shrink-0 justify-center items-center flex flex-col  rounded-full bg-gray-700 hover:bg-gray-600 hover:ring-1 ring-gray-300 transition-all duration-300 cursor-pointer">
            <svg
              width="25"
              height="24"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 14.5L15 9.5"
                stroke="white"
                strokeWidth="1.5"
                stroke-linecap="round"
              />
              <path
                d="M17.3463 14.6095L19.9558 12C22.0147 9.94112 22.0147 6.60302 19.9558 4.54415C17.897 2.48528 14.5589 2.48528 12.5 4.54415L9.89045 7.1537M15.1095 16.8463L12.5 19.4558C10.4411 21.5147 7.10303 21.5147 5.04416 19.4558C2.98528 17.3969 2.98528 14.0588 5.04416 12L7.6537 9.39045"
                stroke="white"
                strokeWidth="1.5"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <span className="text-xs font-medium">Copy link</span>
        </div>
        <div>
          <div
            onClick={handleEditProject}
            className="h-12 w-12 flex-shrink-0 justify-center items-center flex flex-col  rounded-full bg-gray-700 hover:bg-gray-600 hover:ring-1 ring-gray-300 transition-all duration-300 cursor-pointer"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.2141 5.98239L16.6158 4.58063C17.39 3.80646 18.6452 3.80646 19.4194 4.58063C20.1935 5.3548 20.1935 6.60998 19.4194 7.38415L18.0176 8.78591M15.2141 5.98239L6.98023 14.2163C5.93493 15.2616 5.41226 15.7842 5.05637 16.4211C4.70047 17.058 4.3424 18.5619 4 20C5.43809 19.6576 6.94199 19.2995 7.57889 18.9436C8.21579 18.5877 8.73844 18.0651 9.78375 17.0198L18.0176 8.78591M15.2141 5.98239L18.0176 8.78591"
                stroke="white"
                strokeWidth="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M11 20H17"
                stroke="white"
                strokeWidth="1.5"
                stroke-linecap="round"
              />
            </svg>
          </div>
          <span className="text-xs font-medium">Edit Work</span>
        </div>
      </div>
    </div>
  );
};

export default Project;
