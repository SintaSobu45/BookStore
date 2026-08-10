import React, { useEffect, useState } from "react";
import { getBooks } from "../../services/bookService";
import { getAuthors } from "../../services/authorService";
import { getCategories } from "../../services/categoryService";
import { getPublishers } from "../../services/publisherService";

function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 25000,
    books: 0,
    categories: 0,
    authors: 0,
    publishers: 0,
  });

  const [recentBooks, setRecentBooks] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [inventory, setInventory] = useState({
    inStock: 0,
    lowStock: 0,
    outStock: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const books = await getBooks();
      const authors = await getAuthors();
      const categories = await getCategories();
      const publishers = await getPublishers();

      setStats({
        revenue: 25000,
        books: books.length,
        categories: categories.length,
        authors: authors.length,
        publishers: publishers.length,
      });

      setRecentBooks(
        [...books]
          .sort(
            (a, b) =>
              new Date(b.publishedDate) - new Date(a.publishedDate)
          )
          .slice(0, 5)
      );

      setTopBooks(
        [...books]
          .sort((a, b) => b.price - a.price)
          .slice(0, 5)
      );

      setInventory({
        inStock: books.filter((b) => b.stockQuantity > 10).length,
        lowStock: books.filter(
          (b) => b.stockQuantity <= 10 && b.stockQuantity > 0
        ).length,
        outStock: books.filter((b) => b.stockQuantity === 0).length,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const cards = [
    {
      title: "Revenue",
      value: `₹${stats.revenue.toLocaleString()}`,
      color: "bg-green-500 text-white",
    },
    {
      title: "Books",
      value: stats.books,
      color: "bg-white",
    },
    {
      title: "Categories",
      value: stats.categories,
      color: "bg-white",
    },
    {
      title: "Authors",
      value: stats.authors,
      color: "bg-white",
    },
    {
      title: "Publishers",
      value: stats.publishers,
      color: "bg-white",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Welcome back, Admin 👋
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`rounded-xl p-5 shadow-sm border ${card.color}`}
          >
            <p
              className={`text-sm ${
                i === 0 ? "text-white/80" : "text-gray-500"
              }`}
            >
              {card.title}
            </p>
            <h2 className="text-3xl font-bold mt-2">
              {card.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold mb-4">
            Inventory Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>In Stock</span>
              <span className="font-bold text-green-600">
                {inventory.inStock}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Low Stock</span>
              <span className="font-bold text-yellow-600">
                {inventory.lowStock}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Out of Stock</span>
              <span className="font-bold text-red-600">
                {inventory.outStock}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold mb-4">
            Recently Added Books
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Book</th>
                  <th>Author</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {recentBooks.map((book) => (
                  <tr
                    key={book.bookId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 flex items-center gap-3">
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="w-10 h-14 object-cover rounded"
                      />
                      <span className="font-medium">
                        {book.title}
                      </span>
                    </td>
                    <td>{book.authorName}</td>
                    <td className="font-semibold">
                      ₹{book.price}
                    </td>
                    <td>{book.stockQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-semibold mb-4">
          Top 5 Expensive Books
        </h3>
        <div className="space-y-3">
          {topBooks.map((book, index) => (
            <div
              key={book.bookId}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{book.title}</p>
                  <p className="text-sm text-gray-500">
                    {book.categoryName}
                  </p>
                </div>
              </div>
              <span className="font-bold text-green-600">
                ₹{book.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;