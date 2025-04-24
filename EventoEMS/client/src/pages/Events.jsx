import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import eventVideo from '../assets/eventheader.mp4';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/events');
        console.log('Events API Response:', response.data);
        if (response.data) {
          setEvents(response.data);
        } else {
          console.error('Unexpected API response format:', response.data);
          setError('Invalid response format from server');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  const now = new Date();
  const currentEvents = events.filter(event => {
    const eventDate = new Date(event.eventDate);
    return eventDate.toDateString() === now.toDateString();
  });

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.eventDate);
    return eventDate > now;
  });

  const pastEvents = events.filter(event => {
    const eventDate = new Date(event.eventDate);
    return eventDate < now && eventDate.toDateString() !== now.toDateString();
  });

  return (
    <div>
      {/* Video Header */}
      <div className="w-full h-[400px] relative">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          controls={false}
        >
          <source src={eventVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4">
            Events
          </h1>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            {/* Going On Events */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-green-600">Going On</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 font-semibold border-b">
                  <div className="col-span-3">Title</div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Time</div>
                  <div className="col-span-2">Organizer</div>
                  <div className="col-span-1 text-right">Price</div>
                </div>
                {currentEvents.length > 0 ? (
                  currentEvents.map(event => (
                    <Link to={`/event/${event._id}`} key={event._id} className="block hover:bg-gray-50">
                      <div className="grid grid-cols-12 gap-4 p-4 items-center border-b">
                        <div className="col-span-3 font-medium">{event.title}</div>
                        <div className="col-span-2 text-gray-600">{event.location}</div>
                        <div className="col-span-2 text-gray-600">{new Date(event.eventDate).toLocaleDateString()}</div>
                        <div className="col-span-2 text-gray-600">{event.eventTime}</div>
                        <div className="col-span-2 text-gray-600">{event.organizedBy}</div>
                        <div className="col-span-1 text-right font-bold text-primary">
                          {event.ticketPrice === 0 ? 'Free' : `₹ ${event.ticketPrice}`}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-gray-500">No events happening today</div>
                )}
              </div>
            </div>

            {/* Past Events */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-600">Past Events</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 font-semibold border-b">
                  <div className="col-span-3">Title</div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Time</div>
                  <div className="col-span-2">Organizer</div>
                  <div className="col-span-1 text-right">Price</div>
                </div>
                {pastEvents.length > 0 ? (
                  pastEvents.map(event => (
                    <Link to={`/event/${event._id}`} key={event._id} className="block hover:bg-gray-50">
                      <div className="grid grid-cols-12 gap-4 p-4 items-center border-b">
                        <div className="col-span-3 font-medium">{event.title}</div>
                        <div className="col-span-2 text-gray-600">{event.location}</div>
                        <div className="col-span-2 text-gray-600">{new Date(event.eventDate).toLocaleDateString()}</div>
                        <div className="col-span-2 text-gray-600">{event.eventTime}</div>
                        <div className="col-span-2 text-gray-600">{event.organizedBy}</div>
                        <div className="col-span-1 text-right font-bold text-primary">
                          {event.ticketPrice === 0 ? 'Free' : `₹ ${event.ticketPrice}`}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-gray-500">No past events</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming Events */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Upcoming Events</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 font-semibold border-b">
                <div className="col-span-3">Title</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-2">Organizer</div>
                <div className="col-span-1 text-right">Price</div>
              </div>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <Link to={`/event/${event._id}`} key={event._id} className="block hover:bg-gray-50">
                    <div className="grid grid-cols-12 gap-4 p-4 items-center border-b">
                      <div className="col-span-3 font-medium">{event.title}</div>
                      <div className="col-span-2 text-gray-600">{event.location}</div>
                      <div className="col-span-2 text-gray-600">{new Date(event.eventDate).toLocaleDateString()}</div>
                      <div className="col-span-2 text-gray-600">{event.eventTime}</div>
                      <div className="col-span-2 text-gray-600">{event.organizedBy}</div>
                      <div className="col-span-1 text-right font-bold text-primary">
                        {event.ticketPrice === 0 ? 'Free' : `₹ ${event.ticketPrice}`}
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-gray-500">No upcoming events</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 