import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlusIcon } from '@heroicons/react/24/solid';
import { FcGoogle } from "react-icons/fc";
import GoogleLoginButton from "../components/GoogleLoginButton";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- CLIENT-SIDE VALIDATION LOGIC ---
  const validateForm = () => {
    let formErrors = {};
    if (!formData.name.trim()) formErrors.name = "Full name is required.";
    if (!formData.username.trim()) formErrors.username = "Username is required.";
    if (!formData.email.trim()) {
      formErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = "Email address is invalid.";
    }
    if (!formData.password) {
      formErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      formErrors.password = "Password must be at least 8 characters long.";
    }
    if (!formData.confirmPassword) {
      formErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = "Passwords do not match.";
    }
    return formErrors;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const { name, username, email, password } = formData;
      const response = await fetch('http://127.0.0.1:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // --- CHANGED PART STARTS HERE ---
        
        // 1. Get the token from the response
        const { access_token } = data;
        
        // 2. Store the token to log the user in
        localStorage.setItem('accessToken', access_token);
        
        alert("Account created successfully!");
        
        // 3. Redirect to the QR code page
        navigate('/digital-id');

        // --- CHANGED PART ENDS HERE ---
      } else {
        setErrors({ api: data.message });
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setErrors({ api: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
};
  
  const handleGoogleSignUp = () => {
    alert("Google Sign Up is not yet implemented.");
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <UserPlusIcon className="mx-auto h-12 w-auto text-indigo-500" />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
          Create Your Account
        </h2>
      </div>
      <form className="mt-8 space-y-6 bg-gray-800 p-8 rounded-2xl shadow-xl" onSubmit={handleSignUp}>
        {/* <button type="button" onClick={handleGoogleSignUp} className="w-full flex items-center justify-center bg-white border border-gray-600 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-200 transition-all">
          <FcGoogle className="mr-3 text-2xl" /> Sign Up with Google
        </button> */}
        <div className="flex justify-center">
  <GoogleLoginButton isSignUp={true} />
</div>
        <div className="flex items-center"><hr className="w-full border-gray-600" /><span className="px-2 text-sm text-gray-400">OR</span><hr className="w-full border-gray-600" /></div>
        
        <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
        </div>
        
        {errors.api && <p className="text-red-500 text-sm text-center">{errors.api}</p>}

        <button type="submit" disabled={isLoading} className="w-full p-3 rounded-lg font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed">
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
        <p className="text-center text-sm text-gray-400">Already have an account?{' '}<Link to="/signin" className="font-medium text-indigo-400 hover:text-indigo-300">Log In</Link></p>
      </form>
    </div>
  );
}