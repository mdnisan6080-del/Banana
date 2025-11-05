
import React, { useState, useCallback } from 'react';
import { proTaskWithThinking, searchWithGrounding } from '../services/geminiService';
import { GroundingSource } from '../types';
import Button from './common/Button';

const ProStudio: React.FC = () => {
    const [thinkingPrompt, setThinkingPrompt] = useState('');
    const [thinkingResult, setThinkingResult] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [thinkingError, setThinkingError] = useState<string | null>(null);
    
    const [searchPrompt, setSearchPrompt] = useState('');
    const [searchResult, setSearchResult] = useState<{ text: string; sources: GroundingSource[] }>({ text: '', sources: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const handleThinkingSubmit = useCallback(async () => {
        if (!thinkingPrompt.trim()) return;
        setIsThinking(true);
        setThinkingError(null);
        setThinkingResult('');
        try {
            const result = await proTaskWithThinking(thinkingPrompt);
            setThinkingResult(result);
        } catch (e) {
            console.error(e);
            setThinkingError("An error occurred during the thinking process.");
        } finally {
            setIsThinking(false);
        }
    }, [thinkingPrompt]);

    const handleSearchSubmit = useCallback(async () => {
        if (!searchPrompt.trim()) return;
        setIsSearching(true);
        setSearchError(null);
        setSearchResult({ text: '', sources: [] });
        try {
            const { text, sources } = await searchWithGrounding(searchPrompt);
            const formattedSources = sources.map(s => ({
                uri: s.web?.uri || '#',
                title: s.web?.title || 'Unknown Source'
            }));
            setSearchResult({ text, sources: formattedSources });
        } catch (e) {
            console.error(e);
            setSearchError("An error occurred during the web search.");
        } finally {
            setIsSearching(false);
        }
    }, [searchPrompt]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* Thinking Mode */}
            <div className="flex flex-col space-y-4 bg-gray-800/50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-yellow-300">Deep Thinking Mode</h3>
                <p className="text-gray-400">For your most complex queries. The AI will take more time to reason and provide a comprehensive response. Powered by Gemini 2.5 Pro.</p>
                <textarea
                    value={thinkingPrompt}
                    onChange={(e) => setThinkingPrompt(e.target.value)}
                    placeholder="e.g., Write a Python script for a web app that visualizes real-time stock data..."
                    className="w-full h-32 p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                    disabled={isThinking}
                />
                <Button onClick={handleThinkingSubmit} isLoading={isThinking} disabled={!thinkingPrompt.trim()}>
                    Engage Pro
                </Button>
                {thinkingError && <p className="text-red-400 text-center">{thinkingError}</p>}
                {thinkingResult && (
                    <div className="prose prose-invert prose-sm max-w-none bg-gray-900 p-4 rounded-md overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{thinkingResult}</pre>
                    </div>
                )}
            </div>

            {/* Web Search */}
            <div className="flex flex-col space-y-4 bg-gray-800/50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-yellow-300">Grounded Web Search</h3>
                <p className="text-gray-400">Get up-to-date and accurate information from the web for your questions. Powered by Gemini 2.5 Flash with Google Search.</p>
                <textarea
                    value={searchPrompt}
                    onChange={(e) => setSearchPrompt(e.target.value)}
                    placeholder="e.g., Who won the most medals at the last Olympics?"
                    className="w-full h-32 p-3 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                    disabled={isSearching}
                />
                <Button onClick={handleSearchSubmit} isLoading={isSearching} disabled={!searchPrompt.trim()}>
                    Search Web
                </Button>
                {searchError && <p className="text-red-400 text-center">{searchError}</p>}
                {searchResult.text && (
                    <div className="space-y-4">
                        <div className="prose prose-invert prose-sm max-w-none bg-gray-900 p-4 rounded-md">
                            <p>{searchResult.text}</p>
                        </div>
                        {searchResult.sources.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-gray-300">Sources:</h4>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    {searchResult.sources.map((source, index) => (
                                        <li key={index}>
                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">
                                                {source.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProStudio;
