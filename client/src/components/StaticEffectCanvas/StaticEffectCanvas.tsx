import { useEffect, useRef } from "react"

interface StaticEffectCanvasProps {
  interference: boolean
}

function StaticEffectCanvas({interference}: StaticEffectCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
  
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
  
    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
  
    let animationFrameId: number
  
    const drawStatic = () => {
      const width = canvas.width
      const height = canvas.height
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data
  
      for (let i = 0; i < data.length; i += 4) {
        const shade = Math.random() * 255
        data[i] = shade // Red
        data[i + 1] = shade // Green
        data[i + 2] = shade // Blue
        data[i + 3] = 255 // Alpha
      }
  
      ctx.putImageData(imageData, 0, 0)
      animationFrameId = requestAnimationFrame(drawStatic)
    }
  
    if (interference) {
      animationFrameId = requestAnimationFrame(drawStatic)
    }
  
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", updateCanvasSize)
    }
  }, [interference])

  return <canvas 
    ref={canvasRef} 
    style={{
        position: "fixed",
        top: 0,
        left: 0,
        opacity: interference ? 1 : 0,
        width: "100vw",
        height: "100vh",
        zIndex: interference ? 9999 : -1,
        background: "black",
    }}
  />
}

export default StaticEffectCanvas