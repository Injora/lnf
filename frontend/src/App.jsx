import { useState, useEffect } from 'react'

function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Filter states
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPlace, setFilterPlace] = useState('')

  // New item form state
  const [form, setForm] = useState({
    itemName: '',
    type: 'lost',
    place: '',
    date: '',
    contact: ''
  })

  // Edit item state
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    itemName: '',
    type: 'lost',
    place: '',
    date: '',
    contact: ''
  })

  const fetchItems = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filterType) params.append('type', filterType)
      if (filterStatus) params.append('status', filterStatus)
      if (filterPlace) params.append('place', filterPlace)

      const res = await fetch(`/api/items?${params.toString()}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch items: ${res.statusText}`)
      }
      const data = await res.json()
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [filterType, filterStatus, filterPlace])

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create item')
      }
      setMessage(`Item created successfully (ID: ${data.id})`)
      setForm({
        itemName: '',
        type: 'lost',
        place: '',
        date: '',
        contact: ''
      })
      fetchItems()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleClaim = async (id) => {
    setError('')
    setMessage('')
    try {
      const res = await fetch(`/api/items/${id}/claim`, {
        method: 'PATCH'
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim item')
      }
      setMessage(`Item ${id} marked as claimed`)
      fetchItems()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    setError('')
    setMessage('')
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete item')
      }
      setMessage(`Item ${id} deleted`)
      fetchItems()
    } catch (err) {
      setError(err.message)
    }
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditForm({
      itemName: item.itemName,
      type: item.type,
      place: item.place,
      date: item.date,
      contact: item.contact
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleUpdate = async (e, id) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update item')
      }
      setMessage(`Item ${id} updated successfully`)
      setEditingId(null)
      fetchItems()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1>Lost and Found</h1>

      {message && <p><strong>Notice:</strong> {message}</p>}
      {error && <p><strong>Error:</strong> {error}</p>}

      <section>
        <h2>Report an Item</h2>
        <form onSubmit={handleCreate}>
          <div>
            <label htmlFor="itemName">Item Name: </label>
            <input
              id="itemName"
              name="itemName"
              type="text"
              value={form.itemName}
              onChange={handleFormChange}
              required
            />
          </div>

          <div>
            <label htmlFor="type">Type: </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleFormChange}
            >
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
          </div>

          <div>
            <label htmlFor="place">Place: </label>
            <input
              id="place"
              name="place"
              type="text"
              value={form.place}
              onChange={handleFormChange}
              required
            />
          </div>

          <div>
            <label htmlFor="date">Date: </label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleFormChange}
              required
            />
          </div>

          <div>
            <label htmlFor="contact">Contact: </label>
            <input
              id="contact"
              name="contact"
              type="text"
              value={form.contact}
              onChange={handleFormChange}
              required
            />
          </div>

          <button type="submit">Submit Item</button>
        </form>
      </section>

      <hr />

      <section>
        <h2>Filter Items</h2>
        <div>
          <label htmlFor="filterType">Type: </label>
          <select
            id="filterType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          {' | '}

          <label htmlFor="filterStatus">Status: </label>
          <select
            id="filterStatus"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="claimed">Claimed</option>
          </select>

          {' | '}

          <label htmlFor="filterPlace">Place search: </label>
          <input
            id="filterPlace"
            type="text"
            placeholder="Search place..."
            value={filterPlace}
            onChange={(e) => setFilterPlace(e.target.value)}
          />

          {' | '}

          <button
            type="button"
            onClick={() => {
              setFilterType('')
              setFilterStatus('')
              setFilterPlace('')
            }}
          >
            Reset Filters
          </button>
          {' '}
          <button type="button" onClick={fetchItems}>
            Refresh
          </button>
        </div>
      </section>

      <hr />

      <section>
        <h2>Items ({items.length})</h2>
        {loading && <p>Loading items...</p>}
        {!loading && items.length === 0 && <p>No items found.</p>}

        {!loading && items.length > 0 && (
          <table border="1" cellPadding="5" cellSpacing="0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Type</th>
                <th>Place</th>
                <th>Date</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                if (editingId === item.id) {
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        <input
                          type="text"
                          name="itemName"
                          value={editForm.itemName}
                          onChange={handleEditChange}
                          required
                        />
                      </td>
                      <td>
                        <select
                          name="type"
                          value={editForm.type}
                          onChange={handleEditChange}
                        >
                          <option value="lost">lost</option>
                          <option value="found">found</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          name="place"
                          value={editForm.place}
                          onChange={handleEditChange}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          name="date"
                          value={editForm.date}
                          onChange={handleEditChange}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="contact"
                          value={editForm.contact}
                          onChange={handleEditChange}
                          required
                        />
                      </td>
                      <td>{item.status}</td>
                      <td>
                        <button
                          type="button"
                          onClick={(e) => handleUpdate(e, item.id)}
                        >
                          Save
                        </button>
                        {' '}
                        <button type="button" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.itemName}</td>
                    <td>{item.type}</td>
                    <td>{item.place}</td>
                    <td>{item.date}</td>
                    <td>{item.contact}</td>
                    <td>{item.status}</td>
                    <td>
                      {item.status !== 'claimed' && (
                        <button
                          type="button"
                          onClick={() => handleClaim(item.id)}
                        >
                          Mark Claimed
                        </button>
                      )}
                      {' '}
                      <button type="button" onClick={() => startEdit(item)}>
                        Edit
                      </button>
                      {' '}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default App
