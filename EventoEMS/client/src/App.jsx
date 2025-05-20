/* eslint-disable no-unused-vars */
import { Route, Routes } from 'react-router-dom'
import './App.css'
import IndexPage from './pages/IndexPage'
import RegisterPage from './pages/RegisterPage'
import Layout from './Layout'
import LoginPage from './pages/LoginPage'
import axios from 'axios'
import { UserContextProvider } from './UserContext'
import UserAccountPage from './pages/UserAccountPage'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AddEvent from './pages/AddEvent'
import CalendarView from './pages/CalendarView'
import OrderSummary from './pages/OrderSummary'
import PaymentSummary from './pages/PaymentSummary'
import TicketPage from './pages/TicketPage'
import CreatEvent from './pages/CreateEvent'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import Notifications from './pages/Notifications'
import VerificationPage from './pages/VerificationPage'

axios.defaults.baseURL = 'https://ems-backend-jet.vercel.app/';
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <Routes>

        <Route path='/' element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path='/useraccount' element={<UserAccountPage />} />
          <Route path='/createEvent' element={<AddEvent />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/event/:id' element={<EventDetails />} />
          <Route path='/calendar' element={<CalendarView />} />
          <Route path='/wallet' element={<TicketPage />} />
          <Route path='/event/:id/ordersummary' element={<OrderSummary />} />
          <Route path='/events' element={<Events />} />
          <Route path='/notifications' element={<Notifications />} />
          <Route path='/verification' element={<VerificationPage />} />
        </Route>

        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/forgotpassword' element={<ForgotPassword />} />
        <Route path='/resetpassword' element={<ResetPassword />} />
        <Route path='/event/:id/ordersummary/paymentsummary' element={<PaymentSummary />} />


      </Routes>
    </UserContextProvider>
  )
}

export default App
