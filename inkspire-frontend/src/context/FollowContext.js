import React, { createContext, useContext, useState } from 'react';

const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
  const [followTrigger, setFollowTrigger] = useState(0);

  const triggerFollowUpdate = () => {
    setFollowTrigger(prev => prev + 1);
  };

  return (
    <FollowContext.Provider value={{ followTrigger, triggerFollowUpdate }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => useContext(FollowContext);