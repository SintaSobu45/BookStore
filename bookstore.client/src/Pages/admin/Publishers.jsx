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
    <div className="container-fluid p-4">

      {/* ================= HEADER ================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Publishers
          </h2>

          <p className="text-muted mb-0">
            Manage your bookstore publishers
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openAddModal}
        >
          + Add Publisher
        </button>

      </div>

      {/* ================= SUCCESS ================= */}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* ================= ERROR ================= */}

      {error &&
        !showAddModal &&
        !showEditModal && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

      {/* ================= TABLE ================= */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          {loading ? (

            <div className="text-center py-5">

              <div
                className="spinner-border text-primary"
                role="status"
              ></div>

              <p className="mt-3 text-muted">
                Loading publishers...
              </p>

            </div>

          ) : publishers.length === 0 ? (

            <div className="text-center py-5">

              <h5>
                No publishers found
              </h5>

              <p className="text-muted">
                Add your first publisher.
              </p>

              <button
                className="btn btn-primary"
                onClick={openAddModal}
              >
                + Add Publisher
              </button>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>#</th>

                    <th>Publisher Name</th>

                    <th>Description</th>

                    <th>Status</th>

                    <th>Created Date</th>

                    <th>Updated Date</th>

                    <th className="text-end">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {publishers.map((publisher, index) => (

                    <tr key={publisher.publisherId}>

                      <td>
                        {index + 1}
                      </td>

                      <td>

                        <span className="fw-semibold">
                          {publisher.publisherName}
                        </span>

                      </td>

                      <td>

                        <span className="text-muted">
                          {publisher.description ||
                            "No description"}
                        </span>

                      </td>

                      <td>

                        {publisher.isActive ? (

                          <span className="badge bg-success">
                            Active
                          </span>

                        ) : (

                          <span className="badge bg-secondary">
                            Inactive
                          </span>

                        )}

                      </td>

                      <td>

                        {publisher.createdDate
                          ? new Date(
                              publisher.createdDate
                            ).toLocaleDateString()
                          : "-"}

                      </td>

                      <td>

                        {publisher.updatedDate
                          ? new Date(
                              publisher.updatedDate
                            ).toLocaleDateString()
                          : "-"}

                      </td>

                      <td className="text-end">

                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() =>
                            openEditModal(publisher)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() =>
                            openDeleteModal(publisher)
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* ================================================= */}
      {/* ADD PUBLISHER MODAL */}
      {/* ================================================= */}

      {showAddModal && (

        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  Add Publisher
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                ></button>

              </div>

              <form onSubmit={handleCreate}>

                <div className="modal-body">

                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Publisher Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter publisher name"
                      value={publisherName}
                      onChange={(e) =>
                        setPublisherName(e.target.value)
                      }
                      maxLength={100}
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Description
                    </label>

                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Enter publisher description"
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value)
                      }
                      maxLength={500}
                    ></textarea>

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setShowAddModal(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Create Publisher
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

      {/* ================================================= */}
      {/* EDIT PUBLISHER MODAL */}
      {/* ================================================= */}

      {showEditModal && selectedPublisher && (

        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  Edit Publisher
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                ></button>

              </div>

              <form onSubmit={handleUpdate}>

                <div className="modal-body">

                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Publisher Name
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={publisherName}
                      onChange={(e) =>
                        setPublisherName(e.target.value)
                      }
                      maxLength={100}
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label fw-semibold">
                      Description
                    </label>

                    <textarea
                      className="form-control"
                      rows="4"
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value)
                      }
                      maxLength={500}
                    ></textarea>

                  </div>

                  <div className="form-check form-switch">

                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="publisherStatus"
                      checked={isActive}
                      onChange={(e) =>
                        setIsActive(e.target.checked)
                      }
                    />

                    <label
                      className="form-check-label"
                      htmlFor="publisherStatus"
                    >
                      Active
                    </label>

                  </div>

                </div>

                <div className="modal-footer">

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setShowEditModal(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>

                </div>

              </form>

            </div>

          </div>

        </div>

      )}

      {/* ================================================= */}
      {/* DELETE MODAL */}
      {/* ================================================= */}

      {showDeleteModal && selectedPublisher && (

        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >

          <div className="modal-dialog modal-dialog-centered">

            <div className="modal-content">

              <div className="modal-header">

                <h5 className="modal-title fw-bold">
                  Delete Publisher
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                ></button>

              </div>

              <div className="modal-body">

                <p className="mb-2">
                  Are you sure you want to delete this
                  publisher?
                </p>

                <div className="alert alert-warning mb-0">

                  <strong>
                    {selectedPublisher.publisherName}
                  </strong>

                  <br />

                  This action cannot be undone.

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setShowDeleteModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete Publisher
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Publishers;