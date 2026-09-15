const User = require("../models/User");
const Worker = require("../models/Worker");
const JobRequest = require("../models/JobRequest");

const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalWorkers,
      pendingWorkers,
      verifiedWorkers,
      totalJobs,
      completedJobs,
      pendingJobs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Worker.countDocuments(),
      Worker.countDocuments({
        verificationStatus: "pending",
      }),
      Worker.countDocuments({
        verificationStatus: "verified",
      }),
      JobRequest.countDocuments(),
      JobRequest.countDocuments({
        status: "completed",
      }),
      JobRequest.countDocuments({
        status: "pending",
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCustomers,
        totalWorkers,
        pendingWorkers,
        verifiedWorkers,
        totalJobs,
        completedJobs,
        pendingJobs,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard",
    });
  }
};

const getPendingWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({
      verificationStatus: "pending",
    })
      .populate("user", "phone displayName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      workers,
    });
  } catch (error) {
    console.error("Pending workers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load pending workers",
    });
  }
};

const verifyWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    worker.verificationStatus = "verified";

    await worker.save();

    res.json({
      success: true,
      message: "Worker verified successfully",
      worker,
    });
  } catch (error) {
    console.error("Verify worker error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to verify worker",
    });
  }
};

const rejectWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    worker.verificationStatus = "rejected";

    await worker.save();

    res.json({
      success: true,
      message: "Worker rejected",
      worker,
    });
  } catch (error) {
    console.error("Reject worker error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reject worker",
    });
  }
};

module.exports = {
  getDashboard,
  getPendingWorkers,
  verifyWorker,
  rejectWorker,
};