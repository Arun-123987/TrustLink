const validateWorkerRegistration = (req, res, next) => {
  const {
    fullName,
    skills,
    experience,
    hourlyRate,
    serviceRadius,
  } = req.body;

  if (!fullName || fullName.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Full name is required",
    });
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one skill is required",
    });
  }

  if (skills.length > 5) {
    return res.status(400).json({
      success: false,
      message: "Maximum 5 skills allowed",
    });
  }

  if (experience < 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid experience",
    });
  }

  if (
    !hourlyRate ||
    hourlyRate.min == null ||
    hourlyRate.max == null
  ) {
    return res.status(400).json({
      success: false,
      message: "Hourly rate is required",
    });
  }

  if (hourlyRate.min > hourlyRate.max) {
    return res.status(400).json({
      success: false,
      message: "Minimum rate cannot exceed maximum rate",
    });
  }

  if (serviceRadius <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid service radius",
    });
  }

  next();
};

module.exports = validateWorkerRegistration;