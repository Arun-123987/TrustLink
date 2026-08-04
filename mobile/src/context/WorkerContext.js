import { createContext, useContext, useState } from "react";

const WorkerContext = createContext();

export const WorkerProvider = ({ children }) => {
  const [selectedWorker, setSelectedWorker] = useState(null);

  return (
    <WorkerContext.Provider
      value={{
        selectedWorker,
        setSelectedWorker,
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
};

export const useWorker = () => useContext(WorkerContext);