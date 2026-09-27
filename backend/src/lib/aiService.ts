/**
 * Calls the Groq LLM API and returns the AI's response text.
 * Used by the EcoBot chat and weekly recommendations endpoints.
 */
export const getGroqChatCompletion = async (
  systemPrompt: string,
  userMessage: string
): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is missing in environment variables');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to fetch from Groq API');
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
};
