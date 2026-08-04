import api from "./api";

export const createJob = async (jobData) => {
  const response = await api.post("/jobs", jobData);
  return response.data;
};

export const getWorkerJobs = async () => {
  const res = await api.get("/jobs/worker");
  return res.data;
};

export const acceptJob = async (id) => {
  const res = await api.patch(`/jobs/${id}/accept`);
  return res.data;
};

export const rejectJob = async (id) => {
  const res = await api.patch(`/jobs/${id}/reject`);
  return res.data;
};