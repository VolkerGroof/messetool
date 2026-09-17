export const parseTranscriptWithClaude = async (transcript) => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey || !transcript) {
    return null
  }

  const prompt = `You are an expert at extracting contact information from natural speech at trade fairs.

Extract ALL information you can from this speech and map it to these fields. Be intelligent - understand context and natural language.

Speech: "${transcript}"

Return ONLY this exact JSON format (no markdown, no code blocks, ONLY JSON):
{
  "name": "person's full name if mentioned",
  "company": "company name",
  "role": "job title or position",
  "problems": "main problems or pain points they mentioned",
  "solutions": "current solutions they're using",
  "companySize": "number of employees or company size",
  "linkedinLink": "LinkedIn profile URL",
  "funding": "funding stage or investment info",
  "trends": "industry trends they mentioned",
  "tools": "software tools or products they use",
  "nextSteps": "what they want to do next or follow up action"
}

Rules:
- Extract ALL mentioned information intelligently
- If a field is not mentioned, use empty string ""
- Return ONLY the JSON object - nothing else
- Be concise but complete
- Extract from natural speech, not just exact field mentions`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-5',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (!data.content || !data.content[0]) {
      return null
    }

    const content = data.content[0].text
    const parsed = JSON.parse(content)
    return parsed
  } catch (error) {
    return null
  }
}
