import { useState, useContext, useEffect } from 'react';
import { UserContext } from '../UserContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateEvent() {
  const {user} = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);

  useEffect(() => {
    // Fetch available events
    axios.get('/api/events')
      .then(response => {
        setEvents(response.data.events);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events. Please try again.');
      });
  }, []);

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={'/login'} />;
  }

  // Redirect to home if admin
  if (user.role === 'admin') {
    return <Navigate to={'/'} />;
  }

  const handleBookTicket = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/tickets', {
        eventId: selectedEvent._id,
        userId: user._id,
        quantity: ticketCount,
        totalPrice: selectedEvent.ticketPrice * ticketCount
      });

      if (response.status === 201) {
        toast.success('Ticket booked successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Reset form
        setSelectedEvent(null);
        setTicketCount(1);
      }
    } catch (error) {
      console.error('Error booking ticket:', error);
      toast.error('Failed to book ticket. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Book Event Tickets</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Event Selection */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Available Events</h3>
            <div className="space-y-4">
              {events.map(event => (
                <div 
                  key={event._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedEvent?._id === event._id ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-primary'
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <h4 className="font-semibold">{event.title}</h4>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm">Date: {new Date(event.eventDate).toLocaleDateString()}</span>
                    <span className="font-semibold">₹{event.ticketPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Booking Form - Only shown to regular users */}
          {selectedEvent && user.role !== 'admin' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Book Tickets</h3>
              <form onSubmit={handleBookTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event</label>
                  <p className="mt-1 text-lg font-semibold">{selectedEvent.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                  <p className="mt-1">
                    {new Date(selectedEvent.eventDate).toLocaleDateString()} at {selectedEvent.eventTime}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <p className="mt-1">{selectedEvent.location}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Tickets</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedEvent.capacity}
                    value={ticketCount}
                    onChange={(e) => setTicketCount(parseInt(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Price</label>
                  <p className="mt-1 text-xl font-semibold">₹{selectedEvent.ticketPrice * ticketCount}</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primarydark transition-colors"
                >
                  Book Now
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

