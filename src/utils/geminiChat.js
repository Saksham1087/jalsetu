export async function askGemini(message) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured')
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

  const body = {
    contents: [
      {
        parts: [{ text: message }]
      }
    ],
    systemInstruction: {
      parts: [{
        text: "You are JalSetu's assistant, a helpful AI like ChatGPT or Gemini. Answer any question naturally and informatively — general knowledge, facts, advice, anything. If the user describes an actual water problem they're personally experiencing right now, gently mention they can file a complaint using the Report tab, but don't force every message toward filing a complaint."
      }]
    }
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMsg = data.error?.message || `API error: ${response.status}`
    throw new Error(errorMsg)
  }

  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Unexpected response format from Gemini API')
  }

  return data.candidates[0].content.parts[0].text
}