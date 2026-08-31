import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  Loader2,
  Search,
  X,
  MapPin,
  Phone,
  Mail,
  Package,
  ChevronDown,
  User,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  Truck,
} from "lucide-react";

import {
  getAllOrders,
  updateOrderStatus,
} from "../../services/orderService";

export default function BookOrders() {
  // =========================================================
  // STATE
  // =========================================================

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // =========================================================
  // LOAD ORDERS
  // =========================================================

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllOrders();

      console.log("orders:", data);

      // -----------------------------------------------------
      // Only keep PAID orders
      // -----------------------------------------------------

      const paidOrders = (data || []).filter(
        (order) =>
          String(order.paymentStatus || "").toLowerCase() ===
          "paid"
      );

      setOrders(paidOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);

      setError(
        error.message || "Failed to load book orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // FORMAT DATE + TIME
  // =========================================================

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================================
  // GET ITEM COUNT
  // =========================================================

  const getItemCount = (order) => {
    if (!order?.items) return 0;

    return order.items.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );
  };

  // =========================================================
  // GET BOOK NAMES
  // =========================================================

  const getBookNames = (order) => {
    if (!order?.items?.length) {
      return [];
    }

    return order.items
      .map((item) => item.bookTitle)
      .filter(Boolean);
  };

  // =========================================================
  // ORDER STATUS STYLE
  // =========================================================

  const getOrderStatusStyle = (status) => {
    if (status === "Delivered") {
      return {
        className: "bg-emerald-100 text-emerald-800",
        icon: CheckCircle2,
      };
    }

    return {
      className: "bg-amber-100 text-amber-800",
      icon: Truck,
    };
  };

  // =========================================================
  // FILTER ORDERS
  // =========================================================

  const filteredOrders = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return orders.filter((order) => {
      // -----------------------------------------------------
      // STATUS FILTER
      // -----------------------------------------------------

      const matchesStatus =
        statusFilter === "All" ||
        order.orderStatus === statusFilter;

      // -----------------------------------------------------
      // SEARCH FILTER
      // -----------------------------------------------------

      const matchesSearch =
        !search ||
        String(order.orderId || "")
          .toLowerCase()
          .includes(search) ||
        String(order.guestOrderId || "")
          .toLowerCase()
          .includes(search) ||
        String(order.customerName || "")
          .toLowerCase()
          .includes(search) ||
        String(order.customerEmail || "")
          .toLowerCase()
          .includes(search) ||
        String(order.customerPhone || "")
          .toLowerCase()
          .includes(search) ||
        // Also search by book title
        order.items?.some((item) =>
          String(item.bookTitle || "")
            .toLowerCase()
            .includes(search)
        );

      // -----------------------------------------------------
      // DATE FILTER
      // -----------------------------------------------------

      let matchesDate = true;

      if (order.orderDate) {
        const orderDate = new Date(order.orderDate);

        // Normalize order date to local date
        const orderYear = orderDate.getFullYear();
        const orderMonth = String(
          orderDate.getMonth() + 1
        ).padStart(2, "0");
        const orderDay = String(
          orderDate.getDate()
        ).padStart(2, "0");

        const orderDateString = `${orderYear}-${orderMonth}-${orderDay}`;

        // From date
        if (fromDate && orderDateString < fromDate) {
          matchesDate = false;
        }

        // To date
        if (toDate && orderDateString > toDate) {
          matchesDate = false;
        }
      }

      return (
        matchesStatus &&
        matchesSearch &&
        matchesDate
      );
    });
  }, [
    orders,
    searchTerm,
    statusFilter,
    fromDate,
    toDate,
  ]);

  // =========================================================
  // TOTAL AMOUNT RECEIVED
  // =========================================================

  const totalAmountReceived = useMemo(() => {
    return orders.reduce(
      (total, order) =>
        total + Number(order.totalAmount || 0),
      0
    );
  }, [orders]);

  // =========================================================
  // STATUS COUNTS
  // =========================================================

  const totalOrders = orders.length;

  const confirmedOrders = orders.filter(
    (order) =>
      order.orderStatus === "Confirmed"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.orderStatus === "Delivered"
  ).length;

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleStatusChange = async (
    order,
    newStatus
  ) => {
    if (
      !order ||
      !newStatus ||
      order.orderStatus === newStatus
    ) {
      return;
    }

    try {
      setUpdatingOrderId(order.orderId);

      await updateOrderStatus(
        order.orderId,
        newStatus
      );

      // -----------------------------------------------------
      // Update orders list
      // -----------------------------------------------------

      setOrders((previousOrders) =>
        previousOrders.map((item) =>
          item.orderId === order.orderId
            ? {
                ...item,
                orderStatus: newStatus,
              }
            : item
        )
      );

      // -----------------------------------------------------
      // Update selected order
      // -----------------------------------------------------

      setSelectedOrder((previous) =>
        previous &&
        previous.orderId === order.orderId
          ? {
              ...previous,
              orderStatus: newStatus,
            }
          : previous
      );
    } catch (error) {
      console.error(
        "Failed to update order status:",
        error
      );

      alert(
        error.message ||
          "Failed to update order status."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // =========================================================
  // OPEN ORDER
  // =========================================================

  const handleOpenOrder = (order) => {
    setSelectedOrder(order);
  };

  // =========================================================
  // CLOSE ORDER
  // =========================================================

  const handleCloseOrder = () => {
    setSelectedOrder(null);
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
  };

  // =========================================================
  // CHECK WHETHER FILTERS ARE ACTIVE
  // =========================================================

  const hasActiveFilters =
    searchTerm ||
    statusFilter !== "All" ||
    fromDate ||
    toDate;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="p-6 mt-5">
        <div className="bg-white border border-stone-200 rounded-2xl py-24 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-900" />

          <span className="ml-2 text-sm text-stone-500">
            Loading book orders...
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="p-6 mt-5">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Book Orders
        </h1>

        <p className="text-sm text-stone-500 mt-1">
          View and manage paid book orders placed by
          customers.
        </p>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* TOTAL ORDERS */}

        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 font-semibold">
                Paid Orders
              </p>

              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                {totalOrders}
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-emerald-800" />
            </div>
          </div>
        </div>

        {/* CONFIRMED */}

        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-xs text-stone-500 font-semibold">
            Confirmed
          </p>

          <p className="text-2xl font-extrabold text-amber-700 mt-1">
            {confirmedOrders}
          </p>
        </div>

        {/* DELIVERED */}

        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-xs text-stone-500 font-semibold">
            Delivered
          </p>

          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {deliveredOrders}
          </p>
        </div>

        {/* TOTAL AMOUNT */}

        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-xs text-stone-500 font-semibold">
            Total Amount Received
          </p>

          <p className="text-2xl font-extrabold text-emerald-900 mt-1">
            {formatMoney(totalAmountReceived)}
          </p>

          <p className="text-[11px] text-stone-400 mt-1">
            From paid book orders
          </p>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        {/* ===================================================
            FILTER HEADER
        =================================================== */}

        <div className="px-5 py-4 border-b border-stone-200">
          <div className="flex flex-col gap-4">
            {/* TOP ROW */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* LEFT */}

              <div>
                <h2 className="text-base font-bold text-gray-900">
                  All Paid Orders
                </h2>

                <p className="text-xs text-stone-500 mt-0.5">
                  {filteredOrders.length} order
                  {filteredOrders.length !== 1
                    ? "s"
                    : ""}{" "}
                  found
                </p>
              </div>

              {/* RIGHT */}

              <div className="flex flex-col sm:flex-row gap-3">
                {/* STATUS FILTER */}

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                    className="
                      appearance-none
                      w-full
                      sm:w-40
                      px-4
                      py-2.5
                      pr-9
                      rounded-xl
                      border
                      border-stone-200
                      bg-stone-50
                      text-sm
                      text-gray-700
                      outline-none
                      focus:bg-white
                      focus:border-emerald-900
                      focus:ring-2
                      focus:ring-emerald-900/10
                    "
                  >
                    <option value="All">
                      All Status
                    </option>

                    <option value="Confirmed">
                      Confirmed
                    </option>

                    <option value="Delivered">
                      Delivered
                    </option>
                  </select>

                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                </div>

                {/* SEARCH */}

                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                    placeholder="Search order, name, book..."
                    className="
                      w-full
                      pl-9
                      pr-10
                      py-2.5
                      rounded-xl
                      border
                      border-stone-200
                      bg-stone-50
                      text-sm
                      text-gray-900
                      placeholder:text-stone-400
                      outline-none
                      focus:bg-white
                      focus:border-emerald-900
                      focus:ring-2
                      focus:ring-emerald-900/10
                    "
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchTerm("")
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-stone-400
                        hover:text-stone-700
                      "
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                DATE FILTERS
            ================================================= */}

            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              {/* FROM DATE */}

              <div className="w-full sm:w-44">
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                  From Date
                </label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) =>
                      setFromDate(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      pl-9
                      pr-3
                      py-2.5
                      rounded-xl
                      border
                      border-stone-200
                      bg-stone-50
                      text-sm
                      text-gray-700
                      outline-none
                      focus:bg-white
                      focus:border-emerald-900
                      focus:ring-2
                      focus:ring-emerald-900/10
                    "
                  />
                </div>
              </div>

              {/* TO DATE */}

              <div className="w-full sm:w-44">
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                  To Date
                </label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />

                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(e) =>
                      setToDate(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      pl-9
                      pr-3
                      py-2.5
                      rounded-xl
                      border
                      border-stone-200
                      bg-stone-50
                      text-sm
                      text-gray-700
                      outline-none
                      focus:bg-white
                      focus:border-emerald-900
                      focus:ring-2
                      focus:ring-emerald-900/10
                    "
                  />
                </div>
              </div>

              {/* CLEAR FILTERS */}

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    border
                    border-stone-200
                    bg-white
                    hover:bg-stone-100
                    text-sm
                    font-semibold
                    text-stone-600
                    transition-colors
                    cursor-pointer
                  "
                >
                  <X className="h-4 w-4" />

                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================
            EMPTY
        =================================================== */}

        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag className="h-10 w-10 mx-auto text-stone-300 mb-3" />

            <h3 className="font-bold text-gray-900">
              No paid orders found
            </h3>

            <p className="text-sm text-stone-500 mt-1">
              No paid orders match your current
              filters.
            </p>
          </div>
        ) : (
          /* =================================================
             TABLE
          ================================================= */

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-5 py-4 font-bold text-gray-700">
                    Order
                  </th>

                  <th className="text-left px-5 py-4 font-bold text-gray-700">
                    Customer
                  </th>

                  <th className="text-left px-5 py-4 font-bold text-gray-700">
                    Books
                  </th>

                  <th className="text-left px-5 py-4 font-bold text-gray-700">
                    Amount
                  </th>

                  <th className="text-left px-5 py-4 font-bold text-gray-700">
                    Payment
                  </th>

                  <th className="text-left px-5 py-4 font-bold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => {
                  const statusStyle =
                    getOrderStatusStyle(
                      order.orderStatus
                    );

                  const StatusIcon =
                    statusStyle.icon;

                  const bookNames =
                    getBookNames(order);

                  return (
                    <tr
                      key={order.orderId}
                      onClick={() =>
                        handleOpenOrder(order)
                      }
                      className="
                        hover:bg-emerald-50/40
                        transition-colors
                        cursor-pointer
                      "
                    >
                      {/* =================================================
                          ORDER
                      ================================================= */}

                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-gray-900">
                            #{order.orderId}
                          </p>

                          {order.guestOrderId && (
                            <p className="text-[10px] text-stone-500 mt-1">
                              {order.guestOrderId}
                            </p>
                          )}

                          <p className="text-xs text-stone-500 mt-1">
                            {formatDate(
                              order.orderDate
                            )}
                          </p>
                        </div>
                      </td>

                      {/* =================================================
                          CUSTOMER
                      ================================================= */}

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {order.customerName ||
                            "-"}
                        </p>

                        <p className="text-xs text-stone-500 mt-1">
                          {order.customerEmail ||
                            "-"}
                        </p>

                        {order.customerPhone && (
                          <p className="text-xs text-stone-500 mt-0.5">
                            {order.customerPhone}
                          </p>
                        )}
                      </td>

                      {/* =================================================
                          BOOKS
                      ================================================= */}

                      <td className="px-5 py-4 min-w-[250px] max-w-[350px]">
                        {bookNames.length > 0 ? (
                          <div>
                            <div className="space-y-1">
                              {bookNames
                                .slice(0, 2)
                                .map(
                                  (
                                    bookName,
                                    index
                                  ) => (
                                    <p
                                      key={`${bookName}-${index}`}
                                      className="
                                        font-semibold
                                        text-gray-800
                                        truncate
                                      "
                                      title={
                                        bookName
                                      }
                                    >
                                      {bookName}
                                    </p>
                                  )
                                )}
                            </div>

                            {bookNames.length >
                              2 && (
                              <p className="text-xs text-stone-500 mt-1">
                                +
                                {bookNames.length -
                                  2}{" "}
                                more
                              </p>
                            )}

                            <p className="text-xs text-stone-500 mt-1">
                              {getItemCount(
                                order
                              )}{" "}
                              book
                              {getItemCount(
                                order
                              ) !== 1
                                ? "s"
                                : ""}
                            </p>
                          </div>
                        ) : (
                          <p className="text-stone-400">
                            No book details
                          </p>
                        )}
                      </td>

                      {/* =================================================
                          AMOUNT
                      ================================================= */}

                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900">
                          {formatMoney(
                            order.totalAmount
                          )}
                        </p>

                        <p className="text-xs text-stone-500 mt-1">
                          Courier:{" "}
                          {formatMoney(
                            order.courierFee
                          )}
                        </p>
                      </td>

                      {/* =================================================
                          PAYMENT
                      ================================================= */}

                      <td className="px-5 py-4">
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-1
                            rounded-full
                            text-[11px]
                            font-bold
                            bg-emerald-100
                            text-emerald-800
                          "
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />

                          Paid
                        </span>
                      </td>

                      {/* =================================================
                          STATUS
                      ================================================= */}

                      <td
                        className="px-5 py-4"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <div className="relative inline-block">
                          <select
                            value={
                              order.orderStatus ===
                              "Delivered"
                                ? "Delivered"
                                : "Confirmed"
                            }
                            disabled={
                              updatingOrderId ===
                              order.orderId
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                order,
                                e.target.value
                              )
                            }
                            className={`
                              appearance-none
                              pl-8
                              pr-8
                              py-1.5
                              rounded-full
                              text-[11px]
                              font-bold
                              border-0
                              outline-none
                              cursor-pointer
                              disabled:opacity-60
                              disabled:cursor-not-allowed
                              ${statusStyle.className}
                            `}
                          >
                            <option value="Confirmed">
                              Confirmed
                            </option>

                            <option value="Delivered">
                              Delivered
                            </option>
                          </select>

                          {updatingOrderId ===
                          order.orderId ? (
                            <Loader2 className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <StatusIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" />
                          )}

                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-60" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =====================================================
          ORDER DETAILS MODAL
      ===================================================== */}

      {selectedOrder && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/40
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          "
          onClick={handleCloseOrder}
        >
          <div
            className="
              w-full
              max-w-4xl
              max-h-[90vh]
              overflow-y-auto
              bg-white
              rounded-2xl
              shadow-2xl
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-stone-500 font-semibold">
                    Order
                  </p>

                  <h2 className="text-xl font-extrabold text-gray-900">
                    #{selectedOrder.orderId}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseOrder
                  }
                  className="
                    w-9
                    h-9
                    rounded-lg
                    bg-stone-100
                    hover:bg-stone-200
                    flex
                    items-center
                    justify-center
                    text-stone-600
                    cursor-pointer
                  "
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* =================================================
                MODAL CONTENT
            ================================================= */}

            <div className="p-6 space-y-6">
              {/* =================================================
                  ORDER SUMMARY
              ================================================= */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ORDER DATE */}

                <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <CalendarDays className="h-4 w-4" />

                    <span className="text-xs font-semibold">
                      Order Date
                    </span>
                  </div>

                  <p className="font-bold text-gray-900 mt-2">
                    {formatDateTime(
                      selectedOrder.orderDate
                    )}
                  </p>
                </div>

                {/* PAYMENT */}

                <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <CreditCard className="h-4 w-4" />

                    <span className="text-xs font-semibold">
                      Payment
                    </span>
                  </div>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      mt-2
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-bold
                      bg-emerald-100
                      text-emerald-800
                    "
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />

                    Paid
                  </span>
                </div>

                {/* STATUS */}

                <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
                  <div className="flex items-center gap-2 text-stone-500">
                    <Package className="h-4 w-4" />

                    <span className="text-xs font-semibold">
                      Order Status
                    </span>
                  </div>

                  <div className="relative mt-2">
                    <select
                      value={
                        selectedOrder.orderStatus ===
                        "Delivered"
                          ? "Delivered"
                          : "Confirmed"
                      }
                      disabled={
                        updatingOrderId ===
                        selectedOrder.orderId
                      }
                      onChange={(e) =>
                        handleStatusChange(
                          selectedOrder,
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        px-3
                        py-2
                        rounded-lg
                        border
                        border-stone-200
                        bg-white
                        text-sm
                        font-semibold
                        outline-none
                        focus:border-emerald-900
                        disabled:opacity-60
                      "
                    >
                      <option value="Confirmed">
                        Confirmed
                      </option>

                      <option value="Delivered">
                        Delivered
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* =================================================
                  CUSTOMER + SHIPPING
              ================================================= */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CUSTOMER */}

                <div className="border border-stone-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-emerald-800" />

                    <h3 className="font-bold text-gray-900">
                      Customer Details
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] text-stone-500">
                        Name
                      </p>

                      <p className="text-sm font-semibold text-gray-900 mt-0.5">
                        {selectedOrder.customerName ||
                          "-"}
                      </p>
                    </div>

                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-stone-400 mt-0.5" />

                      <div>
                        <p className="text-[11px] text-stone-500">
                          Email
                        </p>

                        <p className="text-sm font-medium text-gray-800">
                          {selectedOrder.customerEmail ||
                            "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-stone-400 mt-0.5" />

                      <div>
                        <p className="text-[11px] text-stone-500">
                          Phone
                        </p>

                        <p className="text-sm font-medium text-gray-800">
                          {selectedOrder.customerPhone ||
                            "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SHIPPING */}

                <div className="border border-stone-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-emerald-800" />

                    <h3 className="font-bold text-gray-900">
                      Shipping Address
                    </h3>
                  </div>

                  <div className="text-sm text-gray-800 leading-6">
                    <p>
                      {selectedOrder.shippingAddress ||
                        "-"}
                    </p>

                    <p>
                      {selectedOrder.city || ""}
                      {selectedOrder.city &&
                      selectedOrder.state
                        ? ", "
                        : ""}
                      {selectedOrder.state || ""}
                    </p>

                    <p>
                      PIN:{" "}
                      {selectedOrder.pincode ||
                        "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  ITEMS
              ================================================= */}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900">
                    Ordered Books
                  </h3>

                  <span className="text-xs text-stone-500">
                    {getItemCount(
                      selectedOrder
                    )}{" "}
                    book
                    {getItemCount(
                      selectedOrder
                    ) !== 1
                      ? "s"
                      : ""}
                  </span>
                </div>

                <div className="border border-stone-200 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-stone-100">
                    {selectedOrder.items?.map(
                      (item) => (
                        <div
                          key={
                            item.orderItemId
                          }
                          className="
                            p-4
                            flex
                            flex-col
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-3
                          "
                        >
                          <div>
                            <p className="font-bold text-gray-900">
                              {item.bookTitle ||
                                "Unknown Book"}
                            </p>

                            <p className="text-xs text-stone-500 mt-1">
                              Book ID #
                              {item.bookId}
                            </p>
                          </div>

                          <div className="flex items-center gap-8">
                            <div>
                              <p className="text-[11px] text-stone-500">
                                Quantity
                              </p>

                              <p className="font-semibold text-gray-900">
                                ×{item.quantity}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] text-stone-500">
                                Unit Price
                              </p>

                              <p className="font-semibold text-gray-900">
                                {formatMoney(
                                  item.unitPrice
                                )}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-[11px] text-stone-500">
                                Total
                              </p>

                              <p className="font-bold text-gray-900">
                                {formatMoney(
                                  item.totalPrice
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* =================================================
                  TOTALS
              ================================================= */}

              <div className="flex justify-end">
                <div className="w-full sm:w-80 border border-stone-200 rounded-2xl p-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-500">
                      Subtotal
                    </span>

                    <span className="font-semibold text-gray-900">
                      {formatMoney(
                        selectedOrder.subTotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm mt-3">
                    <span className="text-stone-500">
                      Courier Fee
                    </span>

                    <span className="font-semibold text-gray-900">
                      {formatMoney(
                        selectedOrder.courierFee
                      )}
                    </span>
                  </div>

                  <div className="border-t border-stone-200 mt-4 pt-4 flex justify-between">
                    <span className="font-bold text-gray-900">
                      Total
                    </span>

                    <span className="text-lg font-extrabold text-emerald-900">
                      {formatMoney(
                        selectedOrder.totalAmount
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* =================================================
                  GUEST INFORMATION
              ================================================= */}

              {selectedOrder.guestOrderId && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-xs font-bold text-amber-800">
                    Guest Order
                  </p>

                  <p className="text-sm text-amber-900 mt-1">
                    {selectedOrder.guestOrderId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}