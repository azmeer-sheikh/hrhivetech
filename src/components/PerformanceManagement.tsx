import { useState } from 'react';
import { Upload, FileText, TrendingUp, Award, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
}

interface PerformanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  fileName: string;
  uploadDate: string;
  rating: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  goals: string[];
  attendance: number;
  activities: string[];
}

interface PerformanceManagementProps {
  employees: Employee[];
  performanceRecords: PerformanceRecord[];
  setPerformanceRecords: (records: PerformanceRecord[]) => void;
}

export function PerformanceManagement({ 
  employees, 
  performanceRecords, 
  setPerformanceRecords 
}: PerformanceManagementProps) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PerformanceRecord | null>(null);

  // Simulate AI PDF processing
  const processPDF = (file: File, employeeId: number): Promise<PerformanceRecord> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const employee = employees.find(e => e.id === employeeId);
        
        // Mock AI-extracted data
        const record: PerformanceRecord = {
          id: Math.max(0, ...performanceRecords.map(r => r.id)) + 1,
          employeeId,
          employeeName: employee?.name || '',
          fileName: file.name,
          uploadDate: new Date().toISOString().split('T')[0],
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          summary: 'Outstanding performance with consistent delivery of high-quality work. Demonstrates strong leadership skills and excellent collaboration with team members.',
          strengths: [
            'Excellent technical skills and problem-solving abilities',
            'Strong communication and team collaboration',
            'Consistently meets deadlines and exceeds expectations',
            'Takes initiative on challenging projects'
          ],
          improvements: [
            'Could improve documentation practices',
            'More active participation in code reviews',
            'Time management during peak periods'
          ],
          goals: [
            'Lead a major project by Q2',
            'Mentor 2 junior developers',
            'Complete advanced certification',
            'Improve cross-team collaboration'
          ],
          attendance: Math.floor(Math.random() * 5) + 95, // 95-99%
          activities: [
            'Led 3 critical projects to successful completion',
            'Conducted 15 technical training sessions',
            'Contributed to 45 code reviews',
            'Implemented 8 process improvements',
            'Participated in 12 client meetings'
          ]
        };
        
        resolve(record);
      }, 2000); // Simulate processing time
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEmployee) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setUploadingFile(true);
    
    try {
      const record = await processPDF(file, parseInt(selectedEmployee));
      setPerformanceRecords([...performanceRecords, record]);
      setSelectedRecord(record);
      setSelectedEmployee('');
    } catch (error) {
      alert('Error processing PDF');
    } finally {
      setUploadingFile(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Performance Management</h1>
        <p className="text-gray-500">Upload and analyze employee performance reviews with AI</p>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-indigo-600 mt-1" />
          <div>
            <h3 className="text-gray-900 mb-1">AI-Powered Performance Analysis</h3>
            <p className="text-gray-600">Upload performance review PDFs and let AI extract insights, ratings, and recommendations</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Select Employee</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Choose an employee...</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.position}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Upload Performance PDF</label>
            <label className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              selectedEmployee 
                ? 'border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-600' 
                : 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}>
              <Upload className="w-5 h-5" />
              <span>{uploadingFile ? 'Processing...' : 'Upload PDF'}</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={!selectedEmployee || uploadingFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {uploadingFile && (
          <div className="mt-4 flex items-center gap-3 text-indigo-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            <span>AI is analyzing the performance review...</span>
          </div>
        )}
      </div>

      {/* Performance Records Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {performanceRecords.map((record) => (
          <div 
            key={record.id} 
            onClick={() => setSelectedRecord(record)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-gray-900 mb-1">{record.employeeName}</h3>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-500">{record.fileName}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 ${getRatingColor(record.rating)}`}>
                  <Award className="w-5 h-5" />
                  <span>{record.rating}/5</span>
                </div>
                <p className="text-gray-500 mt-1">{record.uploadDate}</p>
              </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">{record.summary}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-gray-700 mb-1">Attendance</p>
                <p className="text-green-600">{record.attendance}%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-gray-700 mb-1">Activities</p>
                <p className="text-blue-600">{record.activities.length} logged</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {performanceRecords.length === 0 && (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
          <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No performance records yet. Upload a PDF to get started!</p>
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-gray-900 mb-2">{selectedRecord.employeeName}</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{selectedRecord.fileName}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{selectedRecord.uploadDate}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Rating */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                <Award className={`w-8 h-8 ${getRatingColor(selectedRecord.rating)}`} />
                <div>
                  <p className="text-gray-700">Overall Performance Rating</p>
                  <p className={`text-2xl ${getRatingColor(selectedRecord.rating)}`}>
                    {selectedRecord.rating} / 5.0
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  AI Summary
                </h4>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{selectedRecord.summary}</p>
              </div>

              {/* Attendance & Activities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="text-gray-900">Attendance Rate</h4>
                  </div>
                  <p className="text-green-600">{selectedRecord.attendance}%</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h4 className="text-gray-900">Total Activities</h4>
                  </div>
                  <p className="text-blue-600">{selectedRecord.activities.length} logged</p>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Key Strengths
                </h4>
                <ul className="space-y-2">
                  {selectedRecord.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div>
                <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {selectedRecord.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2"></div>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Goals */}
              <div>
                <h4 className="text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Performance Goals
                </h4>
                <ul className="space-y-2">
                  {selectedRecord.goals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2"></div>
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Activities */}
              <div>
                <h4 className="text-gray-900 mb-3">Recent Activities</h4>
                <div className="space-y-2">
                  {selectedRecord.activities.map((activity, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg text-gray-600">
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
