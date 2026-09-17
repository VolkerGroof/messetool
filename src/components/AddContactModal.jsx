import { useState } from 'react'
import { db } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import useWhisperRecording from '../hooks/useWhisperRecording'
import { parseTranscriptWithClaude } from '../utils/parseTranscript'
import { compressImage } from '../utils/compressImage'

const AddContactModal = ({ onClose }) => {
  const [step, setStep] = useState('choice')
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    problems: '',
    solutions: '',
    companySize: '',
    linkedinLink: '',
    funding: '',
    trends: '',
    tools: '',
    nextSteps: '',
    fullText: '',
  })
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const { isRecording, transcript, startRecording, stopRecording } =
    useWhisperRecording()

  const handleVoiceStart = () => {
    setStep('recording')
    startRecording()
  }

  const handleVoiceStop = async () => {
    setTranscribing(true)
    stopRecording()

    // Wait a moment for transcript to be set
    await new Promise(resolve => setTimeout(resolve, 2000))
    setTranscribing(false)
    setStep('review')
  }

  const handleRerecord = () => {
    setStep('recording')
    startRecording()
  }

  const handleContinue = async () => {
    setFormData((prev) => ({ ...prev, fullText: transcript }))
    setParsing(true)
    const parsed = await parseTranscriptWithClaude(transcript)
    setParsing(false)

    if (parsed) {
      setFormData((prev) => ({
        ...prev,
        ...parsed,
        fullText: transcript,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        fullText: transcript,
      }))
    }

    setStep('form')
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    for (const file of files) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const compressed = await compressImage(event.target.result)
        setPhotos((prev) => [...prev, compressed])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        photos: photos,
        timestamp: serverTimestamp(),
      })
      setUploading(false)
      onClose()
    } catch (error) {
      console.error('Error adding contact:', error)
      setUploading(false)
      alert(`Error saving contact: ${error.message}`)
    }
  }

  if (step === 'choice') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-2xl font-bold mb-6">Add Contact</h2>
          <div className="space-y-4">
            <button onClick={handleVoiceStart} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg text-lg font-semibold">
              🎤 Speak
            </button>
            <button onClick={() => setStep('form')} className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg text-lg font-semibold">
              📸 Add Photo
            </button>
            <button onClick={onClose} className="w-full bg-gray-400 hover:bg-gray-500 text-white py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'recording') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h2 className="text-2xl font-bold mb-6">Recording...</h2>
          <div className="bg-red-100 rounded-lg p-8 text-center mb-4">
            <div className="text-6xl mb-4 animate-pulse">🎤</div>
            <p className="text-gray-600 font-semibold">Recording in progress</p>
          </div>
          <button onClick={handleVoiceStop} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded font-semibold">
            Stop Recording
          </button>
        </div>
      </div>
    )
  }

  if (step === 'review') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg max-w-md w-full p-6 my-8">
          <h2 className="text-2xl font-bold mb-4">Review Transcript</h2>

          {transcribing ? (
            <div className="bg-blue-100 p-4 rounded mb-4 text-center">
              <p className="text-blue-700 font-semibold">⏳ Processing audio...</p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto border-2 border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">{transcript || 'No transcript received'}</p>
            </div>
          )}

          {parsing && (
            <div className="bg-blue-100 p-3 rounded mb-4 text-center">
              <p className="text-blue-700 text-sm">🤖 Parsing with Claude...</p>
            </div>
          )}

          <div className="space-y-2">
            <button onClick={handleRerecord} className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-semibold">
              🔄 Re-record
            </button>
            <button onClick={handleContinue} disabled={transcribing || !transcript} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold disabled:bg-gray-400">
              ✓ Continue to Edit
            </button>
            <button onClick={onClose} className="w-full bg-gray-400 hover:bg-gray-500 text-white py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-2xl font-bold mb-4">Edit Contact</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleFormChange} className="border border-gray-300 rounded px-3 py-2" />
            <input type="text" name="company" placeholder="Company" value={formData.company} onChange={handleFormChange} className="border border-gray-300 rounded px-3 py-2" />
            <input type="text" name="role" placeholder="Role" value={formData.role} onChange={handleFormChange} className="border border-gray-300 rounded px-3 py-2" />
            <input type="text" name="companySize" placeholder="Company Size" value={formData.companySize} onChange={handleFormChange} className="border border-gray-300 rounded px-3 py-2" />
            <textarea name="problems" placeholder="Main Problems" value={formData.problems} onChange={handleFormChange} className="border border-gray-300 rounded px-3 py-2 md:col-span-2" rows="2" />
            <textarea name="solutions" placeholder="Current Solutions" value={formData.solutions} onChange={handleFormChange} className="border border-gray-300 rounded px-3 py-2 md:col-span-2" rows="2" />
            <input type="text" name="linkedinLink" placeholder="LinkedIn Link" value={formData.linkedinLink} onChange={handleFormChange} className="border border-gray-300 rounded px-3 py-2 md:col-span-2" />
            <input type="text" name="funding" placeholder="Funding" value={formData.funding} onChange={handleFormChange} className="border border-gray-300 rounded px-3 py-2" />
            <textarea name="trends" placeholder="Trends Observed" value={formData.trends} onChange={handleFormChange} className="border border-gray-300 rounded px-3 py-2 md:col-span-2" rows="2" />
            <textarea name="tools" placeholder="Tools They Use" value={formData.tools} onChange={handleFormChange} className="border border-gray-300 rounded px-3 py-2 md:col-span-2" rows="2" />
            <textarea name="nextSteps" placeholder="Next Steps" value={formData.nextSteps} onChange={handleFormChange} className="border border-gray-300 rounded px-3 py-2 md:col-span-2" rows="2" />
            <textarea name="fullText" placeholder="Full Text (from voice)" value={formData.fullText} onChange={handleFormChange} className="border border-gray-300 rounded px-3 py-2 md:col-span-2 text-sm text-gray-600" rows="2" />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Photos</h3>
            <input type="file" multiple accept="image/*" capture="environment" onChange={handlePhotoUpload} className="mb-3" />
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative bg-gray-100 rounded overflow-hidden h-20">
                    <img src={photo} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="submit" disabled={uploading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold disabled:bg-gray-400">
              {uploading ? 'Saving...' : 'Save Contact'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-3 rounded font-semibold">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddContactModal
