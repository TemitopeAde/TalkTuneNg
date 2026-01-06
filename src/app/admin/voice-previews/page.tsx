"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Play, Check, X } from 'lucide-react';

interface GenerationResult {
    voiceId: string;
    status: 'generated' | 'exists' | 'error';
    audioUrl?: string;
    fileSize?: number;
    error?: string;
}

interface GenerationSummary {
    total: number;
    generated: number;
    existing: number;
    errors: number;
}

const VoicePreviewAdmin = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<GenerationResult[]>([]);
    const [summary, setSummary] = useState<GenerationSummary | null>(null);

    const generatePreviews = async () => {
        setIsGenerating(true);
        setResults([]);
        setSummary(null);

        try {
            toast.info("Starting voice preview generation...");

            const response = await fetch('/api/voice-preview/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setResults(data.results);
                setSummary(data.summary);
                toast.success("Voice preview generation completed!");
            } else {
                toast.error(`Failed to generate previews: ${data.error}`);
            }

        } catch (error) {
            console.error('Error generating previews:', error);
            toast.error("An error occurred while generating previews");
        } finally {
            setIsGenerating(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'generated':
                return <Check className="w-4 h-4 text-green-500" />;
            case 'exists':
                return <Check className="w-4 h-4 text-blue-500" />;
            case 'error':
                return <X className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'generated':
                return 'bg-green-100 text-green-800';
            case 'exists':
                return 'bg-blue-100 text-blue-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'N/A';
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(2)} MB`;
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Voice Preview Generator</CardTitle>
                    <CardDescription>
                        Generate and save voice previews for all YarnGPT voices. This will create audio previews using the text:
                        "Culture shapes identity, values, and traditions, connecting generations through language, art, and beliefs while fostering understanding, respect, and unity in an increasingly diverse and interconnected world."
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Button
                        onClick={generatePreviews}
                        disabled={isGenerating}
                        className="w-full"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Previews...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-2" />
                                Generate All Voice Previews
                            </>
                        )}
                    </Button>

                    {summary && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Generation Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
                                        <div className="text-sm text-gray-600">Total Voices</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{summary.generated}</div>
                                        <div className="text-sm text-gray-600">Generated</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">{summary.existing}</div>
                                        <div className="text-sm text-gray-600">Already Existed</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
                                        <div className="text-sm text-gray-600">Errors</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {results.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Detailed Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {results.map((result, index) => (
                                        <div
                                            key={result.voiceId}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                {getStatusIcon(result.status)}
                                                <div>
                                                    <div className="font-medium capitalize">{result.voiceId}</div>
                                                    {result.error && (
                                                        <div className="text-sm text-red-600">{result.error}</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                {result.fileSize && (
                                                    <span className="text-sm text-gray-600">
                                                        {formatFileSize(result.fileSize)}
                                                    </span>
                                                )}

                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}
                                                >
                                                    {result.status}
                                                </span>

                                                {result.audioUrl && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            const audio = new Audio(result.audioUrl);
                                                            audio.play().catch(err => {
                                                                console.error('Error playing audio:', err);
                                                                toast.error('Failed to play audio');
                                                            });
                                                        }}
                                                    >
                                                        <Play className="w-3 h-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VoicePreviewAdmin;