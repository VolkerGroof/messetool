import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import ContactList from './components/ContactList'
import ContactDetail from './components/ContactDetail'
import AddContactModal from './components/AddContactModal'
import ExportButton from './components/ExportButton'

function App() {
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [sortField, setSortField] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'contacts'), (snapshot) => {
      const contactsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setContacts(contactsData)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const deleteContact = async (id) => {
    if (window.confirm('Delete this contact?')) {
      await deleteDoc(doc(db, 'contacts', id))
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedContacts = [...contacts].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (sortField === 'date' || sortField === 'timestamp') {
      aVal = a.timestamp || 0
      bVal = b.timestamp || 0
    } else if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    }
  })

  if (selectedContact) {
    return (
      <ContactDetail
        contact={selectedContact}
        onBack={() => setSelectedContact(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Messetool</h1>
          <div className="flex gap-2">
            <ExportButton contacts={sortedContacts} />
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold text-2xl"
            >
              +
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No contacts yet. Click the + button to add one.</p>
          </div>
        ) : (
          <ContactList
            contacts={sortedContacts}
            onSelectContact={setSelectedContact}
            onDeleteContact={deleteContact}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />
        )}
      </main>

      {showAddModal && (
        <AddContactModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}

export default App
