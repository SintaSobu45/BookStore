import React, { useEffect, useState } from "react";
import { getMyOrders } from "../Services/orderService";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyOrders();

        setOrders(data);
      } catch (error) {
        console.error("Failed to load orders:", error);
        setError(error.message || "Unable to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p className="mt-3">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h3>No orders yet</h3>
        <p className="text-muted">
          You haven't ordered any books yet.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">My Orders</h2>

      {orders.map((order) => (
        <div
          key={order.orderId}
          className="card mb-4 shadow-sm"
        >
          <div className="card-body">

            {/* ORDER HEADER */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-1">
                  Order #{order.orderId}
                </h5>

                <small className="text-muted">
                  {new Date(order.orderDate).toLocaleDateString()}
                </small>
              </div>

              <span className="badge bg-primary">
                {order.orderStatus}
              </span>
            </div>

            <hr />

            {/* BOOKS */}
            {order.orderItems?.map((item) => (
              <div
                key={item.orderItemId}
                className="d-flex justify-content-between align-items-center mb-3"
              >
                <div>
                  <h6 className="mb-1">
                    {item.bookTitle}
                  </h6>

                  <small className="text-muted">
                    Quantity: {item.quantity}
                  </small>
                </div>

                <div className="text-end">
                  <div>
                    ₹{item.unitPrice}
                  </div>

                  <small className="text-muted">
                    ₹{item.totalPrice}
                  </small>
                </div>
              </div>
            ))}

            <hr />

            {/* TOTAL */}
            <div className="d-flex justify-content-between">
              <span>Subtotal</span>
              <strong>₹{order.subTotal}</strong>
            </div>

            <div className="d-flex justify-content-between">
              <span>Courier Fee</span>
              <strong>₹{order.courierFee}</strong>
            </div>

            <div className="d-flex justify-content-between mt-2">
              <h5>Total</h5>
              <h5>₹{order.totalAmount}</h5>
            </div>

            {/* PAYMENT */}
            <div className="mt-3">
              <span className="me-2">
                Payment:
              </span>

              <span
                className={`badge ${
                  order.paymentStatus === "Paid"
                    ? "bg-success"
                    : "bg-warning text-dark"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default MyOrders;