"use client"

import React, { useState } from "react";
import PrimaryBtn from "./buttons/PrimaryBtn";
import { useStore } from "@/hooks/useStore";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const LogoutInfo = () => {
  const { onClose } = useStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if user is logged in with NextAuth (Google OAuth)
      if (session) {
        // Use NextAuth signOut for OAuth users
        await signOut({
          redirect: false,
          callbackUrl: '/auth/login'
        });

        // Close the modal
        onClose();

        // Redirect to login page
        router.push('/auth/login');
        router.refresh();
      } else {
        // Use custom logout API for JWT users (email/password)
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to logout');
          return;
        }

        // Close the modal
        onClose();

        // Redirect to login page
        router.push('/auth/login');
        router.refresh();
      }

    } catch (err) {
      console.error('Logout error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full h-full justify-center items-center">
      <div className="border-b border-white w-full">
        <h2 className="text-2xl font-semibold text-center py-4 mt-4">Logout</h2>
      </div>
      <div className="flex flex-col mt-6 items-center justify-center space-y-6">
        <p>Are you sure you want to logout</p>
        
        {/* Error Message */}
        {error && (
          <div className="w-full p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="flex space-x-4 items-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="border border-gray-50 rounded-sm px-6 py-2.5 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>No, Cancel</span>
          </button>
          <PrimaryBtn 
            label={loading ? "Logging out..." : "Yes, Continue"} 
            onClick={handleLogout}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default LogoutInfo;