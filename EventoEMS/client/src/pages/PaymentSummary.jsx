/* eslint-disable no-unused-vars */
import axios from 'axios';
import  { useContext, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom';
import {IoMdArrowBack} from 'react-icons/io'
import { UserContext } from '../UserContext';
import Qrcode from 'qrcode' //TODO:
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PaymentSummary() {
    const {id} = useParams();
    const [event, setEvent] = useState(null);
    const {user} = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [redirect, setRedirect] = useState('');
    const [details, setDetails] = useState({
      name: '',
      email: '',
      contactNo: '',
    });
//!Adding a default state for ticket-----------------------------
    const defaultTicketState = {
      userid: user ? user._id : '',
      eventid: '',
      ticketDetails: {
        name: user ? user.name : '',
        email: user ? user.email : '',
        eventname: '',
        eventdate: '',
        eventtime: '',
        ticketprice: '',
        qr: '',
      }
    };
//! add default state to the ticket details state
    const [ticketDetails, setTicketDetails] = useState(defaultTicketState);

    const [payment, setPayment] = useState({
      nameOnCard: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    });
  
    useEffect(()=>{
      if(!id){
        return;
      }
      const fetchEvent = async () => {
        try {
          const response = await axios.get(`/event/${id}/ordersummary/paymentsummary`);
          setEvent(response.data);

          // Format the date properly for MongoDB
          const eventDate = new Date(response.data.eventDate);
          const formattedDate = eventDate.toISOString().split('T')[0];

          setTicketDetails(prevTicketDetails => ({
            ...prevTicketDetails,
            eventid: response.data._id,
            ticketDetails: {
              ...prevTicketDetails.ticketDetails,
              eventname: response.data.title,
              eventdate: formattedDate, // Use the properly formatted date
              eventtime: response.data.eventTime,
              ticketprice: response.data.ticketPrice,
            }
          }));
        } catch (error) {
          console.error("Error fetching event:", error);
          setError('Failed to load event details');
        }
      };
      fetchEvent();
    }, [id]);
//! Getting user details using useeffect and setting to new ticket details with previous details
    useEffect(() => {
      setTicketDetails(prevTicketDetails => ({
        ...prevTicketDetails,
        userid: user ? user._id : '',
        ticketDetails: {
          ...prevTicketDetails.ticketDetails,
          name: user ? user.name : '',
          email: user ? user.email : '',
        }
      }));
    }, [user]);
    
    
    if (!event) return '';

    const handleChangeDetails = (e) => {
      const { name, value } = e.target;
      setDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    };
  
    const handleChangePayment = (e) => {
      const { name, value } = e.target;
      setPayment((prevPayment) => ({
        ...prevPayment,
        [name]: value,
      }));
    };

    function loadScript(src) {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }

const handleRazorpayPayment = async () => {
    // Load Razorpay script
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        return false;
    }

    try {
        // Create new order
        const result = await axios.post("https://ems-backend-jet.vercel.app/api/orders", {
            amount: event.ticketPrice * 100
        });

        if (!result) {
            toast.error("Server error. Are you online?");
            return false;
        }

        // Getting the order details back
        const { amount, id: order_id, currency } = result.data;
        // console.log(details.contactNo);
        
        return new Promise((resolve) => {
            const options = {
                key: "rzp_test_cQpArg3JWUR81S",
                amount: amount,
                currency: currency,
                name: "Ticketly",
                description: ticketDetails.ticketDetails.eventname,
                order_id: order_id,
                handler: function (response) {
                    const data = {
                        orderCreationId: order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpaySignature: response.razorpay_signature,
                    };
                    // You could post this data to your backend here if needed
                    // const result = await axios.post("http://localhost:5000/payment/success", data);
                    
                    // Important: Resolve the promise to true when payment is successful
                    resolve(true);
                },
                prefill: {
                    name: details.name,
                    email: details.email,
                    contact: details.contactNo,
                },
                notes: {
                    address: "Soumya Dey Corporate Office",
                },
                theme: {
                    color: "#61dafb",
                },
                modal: {
                    ondismiss: function() {
                        // Important: Resolve to false if the payment modal is dismissed
                        resolve(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                toast.error('Payment failed');
                resolve(false);
            });
            paymentObject.open();
        });
    } catch (error) {
        console.error("Error in Razorpay payment:", error);
        toast.error("Payment initiation failed");
        return false;
    }
};



//! creating a ticket ------------------------------
    const createTicket = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const paymentSuccessful = await handleRazorpayPayment();
            
        if (!paymentSuccessful) {
            toast.error("Payment was not completed");
            setLoading(false);
            return;
        }

        const qrData = {
          eventName: ticketDetails.ticketDetails.eventname,
          attendeeName: ticketDetails.ticketDetails.name,
          eventDate: ticketDetails.ticketDetails.eventdate,
          eventTime: ticketDetails.ticketDetails.eventtime,
          ticketId: ticketDetails._id || 'pending'
        };

        const qrCode = await Qrcode.toDataURL(JSON.stringify(qrData));
        
        const updatedTicketDetails = {
          ...ticketDetails,
          ticketDetails: {
            ...ticketDetails.ticketDetails,
            qr: qrCode,
          }
        };

        const response = await axios.post('/tickets', updatedTicketDetails);
        
        if (response.status === 201) {
          toast.success('Ticket created successfully!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          setRedirect(true);
        }
      } catch (error) {
        console.error('Error creating ticket:', error);
        setError(error.response?.data?.message || 'Failed to create ticket');
        toast.error('Failed to create ticket. Please try again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (redirect){
      return <Navigate to={'/wallet'} />
    }

    return (
      <>
      <div>
      <Link to={'/event/'+event._id+ '/ordersummary'}>
                
       <button 
              // onClick={handleBackClick}
              className='
              inline-flex 
              mt-12
              gap-2
              p-3 
              ml-12
              bg-gray-100
              justify-center 
              items-center 
              text-blue-700
              font-bold
              rounded-sm'
              >
                
          <IoMdArrowBack 
            className='
            font-bold
            w-6
            h-6
            gap-2'/> 
            Back
          </button>
          </Link>
          </div>
      <div className="ml-12 bg-gray-100 shadow-lg mt-8 p-16 w-3/5 float-left">
          {/* Your Details */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold mb-4">Your Details</h2>
            <input
              type="text"
              name="name"
              value={details.name}
              onChange={handleChangeDetails}
              placeholder="Name"
              className="input-field ml-10 w-80 h-10 bg-gray-50 border border-gray-30  rounded-md p-2.5"
            />
            <input
              type="email"
              name="email"
              value={details.email}
              onChange={handleChangeDetails}
              placeholder="Email"
              className="input-field w-80 ml-3 h-10 bg-gray-50 border border-gray-30  rounded-sm p-2.5"
            />
            <div className="flex space-x-4">
            <input
              type="tel"
              name="contactNo"
              value={details.contactNo}
              onChange={handleChangeDetails}
              placeholder="Contact No"
              className="input-field ml-10 w-80 h-10 bg-gray-50 border border-gray-30 rounded-sm p-2.5"
            />
            </div>
          </div>
  
          {/* Payment Option */}
     
          <div className="mt-10 space-y-4">
            <h2 className="text-xl font-bold mb-4">Payment Option</h2>
            <div className="ml-10">
            <button type="button" className="px-8 py-3 text-black bg-blue-100  focus:outline border rounded-sm border-gray-300" disabled>Credit / Debit Card</button>
            </div>
          
            <input
              type="text"
              name="nameOnCard"
              value= "A.B.S.L. Perera"                       
              onChange={handleChangePayment}
              placeholder="Name on Card"
              className="input-field w-80 ml-10 h-10 bg-gray-50 border border-gray-30  rounded-sm p-2.5"
            />
            <input
              type="text"
              name="cardNumber"
              value="5648 3212 7802"
              onChange={handleChangePayment}
              placeholder="Card Number"
              className="input-field w-80 ml-3 h-10 bg-gray-50 border border-gray-30 rounded-sm p-2.5"
            />
            <div className="flex space-x-4">
              <div className="relative">
              <input
                type="text"
                name="expiryDate"
                value="12/25"
                onChange={handleChangePayment}
                placeholder="Expiry Date (MM/YY)"
                className="input-field w-60 ml-10 h-10 bg-gray-50 border border-gray-30  rounded-sm p-2.5"
              />
              
              </div>
             
              <input
                type="text"
                name="cvv"
                value="532"
                onChange={handleChangePayment}
                placeholder="CVV"
                className="input-field w-16 h-10 bg-gray-50 border border-gray-30  rounded-sm p-3"
              />
            </div>
            <div className="float-right">
            <p className="text-sm font-semibold pb-2 pt-8">Total : LKR. {event.ticketPrice}</p>
            <Link to={'/'}>
              <button type="button" 
                onClick = {createTicket}
                className="primary"
                disabled={loading}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Make Payment'
                )}
              </button>
            </Link>
            </div>
            
          </div>
      </div>
      <div className="float-right bg-blue-100 w-1/4 p-5 mt-8 mr-12">
          <h2 className="text-xl font-bold mb-8">Order Summary</h2>
          <div className="space-y-1">
            
            <div>
               <p className="float-right">1 Ticket</p>
            </div>
            <p className="text-lg font-semibold">{event.title}</p>
            <p className="text-xs">{event.eventDate.split("T")[0]},</p>
            <p className="text-xs pb-2"> {event.eventTime}</p>
            <hr className=" my-2 border-t pt-2 border-gray-400" />
            <p className="float-right font-bold">LKR. {event.ticketPrice}</p>
            <p className="font-bold">Sub total: {event.ticketPrice}</p>
          </div>
          
        </div>
      </>
    );
}
