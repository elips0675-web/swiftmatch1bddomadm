import { useMemo } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function HeartConfetti() {
  const hearts = useMemo(() => Array.from({ length: 20 }), []);
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {hearts.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "100%", x: 0, opacity: 1 }}
          animate={{
            y: -(Math.random() * 200 + 100),
            x: (Math.random() - 0.5) * 500,
            scale: Math.random() * 1.2 + 0.8,
            opacity: [1, 1, 0],
            rotate: (Math.random() - 0.5) * 540,
          }}
          transition={{
            duration: Math.random() * 2 + 2.5,
            ease: "easeOut",
            delay: 0.2,
          }}
          className="absolute bottom-0"
        >
          <Heart
            size={Math.random() * 25 + 15}
            fill={i % 3 === 0 ? "#fe3c72" : i % 3 === 1 ? "#ff8e53" : "#ffc0cb"}
            className="text-transparent drop-shadow-lg"
          />
        </motion.div>
      ))}
    </div>
  );
}
