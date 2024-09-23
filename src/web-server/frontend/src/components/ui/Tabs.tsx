import React from 'react';

interface Tab {
  value: string | number; // Tab value can be either string or number
  label: string; // Tab label is a string
}

interface TabsProps {
  tabs: Tab[]; // Array of tabs
  activeTab: string | number; // The currently active tab's value
  onTabChange: (value: string | number) => void; // Function to handle tab change
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-300 mb-12 gap-8">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`p-2 text-xs font-medium uppercase ${
            activeTab === tab.value
              ? 'text-blue-500 border-b-2 border-black'
              : 'text-gray-500'
          }`}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label} {/* Ensure only the label is rendered */}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
