export async function askGroq(message, conversationHistory = []) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    throw new Error('Groq API key not configured')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: "You are WaterBot, the AI assistant for JalSetu, a Smart Water Management platform for Mira Road. Answer ALL questions naturally and helpfully, like ChatGPT or Gemini would — general knowledge, facts, math, explanations, casual conversation, anything at all. Additionally, you have special expertise in water management: if the user asks about water leakage, conservation, water usage statistics, or how to use this app, give detailed, accurate answers. If the user describes an actual water problem they are personally experiencing right now (a leak, no supply, contamination), mention they can file a complaint using the Report tab, but don't force this on general questions.",
        },
        ...conversationHistory,
        { role: 'user', content: message },
      ],
      temperature: 0.7,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMsg = data.error?.message || `API error: ${response.status}`
    throw new Error(errorMsg)
  }

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Unexpected response format from Groq API')
  }

  return data.choices[0].message.content
}
