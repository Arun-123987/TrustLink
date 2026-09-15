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

    if (
      !workerId ||
      !title?.trim() ||
      !description?.trim() ||
      !address?.trim() ||
      !scheduledDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All booking fields are required",
      });
    }

    const worker = await Worker.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    if (worker.verificationStatus !== "verified") {
      return res.status(400).json({
        success: false,
        message: "Worker is not verified",
      });
    }

    if (!worker.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Worker is currently unavailable",
      });
    }

    const bookingDate = new Date(scheduledDate);

    if (Number.isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date",
      });
    }

    if (bookingDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date must be in the future",
      });
    }

    // Prevent duplicate pending/accepted booking
    const existingBooking = await JobRequest.findOne({
      customer: req.user._id,
      worker: worker._id,
      status: {
        $in: ["pending", "accepted"],
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message:
          "You already have an active booking with this worker",
      });
    }

    /*
     * Identify the worker skill related to the customer's
     * requested service.
     *
     * Example:
     * Customer enters "House Wiring"
     *
     * Worker skill:
     * category: "Electrician"
     * subcategory: "House Wiring"
     *
     * Stored booking:
     * serviceCategory: "Electrician"
     * serviceType: "House Wiring"
     */

    const requestedService = title.trim().toLowerCase();

    let matchedSkill = null;

    if (Array.isArray(worker.skills)) {
      matchedSkill = worker.skills.find((skill) => {
        const category =
          skill.category?.toLowerCase() || "";

        const subcategory =
          skill.subcategory?.toLowerCase() || "";

        return (
          category.includes(requestedService) ||
          subcategory.includes(requestedService) ||
          requestedService.includes(category) ||
          requestedService.includes(subcategory)
        );
      });
    }

    const serviceCategory =
      matchedSkill?.category || "";

    const serviceType =
      matchedSkill?.subcategory || title.trim();

    const job = await JobRequest.create({
      customer: req.user._id,
      worker: worker._id,

      title: title.trim(),
      description: description.trim(),

      serviceCategory,
      serviceType,

      address: address.trim(),
      scheduledDate: bookingDate,

      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Booking request created successfully",
      job,
    });
  } catch (error) {
    console.error("Create Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create booking request",
    });
  }
};

// Worker: get incoming jobs
const getWorkerJobs = async (req, res) => {
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

    const jobs = await JobRequest.find({
      worker: worker._id,
    })
      .populate("customer", "name displayName phone")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error("Get Worker Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch worker jobs",
    });
  }
};

// Worker: accept pending job
const acceptJob = async (req, res) => {
  try {
    const worker = await Worker.findOne({
      user: req.user._id,
    });

    if (!worker) {
      return res.status(403).json({
        success: false,
        message: "Only workers can accept jobs",
      });
    }

    const job = await JobRequest.findOne({
      _id: req.params.id,
      worker: worker._id,
      status: "pending",
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Pending job not found",
      });
    }

    job.status = "accepted";

    await job.save();

    return res.json({
      success: true,
      message: "Job accepted",
      job,
    });
  } catch (error) {
    console.error("Accept Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to accept job",
    });
  }
};

// Worker: reject pending job
const rejectJob = async (req, res) => {
  try {
    const worker = await Worker.findOne({
      user: req.user._id,
    });

    if (!worker) {
      return res.status(403).json({
        success: false,
        message: "Only workers can reject jobs",
      });
    }

    const job = await JobRequest.findOne({
      _id: req.params.id,
      worker: worker._id,
      status: "pending",
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Pending job not found",
      });
    }

    job.status = "rejected";

    await job.save();

    return res.json({
      success: true,
      message: "Job rejected",
      job,
    });
  } catch (error) {
    console.error("Reject Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reject job",
    });
  }
};

// Worker: mark accepted job as completed
const completeJob = async (req, res) => {
  try {
    const worker = await Worker.findOne({
      user: req.user._id,
    });

    if (!worker) {
      return res.status(403).json({
        success: false,
        message: "Only workers can complete jobs",
      });
    }

    const job = await JobRequest.findOne({
      _id: req.params.id,
      worker: worker._id,
      status: "accepted",
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Accepted job not found",
      });
    }

    job.status = "completed";

    await job.save();

    return res.json({
      success: true,
      message: "Job marked as completed",
      job,
    });
  } catch (error) {
    console.error("Complete Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to complete job",
    });
  }
};

// Customer: cancel pending or accepted booking
const cancelJob = async (req, res) => {
  try {
    const job = await JobRequest.findOne({
      _id: req.params.id,
      customer: req.user._id,
      status: {
        $in: ["pending", "accepted"],
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Active booking not found or cannot be cancelled",
      });
    }

    job.status = "cancelled";

    await job.save();

    return res.json({
      success: true,
      message: "Booking cancelled",
      job,
    });
  } catch (error) {
    console.error("Cancel Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};

// Customer: booking history
const getCustomerJobs = async (req, res) => {
  try {
    const jobs = await JobRequest.find({
      customer: req.user._id,
    })
      .populate({
        path: "worker",
        select:
          "fullName skills hourlyRate profilePhoto reputationScore verificationStatus",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get Customer Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

module.exports = {
  createJob,
  getWorkerJobs,
  getCustomerJobs,
  acceptJob,
  rejectJob,
  completeJob,
  cancelJob,
};