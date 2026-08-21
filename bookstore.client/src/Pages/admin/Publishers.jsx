import React, { useEffect, useState } from "react";
import {
  getPublishers,
  createPublisher,
  updatePublisher,
  deletePublisher,
} from "../../services/publisherService";

function Publishers() {
  const [publishers, setPublishers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
        token,
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
        token,
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

      await deletePublisher(selectedPublisher.publisherId, token);

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

  //search publishers
  const filteredPublishers = publishers.filter((publisher) =>
    publisher.publisherName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Publishers
          </h2>

          <p className="text-gray-500 mt-0.5 text-xs sm:text-sm">
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
              px-4 py-2
              rounded-xl
              font-semibold
              text-xs sm:text-sm
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
        <div className="mb-3 shrink-0 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-xs text-green-700">
          {success}
        </div>
      )}

      {/* ================= ERROR MESSAGE ================= */}
      {error && !showAddModal && !showEditModal && (
        <div className="mb-3 shrink-0 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* ================= TABLE CARD ================= */}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* ================= SEARCH BAR ================= */}

        <div className="px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                All Publishers
              </h3>

              <p className="text-xs text-gray-500 mt-0.5">
                {filteredPublishers.length} publisher
                {filteredPublishers.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {/* Search Input */}

            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search publishers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
            w-full
            pl-9
            pr-9
            py-2
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            text-xs
            text-gray-900
            placeholder:text-gray-400
            outline-none
            focus:bg-white
            focus:border-gray-900
            focus:ring-2
            focus:ring-gray-900/10
            transition
          "
              />

              {/* Clear Search */}

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-gray-400
              hover:text-gray-700
              text-xs
              cursor-pointer
            "
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}

        {loading ? (
          /* ================= LOADING ================= */

          <div className="flex flex-col items-center justify-center flex-1">
            <div
              className="
          w-8 h-8
          border-4
          border-gray-200
          border-t-gray-900
          rounded-full
          animate-spin
        "
            />

            <p className="mt-3 text-xs text-gray-500">Loading publishers...</p>
          </div>
        ) : publishers.length === 0 ? (
          /* ================= NO PUBLISHERS ================= */

          <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl mb-3">
              🏢
            </div>

            <h3 className="text-base font-bold text-gray-900">
              No publishers found
            </h3>

            <p className="text-xs text-gray-500 mt-1 mb-4">
              Add your first publisher to get started.
            </p>

            <button
              onClick={openAddModal}
              className="
          bg-gray-900
          hover:bg-gray-800
          text-white
          px-4 py-2
          rounded-xl
          text-xs
          font-semibold
          transition
          cursor-pointer
        "
            >
              + Add Publisher
            </button>
          </div>
        ) : filteredPublishers.length === 0 ? (
          /* ================= NO SEARCH RESULTS ================= */

          <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl mb-3">
              🔍
            </div>

            <h3 className="text-base font-bold text-gray-900">
              No publishers found
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              No publisher matches "{searchTerm}"
            </p>

            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="
          mt-4
          bg-gray-900
          hover:bg-gray-800
          text-white
          px-4 py-2
          rounded-xl
          text-xs
          font-semibold
          transition
          cursor-pointer
        "
            >
              Clear Search
            </button>
          </div>
        ) : (
          /* ================= TABLE ================= */

          <div className="overflow-x-auto overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <table className="w-full min-w-[900px] text-xs relative">
              {/* TABLE HEADER */}

              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-500 w-12 bg-gray-50">
                    #
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-500 min-w-[180px] bg-gray-50">
                    Publisher Name
                  </th>

                  <th className="px-4 py-3 text-left font-semibold text-gray-500 min-w-[350px] bg-gray-50">
                    Description
                  </th>

                  <th className="px-4 py-3 text-right font-semibold text-gray-500 w-36 bg-gray-50">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody className="divide-y divide-gray-100">
                {filteredPublishers.map((publisher, index) => (
                  <tr
                    key={publisher.publisherId}
                    className="
                hover:bg-gray-50/80
                transition-colors
                duration-150
              "
                  >
                    {/* Number */}

                    <td className="px-4 py-3 text-gray-400 font-medium">
                      {index + 1}
                    </td>

                    {/* Publisher Name */}

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="
                      w-8 h-8
                      rounded-lg
                      bg-gray-100
                      flex items-center justify-center
                      text-sm
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

                    <td className="px-4 py-3">
                      <p
                        className="
                    text-gray-600
                    leading-relaxed
                    max-w-[380px]
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

                    {/* Actions */}

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(publisher)}
                          className="
                      px-3 py-1.5
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
                          onClick={() => openDeleteModal(publisher)}
                          className="
                      px-3 py-1.5
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
                max-h-[85vh]
                flex flex-col
              "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}

            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Add Publisher
                </h3>

                <p className="text-[11px] text-gray-500 mt-0.5">
                  Add a new publisher to your bookstore
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="
                    w-7 h-7
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

            <form
              onSubmit={handleCreate}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="px-5 py-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {error && (
                  <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                  </div>
                )}

                {/* Publisher Name */}

                <div className="mb-3.5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Publisher Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter publisher name"
                    value={publisherName}
                    onChange={(e) => setPublisherName(e.target.value)}
                    maxLength={100}
                    className="
                        w-full
                        px-3 py-2
                        rounded-xl
                        border border-gray-200
                        bg-gray-50
                        text-xs
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Description
                  </label>

                  <textarea
                    rows="3"
                    placeholder="Enter publisher description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    className="
                        w-full
                        px-3 py-2
                        rounded-xl
                        border border-gray-200
                        bg-gray-50
                        text-xs
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

                  <p className="text-[10px] text-gray-400 mt-1 text-right">
                    {description.length}/500
                  </p>
                </div>
              </div>

              {/* Modal Footer */}

              <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="
                      px-3.5 py-1.5
                      rounded-xl
                      border border-gray-200
                      bg-white
                      text-gray-700
                      text-xs
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
                      px-3.5 py-1.5
                      rounded-xl
                      bg-gray-900
                      text-white
                      text-xs
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
                max-h-[85vh]
                flex flex-col
              "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}

            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Edit Publisher
                </h3>

                <p className="text-[11px] text-gray-500 mt-0.5">
                  Update publisher information
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="
                    w-7 h-7
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

            <form
              onSubmit={handleUpdate}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="px-5 py-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {error && (
                  <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                  </div>
                )}

                {/* Publisher Name */}

                <div className="mb-3.5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Publisher Name
                  </label>

                  <input
                    type="text"
                    value={publisherName}
                    onChange={(e) => setPublisherName(e.target.value)}
                    maxLength={100}
                    className="
                        w-full
                        px-3 py-2
                        rounded-xl
                        border border-gray-200
                        bg-gray-50
                        text-xs
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

                <div className="mb-3.5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Description
                  </label>

                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    className="
                        w-full
                        px-3 py-2
                        rounded-xl
                        border border-gray-200
                        bg-gray-50
                        text-xs
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

                  <p className="text-[10px] text-gray-400 mt-1 text-right">
                    {description.length}/500
                  </p>
                </div>

                {/* Active */}

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      Publisher Status
                    </p>

                    <p className="text-[11px] text-gray-500">
                      Enable or disable this publisher
                    </p>
                  </div>

                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />

                    <div
                      className="
                        w-9 h-5
                        bg-gray-300
                        rounded-full
                        peer
                        peer-checked:bg-gray-900
                        transition
                      "
                    />

                    <div
                      className="
                        absolute
                        top-0.5 left-0.5
                        w-4 h-4
                        bg-white
                        rounded-full
                        shadow
                        transition
                        peer-checked:translate-x-4
                      "
                    />
                  </div>
                </label>
              </div>

              {/* Footer */}

              <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="
                      px-3.5 py-1.5
                      rounded-xl
                      border border-gray-200
                      bg-white
                      text-gray-700
                      text-xs
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
                      px-3.5 py-1.5
                      rounded-xl
                      bg-gray-900
                      text-white
                      text-xs
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

            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Delete Publisher
                </h3>

                <p className="text-[11px] text-gray-500 mt-0.5">
                  This action cannot be undone
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="
                    w-7 h-7
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

            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-sm shrink-0">
                  ⚠️
                </div>

                <div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Are you sure you want to delete this publisher?
                  </p>

                  <p className="font-bold text-xs text-gray-900 mt-1.5">
                    {selectedPublisher.publisherName}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}

            <div className="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="
                    px-3.5 py-1.5
                    rounded-xl
                    border border-gray-200
                    bg-white
                    text-gray-700
                    text-xs
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
                    px-3.5 py-1.5
                    rounded-xl
                    bg-red-600
                    text-white
                    text-xs
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
