"use client";

import React, { useState } from "react";
import PrimaryBtn from "@/components/buttons/PrimaryBtn";
import Content from "@/components/Content";
import Footer from "@/components/Footer";
import TextAreaInput from "@/components/inputs/TextAreaInput";
import TextInput from "@/components/inputs/TextInput";
import Testimonials from "@/components/Testimonials";
import { Spiral } from "@/constants/Icons";
import Image from "next/image";

const Page = () => {
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

    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send message");
        return;
      }

      setSuccess(data.message || "Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center -mt-16 w-full h-full">
      <section className="relative rounded-b-[64px] pt-[200px] bg-background pb-20 h-full flex w-full px-6 md:px-[100px] overflow-hidden justify-center items-center flex-col text-white">
        <div className="fixed w-full -bottom-20 justify-end flex items-end h-[600px]">
          <Image src={Spiral} alt="Spiral" fill className="object-cover" />
        </div>
        <div className="w-full max-w-3xl">
          <div className="flex flex-col justify-center items-center gap-4 mb-28">
            <h3 className="uppercase font-semibold text-base md:text-2xl text-center">
              Get Early Access
            </h3>
            <h3 className="font-bold text-3xl max-w-3xl text-center md:text-5xl">
              Send us a message, Let's help
            </h3>
          </div>
          <div
            className="w-1/2 h-[400px] bg-[#A8EF4370] rounded-full absolute -top-20 
          transform blur-[200px] -z-1"
          />

          {/* ✅ Form logic added, styles untouched */}
          <form onSubmit={handleSubmit} className="flex w-full flex-1 gap-4 flex-col">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg">
                <p className="text-green-500 text-sm">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="fullname">Full name</label>
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
            </div>

            <PrimaryBtn
              label={loading ? "Sending..." : "Send Message"}
              type="submit"
              disabled={loading}
            />
          </form>
        </div>
      </section>
      <Content />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Page;
