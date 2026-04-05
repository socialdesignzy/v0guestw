import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 relative">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">GuestWorker</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              A digital workforce management platform by <span className="text-[#22D3EE] font-semibold">Designzy Technologies</span>. Empowering contractors to manage migrant workers efficiently, transparently, and profitably.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#3B2ED0] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#3B2ED0] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#3B2ED0] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#3B2ED0] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-[#22D3EE] transition-colors">Features</Link></li>
              <li><Link to="/about" className="hover:text-[#22D3EE] transition-colors">About Us</Link></li>
              <li><Link to="/pricing-info" className="hover:text-[#22D3EE] transition-colors">Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-[#22D3EE] transition-colors">FAQ</Link></li>
              <li><Link to="/login" className="hover:text-[#22D3EE] transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-[#22D3EE] transition-colors">Register</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/terms-and-conditions" className="hover:text-[#22D3EE] transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#22D3EE] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund-policy" className="hover:text-[#22D3EE] transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/contact-us" className="hover:text-[#22D3EE] transition-colors text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#22D3EE]" />
                  Send us a Message
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#22D3EE]" />
                <a href="mailto:support@guestworker.app" className="hover:text-[#22D3EE] transition-colors text-sm">
                  support@guestworker.app
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#22D3EE]" />
                <span className="text-sm">+91 XXXXX XXXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#22D3EE]" />
                <span className="text-sm">India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © 2026 GuestWorker. All rights reserved. Made with <Heart className="inline h-4 w-4 text-red-500" /> for contractors.
          </p>
        </div>
      </div>
    </footer>
  );
}
