import { useState, useEffect } from "react"
import Canvas from "../components/Canvas"
import Toolbar from "../components/Toolbar"
import { saveSegment, getGuideFromPreviousSegment, finishSession } from "../lib/gameService"

export default function DrawingRoom({ session, turnNumber, onFinished }) {
  const [color, setColor] = useState("#1a1a1a")
  const [brushSize, setBrushSize] = useState(6)
  const [guideImageData, setGuideImageData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loadingGuide, setLoadingGuide] = useState(true)

  const isLastTurn = turnNumber === session.total_segments - 1

  useEffect(() => {
    setLoadingGuide(true)
    getGuideFromPreviousSegment(session.id, turnNumber)
      .then(setGuideImageData)
      .finally(() => setLoadingGuide(false))
  }, [session.id, turnNumber])

  const handleFinish = async (blob) => {
    setSaving(true)
    try {
      await saveSegment(session.id, turnNumber, blob)
      if (isLastTurn) {
        await finishSession(session.id)
        onFinished(session.id)
      } else {
        onFinished(session.id, turnNumber + 1)
      }
    } catch (e) {
      alert("Error guardando: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">🎨 Morph-Exquisite</h1>
            <p className="text-sm text-slate-500">Sala: <span className="font-mono font-bold">{session.code}</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Segmento</p>
            <p className="text-2xl font-bold text-indigo-600">
              {turnNumber + 1} / {session.total_segments}
            </p>
          </div>
        </div>

        {/* Instrucción */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
          {turnNumber === 0
            ? "✏️ Dibuja la cabeza o la parte superior del personaje"
            : isLastTurn
            ? "✏️ Dibuja la parte final — ¡termina el personaje!"
            : "✏️ Continúa desde la guía de arriba — dibuja la parte del medio"}
        </div>

        <Toolbar color={color} setColor={setColor} brushSize={brushSize} setBrushSize={setBrushSize} />

        {loadingGuide ? (
          <div className="h-[300px] flex items-center justify-center text-slate-400">
            Cargando guía...
          </div>
        ) : (
          <Canvas
            width={600}
            height={300}
            color={color}
            brushSize={brushSize}
            guideImageData={guideImageData}
            onFinish={handleFinish}
          />
        )}

        {saving && (
          <p className="text-indigo-600 text-sm text-center animate-pulse">
            Guardando segmento...
          </p>
        )}
      </div>
    </div>
  )
}
