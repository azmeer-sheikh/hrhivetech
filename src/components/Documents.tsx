import { useState } from 'react';
import { FileText, Upload, Download, Trash2, Search, Filter, File } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position: string;
}

export interface Document {
  id: number;
  employeeId: number;
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
  const [selectedEmployee, setSelectedEmployee] = useState<number>(0);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<Document['documentType']>('Contract');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const employee = employees.find(emp => emp.id === selectedEmployee);
    if (!employee) return;

    const newDocument: Document = {
      id: documents.length + 1,
      employeeId: selectedEmployee,
      employeeName: employee.name,
      documentName,
      documentType,
      uploadedBy: 'Admin User',
      uploadedAt: new Date().toISOString(),
      fileSize: '2.4 MB',
    };

    setDocuments([...documents, newDocument]);
    
    // Reset form
    setShowAddModal(false);
    setSelectedEmployee(0);
    setDocumentName('');
    setDocumentType('Contract');
  };

  const deleteDocument = (id: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(d => d.id !== id));
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
          <div key={doc.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <File className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert('Download functionality would be implemented here')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteDocument(doc.id)}
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
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slide-down">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 border-b border-blue-700">
              <h2 className="!text-white !mb-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Upload className="w-5 h-5 !text-white" />
                </div>
                Upload Document
              </h2>
              <p className="!text-blue-100 text-sm !mb-0">
                Add a new document to the employee record
              </p>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Employee Selection */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Select Employee
                    <span className="!text-red-500">*</span>
                  </label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(Number(e.target.value))}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
                    required
                  >
                    <option value={0}>Choose an employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Document Type */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Document Type
                    <span className="!text-red-500">*</span>
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as Document['documentType'])}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300 bg-white"
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
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Document Name
                    <span className="!text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-300"
                    placeholder="e.g., Employment Contract - 2024"
                    required
                  />
                </div>

                {/* File Upload Area */}
                <div className="space-y-2">
                  <label className="block !text-gray-900 font-medium flex items-center gap-2">
                    Upload File
                    <span className="!text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 !text-blue-600" />
                    </div>
                    <p className="!text-gray-900 !mb-2 font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm !text-gray-600 !mb-0">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 !text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm !text-gray-900 font-medium !mb-1">Document Guidelines</p>
                      <ul className="text-sm !text-gray-600 space-y-1 list-disc list-inside !mb-0">
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
            <div className="px-8 py-5 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3.5 bg-white !text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border-2 border-gray-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 px-6 py-3.5 bg-blue-600 !text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 font-medium"
              >
                Upload Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}