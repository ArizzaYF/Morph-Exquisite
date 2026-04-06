import { supabase } from './supabase'

// Genera un código de sala corto y legible (ej: "XKQT")
function generateCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}

// Crea una nueva sesión de juego
export async function createSession(totalSegments) {
  const code = generateCode()
  const { data, error } = await supabase
    .from('sessions')
    .insert({ code, total_segments: totalSegments, status: 'waiting' })
    .select()
    .single()
  if (error) throw error
  return data
}

// Busca una sesión por su código
export async function getSessionByCode(code) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('code', code.toUpperCase())
    .single()
  if (error) throw error
  return data
}

// Sube la imagen PNG al Storage y guarda la URL en la tabla segments
export async function saveSegment(sessionId, turnNumber, imageBlob) {
  const fileName = `${sessionId}/turn-${turnNumber}.png`

  // 1. Subir imagen al bucket
  const { error: uploadError } = await supabase.storage
    .from('segments')
    .upload(fileName, imageBlob, { contentType: 'image/png', upsert: true })
  if (uploadError) throw uploadError

  // 2. Obtener URL pública
  const { data: urlData } = supabase.storage
    .from('segments')
    .getPublicUrl(fileName)

  // 3. Guardar registro en la tabla
  const { data, error } = await supabase
    .from('segments')
    .insert({ session_id: sessionId, turn_number: turnNumber, image_url: urlData.publicUrl })
    .select()
    .single()
  if (error) throw error

  // 4. Avanzar el turno en la sesión
  await supabase
    .from('sessions')
    .update({ current_turn: turnNumber + 1 })
    .eq('id', sessionId)

  return data
}

// Obtiene los últimos 20px del segmento anterior como ImageData
export async function getGuideFromPreviousSegment(sessionId, turnNumber) {
  if (turnNumber === 0) return null

  const { data, error } = await supabase
    .from('segments')
    .select('image_url')
    .eq('session_id', sessionId)
    .eq('turn_number', turnNumber - 1)
    .single()
  if (error || !data) return null

  // Cargar la imagen y extraer los últimos 20px
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = 20
      const ctx = canvas.getContext('2d')
      // Recortar solo los últimos 20px verticales
      ctx.drawImage(img, 0, img.height - 20, img.width, 20, 0, 0, img.width, 20)
      resolve(ctx.getImageData(0, 0, img.width, 20))
    }
    img.onerror = () => resolve(null)
    img.src = data.image_url
  })
}

// Marca la sesión como terminada
export async function finishSession(sessionId) {
  const { error } = await supabase
    .from('sessions')
    .update({ status: 'finished' })
    .eq('id', sessionId)
  if (error) throw error
}

// Obtiene todos los segmentos de una sesión ordenados por turno
export async function getAllSegments(sessionId) {
  const { data, error } = await supabase
    .from('segments')
    .select('*')
    .eq('session_id', sessionId)
    .order('turn_number', { ascending: true })
  if (error) throw error
  return data
}

// Escucha cambios en tiempo real en una sesión
export function subscribeToSession(sessionId, onUpdate) {
  const channel = supabase
    .channel(`session-${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`,
      },
      (payload) => onUpdate(payload.new)
    )
    .subscribe()

  // Retorna función para cancelar la suscripción
  return () => supabase.removeChannel(channel)
}
