
import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Leaf,
  Check,
  X,
  Eye,
  Loader2
} from 'lucide-react';

import {
  getAllStoryPoetry,
  approveStoryPoetry,
  rejectStoryPoetry
} from '../../services/storyPoetryService';

export default function AdminStoryPoetry() {

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [remarks, setRemarks] = useState('');

  // Load all submissions
  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getAllStoryPoetry();

      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      setError(error.message || 'Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Approve
  const handleApprove = async (id) => {
    try {
      setError('');

      await approveStoryPoetry(id, remarks);

      setSelectedItem(null);
      setRemarks('');

      await loadSubmissions();

    } catch (error) {
      console.error('Approve failed:', error);
      setError(error.message || 'Failed to approve submission.');
    }
  };

  // Reject
  const handleReject = async (id) => {
    try {
      setError('');

      await rejectStoryPoetry(id, remarks);

      setSelectedItem(null);
      setRemarks('');

      await loadSubmissions();

    } catch (error) {
      console.error('Reject failed:', error);
      setError(error.message || 'Failed to reject submission.');
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6">

      {/* ================= HEADER ================= */}

      <div className="mb-6">

        <h1 className="text-2xl font-extrabold text-gray-900">
          Story & Poetry Requests
        </h1>

        <p className="text-sm text-stone-500 mt-1">
          Review and manage user Story and Poetry submissions.
        </p>

      </div>


      {/* ================= ERROR ================= */}

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}


      {/* ================= LOADING ================= */}

      {loading ? (

        <div className="bg-white border border-stone-200 rounded-2xl py-20 flex items-center justify-center">

          <Loader2 className="h-6 w-6 animate-spin text-emerald-900" />

          <span className="ml-2 text-sm text-stone-500">
            Loading submissions...
          </span>

        </div>

      ) : submissions.length === 0 ? (

        /* ================= EMPTY ================= */

        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">

          <BookOpen className="h-10 w-10 mx-auto text-stone-300 mb-3" />

          <h3 className="font-bold text-gray-900">
            No submissions found
          </h3>

          <p className="text-sm text-stone-500 mt-1">
            There are currently no Story or Poetry submissions.
          </p>

        </div>

      ) : (

        /* ================= TABLE ================= */

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-stone-50 border-b border-stone-200">

                <tr>

                  <th className="text-left px-5 py-4 font-bold text-gray-700">
                    Submission
                  </th>

                  <th className="text-left px-5 py-4 font-bold text-gray-700">
                    User
                  </th>

                  <th className="text-left px-5 py-4 font-bold text-gray-700">
                    Category
                  </th>

                  <th className="text-left px-5 py-4 font-bold text-gray-700">
                    Status
                  </th>

                  <th className="text-left px-5 py-4 font-bold text-gray-700">
                    Submitted
                  </th>

                  <th className="text-right px-5 py-4 font-bold text-gray-700">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-stone-100">

                {submissions.map((item) => (

                  <tr
                    key={item.storyPoetryId}
                    className="hover:bg-stone-50 transition-colors"
                  >

                    {/* Submission */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">

                          {item.type === 'Poetry' ? (
                            <Leaf className="h-4 w-4 text-emerald-800" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-emerald-800" />
                          )}

                        </div>

                        <div>

                          <p className="font-bold text-gray-900">
                            {item.title}
                          </p>

                          <p className="text-[11px] text-stone-500 mt-0.5">
                            {item.type} · ID #{item.storyPoetryId}
                          </p>

                        </div>

                      </div>

                    </td>


                    {/* User */}

                    <td className="px-5 py-4">

                      <p className="font-semibold text-gray-800">
                        {item.userName}
                      </p>

                      <p className="text-[11px] text-stone-400">
                        User ID: {item.userId}
                      </p>

                    </td>


                    {/* Category */}

                    <td className="px-5 py-4">

                      <span className="text-stone-600 font-medium">
                        {item.categoryName}
                      </span>

                    </td>


                    {/* Status */}

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${
                          item.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status || 'Pending'}
                      </span>

                    </td>


                    {/* Created Date */}

                    <td className="px-5 py-4 text-stone-600 text-xs font-medium">
                      {formatDate(item.createdDate)}
                    </td>


                    {/* Actions */}

                    <td className="px-5 py-4">

                      <div className="flex justify-end gap-2">

                        {/* View */}

                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setRemarks(item.adminRemarks || '');
                          }}
                          className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                          title="View submission"
                        >
                          <Eye className="h-4 w-4" />
                        </button>


                        {/* Approve */}

                        {item.status !== 'Approved' && (
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setRemarks('');
                            }}
                            className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}


                        {/* Reject */}

                        {item.status !== 'Rejected' && (
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setRemarks('');
                            }}
                            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 cursor-pointer"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}


      {/* ================= VIEW MODAL ================= */}

      {selectedItem && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">


            {/* Modal Header */}

            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">

              <div>

                <div className="flex items-center gap-2">

                  {selectedItem.type === 'Poetry' ? (
                    <Leaf className="h-4 w-4 text-emerald-800" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-emerald-800" />
                  )}

                  <span className="text-xs font-bold text-emerald-800">
                    {selectedItem.type}
                  </span>

                </div>

                <h2 className="text-lg font-bold text-gray-900 mt-1">
                  {selectedItem.title}
                </h2>

              </div>


              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

            </div>


            {/* Modal Body */}

            <div className="p-6 space-y-5">


              {/* Information */}

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">
                    Author
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {selectedItem.userName}
                  </p>
                </div>


                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">
                    Category
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {selectedItem.categoryName}
                  </p>
                </div>


                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">
                    Submitted
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {formatDate(selectedItem.createdDate)}
                  </p>
                </div>


                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">
                    Status
                  </p>

                  <span
                    className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      selectedItem.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedItem.status === 'Rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedItem.status || 'Pending'}
                  </span>

                </div>

              </div>


              {/* Content */}

              <div>

                <p className="text-xs font-bold text-stone-500 mb-2">
                  CONTENT
                </p>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 max-h-72 overflow-y-auto">

                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedItem.content}
                  </p>

                </div>

              </div>


              {/* Existing Remarks */}

              {selectedItem.adminRemarks && (

                <div>

                  <p className="text-xs font-bold text-stone-500 mb-2">
                    PREVIOUS ADMIN REMARKS
                  </p>

                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">

                    <p className="text-sm text-stone-600">
                      {selectedItem.adminRemarks}
                    </p>

                  </div>

                </div>

              )}


              {/* Admin Remarks */}

              {selectedItem.status !== 'Approved' &&
               selectedItem.status !== 'Rejected' && (

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Admin Remarks
                  </label>

                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows="3"
                    placeholder="Enter remarks (optional)..."
                    className="w-full border border-stone-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-800 resize-none"
                  />

                </div>

              )}

            </div>


            {/* Modal Footer */}

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-stone-200">

              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2.5 border border-stone-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-stone-50 cursor-pointer"
              >
                Close
              </button>


              {selectedItem.status !== 'Rejected' && (
                <button
                  onClick={() => handleReject(selectedItem.storyPoetryId)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  Reject
                </button>
              )}


              {selectedItem.status !== 'Approved' && (
                <button
                  onClick={() => handleApprove(selectedItem.storyPoetryId)}
                  className="px-4 py-2.5 bg-[#1b3b2b] hover:bg-emerald-950 text-white rounded-xl text-sm font-bold cursor-pointer"
                >
                  Approve
                </button>
              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

