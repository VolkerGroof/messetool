import { useState } from 'react'
import { db } from '../firebase'
import { doc, updateDoc } from 'firebase/firestore'
import useWhisperRecording from '../hooks/useWhisperRecording'

const ContactDetail = ({ contact, onBack }) => {
  const [formData, setFormData] = useState(contact)
  const [isEditing, setIsEditing] = useState(false)
  const [photos, setPhotos] = useState(contact.photos || [])
  const [newPhotos, setNewPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [voiceFieldTarget, setVoiceFieldTarget] = useState(null)
  const [voiceStep, setVoiceStep] = useState(null)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceTranscribing, setVoiceTranscribing] = useState(false)
  const { isRecording, transcript, startRecording, stopRecording } =
    useWhisperRecording()

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files)
    for (const file of files) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setNewPhotos((prev) => [...prev, event.target.result])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVoiceInputField = (field) => {
    setVoiceFieldTarget(field)
    setVoiceStep('recording')
    startRecording()
  }

  const handleVoiceStop = async () => {
    setVoiceTranscribing(true)
    stopRecording()
    await new Promise(resolve => setTimeout(resolve, 2000))
    setVoiceTranscribing(false)
    setVoiceStep('review')
  }

  const handleVoiceApply = () => {
    if (transcript && voiceFieldTarget) {
      setFormData((prev) => ({
        ...prev,
        [voiceFieldTarget]: transcript,
      }))
    }
    setVoiceFieldTarget(null)
    setVoiceStep(null)
    setVoiceTranscript('')
  }

  const handleVoiceCancel = () => {
    setVoiceFieldTarget(null)
    setVoiceStep(null)
    setVoiceTranscript('')
  }

  const handleSave = async () => {
    setUploading(true)

    try {
      const allPhotos = [...photos, ...newPhotos]

      // Update Firestore (photos stored as Base64)
      const contactRef = doc(db, 'contacts', contact.id)
      await updateDoc(contactRef, {
        ...formData,
        photos: allPhotos,
      })

      setPhotos(allPhotos)
      setNewPhotos([])
      setIsEditing(false)
      setUploading(false)
    } catch (error) {
      console.error('Error updating contact:', error)
      setUploading(false)
      alert('Error updating contact. Please try again.')
    }
  }

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewPhoto = (index) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 text-lg font-semibold"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {formData.name || 'Contact'}
          </h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {uploading ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photos Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Photos</h2>
              {photos.length > 0 && (
                <div className="space-y-3 mb-4">
                  {photos.map((photo, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={photo}
                        alt={`Photo ${idx}`}
                        className="w-full h-auto rounded"
                      />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isEditing && (
                <>
                  <div className="mb-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full"
                    />
                  </div>
                  {newPhotos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {newPhotos.map((photo, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={photo}
                            alt={`New ${idx}`}
                            className="w-full h-32 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewPhoto(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        className="flex-1 border border-gray-300 rounded px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleVoiceInputField('name')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                        title="Use voice input"
                      >
                        🎤
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-900">{formData.name || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleFormChange}
                        className="flex-1 border border-gray-300 rounded px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleVoiceInputField('company')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                      >
                        🎤
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-900">{formData.company || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleFormChange}
                        className="flex-1 border border-gray-300 rounded px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleVoiceInputField('role')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                      >
                        🎤
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-900">{formData.role || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleFormChange}
                        className="flex-1 border border-gray-300 rounded px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => handleVoiceInputField('companySize')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                      >
                        🎤
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-900">{formData.companySize || '-'}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Problems
                </label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <textarea
                      name="problems"
                      value={formData.problems}
                      onChange={handleFormChange}
                      className="flex-1 border border-gray-300 rounded px-3 py-2"
                      rows="3"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInputField('problems')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                    >
                      🎤
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.problems || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Solutions
                </label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <textarea
                      name="solutions"
                      value={formData.solutions}
                      onChange={handleFormChange}
                      className="flex-1 border border-gray-300 rounded px-3 py-2"
                      rows="3"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInputField('solutions')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                    >
                      🎤
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.solutions || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn Link
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="linkedinLink"
                    value={formData.linkedinLink}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                ) : (
                  <div>
                    {formData.linkedinLink ? (
                      <a
                        href={formData.linkedinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {formData.linkedinLink}
                      </a>
                    ) : (
                      <p className="text-gray-900">-</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Funding
                </label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="funding"
                      value={formData.funding}
                      onChange={handleFormChange}
                      className="flex-1 border border-gray-300 rounded px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInputField('funding')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                    >
                      🎤
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-900">{formData.funding || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trends Observed
                </label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <textarea
                      name="trends"
                      value={formData.trends}
                      onChange={handleFormChange}
                      className="flex-1 border border-gray-300 rounded px-3 py-2"
                      rows="3"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInputField('trends')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                    >
                      🎤
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.trends || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tools They Use
                </label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <textarea
                      name="tools"
                      value={formData.tools}
                      onChange={handleFormChange}
                      className="flex-1 border border-gray-300 rounded px-3 py-2"
                      rows="3"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInputField('tools')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                    >
                      🎤
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.tools || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Steps
                </label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <textarea
                      name="nextSteps"
                      value={formData.nextSteps}
                      onChange={handleFormChange}
                      className="flex-1 border border-gray-300 rounded px-3 py-2"
                      rows="3"
                    />
                    <button
                      type="button"
                      onClick={() => handleVoiceInputField('nextSteps')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                    >
                      🎤
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.nextSteps || '-'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Text (Voice Input)
                </label>
                {isEditing ? (
                  <textarea
                    name="fullText"
                    value={formData.fullText}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    rows="3"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.fullText || '-'}</p>
                )}
              </div>

              <div className="text-sm text-gray-500 pt-4 border-t">
                Created:{' '}
                {contact.timestamp
                  ? new Date(contact.timestamp.toDate?.() || contact.timestamp).toLocaleString()
                  : '-'}
              </div>
            </div>
          </div>
        </div>
      </main>

      {voiceFieldTarget && voiceStep === 'recording' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">Recording...</h2>
            <div className="bg-red-100 rounded-lg p-8 text-center mb-4">
              <div className="text-6xl mb-4 animate-pulse">🎤</div>
              <p className="text-gray-600 font-semibold">Recording {voiceFieldTarget}</p>
            </div>
            <button onClick={handleVoiceStop} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded font-semibold">
              Stop Recording
            </button>
          </div>
        </div>
      )}

      {voiceFieldTarget && voiceStep === 'review' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-6 my-8">
            <h2 className="text-2xl font-bold mb-4">Review</h2>

            {voiceTranscribing ? (
              <div className="bg-blue-100 p-4 rounded mb-4 text-center">
                <p className="text-blue-700 font-semibold">⏳ Processing audio...</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto border-2 border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">{transcript || 'No transcript received'}</p>
              </div>
            )}

            <div className="space-y-2">
              <button onClick={() => { setVoiceStep('recording'); startRecording() }} className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded font-semibold">
                🔄 Re-record
              </button>
              <button onClick={handleVoiceApply} disabled={voiceTranscribing || !transcript} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold disabled:bg-gray-400">
                ✓ Apply to {voiceFieldTarget}
              </button>
              <button onClick={handleVoiceCancel} className="w-full bg-gray-400 hover:bg-gray-500 text-white py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactDetail
