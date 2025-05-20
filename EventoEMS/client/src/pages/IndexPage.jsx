/* eslint-disable react/jsx-key */
import axios from "axios";
import { useEffect, useState, useContext, useRef } from "react"
import { Link } from "react-router-dom";
import { BsArrowRightShort } from "react-icons/bs";
import { BiLike } from "react-icons/bi";
import { UserContext } from "../UserContext";
import slide1 from '../assets/slide1.jpg';
import slide2 from '../assets/slide2.jpg';
import slide3 from '../assets/slide3.jpg';
import slide4 from '../assets/slide4.jpg';
import { FaUsers, FaCalendarAlt, FaTicketAlt, FaMapMarkerAlt, FaMusic, FaGraduationCap, FaBriefcase, FaUtensils, FaRunning, FaTheaterMasks } from 'react-icons/fa';

// Custom hook for scroll animation
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  return [elementRef, isVisible];
};

export default function IndexPage() {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    totalEvents: 50,
    totalUsers: 100,
    totalTickets: 1000,
    cities: 20
  });

  // Create refs for each section
  const [categoriesRef, isCategoriesVisible] = useScrollAnimation();
  const [eventsRef, isEventsVisible] = useScrollAnimation();
  const [featuredRef, isFeaturedVisible] = useScrollAnimation();

  const slides = [
    {
      image: slide1,
      heading: "Discover Amazing Events",
      subheading: "Find and book tickets for the best events in town"
    },
    {
      image: slide2,
      heading: "Create Your Own Event",
      subheading: "Host and manage your events with ease"
    },
    {
      image: slide3,
      heading: "Connect with Community",
      subheading: "Join thousands of event enthusiasts"
    },
    {
      image: slide4,
      heading: "Special Offers",
      subheading: "Get exclusive deals on popular events"
    }
  ];

  const categories = [
    { icon: <FaMusic className="w-8 h-8" />, name: 'Music' },
    { icon: <FaGraduationCap className="w-8 h-8" />, name: 'Education' },
    { icon: <FaBriefcase className="w-8 h-8" />, name: 'Business' },
    { icon: <FaUtensils className="w-8 h-8" />, name: 'Food & Drink' },
    { icon: <FaRunning className="w-8 h-8" />, name: 'Sports' },
    { icon: <FaTheaterMasks className="w-8 h-8" />, name: 'Arts' },
  ];

  useEffect(() => {
    // Auto slide every 5 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  //! Fetch events from the server ---------------------------------------------------------------
  useEffect(() => {
    axios
      .get("/createEvent")
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, []);

  //! Like Functionality --------------------------------------------------------------
  const handleLike = (eventId) => {
    if (!user) {
      // Redirect to login if user is not logged in
      window.location.href = '/login';
      return;
    }

    const event = events.find(e => e._id === eventId);
    const hasLiked = event?.likedBy?.includes(user._id);

    axios
      .post(`/event/${eventId}`, {
        action: hasLiked ? 'unlike' : 'like',
        userId: user._id
      })
      .then((response) => {
        // Update the events state with the updated event from the server
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event._id === eventId ? response.data : event
          )
        );
      })
      .catch((error) => {
        console.error("Error toggling like:", error);
      });
  };

  return (
    <>
      <div className="mt-1 flex flex-col">
        <div className="hidden sm:block relative h-[500px] overflow-hidden">
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute w-full h-full transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                <img
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Text Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white px-4">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center">
                    {slide.heading}
                  </h2>
                  <p className="text-lg md:text-xl text-center max-w-2xl">
                    {slide.subheading}
                  </p>
                </div>
              </div>
            ))}
            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Event Categories Section */}
        <div
          ref={categoriesRef}
          className={`py-16 bg-white transition-all duration-1000 ${isCategoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
            }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Event Genres</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`group p-6 bg-gray-50 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer text-center ${isCategoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                    }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-primary group-hover:text-white mb-4 flex justify-center">
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          ref={eventsRef}
          className={`mx-10 my-5 grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:mx-5 transition-all duration-1000 ${isEventsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
            }`}
        >
          {/* Events grid content */}
          {events.length > 0 && events.map((event) => {
            const eventDate = new Date(event.eventDate);
            const currentDate = new Date();
            const hasLiked = event?.likedBy?.includes(user?._id);

            if (eventDate > currentDate || eventDate.toDateString() === currentDate.toDateString()) {
              return (
                <div className="bg-white rounded-xl relative" key={event._id}>
                  {/* Event card content */}
                  <div className='rounded-tl-[0.75rem] rounded-tr-[0.75rem] rounded-br-[0] rounded-bl-[0] object-fill aspect-16:9'>
                    {event.image && (
                      <img
                        src={`https://ems-backend-jet.vercel.app/uploads/${event.image}`}
                        alt={event.title}
                        width="300"
                        height="200"
                        className="w-full h-full"
                      />
                    )}
                    <div className="absolute flex gap-4 bottom-[240px] right-8 md:bottom-[20px] md:right-3 lg:bottom-[250px] lg:right-4 sm:bottom-[260px] sm:right-3">
                      <button onClick={() => handleLike(event._id)}>
                        <BiLike className={`w-auto h-12 lg:h-10 sm:h-12 md:h-10 bg-white p-2 rounded-full shadow-md transition-all ${hasLiked ? 'text-red-500' : 'hover:text-primary'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="m-2 grid gap-2">
                    <div className="flex justify-between items-center">
                      <h1 className="font-bold text-lg mt-2">{event.title.toUpperCase()}</h1>
                      <div className="flex gap-2 items-center mr-4 text-red-600"> <BiLike /> {event.likes}</div>
                    </div>

                    <div className="flex text-sm flex-nowrap justify-between text-primarydark font-bold mr-4">
                      <div>{event.eventDate.split("T")[0]}, {event.eventTime}</div>
                      <div>{event.ticketPrice === 0 ? 'Free' : 'Rs. ' + event.ticketPrice}</div>
                    </div>

                    <div className="text-xs flex flex-col flex-wrap truncate-text">{event.description}</div>
                    <div className="flex justify-between items-center my-2 mr-4">
                      <div className="text-sm text-primarydark ">Organized By: <br /><span className="font-bold">{event.organizedBy}</span></div>
                      <div className="text-sm text-primarydark ">Created By: <br /> <span className="font-semibold">{event.owner.toUpperCase()}</span></div>
                    </div>
                    {user && user.role !== 'admin' && (
                      <Link to={'/event/' + event._id} className="flex justify-center">
                        <button className="primary flex items-center gap-2">Book Ticket< BsArrowRightShort className="w-6 h-6" /></button>
                      </Link>
                    )}
                  </div>
                </div>
              )
            }
            return null;
          })}
        </div>

        {/* Featured Events Section */}
        <div
          ref={featuredRef}
          className={`py-16 px-4 sm:px-6 lg:px-8 bg-white transition-all duration-1000 ${isFeaturedVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
            }`}
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Featured Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Featured Event 1 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img src="../src/assets/event1pic.png" alt="Event" className="w-full h-48 object-cover" />
                  <div className="absolute bottom-0 left-0 bg-pink-500 rounded-full p-3 m-4 w-16 h-16 flex flex-col items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-xs">DEC</div>
                      <div className="text-lg font-bold">31</div>
                      <div className="text-xs">2024</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">How to become an entrepreneur ?</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas varius tortor nibh, sit amet tempor nibh finibus et.
                  </p>
                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className="text-sm">795 Pine St, New York</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      {user && user.role !== 'admin' && (
                        <Link to="/event/1" className="text-primary hover:text-primarydark font-medium">
                          Get ticket
                        </Link>
                      )}
                      <span className="text-primarydark font-bold">Free</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Event 2 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img src="../src/assets/event2pic.png" alt="Event" className="w-full h-48 object-cover" />
                  <div className="absolute bottom-0 left-0 bg-pink-500 rounded-full p-3 m-4 w-16 h-16 flex flex-col items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-xs">DEC</div>
                      <div className="text-lg font-bold">1</div>
                      <div className="text-xs">2024</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Phanxipang Tourist</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas varius tortor nibh, sit amet tempor nibh finibus et.
                  </p>
                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className="text-sm">Broadway 473 Broadway</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      {user && user.role !== 'admin' && (
                        <Link to="/event/2" className="text-primary hover:text-primarydark font-medium">
                          Get ticket
                        </Link>
                      )}
                      <span className="text-primarydark font-bold">$20</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Event 3 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img src="../src/assets/event3pic.png" alt="Event" className="w-full h-48 object-cover" />
                  <div className="absolute bottom-0 left-0 bg-pink-500 rounded-full p-3 m-4 w-16 h-16 flex flex-col items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-xs">MAR</div>
                      <div className="text-lg font-bold">30</div>
                      <div className="text-xs">2024</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Concert Linda coline</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas varius tortor nibh, sit amet tempor nibh finibus et.
                  </p>
                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span className="text-sm">South Street Seaport</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      {user && user.role !== 'admin' && (
                        <Link to="/event/3" className="text-primary hover:text-primarydark font-medium">
                          Get ticket
                        </Link>
                      )}
                      <span className="text-primarydark font-bold">$10-$30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">01</span>
                  </div>
                  <h3 className="text-base font-normal tracking-wide whitespace-nowrap group-hover:text-red-500 transition-colors duration-300">MULTIPLE EVENTS</h3>
                </div>
                <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nib</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">02</span>
                  </div>
                  <h3 className="text-base font-normal tracking-wide whitespace-nowrap group-hover:text-red-500 transition-colors duration-300">EVENT MANAGEMENT</h3>
                </div>
                <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nib</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">03</span>
                  </div>
                  <h3 className="text-base font-normal tracking-wide whitespace-nowrap group-hover:text-red-500 transition-colors duration-300">CREDIT CARD PAYMENT</h3>
                </div>
                <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nib</p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">04</span>
                  </div>
                  <h3 className="text-base font-normal tracking-wide whitespace-nowrap group-hover:text-red-500 transition-colors duration-300">LOCATION MANAGEMENT</h3>
                </div>
                <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nib</p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">05</span>
                  </div>
                  <h3 className="text-base font-normal tracking-wide whitespace-nowrap group-hover:text-red-500 transition-colors duration-300">FREE REGISTERING</h3>
                </div>
                <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nib</p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">06</span>
                  </div>
                  <h3 className="text-base font-normal tracking-wide whitespace-nowrap group-hover:text-red-500 transition-colors duration-300">EASY TO USE</h3>
                </div>
                <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nib</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <FaCalendarAlt className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalEvents}+</h3>
                <p className="text-gray-600 mt-2">Events</p>
              </div>
              <div className="text-center">
                <FaUsers className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers}+</h3>
                <p className="text-gray-600 mt-2">Users</p>
              </div>
              <div className="text-center">
                <FaTicketAlt className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalTickets}+</h3>
                <p className="text-gray-600 mt-2">Tickets Sold</p>
              </div>
              <div className="text-center">
                <FaMapMarkerAlt className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-3xl font-bold text-gray-900">{stats.cities}+</h3>
                <p className="text-gray-600 mt-2">Cities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
