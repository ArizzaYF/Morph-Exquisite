import { useState, useEffect, useRef } from "react"
import { getAllSegments } from "../lib/gameService"
import { uploadDrawing, annotateDrawing, animateDrawing } from "../lib/animationService"

const MOTIONS = [
  { id: 'wave',  label: '👋 Saludar' },
  { id: 'dab',   label: '🤙 Dab' },
  { id: 'kick',  label: '🦵 Patear' },
  { id: 'jump',  label: '⬆️ Saltar' },
  { id: 'run',   label: '🏃 Correr' },
  { id: 'walk',  label: '🚶 Caminar' },
]

export default function Result({ sessionId, onPlayAgain }) {
  const [segments, setSegments] = useState([])
  const [loading, setLoading] = useState(true)
  const [animating, setAnimating] = useState(false)
  const [animationUrl, setAnimationUrl] = useState(null)
  const [animError, setAnimError] = useState("")
  const [selectedMotion, setSelectedMotion] = useState('wave')
  const canvasRef = useRef(null)

  useEffect(() => {
    getAllSegments(sessionId).then((data) => {
      setSegments(data)
      setLoading(false)
    })
  }, [sessionId])

  // Ensambla los segmentos en el canvas
  useEffect(() => {
    if (segments.length === 0 || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const segmentHeight = 300
    canvas.width = 600
    canvas.height = segmentHeight * segments.length

    segments.forEach((seg, i) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        ctx.drawImage(img, 0, i * segmentHeight, 600, segmentHeight)
      }
      img.src = seg.image_url
    })
  }, [segments])

  // Exporta el canvas como Blob y lo manda a la IA
  const handleAnimate = async () => {
    setAnimating(true)
    setAnimError("")
    setAnimationUrl(null)

    try {
      // 1. Obtener el PNG ensamblado del canvas
      const blob = await new Promise((resolve) =>
        canvasRef.current.toBlob(resolve, 'image/png')
      )

      // 2. Subir a Meta Animated Drawings
      const uuid = await uploadDrawing(blob)

      // 3. Anotar automáticamente
      await annotateDrawing(uuid)

      // 4. Animar con el movimiento elegido
      const gifUrl = await animateDrawing(uuid, selectedMotion)
      setAnimationUrl(gifUrl)

    } catch (e) {
      setAnimError("No se pudo animar: " + e.message)
    } finally {
      setAnimating(false)
    }
  }

  const handleDownload = () => {
    const url = canvasRef.current.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = "morph-exquisite-personaje.png"
    a.click()
  }

  const handleDownloadGif = () => {
    const a = document.createElement("a")
    a.href = animationUrl
    a.download = "morph-exquisite-animado.gif"
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
          />
        )}

        {/* Sección de animación */}
        {!loading && (
          <div className="w-full flex flex-col gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <h2 className="font-semibold text-indigo-800">🤖 Animar con IA</h2>
            <p className="text-xs text-slate-500">
              Meta Animated Drawings detectará el cuerpo y animará tu personaje
            </p>

            {/* Selector de movimiento */}
            <div className="flex flex-wrap gap-2">
              {MOTIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMotion(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedMotion === m.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleAnimate}
              disabled={animating}
              className="py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
            >
              {animating ? "Animando... (puede tardar ~30s)" : "✨ ¡Animar personaje!"}
            </button>

            {animError && (
              <p className="text-red-500 text-sm">{animError}</p>
            )}
          </div>
        )}

        {/* GIF resultado */}
        {animationUrl && (
          <div className="w-full flex flex-col items-center gap-3">
            <p className="font-semibold text-green-700">🎬 ¡Tu personaje animado!</p>
            <img
              src={animationUrl}
              alt="Personaje animado"
              className="rounded-xl border border-slate-200 max-w-xs"
            />
            <button
              onClick={handleDownloadGif}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              ⬇️ Descargar GIF
            </button>
          </div>
        )}

        <div className="flex gap-3 w-full">
          <button
            onClick={handleDownload}
            className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            ⬇️ Descargar PNG
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
