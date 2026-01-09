const Announcement = require("../models/Announcement");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const {
  asyncHandler,
  paginate,
  sendPaginatedResponse,
} = require("../utils/helpers");

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
exports.getAnnouncements = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, priority, type } = req.query;

  let query = { isActive: true };

  // Check expiry date
  const now = new Date();
  query.$or = [{ expiryDate: { $gte: now } }, { expiryDate: null }];

  if (priority) {
    query.priority = priority;
  }

  if (type) {
    query.type = type;
  }

  // Filter based on user's department and role
  if (req.user.role === "employee" && req.user.employeeId) {
    const Employee = require("../models/Employee");
    const employee = await Employee.findById(req.user.employeeId);

    if (employee) {
      query.$and = [
        {
          $or: [
            { targetAudience: "All Employees" },
            { departments: employee.department },
            { roles: req.user.role },
          ],
        },
      ];
    }
  }

  const { skip, limit: limitNum } = paginate(page, limit);

  const announcements = await Announcement.find(query)
    .populate("createdBy", "username email")
    .sort({ isPinned: -1, publishDate: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Announcement.countDocuments(query);

  sendPaginatedResponse(res, announcements, page, limit, total);
});

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
exports.getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id).populate(
    "createdBy",
    "username email"
  );

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: "Announcement not found",
    });
  }

  // Increment views
  announcement.views += 1;

  // Track if user has read
  const hasRead = announcement.readBy.some(
    (read) => read.user.toString() === req.user.id
  );

  if (!hasRead) {
    announcement.readBy.push({
      user: req.user.id,
      readAt: new Date(),
    });
  }

  await announcement.save();

  res.status(200).json({
    success: true,
    data: announcement,
  });
});

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (admin, hr)
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const { testEmail, ...rest } = req.body;
  
  const announcementData = {
    ...rest,
    createdBy: req.user.id
  };

  const announcement = await Announcement.create(announcementData);

  // Send email to all users
  try {
    let emails;
    
    // If testEmail is provided, only send to that email
    if (testEmail) {
      emails = [testEmail];
    } else {
      const users = await User.find({ isActive: true }).select('email');
      emails = users.map(user => user.email).filter(email => email);
    }

    if (emails.length > 0) {
      const message = `
New Announcement: ${announcement.title}

Priority: ${announcement.priority}
Type: ${announcement.type}

${announcement.content}

Please log in to the HR Portal to view more details.
      `;

      await sendEmail({
        bcc: emails,
        subject: `HR Portal Announcement: ${announcement.title}`,
        message,
      });
    }
  } catch (error) {
    console.error("Email notification failed:", error);
  }

  res.status(201).json({
    success: true,
    data: announcement,
  });
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (admin, hr)
exports.updateAnnouncement = asyncHandler(async (req, res) => {
  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: "Announcement not found",
    });
  }

  // Only creator or admin can update
  if (
    announcement.createdBy.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this announcement",
    });
  }

  announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: announcement,
  });
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (admin, hr)
exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: "Announcement not found",
    });
  }

  // Only creator or admin can delete
  if (
    announcement.createdBy.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this announcement",
    });
  }

  await announcement.deleteOne();

  res.status(200).json({
    success: true,
    message: "Announcement deleted successfully",
  });
});

// @desc    Pin/Unpin announcement
// @route   PATCH /api/announcements/:id/pin
// @access  Private (admin, hr)
exports.togglePin = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: "Announcement not found",
    });
  }

  announcement.isPinned = !announcement.isPinned;
  await announcement.save();

  res.status(200).json({
    success: true,
    data: announcement,
  });
});

// @desc    Mark announcement as read
// @route   PATCH /api/announcements/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return res.status(404).json({
      success: false,
      message: "Announcement not found",
    });
  }

  const hasRead = announcement.readBy.some(
    (read) => read.user.toString() === req.user.id
  );

  if (!hasRead) {
    announcement.readBy.push({
      user: req.user.id,
      readAt: new Date(),
    });
    await announcement.save();
  }

  res.status(200).json({
    success: true,
    message: "Announcement marked as read",
  });
});

// @desc    Get announcement statistics
// @route   GET /api/announcements/stats/overview
// @access  Private
exports.getAnnouncementStats = asyncHandler(async (req, res) => {
  const total = await Announcement.countDocuments({ isActive: true });
  const pinned = await Announcement.countDocuments({
    isPinned: true,
    isActive: true,
  });

  const byPriority = await Announcement.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 },
      },
    },
  ]);

  const byType = await Announcement.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      pinned,
      byPriority,
      byType,
    },
  });
});
