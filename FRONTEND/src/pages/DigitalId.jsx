// src/pages/DigitalId.jsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheckIcon, ClockIcon, QrCodeIcon, IdentificationIcon, PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";

const IdFeatureCard = ({ icon, title, children }) => (
  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{children}</p>
  </div>
);

export default function DigitalId() {
  const [formData, setFormData] = useState({
    fullName: "",
    aadharNumber: "",
    nationality: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  // --- MODIFIED: State now stores the permanent Base64 string for the image ---
  const [profilePicBase64, setProfilePicBase64] = useState(null); 
  const [digitalIdData, setDigitalIdData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // --- Fetches saved ID from the backend when the page loads ---
  useEffect(() => {
    const fetchId = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const response = await fetch('http://127.0.0.1:5000/api/id/fetch', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.digitalId) {
            setDigitalIdData(data.digitalId);
            setFormData(data.digitalId.formData);
            // Load the saved Base64 image string from the database
            setProfilePicBase64(data.digitalId.profilePicBase64); 
          }
        }
      } catch (error) {
        console.error("Failed to fetch Digital ID:", error);
      }
    };
    fetchId();
  }, []);

  // --- Form validation logic (unchanged) ---
  useEffect(() => {
    const errors = {};
    if (formData.aadharNumber && !/^\d{12}$/.test(formData.aadharNumber)) {
      errors.aadharNumber = "Aadhaar must be 12 digits.";
    }
    if (formData.emergencyContactPhone && !/^\d{10}$/.test(formData.emergencyContactPhone)) {
      errors.emergencyContactPhone = "Phone number must be 10 digits.";
    }
    setFormErrors(errors);
  }, [formData]);

  // Check if the form is valid for submission
  const isFormValid = 
    Object.values(formData).every(field => field.trim() !== "") &&
    profilePicBase64 && // Check if an image has been selected and converted
    Object.keys(formErrors).length === 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // ... (logic is unchanged)
    if (name === "aadharNumber" && (/^\d*$/.test(value) && value.length <= 12)) {
      setFormData({ ...formData, [name]: value });
    } else if (name === "emergencyContactPhone" && (/^\d*$/.test(value) && value.length <= 10)) {
      setFormData({ ...formData, [name]: value });
    } else if (!["aadharNumber", "emergencyContactPhone"].includes(name)) {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  // --- MODIFIED: This function now converts the uploaded image to a Base64 string ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.readAsDataURL(file); // This reads the file as a Base64 string
      reader.onload = () => {
        setProfilePicBase64(reader.result); // Save the Base64 string to state
      };
      reader.onerror = (error) => {
        console.error("Error converting file to Base64:", error);
        alert("Could not process the image file.");
      };
    } else {
      setProfilePicBase64(null);
    }
  };

  // --- MODIFIED: This function now saves the Base64 string to the database ---
  const handleGenerateId = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
        alert("Please fill all fields correctly and upload a profile picture.");
        return;
    }

    setIsLoading(true);
    const fullIdData = {
      formData,
      profilePicBase64: profilePicBase64, // Save the permanent Base64 string
      qrValue: JSON.stringify({ ...formData, issuedAt: new Date().toISOString() })
    };

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/id/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(fullIdData)
      });
      if (response.ok) {
        setDigitalIdData(fullIdData);
        alert("Digital ID saved successfully!");
      } else {
        throw new Error("Server responded with an error.");
      }
    } catch (error) {
      alert("Failed to save ID. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- This function removes the ID from the database ---
  const handleRemoveId = async () => {
    if (!window.confirm("Are you sure you want to remove your Digital ID?")) return;
    
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/id/delete', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setDigitalIdData(null);
        setFormData({ fullName: "", aadharNumber: "", nationality: "", emergencyContactName: "", emergencyContactPhone: "" });
        setProfilePicBase64(null);
        alert("Digital ID removed successfully.");
      } else {
        throw new Error("Server responded with an error.");
      }
    } catch (error) {
      alert("Failed to remove ID. Please try again.");
    }
  };
  
  const formatAadhaar = (num) => {
    if (!num) return "";
    return num.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3");
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4 space-y-16">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Digital Tourist ID</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          {digitalIdData ? "Your ID is saved and ready for use." : "Generate your secure ID for a safer travel experience."}
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 p-8 rounded-2xl border border-gray-700"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <IdentificationIcon className="w-7 h-7 mr-3 text-indigo-400"/>
            {digitalIdData ? "Your Details" : "Enter Your Details"}
          </h2>
          <form onSubmit={handleGenerateId} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200" disabled={!!digitalIdData} />
            </div>
            <div>
              <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-300 mb-1">Aadhaar Number</label>
              <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleInputChange} required className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200" disabled={!!digitalIdData} />
              {formErrors.aadharNumber && <p className="text-red-500 text-xs mt-1">{formErrors.aadharNumber}</p>}
            </div>
            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-300 mb-1">Nationality</label>
              <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} required className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200" disabled={!!digitalIdData} />
            </div>
            <div>
              <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-300 mb-1">Emergency Contact Name</label>
              <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} required className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200" disabled={!!digitalIdData} />
            </div>
            <div>
              <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-300 mb-1">Emergency Contact Phone</label>
              <input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} required className="w-full p-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-200" disabled={!!digitalIdData} />
              {formErrors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{formErrors.emergencyContactPhone}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Profile Picture</label>
              <label htmlFor="profilePic" className={`w-full flex items-center justify-center p-3 rounded-lg border-2 border-dashed ${!!digitalIdData ? 'border-gray-700 bg-gray-800 text-gray-500' : 'border-gray-600 bg-gray-700 text-gray-400 cursor-pointer hover:bg-gray-600'}`}>
                <PhotoIcon className="w-6 h-6 mr-2"/>
                <span>{profilePicBase64 ? "Image Selected" : "Upload an image"}</span>
              </label>
              <input type="file" id="profilePic" onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" disabled={!!digitalIdData} />
            </div>

            {!digitalIdData && (
              <button type="submit" disabled={!isFormValid || isLoading} className="w-full mt-4 p-3 rounded-lg font-semibold transition-all bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed">
                {isLoading ? 'Saving...' : 'Save Digital ID'}
              </button>
            )}
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-800 p-8 rounded-2xl border border-gray-700 h-full flex flex-col justify-center items-center"
        >
          {digitalIdData ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="w-full max-w-sm bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">SMART TOURIST ID</h3>
                <div className="w-8 h-6 bg-yellow-400 rounded-sm"></div> {/* Mock Chip */}
              </div>
              <div className="flex items-center space-x-4 mb-6">
                <img src={digitalIdData.profilePicBase64} alt="Profile" className="w-24 h-24 rounded-lg object-cover border-2 border-gray-500" />
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="text-xl font-bold">{digitalIdData.formData.fullName}</p>
                  <p className="text-xs text-gray-400 mt-2">Nationality</p>
                  <p className="font-semibold">{digitalIdData.formData.nationality}</p>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <p className="text-xs text-gray-400">Aadhaar Number</p>
                <p className="font-mono text-lg tracking-wider">{formatAadhaar(digitalIdData.formData.aadharNumber)}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <QRCodeSVG value={digitalIdData.qrValue} size={220} width="100%" />
              </div>
              <button onClick={handleRemoveId} className="w-full mt-6 flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 bg-red-900/50 hover:bg-red-900/70 py-2 rounded-lg">
                <TrashIcon className="w-4 h-4" />
                Remove Digital ID
              </button>
            </motion.div>
          ) : (
            <div className="text-center text-gray-500">
              <QrCodeIcon className="w-24 h-24 mx-auto mb-4"/>
              <h3 className="text-xl font-semibold text-gray-400">Your Digital ID will appear here</h3>
              <p className="mt-2">Complete the form to generate your secure ID.</p>
            </div>
          )}
        </motion.div>
      </div>
      
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-10">Digital ID Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <IdFeatureCard icon={<ShieldCheckIcon className="w-10 h-10 text-green-400"/>} title="Blockchain Security">{/* ... */}</IdFeatureCard>
          <IdFeatureCard icon={<ClockIcon className="w-10 h-10 text-yellow-400"/>} title="Temporary Access">{/* ... */}</IdFeatureCard>
          <IdFeatureCard icon={<QrCodeIcon className="w-10 h-10 text-blue-400"/>} title="Quick Verification">{/* ... */}</IdFeatureCard>
        </div>
      </div>
    </div>
  );
}