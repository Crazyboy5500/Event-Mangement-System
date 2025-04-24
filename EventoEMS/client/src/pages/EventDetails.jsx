import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaWifi, FaParking, FaUtensils, FaFirstAid, FaTicketAlt, FaMapMarkerAlt, FaCopy, FaWhatsappSquare, FaFacebook, FaSmokingBan, FaCamera, FaDog, FaGlassCheers, FaMusic, FaRunning } from 'react-icons/fa';
import { AiFillCalendar } from 'react-icons/ai';
import { MdLocationPin } from 'react-icons/md';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/event/${id}`);
        setEvent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (event) {
      const calculateTimeLeft = () => {
        console.log('Event Date:', event.eventDate);
        console.log('Event Time:', event.eventTime);
        
        // Create a new date object from the event date and time
        const eventDateTime = new Date(`${event.eventDate}T${event.eventTime}`);
        console.log('Event DateTime:', eventDateTime);
        
        const now = new Date();
        console.log('Current Time:', now);
        
        const difference = eventDateTime - now;
        console.log('Time Difference (ms):', difference);

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          });
        } else {
          setTimeLeft({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
          });
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [event]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/profile');
        if (response.data) {
          setUser(response.data);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        // Don't set error state here as we want to show the page even if user is not logged in
      }
    };
    fetchUser();
  }, []);

  // Social sharing functions
  const handleCopyLink = () => {
    const linkToShare = window.location.href;
    navigator.clipboard.writeText(linkToShare).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleWhatsAppShare = () => {
    const linkToShare = window.location.href;
    const whatsappMessage = encodeURIComponent(`${linkToShare}`);
    window.open(`whatsapp://send?text=${whatsappMessage}`);
  };

  const handleFacebookShare = () => {
    const linkToShare = window.location.href;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkToShare)}`;
    window.open(facebookShareUrl);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!event) return <div className="p-8">Event not found</div>;

  const facilities = [
    { icon: <FaWifi className="w-6 h-6" />, name: 'Free WiFi', allowed: true },
    { icon: <FaParking className="w-6 h-6" />, name: 'Parking', allowed: true },
    { icon: <FaUtensils className="w-6 h-6" />, name: 'Food & Drinks', allowed: true },
    { icon: <FaFirstAid className="w-6 h-6" />, name: 'First Aid', allowed: true },
    { icon: <FaTicketAlt className="w-6 h-6" />, name: 'E-Tickets', allowed: true },
    { icon: <FaMapMarkerAlt className="w-6 h-6" />, name: 'Easy Location', allowed: true },
    { icon: <FaSmokingBan className="w-6 h-6" />, name: 'No Smoking', allowed: false },
    { icon: <FaCamera className="w-6 h-6" />, name: 'No Photography', allowed: false },
    { icon: <FaDog className="w-6 h-6" />, name: 'No Pets', allowed: false },
    { icon: <FaGlassCheers className="w-6 h-6" />, name: 'No Alcohol', allowed: false },
    { icon: <FaMusic className="w-6 h-6" />, name: 'No Outside Food', allowed: false },
    { icon: <FaRunning className="w-6 h-6" />, name: 'No Running', allowed: false }
  ];

  return (
    <div className="min-h-screen">
      {/* Banner Section */}
      <div className="relative h-[400px] w-full">
        {event.image ? (
          <img 
            src={`http://localhost:4000/uploads/${event.image}`}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Image failed to load:', event.image);
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/1920x400?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-2xl">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex">
          {/* Left Column - Countdown Timer */}
          <div className="w-1/4 flex flex-col items-center justify-center p-4">
            <h2 className="text-xl font-semibold mb-4 text-center">Event Starts In</h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </div>
            </div>
            <div className="mt-6 w-full">
              {user && user.role === 'user' && (
                <Link to={`/event/${event._id}/ordersummary`}>
                  <button className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primarydark transition-colors text-sm">
                    Book Ticket
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Vertical Line */}
          <div className="w-px bg-gray-300 my-4"></div>

          {/* Right Column - Event Details */}
          <div className="w-3/4 p-4">
            <h2 className="text-xl font-semibold mb-4">Event Details</h2>
            <div className="grid grid-cols-2 gap-8">
              {/* Left Details Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">Date & Time</h3>
                  <div className="flex items-center gap-3">
                    <AiFillCalendar className="w-5 h-5 text-primary" />
                    <p className="text-sm text-gray-600">
                      {new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">Location</h3>
                  <div className="flex items-center gap-3">
                    <MdLocationPin className="w-5 h-5 text-primary" />
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">Organized By</h3>
                  <p className="text-sm text-gray-600">{event.organizedBy}</p>
                </div>
              </div>

              {/* Right Details Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">Description</h3>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">Ticket Price</h3>
                  <p className="text-xl font-bold text-primary">
                    {event.ticketPrice === 0 ? 'Free' : `₹ ${event.ticketPrice}`}
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-700 mb-1">Capacity</h3>
                  <p className="text-sm text-gray-600">{event.capacity} seats available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Facilities */}
        <div className="bg-white p-8 rounded-lg shadow-md mt-8">
          <h3 className="text-xl font-semibold mb-6">Facilities & Restrictions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {facilities.map((facility, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className={`${facility.allowed ? 'text-primary' : 'text-gray-400'}`}>
                    {facility.icon}
                  </div>
                  {!facility.allowed && (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <div className="relative w-8 h-8">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 transform -rotate-45"></div>
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-red-500 transform rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
                <p className={`mt-2 ${facility.allowed ? 'text-gray-700' : 'text-red-500'}`}>
                  {facility.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Share Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-6">Share with Friends</h3>
          <div className="flex gap-6 justify-center">
            <button 
              onClick={handleCopyLink}
              className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaCopy className="w-6 h-6 text-primary" />
            </button>
            <button 
              onClick={handleWhatsAppShare}
              className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaWhatsappSquare className="w-6 h-6 text-primary" />
            </button>
            <button 
              onClick={handleFacebookShare}
              className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <FaFacebook className="w-6 h-6 text-primary" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 