import { useState, useCallback } from "react"
import Lobby from "./pages/Lobby"
import WaitingRoom from "./pages/WaitingRoom"
import DrawingRoom from "./pages/DrawingRoom"
import Result from "./pages/Result"

export default function App() {
  const [screen, setScreen] = useState("lobby")
  const [session, setSession] = useState(null)
  const [myTurn, setMyTurn] = useState(0)
  const [finishedSessionId, setFinishedSessionId] = useState(null)

  // Cuando el jugador crea o se une a una sesión
  const handleJoin = useCallback((sessionData, turn) => {
    setSession(sessionData)
    setMyTurn(turn)
    // Si es el turno 0 (creador), va directo a dibujar
    // Si se une en otro turno, va a la sala de espera
    if (sessionData.current_turn === turn) {
      setScreen("drawing")
    } else {
      setScreen("waiting")
    }
  }, [])

  // Cuando el Realtime detecta que es el turno del jugador
  const handleMyTurn = useCallback((status) => {
    if (status === 'finished') {
      setFinishedSessionId(session.id)
      setScreen("result")
    } else {
      setScreen("drawing")
    }
  }, [session])

  // Cuando el jugador termina su turno
  const handleTurnFinished = useCallback((sessionId, nextTurn) => {
    if (nextTurn === undefined) {
      // Último turno — juego terminado
      setFinishedSessionId(sessionId)
      setScreen("result")
    } else {
      // Hay más turnos — ir a esperar
      setMyTurn(nextTurn)
      setScreen("waiting")
    }
  }, [])

  const handlePlayAgain = useCallback(() => {
    setSession(null)
    setMyTurn(0)
    setFinishedSessionId(null)
    setScreen("lobby")
  }, [])

  if (screen === "lobby")
    return <Lobby onJoin={handleJoin} />

  if (screen === "waiting")
    return (
      <WaitingRoom
        session={session}
        myTurn={myTurn}
        onMyTurn={handleMyTurn}
      />
    )

  if (screen === "drawing")
    return (
      <DrawingRoom
        session={session}
        turnNumber={myTurn}
        onFinished={handleTurnFinished}
      />
    )

  if (screen === "result")
    return (
      <Result
        sessionId={finishedSessionId}
        onPlayAgain={handlePlayAgain}
      />
    )
}
