import { useRef, useEffect, useCallback } from "react"

export default function Canvas({
  width = 600,
  height = 300,
  guideImageData = null,
  onFinish,
  color = "#1a1a1a",
  brushSize = 6,
}) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPos = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)
    if (guideImageData) {
      ctx.putImageData(guideImageData, 0, 0)
      ctx.setLineDash([6, 4])
      ctx.strokeStyle = "#94a3b8"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, 20)
      ctx.lineTo(width, 20)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [guideImageData, width, height])

  const getPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }, [])

  const startDrawing = useCallback((e) => {
    e.preventDefault()
    isDrawing.current = true
    lastPos.current = getPos(e)
  }, [getPos])

  const draw = useCallback((e) => {
    if (!isDrawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const currentPos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(currentPos.x, currentPos.y)
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
    lastPos.current = currentPos
  }, [getPos, color, brushSize])

  const stopDrawing = useCallback(() => {
    isDrawing.current = false
    lastPos.current = null
  }, [])

  const handleFinish = () => {
    canvasRef.current.toBlob((blob) => {
      if (onFinish) onFinish(blob)
    }, "image/png")
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {guideImageData && (
        <p className="text-xs text-slate-500 self-start">
          ↑ Los primeros 20px muestran el final del turno anterior
        </p>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-slate-300 rounded-lg cursor-crosshair touch-none"
        style={{ maxWidth: "100%" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <button
        onClick={handleFinish}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        Terminar mi turno →
      </button>
    </div>
  )
}
