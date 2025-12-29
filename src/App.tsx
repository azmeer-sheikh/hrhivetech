import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { DailyAttendance } from './components/DailyAttendance';
import { EmployeeManagement } from './components/EmployeeManagement';
import { AttendanceTracking } from './components/AttendanceTracking';
import { InterviewManagement } from './components/InterviewManagement';
import { Analytics } from './components/Analytics';
import { LeaveManagement, LeaveRequest } from './components/LeaveManagement';
import { Announcements, Announcement } from './components/Announcements';
import { Documents, Document } from './components/Documents';
import { Holidays, Holiday } from './components/Holidays';
import { LaborCostDashboard } from './components/LaborCostDashboard';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { UserManagement } from './components/UserManagement';
import { EmployeePasswordGate } from './components/EmployeePasswordGate';
import { Toaster } from './components/ui/sonner';
// Types
interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  joinDate: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  imageUrl?: string;
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

interface AttendanceRecord {
  employeeId: number;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Leave';
  checkIn?: string;
  checkOut?: string;
}

interface Interview {
  id: number;
  candidateName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  date: string;
  time: string;
  interviewer: string;
  location: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes?: string;
}

interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  month: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netPay: number;
  status: 'Pending' | 'Processed' | 'Paid';
  paymentDate?: string;
}

// Mock Data
const mockEmployees: Employee[] = [
  // Phase 4 - Sales Operations
  { id: 1, name: "HR", email: "hr@hivetech.com", phone: "+92 300 0000001", position: "HR", department: "Sales Operations (Phase-4)", salary: 100000, joinDate: "2024-01-01", status: "Active" },
  { id: 2, name: "Mr. Obaid Hassan", email: "obaid.hassan@hivetech.com", phone: "+92 300 0000002", position: "Support (Sam)", department: "Sales Operations (Phase-4)", salary: 115000, joinDate: "2024-01-15", status: "Active" },
  { id: 3, name: "Mr. Muhammad Hunzala", email: "m.hunzala@hivetech.com", phone: "+92 300 0000003", position: "Dialer (Henry)", department: "Sales Operations (Phase-4)", salary: 70000, joinDate: "2024-02-01", status: "Active" },
  { id: 4, name: "Mr. Ali Haider", email: "ali.haider@hivetech.com", phone: "+92 300 0000004", position: "Dialer (Tyler)", department: "Sales Operations (Phase-4)", salary: 80000, joinDate: "2024-02-10", status: "Active" },
  { id: 5, name: "Mr. Saifullah", email: "saifullah@hivetech.com", phone: "+92 300 0000005", position: "Dialer (Jaison)", department: "Sales Operations (Phase-4)", salary: 45000, joinDate: "2024-03-01", status: "Active" },
  { id: 6, name: "Ms. Alisha Batool", email: "alisha.batool@hivetech.com", phone: "+92 300 0000006", position: "Dialer (Julia)", department: "Sales Operations (Phase-4)", salary: 45000, joinDate: "2024-03-15", status: "Active" },
  { id: 7, name: "Ms. Kainat Zahra", email: "kainat.zahra@hivetech.com", phone: "+92 300 0000007", position: "Dialer (Stella)", department: "Sales Operations (Phase-4)", salary: 45000, joinDate: "2024-04-01", status: "Active" },
  { id: 8, name: "Mr. Muhammd Hassan", email: "m.hassan@hivetech.com", phone: "+92 300 0000008", position: "Dialer (Fred)", department: "Sales Operations (Phase-4)", salary: 40000, joinDate: "2024-04-10", status: "Active" },
  { id: 9, name: "Mr. Haris Shahzad", email: "haris.shahzad@hivetech.com", phone: "+92 300 0000009", position: "Dialer (Daniel Smith)", department: "Sales Operations (Phase-4)", salary: 60000, joinDate: "2024-05-01", status: "Active" },
  { id: 10, name: "Ms. Faiza Abbas", email: "faiza.abbas@hivetech.com", phone: "+92 300 0000010", position: "Lead Generation Specialist", department: "Sales Operations (Phase-4)", salary: 22167, joinDate: "2024-05-15", status: "Active" },

  // Sales Operations
  { id: 11, name: "Mr. Qasim Ali", email: "qasim.ali@hivetech.com", phone: "+92 300 0000011", position: "Director", department: "Sales Operations", salary: 125000, joinDate: "2023-01-01", status: "Active" },
  { id: 12, name: "Ms. Nazia", email: "nazia@hivetech.com", phone: "+92 300 0000012", position: "Director", department: "Sales Operations", salary: 125000, joinDate: "2023-01-01", status: "Active" },
  { id: 13, name: "Ms. Amna Rauf", email: "amna.rauf@hivetech.com", phone: "+92 300 0000013", position: "Sales Closer", department: "Sales Operations", salary: 100000, joinDate: "2023-03-01", status: "Active" },
  { id: 14, name: "Ms. Noor Fatima", email: "noor.fatima@hivetech.com", phone: "+92 300 0000014", position: "Eva Marshall", department: "Sales Operations", salary: 300000, joinDate: "2023-02-01", status: "Active" },
  { id: 15, name: "Mr. Umair Azam", email: "umair.azam@hivetech.com", phone: "+92 300 0000015", position: "Sales Closer", department: "Sales Operations", salary: 175000, joinDate: "2023-04-01", status: "Active" },
  { id: 16, name: "Mr. Usman Ali", email: "usman.ali@hivetech.com", phone: "+92 300 0000016", position: "Dialer (Ethen)", department: "Sales Operations", salary: 70000, joinDate: "2023-05-01", status: "Active" },
  { id: 17, name: "Syed Husnain Sherazi", email: "husnain.sherazi@hivetech.com", phone: "+92 300 0000017", position: "Dialer (Andy)", department: "Sales Operations", salary: 65000, joinDate: "2023-06-01", status: "Active" },
  { id: 18, name: "Mr. Bilal Azam", email: "bilal.azam@hivetech.com", phone: "+92 300 0000018", position: "Support (Leo)", department: "Sales Operations", salary: 70000, joinDate: "2023-07-01", status: "Active" },
  { id: 19, name: "Mr. Abu Baker Saeed", email: "abu.saeed@hivetech.com", phone: "+92 300 0000019", position: "Dialer (Simon)", department: "Sales Operations", salary: 9032, joinDate: "2024-10-01", status: "Inactive" },
  { id: 20, name: "Mr. Umair Iqbal", email: "umair.iqbal@hivetech.com", phone: "+92 300 0000020", position: "Dialer (Brian)", department: "Sales Operations", salary: 40000, joinDate: "2024-06-01", status: "Active" },
  { id: 21, name: "Mr. Elisha Asif", email: "elisha.asif@hivetech.com", phone: "+92 300 0000021", position: "Dialer (James)", department: "Sales Operations", salary: 40000, joinDate: "2024-06-15", status: "Active" },
  { id: 22, name: "Mirza Shehroze Baig", email: "shehroze.baig@hivetech.com", phone: "+92 300 0000022", position: "Dialer (Jeff)", department: "Sales Operations", salary: 65000, joinDate: "2024-07-01", status: "Active" },
  { id: 23, name: "Mr. Massab Tahir", email: "massab.tahir@hivetech.com", phone: "+92 300 0000023", position: "Dialer (Kevin)", department: "Sales Operations", salary: 65000, joinDate: "2024-07-15", status: "Active" },
  { id: 24, name: "Mr. Hassan Naveed Kahloon", email: "hassan.kahloon@hivetech.com", phone: "+92 300 0000024", position: "Dialer (Nick Johnson)", department: "Sales Operations", salary: 35000, joinDate: "2024-08-01", status: "Active" },
  { id: 25, name: "Mr. Muhammad Faizan", email: "m.faizan1@hivetech.com", phone: "+92 300 0000025", position: "Dialer (Ted Miller)", department: "Sales Operations", salary: 35000, joinDate: "2024-08-10", status: "Active" },
  { id: 26, name: "Mr. Muhammad Faizan", email: "m.faizan2@hivetech.com", phone: "+92 300 0000026", position: "Dialer (Blake Wilson)", department: "Sales Operations", salary: 35000, joinDate: "2024-08-15", status: "Active" },
  { id: 27, name: "Mr. M Shahzaib Awan", email: "shahzaib.awan@hivetech.com", phone: "+92 300 0000027", position: "Dialer (Eric)", department: "Sales Operations", salary: 35000, joinDate: "2024-09-01", status: "Active" },
  { id: 28, name: "Mr. Khalid Saifullah", email: "khalid.saifullah@hivetech.com", phone: "+92 300 0000028", position: "Dialer (Jack)", department: "Sales Operations", salary: 35000, joinDate: "2024-09-10", status: "Active" },
  { id: 29, name: "Mr. Usama Ijaz", email: "usama.ijaz@hivetech.com", phone: "+92 300 0000029", position: "Dialer (Brevis)", department: "Sales Operations", salary: 35000, joinDate: "2024-09-15", status: "Active" },
  { id: 30, name: "Ms. Alisha", email: "alisha.qa@hivetech.com", phone: "+92 300 0000030", position: "QA", department: "Sales Operations", salary: 35000, joinDate: "2024-10-01", status: "Active" },
  { id: 31, name: "Mr. Nauman Akmal", email: "nauman.akmal@hivetech.com", phone: "+92 300 0000031", position: "Dialer (Ben Smith)", department: "Sales Operations", salary: 37258, joinDate: "2024-10-29", status: "Active" },
  { id: 32, name: "Mr. Ayaz Ali Shah", email: "ayaz.shah@hivetech.com", phone: "+92 300 0000032", position: "Dialer (Chris Walker)", department: "Sales Operations", salary: 139320, joinDate: "2024-10-15", status: "Active" },
  { id: 33, name: "Mr. Shakeel Ahmed", email: "shakeel.ahmed@hivetech.com", phone: "+92 300 0000033", position: "Packaging", department: "Sales Operations", salary: 60000, joinDate: "2024-03-01", status: "Active" },
  { id: 34, name: "Mr. Faaiz Ahmed", email: "faaiz.ahmed@hivetech.com", phone: "+92 300 0000034", position: "Dialer", department: "Sales Operations", salary: 22500, joinDate: "2024-10-27", status: "Active" },

  // Tech Department
  { id: 35, name: "Mr. Abdul Hannan Butt", email: "hannan.butt@hivetech.com", phone: "+92 300 0000035", position: "Director", department: "Tech Department", salary: 350000, joinDate: "2022-01-01", status: "Active" },
  { id: 36, name: "Mr. Azmeer Sheikh", email: "azmeer.sheikh@hivetech.com", phone: "+92 300 0000036", position: "CTO", department: "Tech Department", salary: 125000, joinDate: "2022-06-01", status: "Active" },
  { id: 37, name: "Ms. Atiqa Mohsin", email: "atiqa.mohsin@hivetech.com", phone: "+92 300 0000037", position: "Dy. CTO", department: "Tech Department", salary: 125000, joinDate: "2022-06-01", status: "Active" },
  { id: 38, name: "Mr. Faizan Basit (Tabish)", email: "faizan.basit@hivetech.com", phone: "+92 300 0000038", position: "Sr. SEO Executive", department: "Tech Department", salary: 160000, joinDate: "2022-09-01", status: "Active" },
  { id: 39, name: "Mr. Mhammad Muneeb", email: "m.muneeb@hivetech.com", phone: "+92 300 0000039", position: "Team Lead", department: "Tech Department", salary: 100000, joinDate: "2023-01-01", status: "Active" },
  { id: 40, name: "Mr. Ubadi Ali", email: "ubadi.ali@hivetech.com", phone: "+92 300 0000040", position: "SEO Executive", department: "Tech Department", salary: 55000, joinDate: "2023-03-01", status: "Active" },
  { id: 41, name: "Mr. Ahmad Ameen Sheikh", email: "ahmad.sheikh@hivetech.com", phone: "+92 300 0000041", position: "SEO Co-Ordinator", department: "Tech Department", salary: 50000, joinDate: "2023-04-01", status: "Active" },
  { id: 42, name: "Mr. Ameer Hamza", email: "ameer.hamza@hivetech.com", phone: "+92 300 0000042", position: "SEO Executive", department: "Tech Department", salary: 17742, joinDate: "2024-10-01", status: "Inactive" },
  { id: 43, name: "Mr. Zareen Amir Ghauri", email: "zareen.ghauri@hivetech.com", phone: "+92 300 0000043", position: "SEO Expert", department: "Tech Department", salary: 35000, joinDate: "2024-05-01", status: "Active" },
  { id: 44, name: "Mr. M Waqas Khalid", email: "waqas.khalid@hivetech.com", phone: "+92 300 0000044", position: "SEO Executive", department: "Tech Department", salary: 55000, joinDate: "2024-02-01", status: "Active" },
  { id: 45, name: "Mr. Ali Asghar", email: "ali.asghar@hivetech.com", phone: "+92 300 0000045", position: "SEO Expert", department: "Tech Department", salary: 45000, joinDate: "2024-03-01", status: "Active" },
  { id: 46, name: "Mr. Zikrriya", email: "zikrriya@hivetech.com", phone: "+92 300 0000046", position: "Link Builder", department: "Tech Department", salary: 35000, joinDate: "2024-04-01", status: "Active" },
  { id: 47, name: "Mr. M Abdul Rafay", email: "abdul.rafay@hivetech.com", phone: "+92 300 0000047", position: "Junior Product Developer", department: "Tech Department", salary: 15806, joinDate: "2024-10-01", status: "Inactive" },
  { id: 48, name: "Syed Muzammil Hussain", email: "muzammil.hussain@hivetech.com", phone: "+92 300 0000048", position: "SEO Intern", department: "Tech Department", salary: 15000, joinDate: "2024-07-01", status: "Active" },
  { id: 49, name: "Mr. Muhammad Mohsin", email: "m.mohsin@hivetech.com", phone: "+92 300 0000049", position: "Intern-Web", department: "Tech Department", salary: 25000, joinDate: "2024-08-01", status: "Active" },
  { id: 50, name: "Mr. Muhammad Sadeem", email: "m.sadeem@hivetech.com", phone: "+92 300 0000050", position: "Link Builder", department: "Tech Department", salary: 35000, joinDate: "2024-06-01", status: "Active" },
  { id: 51, name: "Syed M Hasnain Sherazi", email: "hasnain.sherazi2@hivetech.com", phone: "+92 300 0000051", position: "Intern-Web", department: "Tech Department", salary: 15000, joinDate: "2024-09-01", status: "Active" },
  { id: 52, name: "Mr. Saad Ali", email: "saad.ali@hivetech.com", phone: "+92 300 0000052", position: "Link Builder", department: "Tech Department", salary: 10000, joinDate: "2024-09-15", status: "Active" },
  { id: 53, name: "Mr. Ishtiaq Bilal", email: "ishtiaq.bilal@hivetech.com", phone: "+92 300 0000053", position: "Link Builder", department: "Tech Department", salary: 10000, joinDate: "2024-08-01", status: "Inactive" },
  { id: 54, name: "Mr. Muhammad Hussain", email: "m.hussain@hivetech.com", phone: "+92 300 0000054", position: "Developer", department: "Tech Department", salary: 70000, joinDate: "2024-05-01", status: "Active" },
  { id: 55, name: "Syed Mukarram Saeed", email: "mukarram.saeed@hivetech.com", phone: "+92 300 0000055", position: "Graphics Designer", department: "Tech Department", salary: 31500, joinDate: "2024-06-01", status: "Active" },
  { id: 56, name: "Mr. Mutayyab Irshad", email: "mutayyab.irshad@hivetech.com", phone: "+92 300 0000056", position: "Dev Intern", department: "Tech Department", salary: 10000, joinDate: "2024-10-01", status: "Active" },
  { id: 57, name: "Mr. Ali Raza", email: "ali.raza@hivetech.com", phone: "+92 300 0000057", position: "Reporting", department: "Tech Department", salary: 10000, joinDate: "2024-09-01", status: "Active" },
];

const mockInterviews: Interview[] = [];

// No dummy attendance - will start from Monday, December 16, 2024
const mockAttendanceRecords: AttendanceRecord[] = [];

// Leave Balances - Default 20 Annual, 10 Sick, 5 Casual per employee
const mockLeaveBalances = mockEmployees.map(emp => ({
  employeeId: emp.id,
  annual: 20,
  sick: 10,
  casual: 5,
}));

// USA Federal Holidays 2025
const mockHolidays: Holiday[] = [
  { id: 1, name: "New Year's Day", date: '2025-01-01', type: 'National', description: 'First day of the year' },
  { id: 2, name: "Martin Luther King Jr. Day", date: '2025-01-20', type: 'National', description: 'Honoring civil rights leader Martin Luther King Jr.' },
  { id: 3, name: "Presidents' Day", date: '2025-02-17', type: 'National', description: "Honoring all U.S. presidents, particularly Washington and Lincoln" },
  { id: 4, name: "Memorial Day", date: '2025-05-26', type: 'National', description: 'Remembering those who died in military service' },
  { id: 5, name: "Independence Day", date: '2025-07-04', type: 'National', description: 'Celebrating the Declaration of Independence' },
  { id: 6, name: "Labor Day", date: '2025-09-01', type: 'National', description: 'Honoring the American labor movement' },
  { id: 7, name: "Columbus Day", date: '2025-10-13', type: 'National', description: "Commemorating Christopher Columbus's arrival in the Americas" },
  { id: 8, name: "Veterans Day", date: '2025-11-11', type: 'National', description: 'Honoring military veterans' },
  { id: 9, name: "Thanksgiving Day", date: '2025-11-27', type: 'National', description: 'Traditional harvest festival' },
  { id: 10, name: "Christmas Day", date: '2025-12-25', type: 'National', description: 'Celebrating the birth of Jesus Christ' },
];

function App() {
  return (
    <AuthProvider>
      <MainApp />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

function MainApp() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State Management
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState(mockLeaveBalances);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>(mockHolidays);

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'daily-attendance':
        return (
          <DailyAttendance
            employees={employees}
            attendanceRecords={attendanceRecords}
            setAttendanceRecords={setAttendanceRecords}
          />
        );
      case 'employees':
        return (
          <EmployeePasswordGate>
            <EmployeeManagement employees={employees} setEmployees={setEmployees} />
          </EmployeePasswordGate>
        );
      case 'attendance':
        return (
          <AttendanceTracking
            employees={employees}
            attendanceRecords={attendanceRecords}
            setAttendanceRecords={setAttendanceRecords}
          />
        );
      case 'leaves':
        return (
          <LeaveManagement
            employees={employees}
            leaveRequests={leaveRequests}
            setLeaveRequests={setLeaveRequests}
            leaveBalances={leaveBalances}
            setLeaveBalances={setLeaveBalances}
          />
        );
      case 'documents':
        return (
          <Documents
            employees={employees}
            documents={documents}
            setDocuments={setDocuments}
          />
        );
      case 'interviews':
        return <InterviewManagement interviews={interviews} setInterviews={setInterviews} />;
      case 'announcements':
        return (
          <Announcements
            announcements={announcements}
            setAnnouncements={setAnnouncements}
          />
        );
      case 'holidays':
        return (
          <Holidays
            holidays={holidays}
            setHolidays={setHolidays}
          />
        );
      case 'analytics':
        return (
          <Analytics
            employees={employees}
            attendanceRecords={attendanceRecords}
          />
        );
      case 'labor-cost':
        return (
          <LaborCostDashboard
            employees={employees}
            attendanceRecords={attendanceRecords}
          />
        );
      case 'settings':
        return <Settings />;
      case 'user-management':
        return <UserManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed on left */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      {/* Main Content - Scrollable with margin for sidebar */}
      <div className="flex-1 flex flex-col lg:ml-72">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} setActiveTab={setActiveTab} />
        
        {/* Content Area */}
        <main className="flex-1 p-8">
          <Toaster />
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;