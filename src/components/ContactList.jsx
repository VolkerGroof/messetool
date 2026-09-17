const ContactList = ({
  contacts,
  onSelectContact,
  onDeleteContact,
  onSort,
  sortField,
  sortOrder,
}) => {
  const fields = [
    'name',
    'company',
    'role',
    'problems',
    'solutions',
    'companySize',
    'linkedinLink',
    'funding',
    'trends',
    'tools',
    'nextSteps',
    'fullText',
  ]

  const SortHeader = ({ field, label }) => (
    <th
      onClick={() => onSort(field)}
      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-100 cursor-pointer hover:bg-gray-200"
    >
      <div className="flex items-center gap-2">
        {label}
        {sortField === field && (
          <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
        )}
      </div>
    </th>
  )

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full">
        <thead>
          <tr>
            <SortHeader field="date" label="Date" />
            <SortHeader field="name" label="Name" />
            <SortHeader field="company" label="Company" />
            <SortHeader field="role" label="Role" />
            <SortHeader field="problems" label="Problems" />
            <SortHeader field="solutions" label="Solutions" />
            <SortHeader field="companySize" label="Size" />
            <SortHeader field="linkedinLink" label="LinkedIn" />
            <SortHeader field="funding" label="Funding" />
            <SortHeader field="trends" label="Trends" />
            <SortHeader field="tools" label="Tools" />
            <SortHeader field="nextSteps" label="Next Steps" />
            <SortHeader field="fullText" label="Full Text" />
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-100">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact, idx) => (
            <tr
              key={contact.id}
              className="border-t hover:bg-gray-50 cursor-pointer"
            >
              <td className="px-4 py-3 text-sm text-gray-600">
                {contact.timestamp
                  ? new Date(contact.timestamp).toLocaleDateString()
                  : '-'}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                {contact.name || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {contact.company || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {contact.role || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">
                {contact.problems || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">
                {contact.solutions || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {contact.companySize || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-blue-600">
                {contact.linkedinLink ? (
                  <a
                    href={contact.linkedinLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Link
                  </a>
                ) : (
                  '-'
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {contact.funding || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">
                {contact.trends || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">
                {contact.tools || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">
                {contact.nextSteps || '-'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">
                {contact.fullText || '-'}
              </td>
              <td className="px-4 py-3 text-sm">
                <button
                  onClick={() => onSelectContact(contact)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDeleteContact(contact.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ContactList
