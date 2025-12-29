const Holiday = require('../models/Holiday');
const { asyncHandler, paginate, sendPaginatedResponse } = require('../utils/helpers');

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Private
exports.getHolidays = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, year, type } = req.query;
  
  let query = { isActive: true };
  
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    query.date = { $gte: startDate, $lte: endDate };
  }
  
  if (type) {
    query.type = type;
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const holidays = await Holiday.find(query)
    .sort({ date: 1 })
    .skip(skip)
    .limit(limitNum);
  
  const total = await Holiday.countDocuments(query);
  
  sendPaginatedResponse(res, holidays, page, limit, total);
});

// @desc    Get single holiday
// @route   GET /api/holidays/:id
// @access  Private
exports.getHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findById(req.params.id);

  if (!holiday) {
    return res.status(404).json({
      success: false,
      message: 'Holiday not found'
    });
  }

  res.status(200).json({
    success: true,
    data: holiday
  });
});

// @desc    Create holiday
// @route   POST /api/holidays
// @access  Private (admin, hr)
exports.createHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.create(req.body);

  res.status(201).json({
    success: true,
    data: holiday
  });
});

// @desc    Update holiday
// @route   PUT /api/holidays/:id
// @access  Private (admin, hr)
exports.updateHoliday = asyncHandler(async (req, res) => {
  let holiday = await Holiday.findById(req.params.id);

  if (!holiday) {
    return res.status(404).json({
      success: false,
      message: 'Holiday not found'
    });
  }

  holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: holiday
  });
});

// @desc    Delete holiday
// @route   DELETE /api/holidays/:id
// @access  Private (admin, hr)
exports.deleteHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findById(req.params.id);

  if (!holiday) {
    return res.status(404).json({
      success: false,
      message: 'Holiday not found'
    });
  }

  await holiday.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Holiday deleted successfully'
  });
});

// @desc    Get upcoming holidays
// @route   GET /api/holidays/upcoming/list
// @access  Private
exports.getUpcomingHolidays = asyncHandler(async (req, res) => {
  const today = new Date();
  
  const holidays = await Holiday.find({
    date: { $gte: today },
    isActive: true
  })
    .sort({ date: 1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: holidays
  });
});

// @desc    Get holiday statistics
// @route   GET /api/holidays/stats/overview
// @access  Private
exports.getHolidayStats = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(`${currentYear}-01-01`);
  const endDate = new Date(`${currentYear}-12-31`);

  const total = await Holiday.countDocuments({
    date: { $gte: startDate, $lte: endDate },
    isActive: true
  });

  const byType = await Holiday.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
        isActive: true
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  const upcoming = await Holiday.countDocuments({
    date: { $gte: new Date() },
    isActive: true
  });

  res.status(200).json({
    success: true,
    data: {
      total,
      upcoming,
      byType
    }
  });
});
