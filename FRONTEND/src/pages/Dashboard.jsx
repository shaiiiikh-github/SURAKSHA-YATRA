import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
  UserPlusIcon,
  PlayIcon,
  StopIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PhoneIcon
} from '@heroicons/react/24/solid';

// Reusable card component for the stats
const InfoCard = ({ title, value, icon, color }) => (
  <div className={`bg-gray-800 p-6 rounded-2xl border border-gray-700 flex items-center`}>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);


export default function Dashboard() {
  const [groupMembers, setGroupMembers] = useState([
    { id: 1, name: 'You', username: 'Sahil006' },
  ]);
  const initialCenter = useMemo(() => ({ lat: 19.0760, lng: 72.8777 }), []);
  const [friendLocations, setFriendLocations] = useState({
    'Sahil006': { ...initialCenter },
  });
  const [statusMessage, setStatusMessage] = useState('Simulation is stopped.');
  const [inviteUsername, setInviteUsername] = useState('');
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const simulationIntervalRef = useRef(null);
  const [strayFriendUsername, setStrayFriendUsername] = useState('');
  const [safetyScore, setSafetyScore] = useState(95);
  const [aiAlert, setAiAlert] = useState("All Clear");

  useEffect(() => {
    if (isSimulationRunning && strayFriendUsername) {
      simulationIntervalRef.current = setInterval(() => {
        setFriendLocations(prevLocations => {
          const newLocations = JSON.parse(JSON.stringify(prevLocations));
          if (newLocations[strayFriendUsername]) {
            newLocations[strayFriendUsername].lat += 0.0015;
            newLocations[strayFriendUsername].lng += 0.0015;
          }
          const token = localStorage.getItem('accessToken');
          if (Object.keys(newLocations).length > 1) {
            fetch('http://127.0.0.1:5000/api/group/check-locations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ friendLocations: newLocations })
            })
            .then(res => res.json())
            .then(data => {
              const strayFriendIsStillAway = newLocations[strayFriendUsername] && newLocations[strayFriendUsername].lat > initialCenter.lat + 0.003;
              if (strayFriendIsStillAway) {
                setSafetyScore(65);
                setAiAlert("Group Member Separated!");
              }
            })
            .catch(err => console.error("Error checking locations:", err));
          }
          return newLocations;
        });
      }, 8000);
    }
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isSimulationRunning, strayFriendUsername, groupMembers, initialCenter]);
  
  const handleStartSimulation = async () => {
    if (!strayFriendUsername) {
      alert("Please select a friend to simulate wandering off first.");
      return;
    }
    const token = localStorage.getItem('accessToken');
    try {
      await fetch('http://127.0.0.1:5000/api/group/reset-alerts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIsSimulationRunning(true);
      setStatusMessage('Simulation running...');
    } catch (error) {
      alert('Could not start simulation. Please check your connection.');
    }
  };

  const handleStopSimulation = () => {
    setIsSimulationRunning(false);
    setStatusMessage('Simulation is stopped.');
    setSafetyScore(95);
    setAiAlert("All Clear");
  };
  
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteUsername) return;
    const token = localStorage.getItem('accessToken');
    try {
        const response = await fetch('http://127.0.0.1:5000/api/group/add-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ username: inviteUsername })
        });
        const data = await response.json();
        if (response.ok) {
            const newUser = data.user;
            if (!groupMembers.some(member => member.username === newUser.username)) {
              setGroupMembers(prev => [...prev, newUser]);
              setFriendLocations(prev => ({ ...prev, [newUser.username]: { lat: initialCenter.lat + 0.001, lng: initialCenter.lng - 0.001 } }));
            }
            setInviteUsername('');
            alert(data.message);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        alert('Failed to add member. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">Group Dashboard</h1>
        <p className="text-lg text-yellow-400">{statusMessage}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard 
          title="Current Safety Score"
          value={`${safetyScore}%`}
          icon={<ShieldCheckIcon className="w-6 h-6 text-white"/>}
          color={safetyScore > 80 ? "bg-green-500" : "bg-yellow-500"}
        />
        <InfoCard 
          title="AI Monitoring Status"
          value={aiAlert}
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-white"/>}
          color={aiAlert === "All Clear" ? "bg-blue-500" : "bg-red-500"}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-6">
          <h2 className="text-2xl font-semibold text-white">Group Management</h2>
          
          <div>
            <label htmlFor="strayFriend" className="block text-sm font-medium text-gray-300 mb-2">
              Select friend to simulate wandering off:
            </label>
            <select
              id="strayFriend"
              value={strayFriendUsername}
              onChange={(e) => setStrayFriendUsername(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-200"
              disabled={isSimulationRunning}
            >
              <option value="">-- Choose a friend --</option>
              {groupMembers
                .filter(member => member.username !== 'Sahil006')
                .map(member => (
                  <option key={member.id} value={member.username}>
                    {member.name} ({member.username})
                  </option>
              ))}
            </select>
          </div>

          <div>
            <button 
              onClick={isSimulationRunning ? handleStopSimulation : handleStartSimulation}
              disabled={!strayFriendUsername && !isSimulationRunning}
              className={`w-full flex items-center justify-center p-3 rounded-lg font-semibold transition-all ${isSimulationRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white disabled:bg-gray-500 disabled:cursor-not-allowed`}
            >
              {isSimulationRunning ? <StopIcon className="w-6 h-6 mr-2"/> : <PlayIcon className="w-6 h-6 mr-2"/>}
              {isSimulationRunning ? 'Stop Simulation' : 'Start Simulation'}
            </button>
          </div>

          <ul className="space-y-3">
            {groupMembers.map(member => (
              <li key={member.id} className="bg-gray-700 p-3 rounded-lg text-white">{member.name} ({member.username})</li>
            ))}
          </ul>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Add Friend by Username</h3>
            <form onSubmit={handleInvite} className="flex gap-2">
              <input type="text" value={inviteUsername} onChange={(e) => setInviteUsername(e.target.value)} placeholder="Enter username" className="flex-grow p-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-200" />
              <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700"><UserPlusIcon className="w-6 h-6"/></button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 h-[60vh] rounded-2xl overflow-hidden border-4 border-gray-700">
          <MapContainer center={initialCenter} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            />
            {Object.entries(friendLocations).map(([username, pos]) => {
              const member = groupMembers.find(m => m.username === username);
              return (
                <Marker key={username} position={[pos.lat, pos.lng]}>
                  <Popup>{member ? member.name : 'Unknown'}</Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
      
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => alert("SOS Activated! This would contact authorities and your emergency contacts.")}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-full font-bold shadow-2xl animate-pulse"
        >
          <PhoneIcon className="text-xl w-6 h-6" />
          SOS
        </button>
      </div>
    </div>
  );
}