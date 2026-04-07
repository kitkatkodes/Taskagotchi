import { motion } from "framer-motion";
import { setPetType } from "../api";

const PETS = ["neko", "piyo", "kuma"];

export default function PetSelector({ userId, selected, onPetUpdated }) {
  return (
    <div className="bg-white rounded-3xl shadow-soft p-4">
      <h3 className="font-bold text-pink-500">Choose Pet</h3>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {PETS.map((pet) => (
          <motion.button
            key={pet}
            whileTap={{ scale: 0.95 }}
            className={`rounded-xl p-2 capitalize ${selected === pet ? "bg-pink-300 text-white" : "bg-pink-50 text-pink-500"}`}
            onClick={async () => {
              const data = await setPetType(userId, pet);
              onPetUpdated(data);
            }}
          >
            {pet}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
