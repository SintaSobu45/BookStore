import React, { useEffect, useState } from "react";
import {
  UserPlus,
  Pencil,
  KeyRound,
  Trash2,
  Search,
  X,
} from "lucide-react";

import {
  getAllEditors,
  createEditor,
  updateEditor,
  changeEditorPassword,
  deleteEditor,
} from "../../services/editorService";

const EditorManagement = () => {
  const [editors, setEditors] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [modal, setModal] = useState(null);

  const [selectedEditor, setSelectedEditor] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    newPassword: "",
  });

  // ===============================
  // LOAD EDITORS
  // ===============================

  useEffect(() => {
    loadEditors();
  }, []);

  const loadEditors = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllEditors();

      setEditors(data || []);
    } catch (err) {
      setError(
        err.message || "Failed to load editors."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // FORM HANDLING
  // ===============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===============================
  // OPEN CREATE MODAL
  // ===============================

  const openCreateModal = () => {
    setError("");
    setMessage("");

    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      newPassword: "",
    });

    setSelectedEditor(null);
    setModal("create");
  };

  // ===============================
  // OPEN EDIT MODAL
  // ===============================

  const openEditModal = (editor) => {
    setError("");
    setMessage("");

    setSelectedEditor(editor);

    setForm({
      name: editor.name || "",
      email: editor.email || "",
      phone: editor.phone || "",
      password: "",
      newPassword: "",
    });

    setModal("edit");
  };

  // ===============================
  // OPEN PASSWORD MODAL
  // ===============================

  const openPasswordModal = (editor) => {
    setError("");
    setMessage("");

    setSelectedEditor(editor);

    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      newPassword: "",
    });

    setModal("password");
  };

  // ===============================
  // CLOSE MODAL
  // ===============================

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setSelectedEditor(null);
    setError("");
  };

  // ===============================
  // CREATE EDITOR
  // ===============================

  const handleCreate = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError(
        "Phone number must be 10 digits and start with 6, 7, 8, or 9."
      );
      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setSaving(true);

      const result = await createEditor({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
      });

      setMessage(
        result?.message ||
          "Editor created successfully."
      );

      await loadEditors();

      setTimeout(() => {
        closeModal();
      }, 800);
    } catch (err) {
      setError(
        err.message || "Failed to create editor."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // UPDATE EDITOR
  // ===============================

  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError(
        "Phone number must be 10 digits and start with 6, 7, 8, or 9."
      );
      return;
    }

    try {
      setSaving(true);

      const result = await updateEditor(
        selectedEditor.userId,
        {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone,
        }
      );

      setMessage(
        result?.message ||
          "Editor updated successfully."
      );

      await loadEditors();

      setTimeout(() => {
        closeModal();
      }, 800);
    } catch (err) {
      setError(
        err.message || "Failed to update editor."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // CHANGE PASSWORD
  // ===============================

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (form.newPassword.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      setSaving(true);

      const result =
        await changeEditorPassword(
          selectedEditor.userId,
          form.newPassword
        );

      setMessage(
        result?.message ||
          "Editor password changed successfully."
      );

      setTimeout(() => {
        closeModal();
      }, 800);
    } catch (err) {
      setError(
        err.message ||
          "Failed to change editor password."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // DELETE EDITOR
  // ===============================

  const handleDelete = async () => {
    if (!selectedEditor) return;

    try {
      setSaving(true);
      setError("");

      const result = await deleteEditor(
        selectedEditor.userId
      );

      setMessage(
        result?.message ||
          "Editor deleted successfully."
      );

      setModal(null);
      setSelectedEditor(null);

      await loadEditors();
    } catch (err) {
      setError(
        err.message ||
          "Failed to delete editor."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===============================
  // OPEN DELETE CONFIRMATION
  // ===============================

  const openDeleteModal = (editor) => {
    setError("");
    setMessage("");
    setSelectedEditor(editor);
    setModal("delete");
  };

  // ===============================
  // FILTER EDITORS
  // ===============================

  const filteredEditors = editors.filter(
    (editor) =>
      `${editor.name || ""} ${
        editor.email || ""
      } ${editor.phone || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // ===============================
  // DATE FORMAT
  // ===============================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="w-full space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Editor Management
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Manage editors and their account details.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1b3b2b] text-white rounded-lg font-semibold hover:bg-[#143022] transition"
        >
          <UserPlus className="w-5 h-5" />
          Add Editor
        </button>

      </div>

      {/* =========================
          MESSAGE
      ========================= */}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          {message}
        </div>
      )}

      {error && !modal && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* =========================
          SEARCH
      ========================= */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">

        <div className="relative max-w-md">

          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search editors..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
          />

        </div>

      </div>

      {/* =========================
          EDITOR TABLE
      ========================= */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">
            Loading editors...
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 border-b border-gray-200">

                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Name
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Email
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Phone
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Created Date
                    </th>

                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredEditors.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        No editors found.
                      </td>
                    </tr>
                  ) : (
                    filteredEditors.map(
                      (editor) => (
                        <tr
                          key={editor.userId}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >

                          <td className="px-6 py-4 font-medium text-gray-900">
                            {editor.name}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {editor.email}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {editor.phone}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {formatDate(
                              editor.createdDate
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <div className="flex justify-end gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(editor)
                                }
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                title="Edit Editor"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openPasswordModal(
                                    editor
                                  )
                                }
                                className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                                title="Change Password"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteModal(
                                    editor
                                  )
                                }
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                                title="Delete Editor"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-gray-100">

              {filteredEditors.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  No editors found.
                </div>
              ) : (
                filteredEditors.map(
                  (editor) => (
                    <div
                      key={editor.userId}
                      className="p-5"
                    >

                      <div className="flex justify-between gap-4">

                        <div className="min-w-0">

                          <h3 className="font-semibold text-gray-900">
                            {editor.name}
                          </h3>

                          <p className="text-sm text-gray-600 mt-1 break-all">
                            {editor.email}
                          </p>

                          <p className="text-sm text-gray-600 mt-1">
                            {editor.phone}
                          </p>

                          <p className="text-xs text-gray-400 mt-2">
                            Created:{" "}
                            {formatDate(
                              editor.createdDate
                            )}
                          </p>

                        </div>

                        <div className="flex gap-1 shrink-0">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                editor
                              )
                            }
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                            title="Edit Editor"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openPasswordModal(
                                editor
                              )
                            }
                            className="p-2 rounded-lg text-amber-600 hover:bg-amber-50"
                            title="Change Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openDeleteModal(
                                editor
                              )
                            }
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                            title="Delete Editor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>

                      </div>

                    </div>
                  )
                )
              )}

            </div>
          </>
        )}

      </div>

      {/* =========================
          CREATE / EDIT / PASSWORD MODAL
      ========================= */}

      {(modal === "create" ||
        modal === "edit" ||
        modal === "password") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">

              <div>

                <h3 className="text-lg font-bold text-gray-900">

                  {modal === "create" &&
                    "Create New Editor"}

                  {modal === "edit" &&
                    "Edit Editor"}

                  {modal === "password" &&
                    "Change Editor Password"}

                </h3>

                {modal === "password" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Set a new password for{" "}
                    {selectedEditor?.name}
                  </p>
                )}

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

            </div>

            {/* CREATE */}

            {modal === "create" && (
              <form
                onSubmit={handleCreate}
                className="p-6 space-y-4"
              >

                <InputField
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter editor name"
                />

                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />

                <InputField
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10 digit phone number"
                  maxLength={10}
                />

                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                />

                <ModalMessage
                  error={error}
                  message={message}
                />

                <ModalButtons
                  onCancel={closeModal}
                  saving={saving}
                  submitText="Create Editor"
                />

              </form>
            )}

            {/* EDIT */}

            {modal === "edit" && (
              <form
                onSubmit={handleUpdate}
                className="p-6 space-y-4"
              >

                <InputField
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter editor name"
                />

                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />

                <InputField
                  label="Phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10 digit phone number"
                  maxLength={10}
                />

                <ModalMessage
                  error={error}
                  message={message}
                />

                <ModalButtons
                  onCancel={closeModal}
                  saving={saving}
                  submitText="Save Changes"
                />

              </form>
            )}

            {/* PASSWORD */}

            {modal === "password" && (
              <form
                onSubmit={handlePasswordChange}
                className="p-6 space-y-4"
              >

                <InputField
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                />

                <ModalMessage
                  error={error}
                  message={message}
                />

                <ModalButtons
                  onCancel={closeModal}
                  saving={saving}
                  submitText="Change Password"
                />

              </form>
            )}

          </div>

        </div>
      )}

      {/* =========================
          DELETE CONFIRMATION
      ========================= */}

      {modal === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Editor?
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-gray-800">
                    {selectedEditor?.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

            </div>

            <ModalMessage
              error={error}
              message={message}
            />

            <div className="flex justify-end gap-3 mt-6">

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {saving
                  ? "Deleting..."
                  : "Yes, Delete"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

// ===============================
// INPUT FIELD
// ===============================

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  maxLength,
}) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
      />
    </div>
  );
};

// ===============================
// MODAL MESSAGE
// ===============================

const ModalMessage = ({ error, message }) => {
  if (!error && !message) return null;

  return (
    <div
      className={`text-sm rounded-lg px-4 py-3 ${
        error
          ? "text-red-700 bg-red-50 border border-red-200"
          : "text-green-700 bg-green-50 border border-green-200"
      }`}
    >
      {error || message}
    </div>
  );
};

// ===============================
// MODAL BUTTONS
// ===============================

const ModalButtons = ({
  onCancel,
  saving,
  submitText,
}) => {
  return (
    <div className="flex justify-end gap-3 pt-2">

      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2.5 rounded-lg bg-[#1b3b2b] text-white font-semibold hover:bg-[#143022] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : submitText}
      </button>

    </div>
  );
};

export default EditorManagement;