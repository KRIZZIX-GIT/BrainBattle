import confetti from "canvas-confetti"

function ConfettiEffect() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
    })

  return null
}

export default ConfettiEffect