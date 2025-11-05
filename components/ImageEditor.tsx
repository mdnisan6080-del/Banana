import React, { useState, useCallback, ChangeEvent } from 'react';
import { editImageWithNanoBanana, enhancePrompt } from '../services/geminiService';
import Button from './common/Button';

const fileToGenerativePart = async (file: File): Promise<{ base64: string, mimeType: string }> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        base64: await base64EncodedDataPromise,
        mimeType: file.type,
    };
};

const urlToGenerativePart = async (url: string): Promise<{ base64: string, mimeType: string }> => {
    if (url.startsWith('data:')) {
        const [meta, base64] = url.split(',');
        const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
        return { base64, mimeType };
    }
    // blob: URL
    const response = await fetch(url);
    const blob = await response.blob();
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
    });
    return {
        base64: await base64EncodedDataPromise,
        mimeType: blob.type,
    };
};


const ImageEditor: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [history, setHistory] = useState<{ prompt: string; url: string; file?: File }[]>([]);
    const [activeHistoryIndex, setActiveHistoryIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setHistory([{ prompt: 'Original', url: imageUrl, file }]);
            setActiveHistoryIndex(0);
            setError(null);
            setPrompt('');
        }
    };
    
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
        if (!prompt.trim() || history.length === 0) {
            setError("Please upload an image and provide an edit prompt.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const currentImageState = history[activeHistoryIndex];
            const generativePart = currentImageState.file 
                ? await fileToGenerativePart(currentImageState.file)
                : await urlToGenerativePart(currentImageState.url);

            const resultUrl = await editImageWithNanoBanana(prompt, generativePart.base64, generativePart.mimeType);
            
            const newHistory = history.slice(0, activeHistoryIndex + 1);
            newHistory.push({ prompt, url: resultUrl });
            
            setHistory(newHistory);
            setActiveHistoryIndex(newHistory.length - 1);
            setPrompt('');

        } catch (e) {
            console.error(e);
            setError("Failed to edit image. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [prompt, history, activeHistoryIndex]);

    const handleHistorySelect = (index: number) => {
        setActiveHistoryIndex(index);
    };

    const hasImage = history.length > 0;
    const originalImageUrl = history[0]?.url;
    const currentEditedUrl = activeHistoryIndex > 0 ? history[activeHistoryIndex]?.url : null;

    return (
        <div className="animate-fade-in space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-yellow-300">Banana Studio Image Editor</h2>
                <p className="text-gray-400 mt-2">Upload an image and tell me how you'd like to change it. Powered by Gemini 2.5 Flash Image.</p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-4">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="edit-prompt-input" className="block text-sm font-medium text-gray-300">Your Edit Prompt</label>
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
                        id="edit-prompt-input"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Add a retro filter, or remove the person in the background"
                        className="w-full h-24 p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                        disabled={isLoading || isEnhancing || !hasImage}
                    />
                </div>
                 <div className="flex flex-col sm:flex-row gap-4">
                    <label htmlFor="file-upload" className="flex-1 cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg text-center transition">
                        {hasImage ? `Selected: ${history[0].file?.name}` : "Upload Image"}
                    </label>
                    <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    
                    <Button onClick={handleSubmit} isLoading={isLoading} disabled={!prompt.trim() || !hasImage || isEnhancing} className="flex-1">
                        Apply Edit
                    </Button>
                </div>
                {error && <p className="text-red-400 text-center">{error}</p>}
                
                {history.length > 1 && (
                    <div className="space-y-2 pt-4">
                        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">History</h3>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-2 max-h-48 overflow-y-auto">
                            <ul className="space-y-1">
                                {history.map((item, index) => (
                                    <li key={index}>
                                        <button
                                            onClick={() => handleHistorySelect(index)}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 truncate ${
                                                activeHistoryIndex === index
                                                    ? 'bg-yellow-400 text-gray-900 font-semibold'
                                                    : 'text-gray-300 hover:bg-gray-700/50'
                                            }`}
                                            title={item.prompt}
                                        >
                                            {item.prompt}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center">
                    <h3 className="font-semibold mb-2 text-gray-400">Original</h3>
                    <div className="w-full aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center p-2">
                        {hasImage ? 
                            <img src={originalImageUrl} alt="Original" className="max-w-full max-h-full object-contain rounded-md"/> :
                            <p className="text-gray-500">Upload an image to start</p>
                        }
                    </div>
                </div>
                 <div className="flex flex-col items-center space-y-4">
                    <h3 className="font-semibold mb-2 text-gray-400">Edited</h3>
                    <div className="w-full aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center p-2">
                        {isLoading && <div className="text-center"><p>Editing in progress...</p></div>}
                        {!isLoading && currentEditedUrl && 
                            <img src={currentEditedUrl} alt="Edited" className="max-w-full max-h-full object-contain rounded-md"/>
                        }
                        {!isLoading && !currentEditedUrl &&
                             <p className="text-gray-500">Your edited image will appear here</p>
                        }
                    </div>
                    {!isLoading && currentEditedUrl && (
                         <a
                            href={currentEditedUrl}
                            download="edited-with-banana-studio.png"
                            className="inline-flex items-center justify-center gap-2 w-full max-w-xs bg-gray-700 text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download This Edit
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
