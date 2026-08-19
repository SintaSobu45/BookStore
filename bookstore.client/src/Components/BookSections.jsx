import React, { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { getBooks } from "../services/bookService";
import BookCard from "../Components/BookCard";
import { Link } from "react-router-dom";

export default function BookSections() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const loadBooks = async () => {
            try {
                const data = await getBooks();
                setBooks(data);
            } catch (error) {
                console.error("Failed to fetch books:", error);
            }
        };

        loadBooks();
    }, []);

    const featuredBooks = books.slice(0, 5);

    const newArrivals = [...books]
        .reverse()
        .slice(0, 10);

    const renderBookGrid = (title, books) => (
        <section className="max-w-7xl mt-5 mx-auto px-6 mb-12">

            <div className="flex items-center justify-between mb-6">

                <h2 className="text-2xl font-bold text-gray-900">
                    {title}
                </h2>

                <Link to={'/all/books'} className="flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Link>

            </div>

           <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-8">

                {books.map((book) => (
                    <BookCard
                        key={book.bookId}
                        book={book}
                    />
                ))}

            </div>

        </section>
    );

    return (
        <>
            {renderBookGrid(
                "Featured Books",
                featuredBooks
            )}

            {renderBookGrid(
                "New Arrivals",
                newArrivals
            )}
        </>
    );
}