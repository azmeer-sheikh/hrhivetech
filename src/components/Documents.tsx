import { useEffect, useRef, useState } from 'react';
import { FileText, Upload, Download, Trash2, Search, Filter, File, Eye, X } from 'lucide-react';
import { documentAPI } from '../services/api';
import { toast } from 'sonner';

interface Employee {
  _id?: string;
  id?: number | string;
  name: string;
  position: string;
}

export interface Document {
  _id?: string;
  id?: string | number;
  employeeId: string | number;
  employeeName: string;
  documentName: string;
  documentType: 'Contract' | 'ID Card' | 'Resume' | 'Certificate' | 'Policy' | 'Other';
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  fileUrl?: string;
}

interface DocumentsProps {
  employees: Employee[];
  documents: Document[];
  setDocuments: (docs: Document[]) => void;
}

export function Documents({ employees, documents, setDocuments }: DocumentsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<Document['documentType']>('Contract');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const mapTypeToBackend = (type: Document['documentType']) => {
    switch (type) {
      case 'ID Card':
        return 'ID Proof';
      case 'Resume':
        return 'Educational Certificate';
      case 'Contract':
        return 'Contract';
      case 'Certificate':
        return 'Certificate';
      case 'Policy':
        return 'Policy';
      default:
        return 'Other';
    }
  };

  const mapTypeFromBackend = (type: string): Document['documentType'] => {
    if (type === 'ID Proof') return 'ID Card';
    if (type === 'Educational Certificate') return 'Resume';
    if (type === 'Certificate' || type === 'Policy' || type === 'Contract') return type as Document['documentType'];
    return 'Other';
  };

  const loadDocuments = async () => {
    try {
      const response = await documentAPI.getAll(1, 500);
      const raw = Array.isArray(response?.data) ? response.data : [];

      const formatted: Document[] = raw.map((item: any) => {
        const employeeName = item.employee?.firstName
          ? `${item.employee.firstName} ${item.employee.lastName || ''}`.trim()
          : item.employeeName || 'Employee';

        return {
          _id: item._id,
          id: item._id,
          employeeId: item.employee?._id || item.employee,
          employeeName,
          documentName: item.title || item.fileName || 'Document',
          documentType: mapTypeFromBackend(item.documentType),
          uploadedBy: item.uploadedBy?.username || item.uploadedBy?.email || 'System',
          uploadedAt: item.createdAt || new Date().toISOString(),
          fileSize: item.fileSize ? (item.fileSize < 1024 ? `${item.fileSize} bytes` : item.fileSize < 1048576 ? `${(item.fileSize / 1024).toFixed(1)} KB` : `${(item.fileSize / 1048576).toFixed(1)} MB`) : '—',
          fileUrl: item.fileUrl,
        };
      });

      setDocuments(formatted);
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', documentName || selectedFile?.name || 'Document');
      formData.append('documentType', mapTypeToBackend(documentType));
      formData.append('employee', String(selectedEmployee));
      formData.append('description', 'Uploaded via UI');
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await documentAPI.upload(formData);
      await loadDocuments();

      // Reset form
      setShowAddModal(false);
      setSelectedEmployee('');
      setDocumentName('');
      setDocumentType('Contract');
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to upload document', err);
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id?: string | number) => {
    if (!id) return;

    let dismissed = false;
    setDeleting(String(id));

    toast.custom(
      (t) => (
        <div className="bg-white shadow-2xl border border-gray-200 max-w-sm overflow-hidden" style={{ borderRadius: '5px' }}>
            
          <div className="p-6">
            <p className="text-gray-800 text-base leading-relaxed mb-6 font-medium">
              Are you sure you want to delete this document?
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (!dismissed) {
                    dismissed = true;
                    setDeleting(null);
                    toast.dismiss(t);
                  }
                }}
                className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors font-semibold text-sm"
                style={{ borderRadius: '5px' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!dismissed) {
                    dismissed = true;
                    try {
                      await documentAPI.delete(String(id));
                      await loadDocuments();
                      toast.dismiss(t);
                      toast.success('Document deleted successfully', {
                        position: 'top-center'
                      });
                    } catch (err) {
                      toast.error('Failed to delete document', {
                        position: 'top-center'
                      });
                    } finally {
                      setDeleting(null);
                    }
                  }
                }}
                className="flex-1 px-5 py-2.5 text-sm font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
                style={{ borderRadius: '5px', backgroundColor: deleting === String(id) ? '#b91c1c' : '#dc2626', color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = deleting === String(id) ? '#b91c1c' : '#dc2626'}
                disabled={deleting === String(id)}
              >
                {deleting === String(id) ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      ),
      { position: 'top-center' }
    );
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.documentType === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Contract': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ID Card': return 'bg-green-100 text-green-800 border-green-200';
      case 'Resume': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Certificate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Policy': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl stat-gradient-green flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 mb-0">Employee Documents</h1>
              <p className="text-sm text-gray-600 mb-0">Manage employee files and documents</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
            <span className="font-medium">{uploading ? 'Uploading...' : 'Upload Document'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by employee or document name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent min-w-[200px]"
          >
            <option value="all">All Types</option>
            <option value="Contract">Contract</option>
            <option value="ID Card">ID Card</option>
            <option value="Resume">Resume</option>
            <option value="Certificate">Certificate</option>
            <option value="Policy">Policy</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <div key={doc._id || doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <File className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingDocument(doc)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="View Document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alert('Download functionality would be implemented here (link stored in fileUrl)')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteDocument(doc._id || doc.id)}
                  disabled={deleting === String(doc._id || doc.id)}
                  className="p-2 text-red-600 hover:bg-red-50 disabled:text-red-300 disabled:hover:bg-transparent rounded-lg transition-colors"
                  title="Delete"
                >
                  {deleting === String(doc._id || doc.id) ? (
                    <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <h4 className="text-gray-900 mb-2 truncate">{doc.documentName}</h4>
            <p className="text-sm text-gray-600 mb-3 truncate">{doc.employeeName}</p>

            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(doc.documentType)}`}>
                {doc.documentType}
              </span>
              <span className="text-xs text-gray-500">{doc.fileSize}</span>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Uploaded by {doc.uploadedBy}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No documents found</p>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full md:w-1/2 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 border-l border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-none mb-1">{viewingDocument.documentName}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-700">{viewingDocument.employeeName}</span>
                    <span>•</span>
                    <span>{viewingDocument.documentType}</span>
                    <span>•</span>
                    <span>{viewingDocument.fileSize}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingDocument(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 bg-gray-100 relative w-full h-full overflow-hidden">
              {viewingDocument.fileUrl ? (
                <iframe
                  src={viewingDocument.fileUrl.startsWith('http') ? viewingDocument.fileUrl : `http://localhost:5000${viewingDocument.fileUrl}`}
                  className="w-full h-full border-none"
                  title="Document Viewer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                   <FileText className="w-16 h-16 text-gray-300 mb-4" />
                   <p>No document URL available</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Uploaded by <span className="font-medium text-gray-900">{viewingDocument.uploadedBy}</span> on {new Date(viewingDocument.uploadedAt).toLocaleDateString()}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setViewingDocument(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Close
                </button>
                <button
                   onClick={() => window.open(viewingDocument.fileUrl?.startsWith('http') ? viewingDocument.fileUrl : `http://localhost:5000${viewingDocument.fileUrl}`, '_blank')}
                   className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" style={{ borderRadius: '5px' }}>
            {/* Header */}
            <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #2563eb, #1d4ed8)' }}>
              <h2 className="text-base font-bold" style={{ color: '#ffffff', margin: 0 }}>
                Upload Document
              </h2>
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '4px 0 0 0' }}>
                Add a new document to the employee record
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                {/* Employee Selection with Predictive Search */}
                <div className="space-y-2 relative">
                  <label className="block text-gray-900 font-medium text-sm">
                    Select Employee <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name or position..."
                      value={employeeSearchTerm}
                      onChange={(e) => {
                        setEmployeeSearchTerm(e.target.value);
                        setShowEmployeeDropdown(true);
                      }}
                      onFocus={() => setShowEmployeeDropdown(true)}
                      className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      style={{ borderRadius: '5px' }}
                      required={!selectedEmployee}
                    />
                    
                    {/* Dropdown */}
                    {showEmployeeDropdown && employees.filter(emp => {
                      const searchLower = employeeSearchTerm.toLowerCase();
                      const empName = (emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()).toLowerCase();
                      const empPosition = (emp.position || '').toLowerCase();
                      return !searchLower || empName.includes(searchLower) || empPosition.includes(searchLower);
                    }).length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {employees.filter(emp => {
                          const searchLower = employeeSearchTerm.toLowerCase();
                          const empName = (emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()).toLowerCase();
                          const empPosition = (emp.position || '').toLowerCase();
                          return !searchLower || empName.includes(searchLower) || empPosition.includes(searchLower);
                        }).map(emp => (
                          <button
                            key={emp._id || emp.id}
                            type="button"
                            onClick={() => {
                              setSelectedEmployee(String(emp._id || emp.id));
                              setEmployeeSearchTerm(emp.name || `${emp.firstName} ${emp.lastName}`);
                              setShowEmployeeDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium text-gray-900">{emp.name || `${emp.firstName} ${emp.lastName}`}</div>
                            <div className="text-xs text-gray-500">{emp.position}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Selected Employee Display */}
                    {selectedEmployee && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Selected</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Type */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Document Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as Document['documentType'])}
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    style={{ borderRadius: '5px' }}
                    required
                  >
                    <option value="Contract">Contract</option>
                    <option value="ID Card">ID Card</option>
                    <option value="Resume">Resume</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Policy">Policy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Document Name */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Document Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    style={{ borderRadius: '5px' }}
                    placeholder="e.g., Employment Contract - 2024"
                    required
                  />
                </div>

                {/* File Upload Area */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Upload File <span className="text-red-500">*</span>
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer bg-gray-50"
                    style={{ borderRadius: '5px' }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error('File size exceeds 10MB limit. Please select a smaller file.', { position: 'top-center' });
                          return;
                        }
                        setSelectedFile(file);
                        setDocumentName(file.name.replace(/\.[^.]+$/, ''));
                      }
                    }}
                  >
                    <div className="w-12 h-12 bg-blue-100 flex items-center justify-center mx-auto mb-3" style={{ borderRadius: '5px' }}>
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-gray-900 mb-1 font-medium text-sm">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-600 mb-2">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </p>
                    {selectedFile && (
                      <p className="text-sm text-blue-700 font-medium mt-2">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error('File size exceeds 10MB limit. Please select a smaller file.', { position: 'top-center' });
                          return;
                        }
                        setSelectedFile(file);
                        setDocumentName(file.name.replace(/\.[^.]+$/, ''));
                      }
                    }}
                  />
                </div>


              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-5 py-2.5 bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors font-semibold text-sm"
                style={{ borderRadius: '5px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={uploading}
                className="flex-1 px-5 py-2.5 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors shadow-lg font-bold text-sm flex items-center justify-center gap-2"
                style={{ borderRadius: '5px', backgroundColor: uploading ? '#60a5fa' : '#2563eb' }}
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <span>Upload</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}