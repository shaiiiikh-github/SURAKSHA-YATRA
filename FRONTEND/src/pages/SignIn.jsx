import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { FcGoogle } from "react-icons/fc";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function SignIn() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    if (!formData.username || !formData.password) {
      setError("Please enter both username and password.");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('accessToken', data.access_token);
        navigate('/digital-id');
      } else {
        setError(data.message); // Display error from backend
      }
    } catch (error) {
      console.error("Signin failed:", error);
      setError("An error occurred. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    alert("Google Sign In is not yet implemented.");
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <LockClosedIcon className="mx-auto h-12 w-auto text-indigo-500" />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Welcome Back
        </h2>
      </div>
      <form className="mt-8 space-y-6 bg-gray-800 p-8 rounded-2xl shadow-xl" onSubmit={handleSignIn}>
        {/* <button type="button" onClick={handleGoogleSignIn} className="w-full flex items-center justify-center bg-white border border-gray-600 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-200 transition-all">
            <FcGoogle className="mr-3 text-2xl" /> Sign In with Google
        </button> */}
        <div className="flex justify-center">
  <GoogleLoginButton />
</div>
        <div className="flex items-center"><hr className="w-full border-gray-600" /><span className="px-2 text-sm text-gray-400">OR</span><hr className="w-full border-gray-600" /></div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <button type="submit" disabled={isLoading} className="w-full mt-6 p-3 rounded-lg font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
          {isLoading ? 'Logging In...' : 'Log In'}
        </button>
        <p className="text-center text-sm text-gray-400">Don't have an account?{' '}<Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">Sign Up</Link></p>
      </form>
    </div>
  );
}