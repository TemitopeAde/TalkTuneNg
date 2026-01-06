"use client";

import React, { useState } from 'react';
import TextInput from './inputs/TextInput';
import PrimaryBtn from './buttons/PrimaryBtn';

const EarlyAccess = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/early-access", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Failed to register for early access");
                return;
            }

            setSuccess(data.message || "Successfully registered!");
            setEmail("");
        } catch (err) {
            console.error("Early access error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-6 flex-col my-10">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                    <p className="text-red-500 text-sm text-center">{error}</p>
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg">
                    <p className="text-green-500 text-sm text-center">{success}</p>
                </div>
            )}

            <div className="flex gap-6">
                <TextInput
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                        if (success) setSuccess(null);
                    }}
                    containerclassname="w-4/5 min-w-auto"
                    disabled={loading}
                />

                <PrimaryBtn 
                    label={loading ? "Get Early Access..." : "Get Early Access"}
                    type="submit"
                    disabled={loading}
                />
            </div>
            <p className="text-center">
                By clicking Sign Up you're confirming that you agree with our Terms
                and Conditions.
            </p>
        </form>
    );
};

export default EarlyAccess;