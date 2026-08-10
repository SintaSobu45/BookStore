import React, { useEffect, useState } from "react";
import {
  getPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher,
} from "../../services/publisherService";

function Publishers() {
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedPublisher, setSelectedPublisher] = useState(null);

  const [publisherName, setPublisherName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  // =========================
  // FETCH PUBLISHERS
  // =========================

  const fetchPublishers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPublishers();

      setPublishers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load publishers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishers();
  }, []);

  // =========================
  // OPEN ADD MODAL
  // =========================

  const openAddModal = () => {
    setPublisherName("");
    setDescription("");
    setIsActive(true);

    setError("");

    setShowAddModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const openEditModal = (publisher) => {
    setSelectedPublisher(publisher);

    setPublisherName(publisher.publisherName);
    setDescription(publisher.description || "");
    setIsActive(publisher.isActive);

    setError("");

    setShowEditModal(true);
  };

  // =========================
  // OPEN DELETE MODAL
  // =========================

  const openDeleteModal = (publisher) => {
    setSelectedPublisher(publisher);

    setShowDeleteModal(true);
  };

  // =========================
  // CREATE PUBLISHER
  // =========================

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!publisherName.trim()) {
      setError("Publisher name is required.");
      return;
    }

    try {
      setError("");

      await createPublisher(
        {
          publisherName: publisherName.trim(),
          description: description.trim() || null,
        },
        token
      );

      setShowAddModal(false);

      setSuccess("Publisher created successfully.");

      await fetchPublishers();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to create publisher.");
    }
  };

  // =========================
  // UPDATE PUBLISHER
  // =========================

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!publisherName.trim()) {
      setError("Publisher name is required.");
      return;
    }

    try {
      setError("");

      await updatePublisher(
        selectedPublisher.publisherId,
        {
          publisherName: publisherName.trim(),
          description: description.trim() || null,
          isActive: isActive,
        },
        token
      );

      setShowEditModal(false);

      setSelectedPublisher(null);

      setSuccess("Publisher updated successfully.");

      await fetchPublishers();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to update publisher.");
    }
  };

  // =========================
  // DELETE PUBLISHER
  // =========================

  const handleDelete = async () => {
    try {
      setError("");

      await deletePublisher(
        selectedPublisher.publisherId,
        token
      );

      setShowDeleteModal(false);

      setSelectedPublisher(null);

      setSuccess("Publisher deleted successfully.");

      await fetchPublishers();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to delete publisher.");
    }
  };

return (
  <div className="w-full">

    {/* ================= HEADER ================= */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Publishers
        </h2>

        <p className="text-gray-500 mt-1 text-sm sm:text-base">
          Manage your bookstore publishers
        </p>
      </div>

      <button
        onClick={openAddModal}
        className="
          inline-flex items-center justify-center
          bg-gray-900
          hover:bg-gray-800
          text-white
          px-5 py-2.5
          rounded-xl
          font-semibold
          text-sm
          shadow-sm
          hover:shadow-md
          transition-all
          duration-200
          cursor-pointer
          whitespace-nowrap
        "
      >
        + Add Publisher
      </button>

    </div>


    {/* ================= SUCCESS MESSAGE ================= */}
    {success && (
      <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        {success}
      </div>
    )}


    {/* ================= ERROR MESSAGE ================= */}
    {error &&
      !showAddModal &&
      !showEditModal && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


    {/* ================= TABLE CARD ================= */}

    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {loading ? (

        /* ================= LOADING ================= */

        <div className="flex flex-col items-center justify-center py-20">

          <div
            className="
              w-10 h-10
              border-4
              border-gray-200
              border-t-gray-900
              rounded-full
              animate-spin
            "
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading publishers...
          </p>

        </div>

      ) : publishers.length === 0 ? (

        /* ================= EMPTY STATE ================= */

        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">

          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-4">
            🏢
          </div>

          <h3 className="text-lg font-bold text-gray-900">
            No publishers found
          </h3>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            Add your first publisher to get started.
          </p>

          <button
            onClick={openAddModal}
            className="
              bg-gray-900
              hover:bg-gray-800
              text-white
              px-5 py-2.5
              rounded-xl
              text-sm
              font-semibold
              transition
              cursor-pointer
            "
          >
            + Add Publisher
          </button>

        </div>

      ) : (

        /* ================= TABLE ================= */

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1100px] text-sm">

            {/* TABLE HEADER */}

            <thead className="bg-gray-50 border-b border-gray-200">

              <tr>

                <th className="px-5 py-4 text-left font-semibold text-gray-600 w-16">
                  #
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600 min-w-[200px]">
                  Publisher Name
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600 min-w-[400px]">
                  Description
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600 w-32">
                  Status
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600 w-36">
                  Created Date
                </th>

                <th className="px-5 py-4 text-left font-semibold text-gray-600 w-36">
                  Updated Date
                </th>

                <th className="px-5 py-4 text-right font-semibold text-gray-600 w-44">
                  Actions
                </th>

              </tr>

            </thead>


            {/* TABLE BODY */}

            <tbody className="divide-y divide-gray-100">

              {publishers.map((publisher, index) => (

                <tr
                  key={publisher.publisherId}
                  className="
                    hover:bg-gray-50/80
                    transition-colors
                    duration-150
                  "
                >

                  {/* Number */}

                  <td className="px-5 py-5 text-gray-400 font-medium">
                    {index + 1}
                  </td>


                  {/* Publisher Name */}

                  <td className="px-5 py-5">

                    <div className="flex items-center gap-3">

                      <div
                        className="
                          w-10 h-10
                          rounded-xl
                          bg-gray-100
                          flex items-center justify-center
                          text-lg
                          shrink-0
                        "
                      >
                        🏢
                      </div>

                      <div className="min-w-0">

                        <p className="font-semibold text-gray-900 truncate">
                          {publisher.publisherName}
                        </p>

                      </div>

                    </div>

                  </td>


                  {/* Description */}

                  <td className="px-5 py-5">

                    <p
                      className="
                        text-gray-600
                        leading-relaxed
                        max-w-[420px]
                        whitespace-normal
                        break-words
                      "
                    >
                      {publisher.description || (
                        <span className="text-gray-400 italic">
                          No description
                        </span>
                      )}
                    </p>

                  </td>


                  {/* Status */}

                  <td className="px-5 py-5">

                    {publisher.isActive ? (

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          px-3 py-1.5
                          rounded-full
                          bg-green-50
                          text-green-700
                          border border-green-100
                          text-xs
                          font-semibold
                        "
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Active
                      </span>

                    ) : (

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          px-3 py-1.5
                          rounded-full
                          bg-gray-100
                          text-gray-600
                          border border-gray-200
                          text-xs
                          font-semibold
                        "
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        Inactive
                      </span>

                    )}

                  </td>


                  {/* Created Date */}

                  <td className="px-5 py-5 text-gray-500 whitespace-nowrap">

                    {publisher.createdDate
                      ? new Date(
                          publisher.createdDate
                        ).toLocaleDateString()
                      : "-"}

                  </td>


                  {/* Updated Date */}

                  <td className="px-5 py-5 text-gray-500 whitespace-nowrap">

                    {publisher.updatedDate
                      ? new Date(
                          publisher.updatedDate
                        ).toLocaleDateString()
                      : "-"}

                  </td>


                  {/* Actions */}

                  <td className="px-5 py-5">

                    <div className="flex items-center justify-end gap-2">

                      <button
                        onClick={() =>
                          openEditModal(publisher)
                        }
                        className="
                          px-3.5 py-2
                          rounded-lg
                          border border-blue-200
                          text-blue-600
                          hover:bg-blue-50
                          hover:border-blue-300
                          text-xs
                          font-semibold
                          transition
                          cursor-pointer
                        "
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          openDeleteModal(publisher)
                        }
                        className="
                          px-3.5 py-2
                          rounded-lg
                          border border-red-200
                          text-red-600
                          hover:bg-red-50
                          hover:border-red-300
                          text-xs
                          font-semibold
                          transition
                          cursor-pointer
                        "
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


    {/* ================================================= */}
    {/* ADD PUBLISHER MODAL */}
    {/* ================================================= */}

    {showAddModal && (

      <div
        className="
          fixed inset-0
          z-50
          flex items-center justify-center
          bg-black/50
          backdrop-blur-sm
          p-4
        "
        onClick={() => setShowAddModal(false)}
      >

        <div
          className="
            w-full
            max-w-md
            bg-white
            rounded-2xl
            shadow-2xl
            overflow-hidden
          "
          onClick={(e) => e.stopPropagation()}
        >

          {/* Modal Header */}

          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

            <div>

              <h3 className="text-lg font-bold text-gray-900">
                Add Publisher
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Add a new publisher to your bookstore
              </p>

            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="
                w-8 h-8
                rounded-lg
                flex items-center justify-center
                text-gray-400
                hover:bg-gray-100
                hover:text-gray-700
                transition
                cursor-pointer
              "
            >
              ✕
            </button>

          </div>


          {/* Form */}

          <form onSubmit={handleCreate}>

            <div className="px-6 py-5">

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              {/* Publisher Name */}

              <div className="mb-4">

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Publisher Name
                </label>

                <input
                  type="text"
                  placeholder="Enter publisher name"
                  value={publisherName}
                  onChange={(e) =>
                    setPublisherName(e.target.value)
                  }
                  maxLength={100}
                  className="
                    w-full
                    px-3.5 py-2.5
                    rounded-xl
                    border border-gray-200
                    bg-gray-50
                    text-sm
                    text-gray-900
                    outline-none
                    focus:bg-white
                    focus:border-gray-900
                    focus:ring-2
                    focus:ring-gray-900/10
                    transition
                  "
                />

              </div>


              {/* Description */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description
                </label>

                <textarea
                  rows="4"
                  placeholder="Enter publisher description"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  maxLength={500}
                  className="
                    w-full
                    px-3.5 py-2.5
                    rounded-xl
                    border border-gray-200
                    bg-gray-50
                    text-sm
                    text-gray-900
                    outline-none
                    resize-none
                    focus:bg-white
                    focus:border-gray-900
                    focus:ring-2
                    focus:ring-gray-900/10
                    transition
                  "
                />

                <p className="text-xs text-gray-400 mt-1.5 text-right">
                  {description.length}/500
                </p>

              </div>

            </div>


            {/* Modal Footer */}

            <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">

              <button
                type="button"
                onClick={() =>
                  setShowAddModal(false)
                }
                className="
                  px-4 py-2.5
                  rounded-xl
                  border border-gray-200
                  bg-white
                  text-gray-700
                  text-sm
                  font-semibold
                  hover:bg-gray-100
                  transition
                  cursor-pointer
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                className="
                  px-4 py-2.5
                  rounded-xl
                  bg-gray-900
                  text-white
                  text-sm
                  font-semibold
                  hover:bg-gray-800
                  shadow-sm
                  transition
                  cursor-pointer
                "
              >
                Create Publisher
              </button>

            </div>

          </form>

        </div>

      </div>

    )}


    {/* ================================================= */}
    {/* EDIT PUBLISHER MODAL */}
    {/* ================================================= */}

    {showEditModal && selectedPublisher && (

      <div
        className="
          fixed inset-0
          z-50
          flex items-center justify-center
          bg-black/50
          backdrop-blur-sm
          p-4
        "
        onClick={() => setShowEditModal(false)}
      >

        <div
          className="
            w-full
            max-w-md
            bg-white
            rounded-2xl
            shadow-2xl
            overflow-hidden
          "
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}

          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

            <div>

              <h3 className="text-lg font-bold text-gray-900">
                Edit Publisher
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Update publisher information
              </p>

            </div>

            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="
                w-8 h-8
                rounded-lg
                flex items-center justify-center
                text-gray-400
                hover:bg-gray-100
                hover:text-gray-700
                transition
                cursor-pointer
              "
            >
              ✕
            </button>

          </div>


          {/* Form */}

          <form onSubmit={handleUpdate}>

            <div className="px-6 py-5">

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              {/* Publisher Name */}

              <div className="mb-4">

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Publisher Name
                </label>

                <input
                  type="text"
                  value={publisherName}
                  onChange={(e) =>
                    setPublisherName(e.target.value)
                  }
                  maxLength={100}
                  className="
                    w-full
                    px-3.5 py-2.5
                    rounded-xl
                    border border-gray-200
                    bg-gray-50
                    text-sm
                    text-gray-900
                    outline-none
                    focus:bg-white
                    focus:border-gray-900
                    focus:ring-2
                    focus:ring-gray-900/10
                    transition
                  "
                />

              </div>


              {/* Description */}

              <div className="mb-4">

                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description
                </label>

                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  maxLength={500}
                  className="
                    w-full
                    px-3.5 py-2.5
                    rounded-xl
                    border border-gray-200
                    bg-gray-50
                    text-sm
                    text-gray-900
                    outline-none
                    resize-none
                    focus:bg-white
                    focus:border-gray-900
                    focus:ring-2
                    focus:ring-gray-900/10
                    transition
                  "
                />

                <p className="text-xs text-gray-400 mt-1.5 text-right">
                  {description.length}/500
                </p>

              </div>


              {/* Active */}

              <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">

                <div>

                  <p className="text-sm font-semibold text-gray-800">
                    Publisher Status
                  </p>

                  <p className="text-xs text-gray-500">
                    Enable or disable this publisher
                  </p>

                </div>

                <div className="relative">

                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) =>
                      setIsActive(e.target.checked)
                    }
                    className="sr-only peer"
                  />

                  <div className="
                    w-11 h-6
                    bg-gray-300
                    rounded-full
                    peer
                    peer-checked:bg-gray-900
                    transition
                  " />

                  <div className="
                    absolute
                    top-1 left-1
                    w-4 h-4
                    bg-white
                    rounded-full
                    shadow
                    transition
                    peer-checked:translate-x-5
                  " />

                </div>

              </label>

            </div>


            {/* Footer */}

            <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">

              <button
                type="button"
                onClick={() =>
                  setShowEditModal(false)
                }
                className="
                  px-4 py-2.5
                  rounded-xl
                  border border-gray-200
                  bg-white
                  text-gray-700
                  text-sm
                  font-semibold
                  hover:bg-gray-100
                  transition
                  cursor-pointer
                "
              >
                Cancel
              </button>

              <button
                type="submit"
                className="
                  px-4 py-2.5
                  rounded-xl
                  bg-gray-900
                  text-white
                  text-sm
                  font-semibold
                  hover:bg-gray-800
                  shadow-sm
                  transition
                  cursor-pointer
                "
              >
                Save Changes
              </button>

            </div>

          </form>

        </div>

      </div>

    )}


    {/* ================================================= */}
    {/* DELETE MODAL */}
    {/* ================================================= */}

    {showDeleteModal && selectedPublisher && (

      <div
        className="
          fixed inset-0
          z-50
          flex items-center justify-center
          bg-black/50
          backdrop-blur-sm
          p-4
        "
        onClick={() => setShowDeleteModal(false)}
      >

        <div
          className="
            w-full
            max-w-sm
            bg-white
            rounded-2xl
            shadow-2xl
            overflow-hidden
          "
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}

          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

            <div>

              <h3 className="text-lg font-bold text-gray-900">
                Delete Publisher
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                This action cannot be undone
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowDeleteModal(false)
              }
              className="
                w-8 h-8
                rounded-lg
                flex items-center justify-center
                text-gray-400
                hover:bg-gray-100
                hover:text-gray-700
                transition
                cursor-pointer
              "
            >
              ✕
            </button>

          </div>


          {/* Body */}

          <div className="px-6 py-6">

            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                ⚠️
              </div>

              <div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  Are you sure you want to delete this publisher?
                </p>

                <p className="font-bold text-gray-900 mt-2">
                  {selectedPublisher.publisherName}
                </p>

              </div>

            </div>

          </div>


          {/* Footer */}

          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-gray-100">

            <button
              type="button"
              onClick={() =>
                setShowDeleteModal(false)
              }
              className="
                px-4 py-2.5
                rounded-xl
                border border-gray-200
                bg-white
                text-gray-700
                text-sm
                font-semibold
                hover:bg-gray-100
                transition
                cursor-pointer
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="
                px-4 py-2.5
                rounded-xl
                bg-red-600
                text-white
                text-sm
                font-semibold
                hover:bg-red-700
                shadow-sm
                transition
                cursor-pointer
              "
            >
              Delete Publisher
            </button>

          </div>

        </div>

      </div>

    )}

  </div>
);


}

export default Publishers;