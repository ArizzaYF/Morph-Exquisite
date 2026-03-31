import { useState } from "react"
import { createSession, getSessionByCode } from "../lib/gameService"

export default function Lobby({ onJoin }) {
  const [segments, setSegments] = useState(3)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async () => {
    setLoading(true)
    setError("")
    try {
      const session = await createSession(segments)
      onJoin(session, 0)
    } catch (e) {
      setError("Error creando sesión: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    if (code.length < 4) return setError("Ingresa un código válido")
    setLoading(true)
    setError("")
    try {
      const session = await getSessionByCode(code)
      onJoin(session, session.current_turn)
    } catch (e) {
      setError("Sesión no encontrada")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">🎨 Morph-Exquisite</h1>
          <p className="text-slate-500 mt-1">Cadáver Exquisito colaborativo</p>
        </div>

        {/* Crear sesión */}
        <div className="flex flex-col gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <h2 className="font-semibold text-indigo-800">Crear nueva partida</h2>
          <label className="text-sm text-slate-600">
            ¿Cuántos segmentos?
            <div className="flex gap-2 mt-2">
              {[3, 4, 5, 6, 7].map((n) => (
                <button
                  key={n}
                  onClick={() => setSegments(n)}
                  className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                    segments === n
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </label>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear partida"}
          </button>
        </div>

        {/* Unirse a sesión */}
        <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h2 className="font-semibold text-slate-700">Unirse a partida existente</h2>
          <input
            type="text"
            placeholder="Código de sala (ej: XKQT)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={4}
            className="px-3 py-2 border border-slate-300 rounded-lg text-center text-lg font-mono tracking-widest uppercase focus:outline-none focus:border-indigo-400"
          />
          <button
            onClick={handleJoin}
            disabled={loading}
            className="py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "Buscando..." : "Unirse"}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}
      </div>
    </div>
  )
}
