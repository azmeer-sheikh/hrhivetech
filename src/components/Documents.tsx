import { useEffect, useRef, useState } from 'react';
import { FileText, Upload, Download, Trash2, Search, Filter, File } from 'lucide-react';
import { documentAPI } from '../services/api';

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
}

interface DocumentsProps {
  employees: Employee[];
  documents: Document[];
  setDocuments: (docs: Document[]) => void;
}

export function Documents({ employees, documents, setDocuments }: DocumentsProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<Document['documentType']>('Contract');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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
      const employee = employees.find(emp => String(emp._id || emp.id) === String(selectedEmployee));
      const safeName = documentName || selectedFile?.name || 'Document';
      const fileName = selectedFile?.name || `${safeName}.pdf`;
      const payload = {
        title: safeName,
        documentType: mapTypeToBackend(documentType),
        employee: String(selectedEmployee),
        description: 'Uploaded via UI',
        fileName,
        fileUrl: `/uploads/documents/${Date.now()}-${fileName.replace(/\s+/g, '-')}`,
        fileSize: selectedFile?.size || 0,
        employeeName: employee?.name || 'Employee',
      };

      await documentAPI.upload(payload);
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
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await documentAPI.delete(String(id));
        await loadDocuments();
      } catch (err) {
        console.error('Failed to delete document', err);
      }
    }
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
            className="flex items-center gap-2 px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Upload Document</span>
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
                  onClick={() => alert('Download functionality would be implemented here (link stored in fileUrl)')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteDocument(doc._id || doc.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
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
                {/* Employee Selection */}
                <div className="space-y-2">
                  <label className="block text-gray-900 font-medium text-sm">
                    Select Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    style={{ borderRadius: '5px' }}
                    required
                  >
                    <option value="">Choose an employee</option>
                    {employees.map(emp => (
                      <option key={emp._id || emp.id} value={emp._id || emp.id}>
                        {emp.name} - {emp.position}
                      </option>
                    ))}
                  </select>
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
                        setSelectedFile(file);
                        setDocumentName(file.name.replace(/\.[^.]+$/, ''));
                      }
                    }}
                  />
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4" style={{ borderRadius: '5px' }}>
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 font-medium mb-2">Document Guidelines</p>
                      <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                        <li>Ensure document is clear and readable</li>
                        <li>Use descriptive file names</li>
                        <li>Sensitive documents will be encrypted</li>
                      </ul>
                    </div>
                  </div>
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
                className="flex-1 px-5 py-2.5 text-white hover:bg-blue-700 transition-colors shadow-lg font-bold text-sm"
                style={{ borderRadius: '5px', backgroundColor: '#2563eb' }}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}