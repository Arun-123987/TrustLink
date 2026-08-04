console.log("✅ workerController loaded");
const Worker = require("../models/Worker");
const JobRequest = require("../models/JobRequest");

/**
 * POST /api/workers/register
 */
const registerWorker = async (req, res) => {
  try {
    const {
      fullName,
      skills,
      experience,
      hourlyRate,
      serviceRadius,
      languages,
      bio,
      profilePhoto,
      location,
    } = req.body;

    // Check if worker profile already exists
    const existingWorker = await Worker.findOne({
      user: req.user._id,
    });

    if (existingWorker) {
      return res.status(400).json({
        success: false,
        message: "Worker profile already exists",
      });
    }

    const worker = await Worker.create({
      user: req.user._id,
      phone: req.user.phone,
      fullName,
      skills,
      experience,
      hourlyRate,
      serviceRadius,
      languages,
      bio,
      profilePhoto,
      location,
      isAvailable: false,
      verificationStatus: "pending",
    });

    // Update user's role
    req.user.role = "worker";
    await req.user.save();

    return res.status(201).json({
      success: true,
      message: "Worker profile created successfully",
      worker,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create worker profile",
    });
  }
};

const getNearbyWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({
      verificationStatus: "verified",
      isAvailable: true,
    })
      .populate("user", "phone")
      .sort({
  reputationScore: -1,
  createdAt: -1,
});

    return res.json({
      success: true,
      workers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/workers/me
 */
const getMyProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({
      user: req.user._id,
    }).populate("user", "-refreshToken");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      worker,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch worker profile",
    });
  }
};

/**
 * PUT /api/workers/me
 */
const updateMyProfile = async (req, res) => {
  try {
    const worker = await Worker.findOne({
      user: req.user._id,
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker profile not found",
      });
    }

    Object.assign(worker, req.body);

    await worker.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      worker,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

const getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate("user", "phone");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    return res.json({
      success: true,
      worker,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getWorkerDashboard = async (req, res) => {
  try {
    const worker = await Worker.findOne({
      user: req.user._id,
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    const pending = await JobRequest.countDocuments({
      worker: worker._id,
      status: "pending",
    });

    const accepted = await JobRequest.countDocuments({
      worker: worker._id,
      status: "accepted",
    });

    const completed = await JobRequest.countDocuments({
      worker: worker._id,
      status: "completed",
    });

    return res.json({
      success: true,
      worker: {
        fullName: worker.fullName,
        verificationStatus: worker.verificationStatus,
        isAvailable: worker.isAvailable,
      },
      stats: {
        pending,
        accepted,
        completed,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerWorker,
  getMyProfile,
  updateMyProfile,
  getWorkerDashboard,
  getWorkerById,
  getNearbyWorkers,
};