const Document = require('../models/Document');
const { asyncHandler, paginate, sendPaginatedResponse } = require('../utils/helpers');
const path = require('path');
const fs = require('fs').promises;

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
exports.getDocuments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, employeeId, documentType, search } = req.query;
  
  let query = {};
  
  if (employeeId) {
    query.employee = employeeId;
  }
  
  if (documentType) {
    query.documentType = documentType;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by access rights
  if (req.user.role === 'employee') {
    query.$or = [
      { employee: req.user.employeeId },
      { isConfidential: false }
    ];
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const documents = await Document.find(query)
    .populate('employee', 'firstName lastName employeeCode')
    .populate('uploadedBy', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);
  
  const total = await Document.countDocuments(query);
  
  sendPaginatedResponse(res, documents, page, limit, total);
});

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id)
    .populate('employee', 'firstName lastName employeeCode')
    .populate('uploadedBy', 'username email');

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check access rights
  if (document.isConfidential && req.user.role === 'employee' && 
      document.employee.toString() !== req.user.employeeId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.status(200).json({
    success: true,
    data: document
  });
});

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
exports.uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a file'
    });
  }

  const fileUrl = `/uploads/documents/${req.file.filename}`;
  
  const documentData = {
    title: req.body.title,
    documentType: req.body.documentType,
    employee: req.body.employee,
    description: req.body.description,
    uploadedBy: req.user.id,
    fileUrl: fileUrl,
    fileName: req.file.originalname,
    fileSize: req.file.size
  };

  const document = await Document.create(documentData);

  res.status(201).json({
    success: true,
    data: document
  });
});

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = asyncHandler(async (req, res) => {
  let document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Only admin, HR, or uploader can update
  if (req.user.role !== 'admin' && req.user.role !== 'hr' && 
      document.uploadedBy.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this document'
    });
  }

  document = await Document.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: document
  });
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Only admin, HR, or uploader can delete
  if (req.user.role !== 'admin' && req.user.role !== 'hr' && 
      document.uploadedBy.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this document'
    });
  }

  await document.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Document deleted successfully'
  });
});

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
exports.downloadDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check access rights
  if (document.isConfidential && req.user.role === 'employee' && 
      document.employee.toString() !== req.user.employeeId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // In a real implementation, this would serve the actual file
  res.status(200).json({
    success: true,
    data: {
      fileName: document.fileName,
      fileUrl: document.fileUrl,
      message: 'File download link'
    }
  });
});

// @desc    Get document statistics
// @route   GET /api/documents/stats/overview
// @access  Private
exports.getDocumentStats = asyncHandler(async (req, res) => {
  const total = await Document.countDocuments();
  const byType = await Document.aggregate([
    {
      $group: {
        _id: '$documentType',
        count: { $sum: 1 }
      }
    }
  ]);

  const confidential = await Document.countDocuments({ isConfidential: true });
  const active = await Document.countDocuments({ status: 'Active' });
  const expired = await Document.countDocuments({ status: 'Expired' });

  res.status(200).json({
    success: true,
    data: {
      total,
      byType,
      confidential,
      active,
      expired
    }
  });
});
