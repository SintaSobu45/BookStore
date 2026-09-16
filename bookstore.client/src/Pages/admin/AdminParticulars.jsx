import React, { useEffect, useState } from "react";
import { Plus, Search, Pencil, Power, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

import {
  getAllStoryPoetryParticulars,
  addStoryPoetryParticular,
  deactivateStoryPoetryParticular,
} from "../../services/storyPoetryParticularService";

const AdminParticulars = () => {
  const [particulars, setParticulars] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: "Poetry",
    name: "",
    extraCopyPrice: "",
  });

  // ======================================================
  // LOAD PARTICULARS
  // ======================================================

  const loadParticulars = async () => {
    try {
      setLoading(true);

      const data = await getAllStoryPoetryParticulars();

      setParticulars(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load particulars:", error);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: error.message || "Failed to load particulars.",
        showConfirmButton: false,
        timer: 2500,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticulars();
  }, []);

  // ======================================================
  // FILTER + SEARCH
  // ======================================================

  const filteredParticulars = particulars.filter((item) => {
    const matchesType = typeFilter === "All" || item.type === typeFilter;

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && item.isActive) ||
      (statusFilter === "Inactive" && !item.isActive);

    const matchesSearch = item.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  // ======================================================
  // FORM
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setFormData({
      type: "Poetry",
      name: "",
      extraCopyPrice: "",
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
  };

  // ======================================================
  // ADD PARTICULAR
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Please enter a particular name.",
        showConfirmButton: false,
        timer: 2500,
      });

      return;
    }

    if (formData.extraCopyPrice === "" || Number(formData.extraCopyPrice) < 0) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Please enter a valid extra copy price.",
        showConfirmButton: false,
        timer: 2500,
      });

      return;
    }

    try {
      setSaving(true);

      await addStoryPoetryParticular({
        type: formData.type,
        name: formData.name.trim(),
        extraCopyPrice: Number(formData.extraCopyPrice),
      });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Particular added successfully.",
        showConfirmButton: false,
        timer: 2000,
      });

      setIsModalOpen(false);

      await loadParticulars();
    } catch (error) {
      console.error("Failed to add particular:", error);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: error.message || "Failed to add particular.",
        showConfirmButton: false,
        timer: 2500,
      });
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // DEACTIVATE
  // ======================================================

  const handleDeactivate = async (id) => {
    try {
      await deactivateStoryPoetryParticular(id);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Particular deactivated successfully.",
        showConfirmButton: false,
        timer: 2000,
      });

      await loadParticulars();
    } catch (error) {
      console.error("Failed to deactivate:", error);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: error.message || "Failed to deactivate particular.",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  return (
    <div className="p-4 md:p-6 mt-5">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Particular Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage Story, Poetry and Special particulars.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Plus size={18} />
          Add Particular
        </button>
      </div>

      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        {/* TYPE FILTER */}

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
        >
          <option value="All">All</option>
          <option value="Story">Story</option>
          <option value="Poetry">Poetry</option>
          <option value="Special">Special</option>
        </select>

        {/* STATUS FILTER */}

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {/* SEARCH */}

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search particular..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-500"
          />
        </div>
      </div>

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <Loader2 size={28} className="animate-spin text-gray-500" />
          </div>
        ) : filteredParticulars.length === 0 ? (
          <div className="flex min-h-[250px] items-center justify-center px-4 text-center text-sm text-gray-500">
            No particulars found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Particular
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Type
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Extra Copy
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredParticulars.map((item) => (
                  <tr
                    key={item.storyPoetryParticularId}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {item.name}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {item.type}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-600">
                      ₹{Number(item.extraCopyPrice).toFixed(2)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {item.isActive && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeactivate(item.storyPoetryParticularId)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Power size={15} />
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================
          ADD MODAL
      ================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Add Particular
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Create a new Story, Poetry or Special particular.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="p-5">
              {/* TYPE */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Type
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                >
                  <option value="Story">Story</option>
                  <option value="Poetry">Poetry</option>
                  <option value="Special">Special</option>
                </select>
              </div>

              {/* NAME */}

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Particular Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Enter particular name"
                  maxLength={200}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                />
              </div>

              {/* EXTRA COPY PRICE */}

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Extra Copy Price
                </label>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="extraCopyPrice"
                    value={formData.extraCopyPrice}
                    onChange={handleChange}
                    disabled={saving}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              {/* ACTIONS */}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}

                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminParticulars;
