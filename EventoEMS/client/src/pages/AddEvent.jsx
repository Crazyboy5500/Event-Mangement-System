import { useState, useContext } from 'react';
import { UserContext } from '../UserContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddEvent() {
  const {user} = useContext(UserContext);
  const [formData, setFormData] = useState({
    owner: user? user.name : "",
    title: "",
    optional:"",
    description: "",
    organizedBy: "",
    eventDate: "",
    eventTime: "",
    location: "",
    ticketPrice: 0,
    capacity: 0,
    image: '',
    likes: 0
  });

  if (!user || user.role !== 'admin') {
    return <Navigate to={'/'} />
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prevState) => ({ ...prevState, image: file }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prevState) => ({ ...prevState, [name]: files[0] }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    
    // Log form data before submission
    console.log('Form data before submission:', formData);
    
    // Append all form data
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key]) {
        data.append('image', formData[key]);
      } else {
        data.append(key, formData[key]);
      }
    });

    // Log FormData contents
    for (let pair of data.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    axios
      .post("/createEvent", data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((response) => {
        console.log("Event posted successfully:", response.data);
        // Verify the image path in the response
        if (response.data.image) {
          console.log("Image path in response:", response.data.image);
        }
        toast.success('Event added successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Reset form
        setFormData({
          owner: user.name,
          title: "",
          optional:"",
          description: "",
          organizedBy: "",
          eventDate: "",
          eventTime: "",
          location: "",
          ticketPrice: 0,
          capacity: 0,
          image: '',
          likes: 0
        });
      })
      .catch((error) => {
        console.error("Error posting event:", error);
        console.error("Error response:", error.response?.data);
        toast.error('Failed to add event. Please try again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });
  };

  return (
    <div className='min-h-screen bg-gray-100 py-12'>
      <ToastContainer />
      <div className='max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md'>
        <h1 className='text-3xl font-bold text-center mb-8'>Post an Event</h1>
        
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Left Column */}
            <div className='space-y-4'>
              <label className='block'>
                <span className='text-gray-700'>Title:</span>
                <input
                  type="text"
                  name="title"
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary'
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className='block'>
                <span className='text-gray-700'>Optional:</span>
                <input
                  type="text"
                  name="optional"
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary'
                  value={formData.optional}
                  onChange={handleChange}
                />
              </label>
              <label className='block'>
                <span className='text-gray-700'>Description:</span>
                <textarea
                  name="description"
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary'
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                />
              </label>
              <label className='block'>
                <span className='text-gray-700'>Organized By:</span>
                <input
                  type="text"
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary'
                  name="organizedBy"
                  value={formData.organizedBy}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className='block'>
                <span className='text-gray-700'>Event Date:</span>
                <input
                  type="date"
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary'
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            {/* Right Column */}
            <div className='space-y-4'>
              <label className='block'>
                <span className='text-gray-700'>Event Time:</span>
                <input
                  type="time"
                  name="eventTime"
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary'
                  value={formData.eventTime}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className='block'>
                <span className='text-gray-700'>Location:</span>
                <input
                  type="text"
                  name="location"
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary'
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className='block'>
                <span className='text-gray-700'>Ticket Price (₹):</span>
                <input
                  type="number"
                  name="ticketPrice"
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary'
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </label>
              <label className='block'>
                <span className='text-gray-700'>Capacity:</span>
                <input
                  type="number"
                  name="capacity"
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary'
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </label>
              <label className='block'>
                <span className='text-gray-700'>Image:</span>
                <input
                  type="file"
                  name="image"
                  className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary'
                  onChange={handleImageUpload}
                  required
                  accept="image/*"
                />
              </label>
            </div>
          </div>
          <button 
            type="submit" 
            className='w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primarydark transition-colors'
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
