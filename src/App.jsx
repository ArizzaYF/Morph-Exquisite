import { useState } from "react"
import Lobby from "./pages/Lobby"
import DrawingRoom from "./pages/DrawingRoom"
import Result from "./pages/Result"

export default function App() {
  const [screen, setScreen] = useState("lobby")
  const [session, setSession] = useState(null)
  const [turnNumber, setTurnNumber] = useState(0)
  const [finishedSessionId, setFinishedSessionId] = useState(null)

  const handleJoin = (sessionData, turn) => {
    setSession(sessionData)
    setTurnNumber(turn)
    setScreen("drawing")
  }

  const handleTurnFinished = (sessionId, nextTurn) => {
    if (nextTurn === undefined) {
      setFinishedSessionId(sessionId)
      setScreen("result")
    } else {
      setTurnNumber(nextTurn)
    }
  }

  const handlePlayAgain = () => {
    setSession(null)
    setTurnNumber(0)
    setFinishedSessionId(null)
    setScreen("lobby")
  }

  if (screen === "lobby") return <Lobby onJoin={handleJoin} />
  if (screen === "drawing") return (
    <DrawingRoom
      session={session}
      turnNumber={turnNumber}
      onFinished={handleTurnFinished}
    />
  )
  if (screen === "result") return (
    <Result sessionId={finishedSessionId} onPlayAgain={handlePlayAgain} />
  )
}
