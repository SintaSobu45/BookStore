import { useEffect, useState } from "react";
import {
  getAllPageWarnings,
  createPageWarning,
  updatePageWarning,
  deletePageWarning,
} from "../../services/pageWarningService";
import Swal from "sweetalert2";

const PageWarningManager = ({ pageName }) => {
  const [warnings, setWarnings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWarning, setEditingWarning] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    pageName,
    message: "",
    isActive: true,
  });

  // =========================================================
  // LOAD WARNING
  // =========================================================

  const loadWarnings = async () => {
    try {
      setLoading(true);

      const data = await getAllPageWarnings();

      const pageWarnings = data.filter(
        (warning) => warning.pageName === pageName
      );

      setWarnings(pageWarnings);
    } catch (error) {
      console.error("Failed to load warnings:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD ON COMPONENT MOUNT
  // =========================================================

  useEffect(() => {
    loadWarnings();
  }, [pageName]);

  // =========================================================
  // OPEN ADD / EDIT
  // =========================================================

  const handleAdd = () => {
    // If warning already exists, open it for editing
    if (warnings.length > 0) {
      const existingWarning = warnings[0];

      setEditingWarning(existingWarning);

      setFormData({
        pageName: existingWarning.pageName,
        message: existingWarning.message,
        isActive: existingWarning.isActive,
      });

      setShowModal(true);

      return;
    }

    // Otherwise open empty Add Warning modal
    setEditingWarning(null);

    setFormData({
      pageName,
      message: "",
      isActive: true,
    });

    setShowModal(true);
  };

  // =========================================================
  // SAVE WARNING
  // =========================================================

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      if (!formData.message.trim()) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "warning",
          title: "Please enter a warning message",
          showConfirmButton: false,
          timer: 2000,
        });

        return;
      }

      if (editingWarning) {
        await updatePageWarning(
          editingWarning.pageWarningId,
          formData
        );

        await Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Warning edited successfully",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        await createPageWarning(formData);

        await Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Warning added successfully",
          showConfirmButton: false,
          timer: 2000,
        });
      }

      setShowModal(false);
      setEditingWarning(null);

      await loadWarnings();
    } catch (error) {
      console.error("Failed to save warning:", error);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Failed to save warning",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  // =========================================================
  // DELETE WARNING
  // =========================================================

  const handleDelete = async () => {
    if (!editingWarning) return;

    try {
      await deletePageWarning(
        editingWarning.pageWarningId
      );

      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Warning deleted successfully",
        showConfirmButton: false,
        timer: 2000,
      });

      setShowModal(false);
      setEditingWarning(null);

      setFormData({
        pageName,
        message: "",
        isActive: true,
      });

      await loadWarnings();
    } catch (error) {
      console.error("Failed to delete warning:", error);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Failed to delete warning",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleClose = () => {
    setShowModal(false);
    setEditingWarning(null);

    setFormData({
      pageName,
      message: "",
      isActive: true,
    });
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      {/* =====================================================
          ADD / EDIT WARNING BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={handleAdd}
        disabled={loading}
        className="btn btn-warning text-light fw-bold"
      >
        + Add Warning
      </button>

      {/* =====================================================
          WARNING MODAL
      ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="mb-5">

              <h2 className="text-lg font-bold text-gray-900">
                {editingWarning
                  ? "Edit Warning"
                  : "Add Warning"}
              </h2>

              <p className="text-sm text-stone-500 mt-1">
                This message will be displayed as the important
                notice on this page.
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSave}>

              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData((previous) => ({
                    ...previous,
                    message: e.target.value,
                  }))
                }
                placeholder="Enter important message..."
                rows={5}
                required
                className="
                  w-full
                  border
                  border-stone-200
                  rounded-xl
                  p-3
                  text-sm
                  outline-none
                  focus:border-emerald-700
                  focus:ring-1
                  focus:ring-emerald-700
                  resize-none
                "
              />

              {/* =================================================
                  ACTION BUTTONS
              ================================================= */}

              <div className="flex justify-between gap-3 mt-5">

                {/* DELETE */}
                {editingWarning ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="
                      px-4
                      py-2
                      bg-red-600
                      hover:bg-red-700
                      text-white
                      rounded-xl
                      font-semibold
                      transition-colors
                    "
                  >
                    Delete
                  </button>
                ) : (
                  <div />
                )}

                {/* RIGHT BUTTONS */}
                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={handleClose}
                    className="
                      px-4
                      py-2
                      border
                      border-stone-200
                      hover:bg-stone-50
                      text-gray-700
                      rounded-xl
                      font-semibold
                      transition-colors
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="
                      px-5
                      py-2
                      bg-emerald-900
                      hover:bg-emerald-950
                      text-white
                      rounded-xl
                      font-semibold
                      transition-colors
                    "
                  >
                    {editingWarning
                      ? "Save Changes"
                      : "Add Warning"}
                  </button>

                </div>

              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default PageWarningManager;