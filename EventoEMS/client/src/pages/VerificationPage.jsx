import { Link } from "react-router-dom";
import { IoMdArrowBack } from 'react-icons/io';
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";

export default function VerificationPage() {
  const { user } = useContext(UserContext);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/verification/${user._id}`);
      setVerificationStatus(response.data);
    } catch (error) {
      console.error('Error fetching verification status:', error);
      setError('Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerification = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post('/api/verify/email', { userId: user._id });
      setSuccess(response.data.message);
      fetchVerificationStatus();
    } catch (error) {
      console.error('Error verifying email:', error);
      setError('Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerification = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post('/api/verify/phone', {
        userId: user._id,
        phoneNumber
      });
      setSuccess(response.data.message);
      setShowCodeInput(true);
    } catch (error) {
      console.error('Error verifying phone:', error);
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setLoading(true);
      setError('');
      // TODO: Implement code verification
      // For now, we'll just simulate successful verification
      setSuccess('Phone number verified successfully!');
      setShowCodeInput(false);
      fetchVerificationStatus();
    } catch (error) {
      console.error('Error verifying code:', error);
      setError('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Verification</h1>
          <p className="mt-2 text-gray-600">Verify your account to access all features</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Verification Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading verification status...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Email Verification</h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    {verificationStatus?.emailVerified ? 'Verified' : 'Not Verified'}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    verificationStatus?.emailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {verificationStatus?.emailVerified ? '✓' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Phone Verification</h3>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    {verificationStatus?.phoneVerified ? 'Verified' : 'Not Verified'}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    verificationStatus?.phoneVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {verificationStatus?.phoneVerified ? '✓' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Verification Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Actions</h2>
          <div className="space-y-4">
            {/* Email Verification */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Verify Email</h3>
              <p className="text-gray-600 mb-4">Click the button below to verify your email address.</p>
              <button
                onClick={handleEmailVerification}
                disabled={loading || verificationStatus?.emailVerified}
                className={`w-full md:w-auto px-4 py-2 rounded-lg transition-colors ${
                  verificationStatus?.emailVerified
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : 'Verify Email'}
              </button>
            </div>

            {/* Phone Verification */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Verify Phone</h3>
              <p className="text-gray-600 mb-4">Enter your phone number to receive a verification code.</p>
              
              {!showCodeInput ? (
                <div className="space-y-4">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full p-2 border rounded-lg"
                  />
                  <button
                    onClick={handlePhoneVerification}
                    disabled={loading || !phoneNumber || verificationStatus?.phoneVerified}
                    className={`w-full md:w-auto px-4 py-2 rounded-lg transition-colors ${
                      verificationStatus?.phoneVerified || !phoneNumber
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Processing...' : 'Send Verification Code'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter verification code"
                    className="w-full p-2 border rounded-lg"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={handleVerifyCode}
                      disabled={loading || !verificationCode}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        !verificationCode
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </button>
                    <button
                      onClick={() => setShowCodeInput(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 