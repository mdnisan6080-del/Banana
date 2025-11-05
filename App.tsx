
import React, { useState } from 'react';
import { Tab } from './types';
import Tabs from './components/common/Tabs';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import ProStudio from './components/ProStudio';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.IMAGE_GENERATOR);

    const renderContent = () => {
        switch (activeTab) {
            case Tab.IMAGE_GENERATOR:
                return <ImageGenerator />;
            case Tab.IMAGE_EDITOR:
                return <ImageEditor />;
            case Tab.PRO_STUDIO:
                return <ProStudio />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <span className="text-3xl">🍌</span>
                        <h1 className="text-2xl font-bold text-yellow-300">Banana Studio</h1>
                    </div>
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                {renderContent()}
            </main>
             <footer className="text-center p-4 text-gray-500 text-sm">
                <p>Powered by Google Gemini. UI designed for creativity and performance.</p>
            </footer>
        </div>
    );
};

export default App;