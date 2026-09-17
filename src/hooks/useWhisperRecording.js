import { useState, useRef } from 'react'

const useWhisperRecording = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        })
        await sendToWhisper(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setTranscript('')
    } catch (error) {
      console.error('Microphone error:', error)
      alert('Microphone access denied. Please enable microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const sendToWhisper = async (audioBlob) => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY

    if (!apiKey) {
      console.error('OpenAI API key not found')
      setTranscript('Error: API key missing')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'audio.wav')
      formData.append('model', 'whisper-1')

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Whisper error:', error)
        setTranscript('Error transcribing audio')
        return
      }

      const data = await response.json()
      setTranscript(data.text)
    } catch (error) {
      console.error('Whisper transcription error:', error)
      setTranscript('Error transcribing audio')
    }
  }

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
  }
}

export default useWhisperRecording
