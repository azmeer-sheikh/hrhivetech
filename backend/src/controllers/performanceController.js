const Performance = require('../models/Performance');
const { asyncHandler, paginate, sendPaginatedResponse } = require('../utils/helpers');

// @desc    Get all performance reviews
// @route   GET /api/performance
// @access  Private
exports.getPerformanceReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, employeeId, reviewType, status } = req.query;
  
  let query = {};
  
  if (employeeId) {
    query.employee = employeeId;
  }
  
  if (reviewType) {
    query.reviewType = reviewType;
  }
  
  if (status) {
    query.status = status;
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const reviews = await Performance.find(query)
    .populate('employee', 'firstName lastName employeeCode department position')
    .populate('reviewer', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);
  
  const total = await Performance.countDocuments(query);
  
  sendPaginatedResponse(res, reviews, page, limit, total);
});

// @desc    Get single performance review
// @route   GET /api/performance/:id
// @access  Private
exports.getPerformanceReview = asyncHandler(async (req, res) => {
  const review = await Performance.findById(req.params.id)
    .populate('employee', 'firstName lastName employeeCode department position')
    .populate('reviewer', 'username email');

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Performance review not found'
    });
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Create performance review
// @route   POST /api/performance
// @access  Private (admin, hr, manager)
exports.createPerformanceReview = asyncHandler(async (req, res) => {
  const reviewData = {
    ...req.body,
    reviewer: req.user.id
  };

  const review = await Performance.create(reviewData);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Update performance review
// @route   PUT /api/performance/:id
// @access  Private (admin, hr, manager)
exports.updatePerformanceReview = asyncHandler(async (req, res) => {
  let review = await Performance.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Performance review not found'
    });
  }

  // Only allow reviewer or admin to update
  if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review'
    });
  }

  review = await Performance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Delete performance review
// @route   DELETE /api/performance/:id
// @access  Private (admin, hr)
exports.deletePerformanceReview = asyncHandler(async (req, res) => {
  const review = await Performance.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Performance review not found'
    });
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Performance review deleted successfully'
  });
});

// @desc    Get employee performance history
// @route   GET /api/performance/employee/:employeeId
// @access  Private
exports.getEmployeePerformance = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  const reviews = await Performance.find({ employee: employeeId })
    .populate('reviewer', 'username email')
    .sort({ 'reviewPeriod.endDate': -1 });

  // Calculate average ratings
  const avgRatings = {
    workQuality: 0,
    productivity: 0,
    communication: 0,
    teamwork: 0,
    punctuality: 0,
    initiative: 0,
    leadership: 0,
    problemSolving: 0,
    overall: 0
  };

  if (reviews.length > 0) {
    reviews.forEach(review => {
      Object.keys(avgRatings).forEach(key => {
        if (key === 'overall') {
          avgRatings[key] += review.overallRating || 0;
        } else if (review.ratings[key]) {
          avgRatings[key] += review.ratings[key];
        }
      });
    });

    Object.keys(avgRatings).forEach(key => {
      avgRatings[key] = (avgRatings[key] / reviews.length).toFixed(2);
    });
  }

  res.status(200).json({
    success: true,
    data: {
      reviews,
      averageRatings: avgRatings,
      totalReviews: reviews.length
    }
  });
});

// @desc    Acknowledge performance review
// @route   PATCH /api/performance/:id/acknowledge
// @access  Private (employee)
exports.acknowledgeReview = asyncHandler(async (req, res) => {
  const review = await Performance.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Performance review not found'
    });
  }

  review.status = 'Acknowledged';
  review.acknowledgedDate = Date.now();
  
  if (req.body.employeeComments) {
    review.employeeComments = req.body.employeeComments;
  }
  
  await review.save();

  res.status(200).json({
    success: true,
    data: review
  });
});
