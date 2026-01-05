const mongoose = require('mongoose');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
const Attendance = require('./src/models/Attendance');
require('dotenv').config();

// 57 Real-time Employees Data
const employeesData = [
  // Phase 4 - Sales Operations
  { firstName: 'HR', lastName: 'Manager', email: 'hr@hivetech.com', phone: '+92 300 0000001', department: 'Sales', position: 'HR', salary: 100000, dateOfBirth: '1990-01-15', gender: 'Male', joiningDate: '2024-01-01', status: 'Active' },
  { firstName: 'Mr. Obaid', lastName: 'Hassan', email: 'obaid.hassan@hivetech.com', phone: '+92 300 0000002', department: 'Sales', position: 'Support (Sam)', salary: 115000, dateOfBirth: '1992-03-20', gender: 'Male', joiningDate: '2024-01-15', status: 'Active' },
  { firstName: 'Mr. Muhammad', lastName: 'Hunzala', email: 'm.hunzala@hivetech.com', phone: '+92 300 0000003', department: 'Sales', position: 'Dialer (Henry)', salary: 70000, dateOfBirth: '1995-05-10', gender: 'Male', joiningDate: '2024-02-01', status: 'Active' },
  { firstName: 'Mr. Ali', lastName: 'Haider', email: 'ali.haider@hivetech.com', phone: '+92 300 0000004', department: 'Sales', position: 'Dialer (Tyler)', salary: 80000, dateOfBirth: '1993-07-22', gender: 'Male', joiningDate: '2024-02-10', status: 'Active' },
  { firstName: 'Mr. Saifullah', lastName: 'Khan', email: 'saifullah@hivetech.com', phone: '+92 300 0000005', department: 'Sales', position: 'Dialer (Jaison)', salary: 45000, dateOfBirth: '1998-02-14', gender: 'Male', joiningDate: '2024-03-01', status: 'Active' },
  { firstName: 'Ms. Alisha', lastName: 'Batool', email: 'alisha.batool@hivetech.com', phone: '+92 300 0000006', department: 'Sales', position: 'Dialer (Julia)', salary: 45000, dateOfBirth: '1996-09-08', gender: 'Female', joiningDate: '2024-03-15', status: 'Active' },
  { firstName: 'Ms. Kainat', lastName: 'Zahra', email: 'kainat.zahra@hivetech.com', phone: '+92 300 0000007', department: 'Sales', position: 'Dialer (Stella)', salary: 45000, dateOfBirth: '1997-11-25', gender: 'Female', joiningDate: '2024-04-01', status: 'Active' },
  { firstName: 'Mr. Muhammd', lastName: 'Hassan', email: 'm.hassan@hivetech.com', phone: '+92 300 0000008', department: 'Sales', position: 'Dialer (Fred)', salary: 40000, dateOfBirth: '1999-04-12', gender: 'Male', joiningDate: '2024-04-10', status: 'Active' },
  { firstName: 'Mr. Haris', lastName: 'Shahzad', email: 'haris.shahzad@hivetech.com', phone: '+92 300 0000009', department: 'Sales', position: 'Dialer (Daniel Smith)', salary: 60000, dateOfBirth: '1994-06-30', gender: 'Male', joiningDate: '2024-05-01', status: 'Active' },
  { firstName: 'Ms. Faiza', lastName: 'Abbas', email: 'faiza.abbas@hivetech.com', phone: '+92 300 0000010', department: 'Sales', position: 'Lead Generation Specialist', salary: 22167, dateOfBirth: '2000-08-18', gender: 'Female', joiningDate: '2024-05-15', status: 'Active' },

  // Sales Operations
  { firstName: 'Mr. Qasim', lastName: 'Ali', email: 'qasim.ali@hivetech.com', phone: '+92 300 0000011', department: 'Sales', position: 'Director', salary: 125000, dateOfBirth: '1988-01-10', gender: 'Male', joiningDate: '2023-01-01', status: 'Active' },
  { firstName: 'Ms. Nazia', lastName: 'Ahmed', email: 'nazia@hivetech.com', phone: '+92 300 0000012', department: 'Sales', position: 'Director', salary: 125000, dateOfBirth: '1989-03-15', gender: 'Female', joiningDate: '2023-01-01', status: 'Active' },
  { firstName: 'Ms. Amna', lastName: 'Rauf', email: 'amna.rauf@hivetech.com', phone: '+92 300 0000013', department: 'Sales', position: 'Sales Closer', salary: 100000, dateOfBirth: '1991-05-20', gender: 'Female', joiningDate: '2023-03-01', status: 'Active' },
  { firstName: 'Ms. Noor', lastName: 'Fatima', email: 'noor.fatima@hivetech.com', phone: '+92 300 0000014', department: 'Sales', position: 'Eva Marshall', salary: 300000, dateOfBirth: '1987-02-28', gender: 'Female', joiningDate: '2023-02-01', status: 'Active' },
  { firstName: 'Mr. Umair', lastName: 'Azam', email: 'umair.azam@hivetech.com', phone: '+92 300 0000015', department: 'Sales', position: 'Sales Closer', salary: 175000, dateOfBirth: '1990-07-12', gender: 'Male', joiningDate: '2023-04-01', status: 'Active' },
  { firstName: 'Mr. Usman', lastName: 'Ali', email: 'usman.ali@hivetech.com', phone: '+92 300 0000016', department: 'Sales', position: 'Dialer (Ethen)', salary: 70000, dateOfBirth: '1994-09-05', gender: 'Male', joiningDate: '2023-05-01', status: 'Active' },
  { firstName: 'Syed', lastName: 'Husnain Sherazi', email: 'husnain.sherazi@hivetech.com', phone: '+92 300 0000017', department: 'Sales', position: 'Dialer (Andy)', salary: 65000, dateOfBirth: '1995-11-18', gender: 'Male', joiningDate: '2023-06-01', status: 'Active' },
  { firstName: 'Mr. Bilal', lastName: 'Azam', email: 'bilal.azam@hivetech.com', phone: '+92 300 0000018', department: 'Sales', position: 'Support (Leo)', salary: 70000, dateOfBirth: '1992-04-22', gender: 'Male', joiningDate: '2023-07-01', status: 'Active' },
  { firstName: 'Mr. Abu Baker', lastName: 'Saeed', email: 'abu.saeed@hivetech.com', phone: '+92 300 0000019', department: 'Sales', position: 'Dialer (Simon)', salary: 9032, dateOfBirth: '1996-10-30', gender: 'Male', joiningDate: '2024-10-01', status: 'Inactive' },
  { firstName: 'Mr. Umair', lastName: 'Iqbal', email: 'umair.iqbal@hivetech.com', phone: '+92 300 0000020', department: 'Sales', position: 'Dialer (Brian)', salary: 40000, dateOfBirth: '1998-12-08', gender: 'Male', joiningDate: '2024-06-01', status: 'Active' },
  { firstName: 'Mr. Elisha', lastName: 'Asif', email: 'elisha.asif@hivetech.com', phone: '+92 300 0000021', department: 'Sales', position: 'Dialer (James)', salary: 40000, dateOfBirth: '1999-01-14', gender: 'Male', joiningDate: '2024-06-15', status: 'Active' },
  { firstName: 'Mirza', lastName: 'Shehroze Baig', email: 'shehroze.baig@hivetech.com', phone: '+92 300 0000022', department: 'Sales', position: 'Dialer (Jeff)', salary: 65000, dateOfBirth: '1993-08-26', gender: 'Male', joiningDate: '2024-07-01', status: 'Active' },
  { firstName: 'Mr. Massab', lastName: 'Tahir', email: 'massab.tahir@hivetech.com', phone: '+92 300 0000023', department: 'Sales', position: 'Dialer (Kevin)', salary: 65000, dateOfBirth: '1994-10-11', gender: 'Male', joiningDate: '2024-07-15', status: 'Active' },
  { firstName: 'Mr. Hassan Naveed', lastName: 'Kahloon', email: 'hassan.kahloon@hivetech.com', phone: '+92 300 0000024', department: 'Sales', position: 'Dialer (Nick Johnson)', salary: 35000, dateOfBirth: '2000-03-17', gender: 'Male', joiningDate: '2024-08-01', status: 'Active' },
  { firstName: 'Mr. Muhammad', lastName: 'Faizan', email: 'm.faizan1@hivetech.com', phone: '+92 300 0000025', department: 'Sales', position: 'Dialer (Ted Miller)', salary: 35000, dateOfBirth: '2000-05-22', gender: 'Male', joiningDate: '2024-08-10', status: 'Active' },
  { firstName: 'Mr. Muhammad', lastName: 'Faizan', email: 'm.faizan2@hivetech.com', phone: '+92 300 0000026', department: 'Sales', position: 'Dialer (Blake Wilson)', salary: 35000, dateOfBirth: '2000-06-09', gender: 'Male', joiningDate: '2024-08-15', status: 'Active' },
  { firstName: 'Mr. M', lastName: 'Shahzaib Awan', email: 'shahzaib.awan@hivetech.com', phone: '+92 300 0000027', department: 'Sales', position: 'Dialer (Eric)', salary: 35000, dateOfBirth: '2000-07-03', gender: 'Male', joiningDate: '2024-09-01', status: 'Active' },
  { firstName: 'Mr. Khalid', lastName: 'Saifullah', email: 'khalid.saifullah@hivetech.com', phone: '+92 300 0000028', department: 'Sales', position: 'Dialer (Jack)', salary: 35000, dateOfBirth: '2000-08-14', gender: 'Male', joiningDate: '2024-09-10', status: 'Active' },
  { firstName: 'Mr. Usama', lastName: 'Ijaz', email: 'usama.ijaz@hivetech.com', phone: '+92 300 0000029', department: 'Sales', position: 'Dialer (Brevis)', salary: 35000, dateOfBirth: '2000-09-21', gender: 'Male', joiningDate: '2024-09-15', status: 'Active' },
  { firstName: 'Ms. Alisha', lastName: 'Ali', email: 'alisha.qa@hivetech.com', phone: '+92 300 0000030', department: 'Sales', position: 'QA', salary: 35000, dateOfBirth: '1999-10-12', gender: 'Female', joiningDate: '2024-10-01', status: 'Active' },
  { firstName: 'Mr. Nauman', lastName: 'Akmal', email: 'nauman.akmal@hivetech.com', phone: '+92 300 0000031', department: 'Sales', position: 'Dialer (Ben Smith)', salary: 37258, dateOfBirth: '2000-11-05', gender: 'Male', joiningDate: '2024-10-29', status: 'Active' },
  { firstName: 'Mr. Ayaz Ali', lastName: 'Shah', email: 'ayaz.shah@hivetech.com', phone: '+92 300 0000032', department: 'Sales', position: 'Dialer (Chris Walker)', salary: 139320, dateOfBirth: '1991-12-19', gender: 'Male', joiningDate: '2024-10-15', status: 'Active' },
  { firstName: 'Mr. Shakeel', lastName: 'Ahmed', email: 'shakeel.ahmed@hivetech.com', phone: '+92 300 0000033', department: 'Sales', position: 'Packaging', salary: 60000, dateOfBirth: '1997-01-07', gender: 'Male', joiningDate: '2024-03-01', status: 'Active' },
  { firstName: 'Mr. Faaiz', lastName: 'Ahmed', email: 'faaiz.ahmed@hivetech.com', phone: '+92 300 0000034', department: 'Sales', position: 'Dialer', salary: 22500, dateOfBirth: '2001-02-13', gender: 'Male', joiningDate: '2024-10-27', status: 'Active' },

  // Tech Department
  { firstName: 'Mr. Abdul Hannan', lastName: 'Butt', email: 'hannan.butt@hivetech.com', phone: '+92 300 0000035', department: 'IT', position: 'Director', salary: 350000, dateOfBirth: '1982-03-15', gender: 'Male', joiningDate: '2022-01-01', status: 'Active' },
  { firstName: 'Mr. Azmeer', lastName: 'Sheikh', email: 'azmeer.sheikh@hivetech.com', phone: '+92 300 0000036', department: 'IT', position: 'CTO', salary: 125000, dateOfBirth: '1985-06-22', gender: 'Male', joiningDate: '2022-06-01', status: 'Active' },
  { firstName: 'Ms. Atiqa', lastName: 'Mohsin', email: 'atiqa.mohsin@hivetech.com', phone: '+92 300 0000037', department: 'IT', position: 'Dy. CTO', salary: 125000, dateOfBirth: '1986-07-10', gender: 'Female', joiningDate: '2022-06-01', status: 'Active' },
  { firstName: 'Mr. Faizan', lastName: 'Basit (Tabish)', email: 'faizan.basit@hivetech.com', phone: '+92 300 0000038', department: 'IT', position: 'Sr. SEO Executive', salary: 160000, dateOfBirth: '1984-09-05', gender: 'Male', joiningDate: '2022-09-01', status: 'Active' },
  { firstName: 'Mr. Mhammad', lastName: 'Muneeb', email: 'm.muneeb@hivetech.com', phone: '+92 300 0000039', department: 'IT', position: 'Team Lead', salary: 100000, dateOfBirth: '1989-01-18', gender: 'Male', joiningDate: '2023-01-01', status: 'Active' },
  { firstName: 'Mr. Ubadi', lastName: 'Ali', email: 'ubadi.ali@hivetech.com', phone: '+92 300 0000040', department: 'IT', position: 'SEO Executive', salary: 55000, dateOfBirth: '1992-03-28', gender: 'Male', joiningDate: '2023-03-01', status: 'Active' },
  { firstName: 'Mr. Ahmad Ameen', lastName: 'Sheikh', email: 'ahmad.sheikh@hivetech.com', phone: '+92 300 0000041', department: 'IT', position: 'SEO Co-Ordinator', salary: 50000, dateOfBirth: '1993-04-12', gender: 'Male', joiningDate: '2023-04-01', status: 'Active' },
  { firstName: 'Mr. Ameer', lastName: 'Hamza', email: 'ameer.hamza@hivetech.com', phone: '+92 300 0000042', department: 'IT', position: 'SEO Executive', salary: 17742, dateOfBirth: '1998-10-20', gender: 'Male', joiningDate: '2024-10-01', status: 'Inactive' },
  { firstName: 'Mr. Zareen', lastName: 'Amir Ghauri', email: 'zareen.ghauri@hivetech.com', phone: '+92 300 0000043', department: 'IT', position: 'SEO Expert', salary: 35000, dateOfBirth: '1997-05-08', gender: 'Male', joiningDate: '2024-05-01', status: 'Active' },
  { firstName: 'Mr. M', lastName: 'Waqas Khalid', email: 'waqas.khalid@hivetech.com', phone: '+92 300 0000044', department: 'IT', position: 'SEO Executive', salary: 55000, dateOfBirth: '1995-02-14', gender: 'Male', joiningDate: '2024-02-01', status: 'Active' },
  { firstName: 'Mr. Ali', lastName: 'Asghar', email: 'ali.asghar@hivetech.com', phone: '+92 300 0000045', department: 'IT', position: 'SEO Expert', salary: 45000, dateOfBirth: '1996-03-25', gender: 'Male', joiningDate: '2024-03-01', status: 'Active' },
  { firstName: 'Mr. Zikrriya', lastName: 'Hassan', email: 'zikrriya@hivetech.com', phone: '+92 300 0000046', department: 'IT', position: 'Link Builder', salary: 35000, dateOfBirth: '1998-04-16', gender: 'Male', joiningDate: '2024-04-01', status: 'Active' },
  { firstName: 'Mr. M', lastName: 'Abdul Rafay', email: 'abdul.rafay@hivetech.com', phone: '+92 300 0000047', department: 'IT', position: 'Junior Product Developer', salary: 15806, dateOfBirth: '2002-10-09', gender: 'Male', joiningDate: '2024-10-01', status: 'Inactive' },
  { firstName: 'Syed', lastName: 'Muzammil Hussain', email: 'muzammil.hussain@hivetech.com', phone: '+92 300 0000048', department: 'IT', position: 'SEO Intern', salary: 15000, dateOfBirth: '2003-07-14', gender: 'Male', joiningDate: '2024-07-01', status: 'Active' },
  { firstName: 'Mr. Muhammad', lastName: 'Mohsin', email: 'm.mohsin@hivetech.com', phone: '+92 300 0000049', department: 'IT', position: 'Intern-Web', salary: 25000, dateOfBirth: '2002-08-19', gender: 'Male', joiningDate: '2024-08-01', status: 'Active' },
  { firstName: 'Mr. Muhammad', lastName: 'Sadeem', email: 'm.sadeem@hivetech.com', phone: '+92 300 0000050', department: 'IT', position: 'Link Builder', salary: 35000, dateOfBirth: '1999-06-11', gender: 'Male', joiningDate: '2024-06-01', status: 'Active' },
  { firstName: 'Syed M', lastName: 'Hasnain Sherazi', email: 'hasnain.sherazi2@hivetech.com', phone: '+92 300 0000051', department: 'IT', position: 'Intern-Web', salary: 15000, dateOfBirth: '2003-09-23', gender: 'Male', joiningDate: '2024-09-01', status: 'Active' },
  { firstName: 'Mr. Saad', lastName: 'Ali', email: 'saad.ali@hivetech.com', phone: '+92 300 0000052', department: 'IT', position: 'Link Builder', salary: 10000, dateOfBirth: '2003-09-27', gender: 'Male', joiningDate: '2024-09-15', status: 'Active' },
  { firstName: 'Mr. Ishtiaq', lastName: 'Bilal', email: 'ishtiaq.bilal@hivetech.com', phone: '+92 300 0000053', department: 'IT', position: 'Link Builder', salary: 10000, dateOfBirth: '2002-08-06', gender: 'Male', joiningDate: '2024-08-01', status: 'Inactive' },
  { firstName: 'Mr. Muhammad', lastName: 'Hussain', email: 'm.hussain@hivetech.com', phone: '+92 300 0000054', department: 'IT', position: 'Developer', salary: 70000, dateOfBirth: '1997-05-15', gender: 'Male', joiningDate: '2024-05-01', status: 'Active' },
  { firstName: 'Syed', lastName: 'Mukarram Saeed', email: 'mukarram.saeed@hivetech.com', phone: '+92 300 0000055', department: 'IT', position: 'Graphics Designer', salary: 31500, dateOfBirth: '1999-06-20', gender: 'Male', joiningDate: '2024-06-01', status: 'Active' },
  { firstName: 'Mr. Mutayyab', lastName: 'Irshad', email: 'mutayyab.irshad@hivetech.com', phone: '+92 300 0000056', department: 'IT', position: 'Dev Intern', salary: 10000, dateOfBirth: '2003-10-11', gender: 'Male', joiningDate: '2024-10-01', status: 'Active' },
  { firstName: 'Mr. Ali', lastName: 'Raza', email: 'ali.raza@hivetech.com', phone: '+92 300 0000057', department: 'IT', position: 'Reporting', salary: 10000, dateOfBirth: '2003-09-05', gender: 'Male', joiningDate: '2024-09-01', status: 'Active' },
];

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('\n✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Attendance.deleteMany({});
    console.log('✅ Data cleared\n');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@hr-portal.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create HR user
    const hrUser = await User.create({
      username: 'hr_manager',
      email: 'hr@hr-portal.com',
      password: 'hr123456',
      role: 'hr',
      isActive: true
    });
    console.log('✅ HR user created:', hrUser.email);

    // Create 57 employees
    console.log('\n📝 Creating 57 employees...');
    const createdEmployees = [];

    for (let i = 0; i < employeesData.length; i++) {
      const empData = employeesData[i];
      
      const employee = await Employee.create({
        employeeCode: `EMP${String(i + 1).padStart(4, '0')}`,
        firstName: empData.firstName,
        lastName: empData.lastName,
        email: empData.email,
        phone: empData.phone,
        dateOfBirth: new Date(empData.dateOfBirth),
        gender: empData.gender,
        address: {
          street: '123 Business Street',
          city: 'Lahore',
          state: 'Punjab',
          zipCode: '54000',
          country: 'Pakistan'
        },
        department: empData.department,
        position: empData.position,
        employmentType: 'Full-time',
        joiningDate: new Date(empData.joiningDate),
        salary: empData.salary,
        salaryType: 'Monthly',
        status: empData.status,
        emergencyContact: {
          name: `${empData.firstName} Family`,
          relationship: 'Family',
          phone: empData.phone
        },
        bankDetails: {
          accountNumber: `${Math.floor(Math.random() * 9000000000000000) + 1000000000000000}`,
          bankName: 'HBL Bank',
          ifscCode: 'HBLCPK',
          accountHolderName: `${empData.firstName} ${empData.lastName}`
        }
      });

      createdEmployees.push(employee);
      if ((i + 1) % 10 === 0) {
        console.log(`  ✅ Created ${i + 1}/57 employees`);
      }
    }
    console.log(`\n✅ All 57 employees created successfully!\n`);

    // Create daily attendance records for the last 30 days for all employees
    console.log('📋 Creating attendance records...');
    const attendanceRecords = [];
    const today = new Date();
    let processedDays = 0;
    
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - dayOffset);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      processedDays++;

      for (const employee of createdEmployees) {
        // Random attendance scenarios
        const random = Math.random();
        let status = 'Present';
        let checkIn = new Date(currentDate);
        let checkOut = new Date(currentDate);

        if (random < 0.05) {
          // 5% absent
          status = 'Absent';
          checkIn = null;
          checkOut = null;
        } else if (random < 0.10) {
          // 5% on leave
          status = 'On Leave';
          checkIn = null;
          checkOut = null;
        } else if (random < 0.15) {
          // 5% late
          status = 'Late';
          checkIn.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
          checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
        } else if (random < 0.20) {
          // 5% half day
          status = 'Half Day';
          checkIn.setHours(8 + Math.floor(Math.random() * 1), Math.floor(Math.random() * 60));
          checkOut.setHours(12 + Math.floor(Math.random() * 1), Math.floor(Math.random() * 60));
        } else {
          // 80% present (normal 8-hour day)
          checkIn.setHours(8, Math.floor(Math.random() * 30));
          checkOut.setHours(17, Math.floor(Math.random() * 60));
        }

        if (checkIn && checkOut) {
          attendanceRecords.push({
            employee: employee._id,
            date: currentDate,
            checkIn: checkIn,
            checkOut: checkOut,
            status: status,
            isRemote: Math.random() < 0.3 // 30% remote work
          });
        } else {
          attendanceRecords.push({
            employee: employee._id,
            date: currentDate,
            checkIn: null,
            checkOut: null,
            status: status,
            isRemote: false
          });
        }
      }

      if (processedDays % 3 === 0) {
        console.log(`  ✅ Processed ${processedDays} working days`);
      }
    }

    // Insert all attendance records
    await Attendance.insertMany(attendanceRecords);
    console.log(`\n✅ Created ${attendanceRecords.length} attendance records\n`);

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ SEED DATA CREATION COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Summary:`);
    console.log(`   • Users Created: 2 (1 Admin + 1 HR Manager)`);
    console.log(`   • Employees Created: 57`);
    console.log(`   • Attendance Records: ${attendanceRecords.length}`);
    console.log(`   • Days of Attendance Data: ${processedDays} working days`);
    console.log(`\n🔐 Test Credentials:`);
    console.log(`   Admin:  admin@hr-portal.com / admin123`);
    console.log(`   HR:     hr@hr-portal.com / hr123456`);
    console.log(`\n📋 Employee Distribution:`);
    const deptCounts = {};
    createdEmployees.forEach(emp => {
      deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
    });
    Object.entries(deptCounts).forEach(([dept, count]) => {
      console.log(`   • ${dept}: ${count} employees`);
    });
    console.log('\n═══════════════════════════════════════════════════════════\n');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
