"use client";

import ChangePassword from "@/components/ChangePassword";
import TextInput from "@/components/inputs/TextInput";
import Preferences from "@/components/Preferences";
import Support from "@/components/Support";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import { useStore } from "@/hooks/useStore";
import { Bell, Camera, HelpCircle } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

const Page = () => {
  const { onOpen } = useStore();
  const [countryCode, setCountryCode] = useState("+234");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get('/api/user/profile');

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setFormData({
              name: data.user.name || "",
              email: data.user.email || "",
              phoneNumber: data.user.phoneNumber || "",
            });

            // Set country code if available
            if (data.user.countryCode) {
              setCountryCode(`+${data.user.countryCode}`);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccess(null);

    // Check if at least one field has data
    const hasName = formData.name.trim() !== "";
    const hasPhone = formData.phoneNumber.trim() !== "";

    if (!hasName && !hasPhone) {
      setError("Please fill in at least one field to update");
      return;
    }

    // Validate phone number only if provided
    if (hasPhone && !/^\d{10,15}$/.test(formData.phoneNumber)) {
      setError("Phone number must be 10-15 digits");
      return;
    }

    // Validate name only if provided
    if (hasName && formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    setLoading(true);

    try {
      // Build request body with only filled fields
      const requestBody: any = {};
      
      if (hasName) {
        requestBody.name = formData.name;
      }
      
      if (hasPhone) {
        requestBody.phoneNumber = formData.phoneNumber;
        requestBody.countryCode = countryCode.replace('+', '');
      }

      const response = await apiClient.put('/api/user/profile', requestBody);

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }

      // Success
      setSuccess(data.message || 'Profile updated successfully');
      
      // Update form data with the returned user data
      if (data.user) {
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          phoneNumber: data.user.phoneNumber || "",
        });
        
        if (data.user.countryCode) {
          setCountryCode(`+${data.user.countryCode}`);
        }
      }

    } catch (err) {
      console.error('Profile update error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 overflow-y-auto min-h-[90vh] md:min-h-screen">
      {loadingProfile ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading profile...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="grid grid-cols-2 md:flex mt-6 items-center gap-4">
          <div className="border-l cursor-pointer border-accent-foreground rounded-sm flex bg-[#2D3E4280] items-center space-x-2 px-4 py-2.5">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.5 22H6.59087C5.04549 22 3.81631 21.248 2.71266 20.1966C0.453366 18.0441 4.1628 16.324 5.57757 15.4816C8.12805 13.9629 11.2057 13.6118 14 14.4281"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M18.4332 13.8485C18.7685 13.4851 18.9362 13.3035 19.1143 13.1975C19.5442 12.9418 20.0736 12.9339 20.5107 13.1765C20.6918 13.2771 20.8646 13.4537 21.2103 13.8067C21.5559 14.1598 21.7287 14.3364 21.8272 14.5214C22.0647 14.9679 22.0569 15.5087 21.8066 15.9478C21.7029 16.1298 21.5251 16.3011 21.1694 16.6437L16.9378 20.7194C16.2638 21.3686 15.9268 21.6932 15.5056 21.8577C15.0845 22.0222 14.6214 22.0101 13.6954 21.9859L13.5694 21.9826C13.2875 21.9752 13.1466 21.9715 13.0646 21.8785C12.9827 21.7855 12.9939 21.6419 13.0162 21.3548L13.0284 21.1988C13.0914 20.3906 13.1228 19.9865 13.2807 19.6232C13.4385 19.2599 13.7107 18.965 14.2552 18.375L18.4332 13.8485Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-medium text-sm">Personal Information</span>
          </div>
          <div
            onClick={() => onOpen("modal", <ChangePassword />)}
            className="border-l cursor-pointer border-accent-foreground rounded-sm flex bg-[#2D3E4280] items-center space-x-2 px-4 py-2.5"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.5 22H6.59087C5.04549 22 3.81631 21.248 2.71266 20.1966C0.453366 18.0441 4.1628 16.324 5.57757 15.4816C8.12805 13.9629 11.2057 13.6118 14 14.4281"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.5 6.5C16.5 8.98528 14.4853 11 12 11C9.51472 11 7.5 8.98528 7.5 6.5C7.5 4.01472 9.51472 2 12 2C14.4853 2 16.5 4.01472 16.5 6.5Z"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M18.4332 13.8485C18.7685 13.4851 18.9362 13.3035 19.1143 13.1975C19.5442 12.9418 20.0736 12.9339 20.5107 13.1765C20.6918 13.2771 20.8646 13.4537 21.2103 13.8067C21.5559 14.1598 21.7287 14.3364 21.8272 14.5214C22.0647 14.9679 22.0569 15.5087 21.8066 15.9478C21.7029 16.1298 21.5251 16.3011 21.1694 16.6437L16.9378 20.7194C16.2638 21.3686 15.9268 21.6932 15.5056 21.8577C15.0845 22.0222 14.6214 22.0101 13.6954 21.9859L13.5694 21.9826C13.2875 21.9752 13.1466 21.9715 13.0646 21.8785C12.9827 21.7855 12.9939 21.6419 13.0162 21.3548L13.0284 21.1988C13.0914 20.3906 13.1228 19.9865 13.2807 19.6232C13.4385 19.2599 13.7107 18.965 14.2552 18.375L18.4332 13.8485Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-medium text-sm">Change Password</span>
          </div>
          <div
            onClick={() => onOpen("modal", <Preferences />)}
            className="border-l cursor-pointer border-accent-foreground rounded-sm flex bg-[#2D3E4280] items-center space-x-2 px-4 py-2.5"
          >
            <Bell />
            <span className="font-medium text-sm">Preference</span>
          </div>
          <div
            onClick={() => onOpen("modal", <Support />)}
            className="border-l md:hidden cursor-pointer border-accent-foreground rounded-sm flex bg-[#2D3E4280] items-center space-x-2 px-4 py-2.5"
          >
            <HelpCircle />
            <span className="font-medium text-sm">Support</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="my-20">
        <div className="flex flex-col w-fit justify-center pb-2 items-center">
          <div className="relative h-[120px] w-[120px] rounded-full">
            <Image
              src={"/images/dummy4.png"}
              fill
              alt="Profile"
              className="object-cover rounded-full"
            />
            <div className="absolute bottom-0 right-0 flex justify-center items-center bg-white h-10 w-10 rounded-full cursor-pointer">
              <Camera className="text-green-800" />
            </div>
          </div>
          <span className="text-center font-semibold mt-2">{formData.name || "James Jones"}</span>
        </div>

        <div className="border-t py-6 border-gray-100 border-b">
          <h3 className="text-xl font-semibold">Personal Information</h3>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded-lg max-w-3xl">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500 rounded-lg max-w-3xl">
              <p className="text-green-500 text-sm">{success}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mt-5 max-w-3xl">
            <TextInput
              placeholder="Enter Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              containerclassname="ring-0 border-0 w-full"
              className="w-full border-0 ring-0"
            />

            <TextInput
              placeholder="Enter Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              containerclassname="ring-0 border-0"
              className="flex-1 border-0 ring-0"
              disabled
            />

            <div className="flex w-full">
              <div className="relative">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-4 py-3 bg-white/20 backdrop-blur-lg border border-gray-600 rounded-l-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 cursor-pointer h-[49px] min-w-[80px]"
                  disabled={loading}
                >
                  <option value="+234">+234</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+91">+91</option>
                </select>
                <svg
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              <TextInput
                placeholder="Enter phone no"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                containerclassname="ring-0 rounded-l-none min-w-[200px] border-0 flex-1"
                className="flex-1 border-0 ring-0"
              />
            </div>
          </div>

          <div className="mt-8 max-w-3xl">
            <PrimaryBtn 
              label={loading ? "Updating..." : "Update Profile"} 
              containerclass="w-full md:w-[300px]" 
              type="submit"
            />
          </div>
        </div>
        </form>
      </>
      )}
    </div>
  );
};

export default Page;