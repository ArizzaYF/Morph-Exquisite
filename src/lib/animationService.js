const BASE_URL = 'https://sketch.metademolab.com/api'

// Paso 1: Sube el PNG y obtiene un UUID de la imagen
export async function uploadDrawing(imageBlob) {
  const formData = new FormData()
  formData.append('file', imageBlob, 'character.png')

  const res = await fetch(`${BASE_URL}/upload_drawing`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`Upload falló: ${res.status}`)
  const data = await res.json()
  // Retorna el uuid de la imagen subida
  return data.uuid
}

// Paso 2: Pide la anotación automática del personaje
export async function annotateDrawing(uuid) {
  const res = await fetch(`${BASE_URL}/auto_annotate/${uuid}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`Anotación falló: ${res.status}`)
  return await res.json()
}

// Paso 3: Genera el GIF animado
// motion: 'dab', 'jab', 'kick', 'wave', 'jump', 'run', 'walk'
export async function animateDrawing(uuid, motion = 'wave') {
  const res = await fetch(`${BASE_URL}/animate_drawing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uuid, motion }),
  })
  if (!res.ok) throw new Error(`Animación falló: ${res.status}`)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}
