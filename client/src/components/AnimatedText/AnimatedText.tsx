import { motion } from "framer-motion"

interface AnimatedTextProps {
  text: string
}

const AnimatedText = ({ text }: AnimatedTextProps) => (
  <div style={{ display: "inline-block", textAlign: "center", color: "white" }}>
    {text.split("").map((char, index) => (
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.05,
          duration: 0.4,
        }}
        style={{
          display: "inline-block",
          fontSize: "30px",
          whiteSpace: "pre-line",
          fontWeight: "bold",
        }}
      >
        {char === " " ? "\u00A0" : char}
      </motion.span>
    ))}
  </div>
)

export default AnimatedText