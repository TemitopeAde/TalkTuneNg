"use client"

import { ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import PasswordInput from "./inputs/PasswordInput";
import PrimaryBtn from "./buttons/PrimaryBtn";
import { useStore } from "@/hooks/useStore";
import { ChangePasswordFormData } from "@/types";

const ChangePassword = () => {
  const { onClose } = useStore();

  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = (): boolean => {
    // Check if all fields are filled
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("All fields are required");
      return false;
    }

    // Check password length
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return false;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumber = /[0-9]/.test(formData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      setError("New password must contain at least one uppercase letter, one lowercase letter, and one number");
      return false;
    }

    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      return false;
    }

    // Check if new password is same as current
    if (formData.currentPassword === formData.newPassword) {
      setError("New password must be different from your current password");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccess(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookie-based auth
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        setError(data.error || 'Failed to update password');
        return;
      }

      // Success
      setSuccess(data.message || 'Password updated successfully');
      
      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Optionally close the form after a delay
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Password change error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full px-4 pt-8">
      <button
        onClick={onClose}
        className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <h2 className="text-2xl font-medium my-4">Change Password</h2>
      <h6 className="font-medium">Update your password</h6>
      
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-green-500 text-sm">{success}</p>
          </div>
        )}

        <PasswordInput
          placeholder="Existing password"
          type={showPasswords.current ? "text" : "password"}
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleInputChange}
          containerclassname="ring-0 border-0 w-full"
          className="w-full border-0 ring-0"
          showPassword={showPasswords.current}
          onTogglePassword={() => togglePasswordVisibility('current')}
        />
        
        <PasswordInput
          placeholder="New password"
          type={showPasswords.new ? "text" : "password"}
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          containerclassname="ring-0 border-0 w-full"
          className="w-full border-0 ring-0"
          showPassword={showPasswords.new}
          onTogglePassword={() => togglePasswordVisibility('new')}
        />

        <PasswordInput
          placeholder="Confirm new password"
          type={showPasswords.confirm ? "text" : "password"}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          containerclassname="ring-0 border-0 w-full"
          className="w-full border-0 ring-0"
          showPassword={showPasswords.confirm}
          onTogglePassword={() => togglePasswordVisibility('confirm')}
        />
        
        <div className="w-full flex justify-center items-center mt-20">
          <PrimaryBtn 
            label={loading ? "Updating..." : "Update"} 
            containerclass="w-[400px]" 
            type="submit"
          />
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;