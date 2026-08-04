console.log("Loading Job Controller...");
const JobRequest = require("../models/JobRequest");
const Worker = require("../models/Worker");

const createJob = async (req, res) => {
  try {
    const {
      workerId,
      title,
      description,
      address,
      scheduledDate,
    } = req.body;

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    const job = await JobRequest.create({
      customer: req.user._id,
      worker: worker._id,
      title,
      description,
      address,
      scheduledDate,
    });

    return res.status(201).json({
      success: true,
      job,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }   
};

// Get jobs for logged in worker
const getWorkerJobs = async (req, res) => {
  try {
    const worker = await Worker.findOne({ user: req.user._id });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    const jobs = await JobRequest.find({ worker: worker._id })
      .populate("customer", "name phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      jobs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Accept Job
const acceptJob = async (req, res) => {
  try {
    const job = await JobRequest.findById(req.params.id);

    if (!job)
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });

    job.status = "accepted";
    await job.save();

    res.json({
      success: true,
      message: "Job accepted",
      job,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Reject Job
const rejectJob = async (req, res) => {
  try {
    const job = await JobRequest.findById(req.params.id);

    if (!job)
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });

    job.status = "rejected";
    await job.save();

    res.json({
      success: true,
      message: "Job rejected",
      job,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createJob,
  getWorkerJobs,
  acceptJob,
  rejectJob,
};