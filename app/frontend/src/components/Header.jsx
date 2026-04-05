import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Users } from 'lucide-react';

export default function Header() {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm relative">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent">
            GuestWorker
          </h1>
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          <Link 
            to="/features" 
            className={`transition-colors font-medium ${
              isActive('/features') 
                ? 'text-[#3B2ED0] font-semibold' 
                : 'text-gray-700 hover:text-[#3B2ED0]'
            }`}
          >
            Features
          </Link>
          <Link 
            to="/about" 
            className={`transition-colors font-medium ${
              isActive('/about') 
                ? 'text-[#3B2ED0] font-semibold' 
                : 'text-gray-700 hover:text-[#3B2ED0]'
            }`}
          >
            About
          </Link>
          <Link 
            to="/pricing-info" 
            className={`transition-colors font-medium ${
              isActive('/pricing-info') || isActive('/pricing')
                ? 'text-[#3B2ED0] font-semibold' 
                : 'text-gray-700 hover:text-[#3B2ED0]'
            }`}
          >
            Pricing
          </Link>
          <Link 
            to="/faq" 
            className={`transition-colors font-medium ${
              isActive('/faq') 
                ? 'text-[#3B2ED0] font-semibold' 
                : 'text-gray-700 hover:text-[#3B2ED0]'
            }`}
          >
            FAQ
          </Link>
          <Link 
            to="/contact-us" 
            className={`transition-colors font-medium ${
              isActive('/contact-us') || isActive('/contact')
                ? 'text-[#3B2ED0] font-semibold' 
                : 'text-gray-700 hover:text-[#3B2ED0]'
            }`}
          >
            Contact
          </Link>
        </nav>
        <div className="flex gap-3 items-center">
          <Link to="/login">
            <Button variant="ghost" className="hover:bg-[#3B2ED0]/10">Login</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4] text-white shadow-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
