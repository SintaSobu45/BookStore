import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';


export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-3xl p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between relative overflow-hidden shadow-sm">
        
        {/* Left Content */}
        <div className="max-w-xl z-10 mb-8 lg:mb-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-6">
            Discover Your Next <span className="text-emerald-800">Favorite Book</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed">
            Explore thousands of books, stories, poems and more.
          </p>
          <Link className="inline-flex items-center space-x-2 bg-emerald-900 hover:bg-emerald-800 text-white font-medium px-7 py-3.5 rounded-full transition-all shadow-md group cursor-pointer" to={'/all/books'}>
            <span>Explore Now</span>
            <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Right Image Section */}
        <div className="relative z-10 w-full lg:w-[45%] flex justify-center">
          <div className="relative rounded-2xl overflow-hidden shadow-md border border-stone-100 bg-white p-2">
            <img 
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80" 
              alt="Books and plant stack" 
              className="rounded-xl object-cover w-full h-[280px] sm:h-[320px]"
            />
          </div>
        </div>

      </div>
    </section>
  );
}