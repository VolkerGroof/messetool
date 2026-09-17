export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { transcript } = req.body
  const apiKey = process.env.VITE_ANTHROPIC_API_KEY

  console.log('API Key present:', !!apiKey)
  console.log('Transcript length:', transcript?.length)

  if (!apiKey) {
    return res.status(400).json({ error: 'Missing VITE_ANTHROPIC_API_KEY environment variable' })
  }

  if (!transcript) {
    return res.status(400).json({ error: 'Missing transcript' })
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
      const error = await response.json()
      console.error('Claude API error:', error)
      return res.status(response.status).json({ error: 'Claude API error', details: error })
    }

    const data = await response.json()
    console.log('Claude response:', JSON.stringify(data))

    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Invalid Claude response structure:', data)
      return res.status(500).json({ error: 'Invalid Claude response', details: data })
    }

    const content = data.content[0].text
    console.log('Parsed content:', content)
    const parsed = JSON.parse(content)
    return res.status(200).json(parsed)
  } catch (error) {
    return res.status(500).json({ error: 'Failed to parse transcript', details: error.message })
  }
}
