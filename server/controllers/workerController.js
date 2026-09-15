console.log("✅ workerController loaded");
const Worker = require("../models/Worker");
const JobRequest = require("../models/JobRequest");
const Review = require("../models/Review");

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
    const { lat, lng, radius = 10, skill = "" } = req.query;

    const latitude = Number(lat);
    const longitude = Number(lng);
    const radiusKm = Number(radius);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required",
      });
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
      });
    }

    const query = {
      verificationStatus: "verified",
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusKm * 1000,
        },
      },
    };

    const searchText = skill.trim();

    if (searchText) {
      const searchTerms = searchText
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      query.skills = {
        $elemMatch: {
          $and: searchTerms.map((term) => ({
            $or: [
              {
                category: {
                  $regex: term,
                  $options: "i",
                },
              },
              {
                subcategory: {
                  $regex: term,
                  $options: "i",
                },
              },
            ],
          })),
        },
      };
    }

    const workers = await Worker.find(query)
      .select(
        "fullName phone skills experience hourlyRate serviceRadius languages bio profilePhoto location reputationScore verificationStatus isAvailable"
      )
      .limit(20)
      .lean();

    /*
     * No workers
     */
    if (workers.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        workers: [],
      });
    }

    /*
     * Customer history
     */
    const customerJobCount = await JobRequest.countDocuments({
      customer: req.user._id,
    });

    /*
     * Build ML features and rank workers
     */
    const rankedWorkers = await Promise.all(
      workers.map(async (worker) => {
        const workerId = worker._id;

        const [completedJobs, acceptedJobs, rejectedJobs] =
          await Promise.all([
            JobRequest.countDocuments({
              worker: workerId,
              status: "completed",
            }),

            JobRequest.countDocuments({
              worker: workerId,
              status: "accepted",
            }),

            JobRequest.countDocuments({
              worker: workerId,
              status: "rejected",
            }),
          ]);

        const totalDecidedJobs =
          acceptedJobs + rejectedJobs;

        const acceptanceRate =
          totalDecidedJobs > 0
            ? acceptedJobs / totalDecidedJobs
            : 0.5;

        const totalReviews = await Review.countDocuments({
          worker: workerId,
        });

        /*
         * Calculate distance using coordinates returned by MongoDB.
         */
        const workerLng =
          worker.location?.coordinates?.[0];

        const workerLat =
          worker.location?.coordinates?.[1];

        let distanceKm = radiusKm;

        if (
          Number.isFinite(workerLat) &&
          Number.isFinite(workerLng)
        ) {
          distanceKm = calculateDistanceKm(
            latitude,
            longitude,
            workerLat,
            workerLng
          );
        }

        /*
         * Basic skill match.
         *
         * Candidate workers already passed the MongoDB
         * skill filter when a search term was supplied.
         */
        let skillMatch = searchText ? 1 : 0.5;

        if (!searchText) {
          skillMatch = 0.5;
        }

        /*
         * Rating is stored in reputationScore.
         */
        const rating = Math.max(
          0,
          Math.min(5, Number(worker.reputationScore) || 0)
        );

        const hourlyRate =
          Number(worker.hourlyRate?.min) || 0;

        const features = {
          skill_match: skillMatch,
          distance_km: Math.min(distanceKm, 10),
          rating,
          experience_years:
            Number(worker.experience) || 0,
          hourly_rate: hourlyRate,
          is_available: worker.isAvailable ? 1 : 0,
          is_verified:
            worker.verificationStatus === "verified"
              ? 1
              : 0,
          completed_jobs: completedJobs,
          acceptance_rate: acceptanceRate,
          completion_rate:
            completedJobs + acceptedJobs > 0
              ? completedJobs /
                (completedJobs + acceptedJobs)
              : 0.5,
          customer_previous_jobs: customerJobCount,
        };

        let mlScore = null;

        /*
         * Call Python ML service.
         *
         * If ML service is unavailable, TrustLink
         * continues working normally.
         */
        try {
          const response = await fetch(
            "http://127.0.0.1:8000/ml/predict",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(features),
              signal: AbortSignal.timeout(3000),
            }
          );

          if (response.ok) {
            const data = await response.json();
            mlScore = Number(data.score);
          }
        } catch (mlError) {
          console.warn(
            `ML service unavailable for worker ${workerId}`
          );
        }

        return {
          ...worker,
          distanceKm: Number(distanceKm.toFixed(2)),
          completedJobs,
          acceptanceRate: Number(
            acceptanceRate.toFixed(2)
          ),
          totalReviews,
          mlScore,
        };
      })
    );

    /*
     * ML available → sort by ML score.
     *
     * ML unavailable → sort by reputation.
     */
    rankedWorkers.sort((a, b) => {
      if (
        a.mlScore !== null &&
        b.mlScore !== null
      ) {
        return b.mlScore - a.mlScore;
      }

      if (a.mlScore !== null) return -1;
      if (b.mlScore !== null) return 1;

      return (
        (b.reputationScore || 0) -
        (a.reputationScore || 0)
      );
    });

    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      count: rankedWorkers.length,
      workers: rankedWorkers,
    });
  } catch (error) {
    console.error("Nearby Workers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to find nearby workers",
    });
  }
};


/*
 * Haversine distance calculation
 */
const calculateDistanceKm = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const earthRadiusKm = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
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

const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const worker = await Worker.findOne({
      user: req.user._id,
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    worker.isAvailable = isAvailable;

    await worker.save();

    return res.json({
      success: true,
      message: "Availability updated",
      isAvailable: worker.isAvailable,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const testML = async (req, res) => {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/ml/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill_match: 1,
          distance_km: 2,
          rating: 4.5,
          experience_years: 5,
          hourly_rate: 500,
          is_available: 1,
          is_verified: 1,
          completed_jobs: 20,
          acceptance_rate: 0.9,
          completion_rate: 0.95,
          customer_previous_jobs: 0,
        }),
      }
    );

    const data = await response.json();

    return res.json({
      success: true,
      mlService: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "ML service is not reachable",
      error: error.message,
    });
  }
};

module.exports = {
  registerWorker,
  getMyProfile,
  updateMyProfile,
  testML,
  updateAvailability,
  getWorkerDashboard,
  getWorkerById,
  getNearbyWorkers,
};