"use client";

import React, { useState } from "react";
import TextInput from "./inputs/TextInput";
import PrimaryBtn from "./buttons/PrimaryBtn";
import Image from "next/image";
import { Email, Phone, Pin } from "@/constants/Icons";
import Link from "next/link";
import TextAreaInput from "./inputs/TextAreaInput";
import { Loader2 } from "lucide-react";
import EarlyAccess from "./EarlyAccess";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("All fields are required");
      return;
    }

    if (formData.name.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (formData.message.length < 10) {
      setError("Message must be at least 10 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send message");
        return;
      }

      // Success
      setSuccess(data.message || "Message sent successfully!");

      // Clear form
      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact form error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-background py-20 md:px-[100px] px-6 h-full flex w-full overflow-hidden justify-center items-center flex-col text-white">
      <div
        className="w-1/2 h-full bg-[#A8EF4370] rounded-full absolute
             transform blur-[400px] -translate-x-1/2 -left-10 -z-1"
      />
      <div>
        <h2 className="font-bold text-3xl md:text-5xl max-w-5xl text-center mb-4">
          Get early access and start transforming your content
        </h2>

        <p className="text-center">
          To receive updates on development progress, launch dates, and special
          offers.
        </p>
      </div>

      <EarlyAccess />

      <div className="h-[1px] my-4 w-full max-w-4xl bg-white/30" />

      <div className="flex flex-col md:flex-row w-full justify-normal md:justify-between items-start mt-10 gap-6">
        <div className="flex flex-1 flex-col gap-6">
          <h2 className="text-3xl md:text-5xl font-bold">Contact Us</h2>
          <h2 className="">You have any question? we would like to help you</h2>
          <div className="flex flex-col gap-4">
            <div className="flex space-x-4 items-center">
              <Image src={Email} alt="Email" height={24} width={24} />

              <a href="mailto:talktuneng@gmail.com" className="underline">
                talktuneng@gmail.com
              </a>
            </div>
            <div className="flex space-x-4 items-center">
              <Image src={Phone} alt="Phone" height={24} width={24} />

              <a href="tel:+2347089750701" className="">
                +234 708 975 0701
              </a>
            </div>
            <div className="flex space-x-4 items-center">
              <Image src={Pin} alt="Location" height={24} width={24} />

              <Link href="" className="">
                Use 6 Olaosebikan street, Shomolu
              </Link>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-1 gap-4 flex-col">
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

          <div className="space-y-2">
            <label htmlFor="name">Full name</label>
            <TextInput
              placeholder="Enter fullname"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <TextInput
              placeholder="Enter email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message">Message</label>
            <TextAreaInput
              placeholder="Type your message..."
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              disabled={loading}
            />
            <p className="text-sm text-gray-400">
              {formData.message.length} / 1000 characters
            </p>
          </div>

          <PrimaryBtn 
            label={loading ? "Sending..." : "Send Message"}
            type="submit"
            disabled={loading}
            
          />
        </form>
      </div>
    </section>
  );
};

export default Contact;