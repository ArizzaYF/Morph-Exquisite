import { useState, useEffect, useRef } from "react"
import { getAllSegments } from "../lib/gameService"

export default function Result({ sessionId, onPlayAgain }) {
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef(null)

  useEffect(() => {
    getAllSegments(sessionId).then((data) => {
      setSegments(data)
      setLoading(false)
    })
  }, [sessionId])

  useEffect(() => {
    if (segments.length === 0 || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const segmentHeight = 300
    canvas.width = 600
    canvas.height = segmentHeight * segments.length

    let loaded = 0
    segments.forEach((seg, i) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        ctx.drawImage(img, 0, i * segmentHeight, 600, segmentHeight)
        loaded++
      }
      img.src = seg.image_url
    })
  }, [segments])

  const handleDownload = () => {
    const url = canvasRef.current.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = "morph-exquisite-personaje.png"
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 w-full max-w-2xl items-center">
        <h1 className="text-2xl font-bold text-slate-800">🎉 ¡Personaje completado!</h1>
        <p className="text-slate-500 text-sm">Así quedó la creación colaborativa</p>

        {loading ? (
          <p className="text-slate-400 py-12">Ensamblando personaje...</p>
        ) : (
          <canvas
            ref={canvasRef}
            className="border border-slate-200 rounded-xl w-full"
            style={{ imageRendering: "pixelated" }}
          />
        )}

        <div className="flex gap-3 w-full">
          <button
            onClick={handleDownload}
            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            ⬇️ Descargar personaje
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            🔄 Jugar de nuevo
          </button>
        </div>
      </div>
    </div>
  )
}
