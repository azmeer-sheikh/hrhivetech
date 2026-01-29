const Interview = require('../models/Interview');
const { asyncHandler, paginate, sendPaginatedResponse } = require('../utils/helpers');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all interviews
// @route   GET /api/interviews
// @access  Private
exports.getInterviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, position, department } = req.query;
  
  let query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (position) {
    query.position = { $regex: position, $options: 'i' };
  }
  
  if (department) {
    query.department = department;
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const interviews = await Interview.find(query)
    .populate('interviewers', 'username email')
    .sort({ interviewDate: -1 })
    .skip(skip)
    .limit(limitNum);
  
  const total = await Interview.countDocuments(query);
  
  sendPaginatedResponse(res, interviews, page, limit, total);
});

// @desc    Get single interview
// @route   GET /api/interviews/:id
// @access  Private
exports.getInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id)
    .populate('interviewers', 'username email role');

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found'
    });
  }

  res.status(200).json({
    success: true,
    data: interview
  });
});

// @desc    Schedule interview
// @route   POST /api/interviews
// @access  Private (admin, hr)
exports.createInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.create(req.body);

  if (interview?.candidateEmail) {
    const dateText = interview.interviewDate
      ? new Date(interview.interviewDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';

    const timeText = interview.interviewTime || '';
    const locationText = interview.location || (interview.meetingLink ? 'Online' : 'TBD');
    const meetingLink = interview.meetingLink ? `<p style="margin:0 0 8px 0;"><strong>Meeting Link:</strong> <a href="${interview.meetingLink}">${interview.meetingLink}</a></p>` : '';

    const html = `
      <div style="font-family: 'Poppins', 'Entire'; color: #111;">
        <h2 style="margin: 0 0 12px 0;">Interview Scheduled</h2>
        <p style="margin: 0 0 8px 0;">Hello ${interview.candidateName || 'Candidate'},</p>
        <p style="margin: 0 0 12px 0;">Your interview has been scheduled. Here are the details:</p>
        <ul style="margin: 0 0 12px 18px; padding: 0;">
          <li><strong>Position:</strong> ${interview.position}</li>
          <li><strong>Department:</strong> ${interview.department}</li>
          <li><strong>Date:</strong> ${dateText}</li>
          <li><strong>Time:</strong> ${timeText}</li>
          <li><strong>Type:</strong> ${interview.interviewType}</li>
          <li><strong>Location:</strong> ${locationText}</li>
        </ul>
        ${meetingLink}
        <p style="margin: 12px 0 0 0;">If you have any questions, please reply to this email.</p>
        <p style="margin: 8px 0 0 0;">Thank you.</p>
      </div>
    `;

    const message = `Interview Scheduled\n\n` +
      `Hello ${interview.candidateName || 'Candidate'},\n` +
      `Your interview has been scheduled.\n\n` +
      `Position: ${interview.position}\n` +
      `Department: ${interview.department}\n` +
      `Date: ${dateText}\n` +
      `Time: ${timeText}\n` +
      `Type: ${interview.interviewType}\n` +
      `Location: ${locationText}\n` +
      (interview.meetingLink ? `Meeting Link: ${interview.meetingLink}\n` : '') +
      `\nThank you.`;

    try {
      await sendEmail({
        email: interview.candidateEmail,
        subject: `Interview Scheduled - ${interview.position}`,
        message,
        html,
      });
    } catch (emailError) {
      console.error('Failed to send interview email:', emailError);
    }
  }

  res.status(201).json({
    success: true,
    data: interview
  });
});

// @desc    Update interview
// @route   PUT /api/interviews/:id
// @access  Private (admin, hr)
exports.updateInterview = asyncHandler(async (req, res) => {
  let interview = await Interview.findById(req.params.id);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found'
    });
  }

  interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: interview
  });
});

// @desc    Delete/Cancel interview
// @route   DELETE /api/interviews/:id
// @access  Private (admin, hr)
exports.deleteInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found'
    });
  }

  await interview.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Interview cancelled successfully'
  });
});

// @desc    Update interview status
// @route   PATCH /api/interviews/:id/status
// @access  Private (admin, hr, interviewer)
exports.updateInterviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const interview = await Interview.findById(req.params.id);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found'
    });
  }

  interview.status = status;
  await interview.save();

  res.status(200).json({
    success: true,
    data: interview
  });
});

// @desc    Submit interview evaluation
// @route   PATCH /api/interviews/:id/evaluate
// @access  Private (interviewer)
exports.evaluateInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findById(req.params.id);

  if (!interview) {
    return res.status(404).json({
      success: false,
      message: 'Interview not found'
    });
  }

  const { evaluation, feedback, recommendation } = req.body;

  interview.evaluation = evaluation;
  interview.feedback = feedback;
  interview.recommendation = recommendation;
  interview.status = 'Completed';

  await interview.save();

  res.status(200).json({
    success: true,
    data: interview
  });
});

// @desc    Get interview statistics
// @route   GET /api/interviews/stats/overview
// @access  Private
exports.getInterviewStats = asyncHandler(async (req, res) => {
  const total = await Interview.countDocuments();
  const scheduled = await Interview.countDocuments({ status: 'Scheduled' });
  const completed = await Interview.countDocuments({ status: 'Completed' });
  const cancelled = await Interview.countDocuments({ status: 'Cancelled' });

  // Get stats by position
  const byPosition = await Interview.aggregate([
    {
      $group: {
        _id: '$position',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get stats by department
  const byDepartment = await Interview.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      scheduled,
      completed,
      cancelled,
      byPosition,
      byDepartment
    }
  });
});
