import { useEffect, useState } from "react"
import { subscribeToSession } from "../lib/gameService"

export default function WaitingRoom({ session, myTurn, onMyTurn }) {
  const [currentTurn, setCurrentTurn] = useState(session.current_turn)

  useEffect(() => {
    // Si ya es mi turno al entrar, avanzar de una
    if (session.current_turn === myTurn) {
      onMyTurn()
      return
    }

    // Escuchar cambios en tiempo real
    const unsubscribe = subscribeToSession(session.id, (updatedSession) => {
      setCurrentTurn(updatedSession.current_turn)
      if (updatedSession.current_turn === myTurn) {
        onMyTurn()
      }
      if (updatedSession.status === 'finished') {
        onMyTurn('finished')
      }
    })

    return unsubscribe
  }, [session.id, myTurn, onMyTurn])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col items-center gap-6">
        <div className="text-5xl animate-bounce">⏳</div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Esperando tu turno</h1>
          <p className="text-slate-500 mt-2">
            Sala: <span className="font-mono font-bold text-indigo-600">{session.code}</span>
          </p>
        </div>

        <div className="w-full bg-slate-50 rounded-xl p-4 flex flex-col gap-3">
          {Array.from({ length: session.total_segments }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${i < currentTurn ? 'bg-green-100 text-green-700' : ''}
                ${i === currentTurn ? 'bg-indigo-600 text-white animate-pulse' : ''}
                ${i > currentTurn ? 'bg-slate-200 text-slate-400' : ''}
              `}>
                {i < currentTurn ? '✓' : i + 1}
              </div>
              <span className="text-sm text-slate-600">
                {i < currentTurn && 'Segmento completado'}
                {i === currentTurn && (i === myTurn ? '← Tu turno está listo' : 'Dibujando ahora...')}
                {i > currentTurn && 'Pendiente'}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center">
          Comparte el código con tus amigos para que se unan
        </p>
      </div>
    </div>
  )
}
