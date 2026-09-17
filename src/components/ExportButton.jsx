import { utils, writeFile } from 'xlsx'

const ExportButton = ({ contacts }) => {
  const handleExport = () => {
    const data = contacts.map((contact) => ({
      Name: contact.name || '',
      Company: contact.company || '',
      Role: contact.role || '',
      'Main Problems': contact.problems || '',
      'Current Solutions': contact.solutions || '',
      'Company Size': contact.companySize || '',
      'LinkedIn Link': contact.linkedinLink || '',
      Funding: contact.funding || '',
      'Trends Observed': contact.trends || '',
      'Tools They Use': contact.tools || '',
      'Next Steps': contact.nextSteps || '',
      'Date': contact.timestamp
        ? new Date(contact.timestamp.toDate?.() || contact.timestamp).toLocaleDateString()
        : '',
      'Time': contact.timestamp
        ? new Date(contact.timestamp.toDate?.() || contact.timestamp).toLocaleTimeString()
        : '',
    }))

    const worksheet = utils.json_to_sheet(data)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, 'Contacts')

    // Auto-size columns
    const maxWidth = 50
    worksheet['!cols'] = Object.keys(data[0] || {}).map(() => ({
      wch: maxWidth,
    }))

    writeFile(workbook, `contacts-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <button
      onClick={handleExport}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
    >
      📥 Export Excel
    </button>
  )
}

export default ExportButton
