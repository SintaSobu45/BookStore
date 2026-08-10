import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, ChevronRight, BookOpen, Users, Award, 
  ShieldCheck, Sparkles, BookMarked, Heart, ArrowRight 
} from 'lucide-react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

export default function About() {
  return (
    <>
    <Navbar/>

    <div className="min-h-screen bg-stone-50/60 pb-20">
      
      {/* Top Breadcrumb & Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
        <div className="flex items-center space-x-2 text-xs text-stone-500 mb-2 font-medium">
          <Link to="/" className="hover:text-emerald-900 flex items-center">
            <Home className="h-3.5 w-3.5 mr-1" /> Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-400" />
          <span className="text-gray-900 font-semibold">About Us</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
          About Malayalam Book Store
        </h1>
        <p className="text-sm text-stone-600 font-medium mt-1">
          Celebrating the richness of Malayalam literature and connecting readers with timeless stories.
        </p>
      </div>

      {/* Hero Section: Story & Image Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white border border-stone-200/80 rounded-3xl p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-900 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-800/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Our Literary Journey</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-950 leading-snug">
              Preserving Kerala's heritage one page at a time.
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
              Founded with a deep passion for Malayalam language and culture, Malayalam Book Store serves as a bridge between classic masterpieces and contemporary voices. Whether you are looking for timeless poetry, gripping short stories, or modern novels, we bring the best of literature right to your doorstep.
            </p>

            <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
              Beyond books, we foster a vibrant community of authors, poets, and avid readers through open mics, book releases, and interactive literary events across Kerala.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/all/books"
                className="bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-colors flex items-center space-x-2 text-xs"
              >
                <span>Explore Library</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/events"
                className="bg-white border border-stone-300 hover:bg-stone-50 text-gray-800 font-bold py-3 px-6 rounded-xl shadow-xs transition-colors text-xs flex items-center"
              >
                Join Our Events
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-stone-200">
              <img 
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80" 
                alt="Library books stack" 
                className="w-full h-[320px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="text-xs font-bold tracking-wider uppercase text-emerald-300">Malayalam Literature</p>
                  <p className="text-sm font-semibold mt-0.5">Connecting generations through words</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Core Values / Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-950 mb-2">Why Readers Choose Us</h3>
          <p className="text-xs text-stone-600 font-medium">We strive to provide the best literary experience for every book enthusiast.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="bg-emerald-100 text-emerald-900 p-3 rounded-2xl w-fit">
              <BookOpen className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-gray-900 text-sm">Vast Collection</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Access thousands of titles spanning fiction, poetry, memoirs, and academic publications in Malayalam.
            </p>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="bg-emerald-100 text-emerald-900 p-3 rounded-2xl w-fit">
              <Users className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-gray-900 text-sm">Active Community</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Engage with fellow readers and published authors during our regular open mic and poetry recitation events.
            </p>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="bg-emerald-100 text-emerald-900 p-3 rounded-2xl w-fit">
              <Award className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-gray-900 text-sm">Author Support</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Special platforms for emerging writers to publish work, earn recognition, and showcase books on stage.
            </p>
          </div>

          <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="bg-emerald-100 text-emerald-900 p-3 rounded-2xl w-fit">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-extrabold text-gray-900 text-sm">Secure Shopping</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Safe checkout with multiple payment gateways and reliable doorstep delivery across regions.
            </p>
          </div>

        </div>
      </div>

      {/* Milestone Stats Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-[#1b3b2b] text-white rounded-3xl p-8 sm:p-10 shadow-lg grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="space-y-1">
            <span className="block text-2xl sm:text-4xl font-black text-emerald-200">5,000+</span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">Books Available</span>
          </div>

          <div className="space-y-1">
            <span className="block text-2xl sm:text-4xl font-black text-emerald-200">200+</span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">Featured Authors</span>
          </div>

          <div className="space-y-1">
            <span className="block text-2xl sm:text-4xl font-black text-emerald-200">50+</span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">Literary Events</span>
          </div>

          <div className="space-y-1">
            <span className="block text-2xl sm:text-4xl font-black text-emerald-200">10,000+</span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">Happy Readers</span>
          </div>

        </div>
      </div>

      {/* Call to Action Footer Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-stone-200/80 rounded-3xl p-8 sm:p-12 text-center shadow-sm space-y-4">
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-950">
            Ready to dive into your next great read?
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto font-medium">
            Join our growing community of literature lovers today and explore the magic of Malayalam writing.
          </p>
          <div className="pt-2 flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-colors text-xs"
            >
              Create Account
            </Link>
            <Link
              to="/contact"
              className="bg-stone-100 hover:bg-stone-200 text-gray-800 font-bold py-3.5 px-8 rounded-xl transition-colors text-xs"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

    </div>

    <Footer/>
    </>
  );
}