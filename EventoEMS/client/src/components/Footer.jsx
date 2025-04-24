import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useContext } from "react";
import { UserContext } from "../UserContext";

export default function Footer() {
  const { user } = useContext(UserContext);
  const isAdmin = user?.role === "admin";

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About Evento</h3>
            <p className="text-gray-400">
              Evento is your premier event management platform, offering seamless event creation, ticket booking, and management solutions for organizers and attendees alike.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-400 hover:text-white transition-colors">
                  Events
                </Link>
              </li>
              {isAdmin && (
                <>
                  <li>
                    <Link to="/createEvent" className="text-gray-400 hover:text-white transition-colors">
                      Create Event
                    </Link>
                  </li>
                  <li>
                    <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                      Admin Dashboard
                    </Link>
                  </li>
                </>
              )}
              {user && (
                <li>
                  <Link to="/useraccount" className="text-gray-400 hover:text-white transition-colors">
                    My Account
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Event Creation & Management</li>
              <li className="text-gray-400">Secure Ticket Booking</li>
              <li className="text-gray-400">Real-time Event Updates</li>
              <li className="text-gray-400">User Reviews & Ratings</li>
              <li className="text-gray-400">Event Analytics</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-2">
              <p className="text-gray-400">
                <span className="font-medium">Email:</span> support@evento.com
              </p>
              <p className="text-gray-400">
                <span className="font-medium">Phone:</span> +1 (555) 123-4567
              </p>
              <p className="text-gray-400">
                <span className="font-medium">Address:</span> 123 Event Street, City, Country
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Evento. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 