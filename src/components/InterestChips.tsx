import React from 'react';
import { X } from 'lucide-react';

interface InterestChipsProps {
  availableInterests: string[];
  selectedInterests: string[];
  onInterestToggle: (interest: string) => void;
  className?: string;
}

export function InterestChips({ 
  availableInterests, 
  selectedInterests, 
  onInterestToggle,
  className = '' 
}: InterestChipsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {availableInterests.map((interest) => {
        const isSelected = selectedInterests.includes(interest);
        
        return (
          <button
            key={interest}
            onClick={() => onInterestToggle(interest)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
              isSelected
                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{interest}</span>
            {isSelected && <X className="w-3 h-3" />}
          </button>
        );
      })}
    </div>
  );
}
