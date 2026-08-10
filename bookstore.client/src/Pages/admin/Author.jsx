import React, { useEffect, useState } from 'react'
import { getAuthors, createAuthor, deleteAuthor, updateAuthor } from '../../services/authorService'

function Authors() {

    const [authors, setAuthors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    //edit author
    const [editingAuthorId, setEditingAuthorId] = useState(null)
    const [editMode, setEditMode] = useState(false)

    const [showForm, setShowForm] = useState(false)

    const [formData, setFormData] = useState({
        authorName: '',
        biography: '',
        isActive: true
    })

    useEffect(() => {
        loadAuthors()
    }, [])

    const loadAuthors = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await getAuthors()

            setAuthors(data)
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setError('')

            if (editMode) {

                // Update existing author
                const authorData = {
                    authorName: formData.authorName,
                    biography: formData.biography || null,
                    isActive: formData.isActive
                }
                

                await updateAuthor(editingAuthorId, authorData)

            } else {

                // Create new author
                const authorData = {
                    authorName: formData.authorName,
                    biography: formData.biography || null
                }

                await createAuthor(authorData)
            }

            // Reset form
            setFormData({
                authorName: '',
                biography: '',
                isActive: true
            })

            setEditingAuthorId(null)
            setEditMode(false)
            setShowForm(false)

            // Reload authors
            await loadAuthors()

        } catch (error) {
            setError(error.message)
        }
    }

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this author?'
        )

        if (!confirmed) {
            return
        }

        try {
            setError('')

            await deleteAuthor(id)

            await loadAuthors()

        } catch (error) {
            setError(error.message)
        }
    }

    const handleEdit = (author) => {
        setEditingAuthorId(author.authorId)

        setFormData({
            authorName: author.authorName,
            biography: author.biography || '',
            isActive: author.isActive
        })

        setEditMode(true)
        setShowForm(true)
    }

return (
  <div className="w-full">

    {/* =========================
        PAGE HEADER
    ========================= */}

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Authors
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Manage book authors and their biographies
        </p>
      </div>

      <button
        onClick={() => {
          if (showForm) {
            setShowForm(false);
            setEditMode(false);
          } else {
            setShowForm(true);
            setEditMode(false);
          }
        }}
        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
      >
        {showForm ? "Close" : "+ Add Author"}
      </button>

    </div>


    {/* =========================
        ADD / EDIT AUTHOR FORM
    ========================= */}

    {showForm && (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-8 overflow-hidden">

        {/* Form Header */}

        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/70">

          <h2 className="text-lg font-bold text-gray-900">
            {editMode ? "Edit Author" : "Add New Author"}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {editMode
              ? "Update the author's information below."
              : "Add a new author to your bookstore."}
          </p>

        </div>


        {/* Form */}

        <div className="p-6">

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Author Name */}

            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Author Name
              </label>

              <input
                type="text"
                name="authorName"
                placeholder="Enter author name"
                value={formData.authorName}
                onChange={handleChange}
                maxLength={100}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />

            </div>


            {/* Biography */}

            <div>

              <div className="flex items-center justify-between mb-1.5">

                <label className="block text-sm font-semibold text-gray-700">
                  Biography
                </label>

                <span className="text-xs text-gray-400">
                  {formData.biography?.length || 0}/500
                </span>

              </div>

              <textarea
                name="biography"
                rows={4}
                placeholder="Write a short biography about the author..."
                value={formData.biography}
                onChange={handleChange}
                maxLength={500}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 outline-none resize-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              />

              <p className="text-xs text-gray-400 mt-1.5">
                Maximum 500 characters.
              </p>

            </div>


            {/* Active */}

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">

              <div>

                <p className="text-sm font-semibold text-gray-800">
                  Active Author
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  Active authors can be assigned to books.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  handleChange({
                    target: {
                      name: "isActive",
                      type: "checkbox",
                      checked: !formData.isActive,
                    },
                  })
                }
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                  formData.isActive
                    ? "bg-gray-900"
                    : "bg-gray-300"
                }`}
              >

                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    formData.isActive
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />

              </button>

            </div>


            {/* Buttons */}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditMode(false);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition cursor-pointer"
              >
                {editMode ? "Save Changes" : "Save Author"}
              </button>

            </div>

          </form>

        </div>

      </div>
    )}


    {/* =========================
        AUTHORS TABLE
    ========================= */}

    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Table Header */}

      <div className="px-6 py-5 border-b border-gray-100">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              All Authors
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {authors.length} author
              {authors.length !== 1 ? "s" : ""} in your bookstore
            </p>
          </div>

        </div>

      </div>


      {/* Loading */}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">

          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />

          <p className="text-sm text-gray-500 mt-4">
            Loading authors...
          </p>

        </div>
      )}


      {/* Error */}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 px-6">

          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
            <span className="text-red-500 text-xl">
              !
            </span>
          </div>

          <p className="text-sm font-medium text-red-600">
            {error}
          </p>

        </div>
      )}


      {/* Empty */}

      {!loading && !error && authors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6">

          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mb-4">
            ✍️
          </div>

          <h3 className="font-semibold text-gray-900">
            No authors found
          </h3>

          <p className="text-sm text-gray-500 mt-1 text-center">
            Add your first author to get started.
          </p>

          <button
            onClick={() => {
              setShowForm(true);
              setEditMode(false);
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition cursor-pointer"
          >
            + Add Author
          </button>

        </div>
      )}


      {/* Table */}

      {!loading && !error && authors.length > 0 && (
        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] text-sm">

            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left">

                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  #
                </th>

                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Author
                </th>

                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Biography
                </th>

                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>

                <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Created
                </th>

                <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">
                  Actions
                </th>

              </tr>
            </thead>


            <tbody className="divide-y divide-gray-100">

              {authors.map((author, index) => (

                <tr
                  key={author.authorId}
                  className="hover:bg-gray-50/70 transition-colors"
                >

                  {/* Number */}

                  <td className="px-6 py-4 text-gray-400 font-medium">
                    {index + 1}
                  </td>


                  {/* Author */}

                  <td className="px-4 py-4">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {author.authorName?.charAt(0)?.toUpperCase() || "A"}
                      </div>

                      <div>

                        <p className="font-semibold text-gray-900">
                          {author.authorName}
                        </p>


                      </div>

                    </div>

                  </td>


                  {/* Biography */}

                  <td className="px-4 py-4 max-w-sm">

                    <p
                      className="text-gray-500 line-clamp-2"
                      title={author.biography || ""}
                    >
                      {author.biography || "No biography available"}
                    </p>

                  </td>


                  {/* Status */}

                  <td className="px-4 py-4">

                    {author.isActive ? (

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">

                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

                        Active

                      </span>

                    ) : (

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">

                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />

                        Inactive

                      </span>

                    )}

                  </td>


                  {/* Created */}

                  <td className="px-4 py-4 text-gray-500 whitespace-nowrap">

                    {author.createdDate
                      ? new Date(
                          author.createdDate
                        ).toLocaleDateString()
                      : "-"}

                  </td>


                  {/* Actions */}

                  <td className="px-6 py-4">

                    <div className="flex justify-end gap-2">

                      <button
                        onClick={() => handleEdit(author)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(author.authorId)
                        }
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>

  </div>
);


}

export default Authors