
import React from 'react';
import { Tab } from '../../types';

interface TabsProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
    const tabs = Object.values(Tab);

    return (
        <nav className="flex items-center bg-gray-700/50 rounded-full p-1 space-x-1">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
                        ${activeTab === tab 
                            ? 'bg-yellow-400 text-gray-900 shadow-md' 
                            : 'text-gray-300 hover:bg-gray-600/50'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </nav>
    );
};

export default Tabs;
