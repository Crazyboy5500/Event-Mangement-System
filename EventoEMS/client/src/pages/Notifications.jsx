import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../UserContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const { user } = useContext(UserContext);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    if (user) {
      // Get user's tickets
      axios.get(`/tickets/user/${user._id}`).then((response) => {
        const userTickets = response.data;
        
        // Get all events
        axios.get('/events').then((eventsResponse) => {
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          // Filter events happening tomorrow
          const tomorrowEvents = eventsResponse.data.filter(event => {
            const eventDate = new Date(event.eventDate);
            return eventDate.toDateString() === tomorrow.toDateString() &&
                   userTickets.some(ticket => ticket.eventid === event._id);
          });

          setUpcomingEvents(tomorrowEvents);
        });
      }).catch((error) => {
        console.error("Error fetching data:", error);
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Please login to view notifications</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Upcoming Events</h1>
      
      {upcomingEvents.length === 0 ? (
        <p className="text-gray-600">No upcoming events for tomorrow.</p>
      ) : (
        <div className="grid gap-4">
          {upcomingEvents.map(event => (
            <div key={event._id} className="bg-white p-4 rounded-lg shadow-md">
              <Link to={`/event/${event._id}`} className="block">
                <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                <div className="text-gray-600">
                  <p>Date: {new Date(event.eventDate).toLocaleDateString()}</p>
                  <p>Time: {event.eventTime}</p>
                  <p>Location: {event.location}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 