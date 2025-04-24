import { Link } from "react-router-dom";
import {IoMdArrowBack} from 'react-icons/io'
import {RiDeleteBinLine} from 'react-icons/ri'
import {BsCalendarEvent, BsCalendarCheck} from 'react-icons/bs'
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";

export default function TicketPage() {
    const {user} = useContext(UserContext);
    const [userTickets, setUserTickets] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
    const [totalSpent, setTotalSpent] = useState(0);
  
    useEffect(() => {
      if (user) {
        fetchTickets();
      }
    }, [user]);

    useEffect(() => {
      // Calculate total spent
      const total = userTickets.reduce((sum, ticket) => 
        sum + parseFloat(ticket.ticketDetails.ticketprice), 0);
      setTotalSpent(total);
    }, [userTickets]);
  
    const fetchTickets = async() => {
      try {
        const response = await axios.get(`/tickets/user/${user._id}`);
        setUserTickets(response.data);
      } catch (error) {
        console.error('Error fetching user tickets:', error);
      }
    }
  
    const deleteTicket = async(ticketId) => {
      try {
        await axios.delete(`/tickets/${ticketId}`); 
        fetchTickets();
        alert('Ticket Deleted');
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }

    const filteredTickets = userTickets.filter(ticket => {
      const eventDate = new Date(ticket.ticketDetails.eventdate);
      const now = new Date();
      
      if (filter === 'upcoming') return eventDate >= now;
      if (filter === 'past') return eventDate < now;
      return true;
    });
  
    return (
      <div className="flex flex-col flex-grow min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <Link to='/' className="flex items-center">
                <button className="inline-flex items-center gap-2 p-2 bg-gray-100 text-blue-700 font-bold rounded-md hover:bg-gray-200 transition-colors">
                  <IoMdArrowBack className="w-5 h-5" />
                  Back
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
            <p className="mt-2 text-gray-600">Manage and view your event tickets</p>
          </div>

          {/* Wallet Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-blue-700">{userTickets.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-green-700">Rs. {totalSpent.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-purple-700">
                  {userTickets.filter(ticket => new Date(ticket.ticketDetails.eventdate) >= new Date()).length}
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Tickets
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BsCalendarEvent className="inline-block mr-2" />
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'past' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BsCalendarCheck className="inline-block mr-2" />
              Past
            </button>
          </div>

          {/* Tickets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map(ticket => (
              <div 
                key={ticket._id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ticket.ticketDetails.eventname}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(ticket.ticketDetails.eventdate).toLocaleDateString()} at {ticket.ticketDetails.eventtime}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTicket(ticket._id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <RiDeleteBinLine className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-sm">
                      <p className="text-gray-600">Ticket ID</p>
                      <p className="font-medium">{ticket._id}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <p className="text-lg font-bold text-blue-700">
                          Rs. {ticket.ticketDetails.ticketprice}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-center">
                      <img
                        src={ticket.ticketDetails.qr}
                        alt="QR Code"
                        className="w-32 h-32 object-contain"
                      />
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-600">
                      <p>Name: {ticket.ticketDetails.name}</p>
                      <p>Email: {ticket.ticketDetails.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tickets found</p>
            </div>
          )}
        </div>
      </div>
    );
}
