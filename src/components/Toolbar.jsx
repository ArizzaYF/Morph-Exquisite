const COLORS = [
  "#1a1a1a", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ffffff",
]

export default function Toolbar({ color, setColor, brushSize, setBrushSize }) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              borderColor: color === c ? "#6366f1" : "#cbd5e1",
              transform: color === c ? "scale(1.2)" : "scale(1)",
            }}
          />
        ))}
      </div>
      <div className="w-px h-6 bg-slate-300" />
      <label className="flex items-center gap-2 text-sm text-slate-600">
        Grosor:
        <input
          type="range"
          min={2}
          max={30}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-24 accent-indigo-600"
        />
        <span className="w-6 text-center">{brushSize}</span>
      </label>
    </div>
  )
}
