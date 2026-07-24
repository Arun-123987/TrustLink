import { createContext, useContext, useState } from "react";

const WorkerRegistrationContext = createContext();

export const WorkerRegistrationProvider = ({ children }) => {
  const [workerData, setWorkerData] = useState({
    fullName: "",
    bio: "",
    experience: "",
    hourlyRate: {
      min: "",
      max: "",
    },
    serviceRadius: "",
    languages: [],
    skills: [],
    profilePhoto: "",
    location: null,
  });

  const updateWorkerData = (data) => {
    setWorkerData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const resetWorkerData = () => {
    setWorkerData({
      fullName: "",
      bio: "",
      experience: "",
      hourlyRate: {
        min: "",
        max: "",
      },
      serviceRadius: "",
      languages: [],
      skills: [],
      profilePhoto: "",
      location: null,
    });
  };

  return (
    <WorkerRegistrationContext.Provider
      value={{
        workerData,
        updateWorkerData,
        resetWorkerData,
      }}
    >
      {children}
    </WorkerRegistrationContext.Provider>
  );
};

export const useWorkerRegistration = () =>
  useContext(WorkerRegistrationContext);