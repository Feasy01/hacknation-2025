import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OfficerViewContextType {
  isOfficerView: boolean;
  toggleOfficerView: () => void;
}

const OfficerViewContext = createContext<OfficerViewContextType | undefined>(undefined);

export const OfficerViewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOfficerView, setIsOfficerView] = useState(false);

  const toggleOfficerView = () => {
    setIsOfficerView((prev) => !prev);
  };

  return (
    <OfficerViewContext.Provider value={{ isOfficerView, toggleOfficerView }}>
      {children}
    </OfficerViewContext.Provider>
  );
};

export const useOfficerView = () => {
  const context = useContext(OfficerViewContext);
  if (context === undefined) {
    throw new Error('useOfficerView must be used within an OfficerViewProvider');
  }
  return context;
};

