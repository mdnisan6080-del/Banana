import React, { useState, useCallback } from 'react';
import { generateImageWithImagen, enhancePrompt } from '../services/geminiService';
import { AspectRatio } from '../types';
import Button from './common/Button';

const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleEnhancePrompt = useCallback(async () => {
        if (!prompt.trim() || isEnhancing) return;
        setIsEnhancing(true);
        setError(null);
        try {
            const enhanced = await enhancePrompt(prompt);
            setPrompt(enhanced);
        } catch (e) {
            console.error(e);
            setError("Failed to enhance prompt. Please try again.");
        } finally {
            setIsEnhancing(false);
        }
    }, [prompt, isEnhancing]);

    const handleSubmit = useCallback(async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageUrl = await generateImageWithImagen(prompt, aspectRatio);
            setGeneratedImage(imageUrl);
        } catch (e) {
            console.error(e);
            setError("Failed to generate image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aspectRatio]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            <div className="flex flex-col space-y-6">
                <h2 className="text-3xl font-bold text-yellow-300">Image Generator</h2>
                <p className="text-gray-400">Describe the image you want to create. Be as detailed as you like. Powered by Imagen 4.</p>
                
                <div className="space-y-4">
                     <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-300">Your Prompt</label>
                            <button 
                                onClick={handleEnhancePrompt}
                                disabled={!prompt.trim() || isEnhancing || isLoading}
                                className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                {isEnhancing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enhancing...
                                    </>
                                ) : (
                                    '✨ Enhance Prompt'
                                )}
                            </button>
                        </div>
                        <textarea
                            id="prompt-input"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A cinematic shot of a raccoon in a tiny detective trench coat, exploring a futuristic city at night"
                            className="w-full h-32 p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                            disabled={isLoading || isEnhancing}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                        <div className="grid grid-cols-5 gap-2">
                            {aspectRatios.map(ar => (
                                <button key={ar} onClick={() => setAspectRatio(ar)}
                                    disabled={isLoading}
                                    className={`p-2 rounded-md text-sm transition disabled:opacity-50 ${aspectRatio === ar ? 'bg-yellow-400 text-gray-900 font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}
                                >
                                    {ar}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <Button onClick={handleSubmit} isLoading={isLoading} disabled={!prompt.trim() || isEnhancing}>
                    Generate Image
                </Button>
                {error && <p className="text-red-400 text-center">{error}</p>}
            </div>

            <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col items-center justify-center min-h-[300px] md:min-h-0 space-y-4">
                {isLoading && <div className="text-center flex-grow flex items-center justify-center"><p>Generating your masterpiece...</p></div>}
                {!isLoading && generatedImage && (
                    <>
                        <div className="flex-grow flex items-center justify-center w-full">
                            <img src={generatedImage} alt="Generated art" className="max-w-full max-h-full object-contain rounded-md shadow-lg" />
                        </div>
                        <a
                            href={generatedImage}
                            download="generated-by-banana-studio.jpg"
                            className="inline-flex items-center justify-center gap-2 w-full max-w-xs bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download Image
                        </a>
                    </>
                )}
                 {!isLoading && !generatedImage && (
                    <div className="text-center text-gray-500 flex-grow flex items-center justify-center">
                        <p>Your generated image will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;