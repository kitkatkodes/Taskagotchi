import { motion } from "framer-motion";

const PET_FACE = {
  happy: "^_^",
  sad: "T_T",
  tired: "-_-",
};

const PET_STYLE = {
  neko: {
    icon: "🐱",
    accent: "text-pink-600",
    bg: "bg-candyPink",
    label: "Neko",
  },
  piyo: {
    icon: "🐥",
    accent: "text-amber-500",
    bg: "bg-yellow-100",
    label: "Piyo",
  },
  kuma: {
    icon: "🐻",
    accent: "text-amber-700",
    bg: "bg-orange-100",
    label: "Kuma",
  },
};

export default function PetDisplay({ pet, onAction }) {
  const mood = pet?.mood || "happy";
  const face = PET_FACE[mood] || "^_^";
  const petType = pet?.pet_type || "neko";
  const stage = pet?.evolution_stage || 1;
  const style = PET_STYLE[petType] || PET_STYLE.neko;

  return (
    <div className="bg-white rounded-3xl shadow-soft p-6 text-center">
      <h2 className="text-lg font-bold text-pink-500">Your Buddy</h2>
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [0, 2, -2, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className={`mx-auto mt-4 h-44 w-44 rounded-full ${style.bg} flex flex-col items-center justify-center text-4xl font-bold ${style.accent}`}
      >
        <span className="text-5xl leading-none">{style.icon}</span>
        <span className="text-2xl mt-2">{face}</span>
      </motion.div>
      <p className="mt-4 text-gray-700">
        {style.label} | Stage {stage}
      </p>
      <div className="mt-4 space-y-3 text-sm text-left">
        <div>
          <div className="flex justify-between mb-1">
            <span>Health</span>
            <span>{pet?.health ?? 0}%</span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 border border-rose-200 overflow-hidden">
            <div className="h-full bg-rose-400 transition-all duration-500" style={{ width: `${pet?.health ?? 0}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span>Energy</span>
            <span>{pet?.energy ?? 0}%</span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 border border-sky-200 overflow-hidden">
            <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${pet?.energy ?? 0}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <button className="rounded-lg bg-green-100 text-green-700 py-2" onClick={() => onAction("feed")}>
          Feed
        </button>
        <button className="rounded-lg bg-blue-100 text-blue-700 py-2" onClick={() => onAction("play")}>
          Play
        </button>
        <button className="rounded-lg bg-purple-100 text-purple-700 py-2" onClick={() => onAction("rest")}>
          Rest
        </button>
      </div>
    </div>
  );
}
