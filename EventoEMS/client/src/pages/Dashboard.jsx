import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../UserContext';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BsCaretLeftFill, BsFillCaretRightFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalTickets: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
    recentEvents: [],
    users: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      // Fetch all statistics
      Promise.all([
        axios.get('/admin/stats/users'),
        axios.get('/admin/stats/events'),
        axios.get('/admin/stats/tickets'),
        axios.get('/admin/stats/revenue'),
        axios.get('/admin/stats/upcoming-events'),
        axios.get('/admin/stats/recent-events'),
        axios.get('/admin/users')
      ])
        .then(([usersRes, eventsRes, ticketsRes, revenueRes, upcomingRes, recentRes, allUsersRes]) => {
          console.log('API Responses:', {
            users: usersRes.data,
            events: eventsRes.data,
            tickets: ticketsRes.data,
            revenue: revenueRes.data,
            upcoming: upcomingRes.data,
            recent: recentRes.data,
            allUsers: allUsersRes.data
          });

          setStats({
            totalUsers: usersRes.data.count,
            totalEvents: eventsRes.data.count,
            totalTickets: ticketsRes.data.count,
            totalRevenue: revenueRes.data.amount,
            upcomingEvents: upcomingRes.data.count,
            recentEvents: recentRes.data.events,
            users: allUsersRes.data.users
          });
        })
        .catch(error => {
          console.error('Error fetching dashboard data:', error);
          setError('Failed to load dashboard data. Please try again.');
        });
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <Navigate to={'/'} />
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="flex gap-8">
        {/* Left Column - Main Content */}
        <div className="flex-1 max-w-[calc(100%-400px)]">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
              <p className="text-3xl font-bold text-primary">{stats.upcomingEvents}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-primary">₹{stats.totalRevenue}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Total Tickets Sold</h3>
              <p className="text-3xl font-bold text-primary">{stats.totalTickets}</p>
            </div>
          </div>

          {/* Recent Events */}
          <div className="p-2 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Recent Events</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/createEvent')}
                  className="bg-primary text-white py-2 px-4 rounded hover:bg-primarydark transition-colors"
                >
                  Create New Event
                </button>
                <button
                  onClick={() => navigate('/events')}
                  className="bg-primary text-white py-2 px-4 rounded hover:bg-primarydark transition-colors"
                >
                  View All Events
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.recentEvents
                .slice(0, 3) // Show only 3 most recent events
                .map((event) => (
                  <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Event Image */}
                    <div className="h-56 relative">
                      {event.image ? (
                        <img
                          src={`https://ems-backend-jet.vercel.app/uploads/${event.image}`}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', event.image);
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/400x224?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${new Date(event.eventDate) > new Date()
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {new Date(event.eventDate) > new Date() ? 'Upcoming' : 'Completed'}
                        </span>
                      </div>
                    </div>

                    {/* Event Title and Location */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm">{event.location}</p>
                    </div>

                    {/* Event Date, Time and Price */}
                    <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
                      <div className="text-sm">
                        <p className="text-gray-600">{new Date(event.eventDate).toLocaleDateString()}</p>
                        <p className="text-gray-600">{event.eventTime}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">₹ {event.ticketPrice}</p>
                        <p className="text-xs text-gray-500">{event.ticketsSold || 0} tickets sold</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-[350px]">
          {/* Upcoming Events Box */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
            <div className="h-[300px]">
              {stats.recentEvents
                .filter(event => new Date(event.eventDate) > new Date())
                .slice(0, 1)
                .map(event => (
                  <div key={event._id} className="relative h-full rounded-lg overflow-hidden group">
                    {event.image ? (
                      <img
                        src={`https://ems-backend-jet.vercel.app/uploads/${event.image}`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', event.image);
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center p-8 text-white group-hover:bg-opacity-60 transition-all">
                      <h4 className="font-semibold text-2xl mb-2">{event.title}</h4>
                      <p className="text-lg">
                        {new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}
                      </p>
                      <p className="mt-2 text-sm opacity-90">{event.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Calendar</h3>
            <div className="rounded-full bg-gray-50 p-4">
              <div className="flex items-center mb-4 justify-center gap-2">
                <button className="hover:bg-gray-100 p-1 rounded-full">
                  <BsCaretLeftFill className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-sm font-semibold">{format(new Date(), "MMMM yyyy")}</span>
                <button className="hover:bg-gray-100 p-1 rounded-full">
                  <BsFillCaretRightFill className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="grid grid-cols-7 text-center mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-[10px] font-semibold text-gray-600">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }, (_, i) => {
                  const eventDate = new Date(stats.recentEvents[i]?.eventDate || '');
                  const hasEvent = eventDate.getDate() === i + 1 &&
                    eventDate.getMonth() === new Date().getMonth() &&
                    eventDate.getFullYear() === new Date().getFullYear();
                  const isToday = i + 1 === new Date().getDate();
                  return (
                    <div
                      key={i}
                      className="relative aspect-square"
                    >
                      <div className={`
                        absolute inset-1 flex items-center justify-center rounded-full
                        ${hasEvent ? 'bg-purple-500 text-white' : 'hover:bg-gray-100'}
                        ${isToday && !hasEvent ? 'border-2 border-purple-500' : ''}
                        transition-colors duration-200
                      `}>
                        <span className={`text-[10px] font-bold ${hasEvent ? 'text-white' : 'text-gray-600'}`}>
                          {i + 1}
                        </span>
                      </div>
                      {hasEvent && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Event List */}
            <div className="mt-4 space-y-2">
              {stats.recentEvents
                .filter(event => {
                  const eventDate = new Date(event.eventDate);
                  return eventDate.getMonth() === new Date().getMonth();
                })
                .map((event) => (
                  <Link
                    key={event._id}
                    to={"/event/" + event._id}
                    className="block text-xs hover:bg-gray-50 p-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="font-medium">{event.title}</span>
                      <span className="text-gray-500 ml-auto">
                        {new Date(event.eventDate).getDate()}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 