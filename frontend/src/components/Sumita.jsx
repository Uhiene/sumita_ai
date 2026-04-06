import { motion } from "framer-motion";
import SpeechBubble from "./SpeechBubble";

const SIZES = { sm: 80, md: 120, lg: 160, xl: 240 };

const POSE_IMAGES = {
  wave:      "/sumita/sumita-wave.png",
  point:     "/sumita/sumita-point.png",
  celebrate: "/sumita/sumita-celebrate.png",
  think:     "/sumita/sumita-think.png",
};

// Per-pose Framer Motion animate + transition config
const ANIMATIONS = {
  wave: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  point: {
    animate: { y: [0, -10, 0] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
  celebrate: {
    animate: { y: [0, -16, 0, -8, 0] },
    transition: { duration: 0.7, repeat: Infinity, ease: "easeOut" },
  },
  think: {
    animate: { rotate: [-4, 4, -4] },
    transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
  },
};

/**
 * Sumita mascot component.
 *
 * Props:
 *   pose      "wave" | "point" | "celebrate" | "think"   default "wave"
 *   message   string   text shown in speech bubble (omit to hide bubble)
 *   size      "sm" | "md" | "lg"                          default "md"
 *   direction "left" | "right"  which side bubble appears  default "right"
 */
export default function Sumita({
  pose = "wave",
  message,
  size = "md",
  direction = "right",
}) {
  const px = SIZES[size] ?? SIZES.md;
  const { animate, transition } = ANIMATIONS[pose] ?? ANIMATIONS.wave;
  const src = POSE_IMAGES[pose] ?? POSE_IMAGES.wave;

  const image = (
    <motion.img
      src={src}
      alt={`Sumita ${pose}`}
      animate={animate}
      transition={transition}
      style={{
        width: px,
        height: "auto",
        display: "block",
        flexShrink: 0,
        userSelect: "none",
        pointerEvents: "none",
      }}
    />
  );

  const bubble = message ? (
    <SpeechBubble message={message} direction={direction === "right" ? "left" : "right"} />
  ) : null;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "12px",
        flexDirection: direction === "right" ? "row" : "row-reverse",
      }}
    >
      {image}
      {bubble}
    </div>
  );
}
