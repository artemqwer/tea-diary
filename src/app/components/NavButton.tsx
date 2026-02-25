import React from 'react';
import { useVibration } from './useVibration';

export const NavButton = ({
  tab,
  icon,
  label,
  activeTab,
  setActiveTab,
}: {
  tab: string;
  icon: React.ReactNode;
  label: string;
  activeTab: string;
  setActiveTab: (t: any) => void;
}) => {
  const { tap } = useVibration();
  return (
    <button
      onClick={() => {
        tap();
        setActiveTab(tab);
      }}
      className="flex flex-col items-center gap-1 p-2 transition-colors"
      style={{ color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)' }}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
};
