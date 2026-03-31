import { useState } from "react"
import Canvas from "./components/Canvas"
import Toolbar from "./components/Toolbar"

export default function App() {
  const [color, setColor] = useState("#1a1a1a")
  const [brushSize, setBrushSize] = useState(6)
  const [savedBlob, setSavedBlob] = useState(null)

  const handleFinish = (blob) => {
    setSavedBlob(blob)
    const url = URL.createObjectURL(blob)
    window.open(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-800">
          🎨 Morph-Exquisite
          <span className="ml-2 text-sm font-normal text-slate-400">Paso 1 — Canvas</span>
        </h1>
        <Toolbar
          color={color}
          setColor={setColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
        />
        <Canvas
          width={600}
          height={300}
          color={color}
          brushSize={brushSize}
          onFinish={handleFinish}
        />
        {savedBlob && (
          <p className="text-green-600 text-sm text-center">
            ✅ Segmento exportado correctamente ({Math.round(savedBlob.size / 1024)} KB)
          </p>
        )}
      </div>
    </div>
  )
}
