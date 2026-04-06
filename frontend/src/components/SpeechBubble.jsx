/**
 * SpeechBubble — cartoon-style bubble with a tail pointing left or right.
 *
 * Props:
 *   message   string          text to display
 *   direction "left" | "right"  which side the tail points toward Sumita
 */
export default function SpeechBubble({ message, direction = "left" }) {
  if (!message) return null;

  // Tail is a CSS triangle positioned on the side closest to Sumita.
  // direction="left"  → tail pokes out the left  (Sumita is to our left)
  // direction="right" → tail pokes out the right (Sumita is to our right)
  const tailBase = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 0,
    height: 0,
    borderTop: "10px solid transparent",
    borderBottom: "10px solid transparent",
  };

  const tail =
    direction === "left"
      ? {
          ...tailBase,
          left: "-12px",
          borderRight: "12px solid #FFD700",
        }
      : {
          ...tailBase,
          right: "-12px",
          borderLeft: "12px solid #FFD700",
        };

  // Inner fill tail sits on top to create a bordered look
  const tailInnerBase = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 0,
    height: 0,
    borderTop: "8px solid transparent",
    borderBottom: "8px solid transparent",
  };

  const tailInner =
    direction === "left"
      ? {
          ...tailInnerBase,
          left: "-9px",
          borderRight: "10px solid #FFF3CC",
        }
      : {
          ...tailInnerBase,
          right: "-9px",
          borderLeft: "10px solid #FFF3CC",
        };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Outer border tail */}
      <span style={tail} />
      {/* Inner fill tail */}
      <span style={tailInner} />

      <div
        style={{
          backgroundColor: "#FFF3CC",
          border: "2px solid #FFD700",
          borderRadius: "20px",
          padding: "12px 16px",
          color: "#2D2D2D",
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          lineHeight: "1.5",
          maxWidth: "260px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        {message}
      </div>
    </div>
  );
}
