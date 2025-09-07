import React from 'react';
import { Clock, Calendar, Zap } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'all' | 'happening-soon' | 'make-it-in-time';
  onTabChange: (tab: 'all' | 'happening-soon' | 'make-it-in-time') => void;
  eventCounts?: {
    all: number;
    happeningSoon: number;
    makeItInTime: number;
  };
}

export function TabNavigation({ activeTab, onTabChange, eventCounts }: TabNavigationProps) {
  const tabs = [
    {
      id: 'all' as const,
      label: 'All',
      icon: Calendar,
      count: eventCounts?.all,
    },
    {
      id: 'happening-soon' as const,
      label: 'Happening Soon',
      icon: Clock,
      count: eventCounts?.happeningSoon,
    },
    {
      id: 'make-it-in-time' as const,
      label: 'Make It In Time',
      icon: Zap,
      count: eventCounts?.makeItInTime,
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="-mb-px flex space-x-8 px-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
