// src/components/GoogleLoginButton.jsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function GoogleLoginButton({ isSignUp }) {
  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save your own backend token (not Google’s)
        localStorage.setItem('accessToken', data.access_token);
        // redirect if needed
        window.location.href = '/digital-id';
      } else {
        alert(data.message || 'Google sign-in failed.');
      }
    } catch (err) {
      console.error('Error sending Google credential to backend:', err);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => {
        console.log('Google Sign In Failed');
      }}
    />
  );
}
