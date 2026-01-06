import React from "react";
import { ArrowLeft, Check, ChevronLeft } from "lucide-react";

interface ActivePlanProps {
  onBack?: () => void;
  onManagePlan?: () => void;
  onCancelPlan?: () => void;
}

const ActivePlan: React.FC<ActivePlanProps> = ({
  onBack,
  onManagePlan,
  onCancelPlan,
}) => {
  const planFeatures = [
    "Generate speech in 20+ Languages using thousands of ~30k+ unique voices",
    "Translate content with automatic dubbing",
    "Create custom, synthetic voices",
    "Generate sound effects",
    "Download 30 minutes of audio & 10mins of Videos",
    "Clone your voice with as little as 1 minute of audio",
    "Access to the Dubbing studio for more control over transition and timing",
    "License to use TalkTune for commercial use",
  ];

  return (
    <div className="w-full h-full p-4">
      <button
        // onClick={onClose}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <h2 className="text-2xl font-medium my-4">Active Plan</h2>

      <div className="bg-slate-800/80 backdrop-blur-sm h-[55vh] overflow-auto rounded-2xl border border-green-400/50 shadow-xl shadow-green-500/10 p-8">
        <div className="flex justify-between items-start mb-8">
          <h2 className="text-3xl font-bold text-white">Starter plan</h2>
          <span className="text-3xl font-bold text-white">$150</span>
        </div>

        <div className="h-px bg-slate-600 mb-8"></div>

        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-slate-400 text-lg mb-2">
                Voiceover time remaining
              </h3>
              <p className="text-white text-2xl font-bold">10.00/20.00hrs</p>
            </div>
            <div className="bg-slate-700 px-4 py-2 rounded-lg">
              <span className="text-slate-300 font-medium">6 days left</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-600 mb-8"></div>

        <p className="text-slate-300 text-lg mb-8">
          This is for hobbyists creating projects with AI audio
        </p>

        <div className="h-px bg-slate-600 mb-8"></div>

        <div className="space-y-6 mb-12">
          {planFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <Check className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
              <span className="text-slate-300 text-lg leading-relaxed">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onManagePlan}
            className="px-8 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Manage Plan
          </button>
          <button
            onClick={onCancelPlan}
            className="px-8 py-3 bg-transparent border-2 border-slate-600 text-white font-semibold rounded-lg hover:border-slate-500 hover:bg-slate-700/30 transition-all"
          >
            Cancel Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivePlan;
