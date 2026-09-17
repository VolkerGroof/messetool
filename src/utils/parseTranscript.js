export const parseTranscriptWithClaude = async (transcript) => {
  if (!transcript) {
    return null
  }

  try {
    const response = await fetch('/api/parse-transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    })

    if (!response.ok) {
      return null
    }

    const parsed = await response.json()
    return parsed
  } catch (error) {
    return null
  }
}
