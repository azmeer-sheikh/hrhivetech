const mongoose = require('mongoose');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
const Attendance = require('./src/models/Attendance');
require('dotenv').config();

// 57 Employees Data
const employeesData = [
  // Engineering Department (15 employees)
  { firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com', department: 'Engineering', position: 'Senior Engineer', salary: 120000 },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com', department: 'Engineering', position: 'Software Engineer', salary: 95000 },
  { firstName: 'Michael', lastName: 'Johnson', email: 'michael.johnson@company.com', department: 'Engineering', position: 'Full Stack Developer', salary: 100000 },
  { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@company.com', department: 'Engineering', position: 'Frontend Developer', salary: 90000 },
  { firstName: 'David', lastName: 'Brown', email: 'david.brown@company.com', department: 'Engineering', position: 'Backend Developer', salary: 95000 },
  { firstName: 'Emma', lastName: 'Davis', email: 'emma.davis@company.com', department: 'Engineering', position: 'QA Engineer', salary: 80000 },
  { firstName: 'Robert', lastName: 'Miller', email: 'robert.miller@company.com', department: 'Engineering', position: 'DevOps Engineer', salary: 110000 },
  { firstName: 'Lisa', lastName: 'Wilson', email: 'lisa.wilson@company.com', department: 'Engineering', position: 'Software Architect', salary: 130000 },
  { firstName: 'James', lastName: 'Moore', email: 'james.moore@company.com', department: 'Engineering', position: 'Tech Lead', salary: 115000 },
  { firstName: 'Mary', lastName: 'Taylor', email: 'mary.taylor@company.com', department: 'Engineering', position: 'Mobile Developer', salary: 92000 },
  { firstName: 'William', lastName: 'Anderson', email: 'william.anderson@company.com', department: 'Engineering', position: 'Database Engineer', salary: 105000 },
  { firstName: 'Jennifer', lastName: 'Thomas', email: 'jennifer.thomas@company.com', department: 'Engineering', position: 'Security Engineer', salary: 115000 },
  { firstName: 'Richard', lastName: 'Jackson', email: 'richard.jackson@company.com', department: 'Engineering', position: 'Solutions Architect', salary: 125000 },
  { firstName: 'Patricia', lastName: 'White', email: 'patricia.white@company.com', department: 'Engineering', position: 'ML Engineer', salary: 130000 },
  { firstName: 'Charles', lastName: 'Harris', email: 'charles.harris@company.com', department: 'Engineering', position: 'Cloud Engineer', salary: 112000 },

  // HR Department (8 employees)
  { firstName: 'Michelle', lastName: 'Clark', email: 'michelle.clark@company.com', department: 'HR', position: 'HR Manager', salary: 85000 },
  { firstName: 'Kevin', lastName: 'Lewis', email: 'kevin.lewis@company.com', department: 'HR', position: 'Recruiter', salary: 75000 },
  { firstName: 'Amanda', lastName: 'Walker', email: 'amanda.walker@company.com', department: 'HR', position: 'HR Specialist', salary: 70000 },
  { firstName: 'Daniel', lastName: 'Hall', email: 'daniel.hall@company.com', department: 'HR', position: 'Benefits Administrator', salary: 65000 },
  { firstName: 'Karen', lastName: 'Allen', email: 'karen.allen@company.com', department: 'HR', position: 'Talent Acquisition', salary: 78000 },
  { firstName: 'Paul', lastName: 'Young', email: 'paul.young@company.com', department: 'HR', position: 'Training Coordinator', salary: 62000 },
  { firstName: 'Susan', lastName: 'Hernandez', email: 'susan.hernandez@company.com', department: 'HR', position: 'Compensation Analyst', salary: 72000 },
  { firstName: 'Mark', lastName: 'King', email: 'mark.king@company.com', department: 'HR', position: 'HR Business Partner', salary: 88000 },

  // Sales Department (10 employees)
  { firstName: 'Christopher', lastName: 'Wright', email: 'christopher.wright@company.com', department: 'Sales', position: 'Sales Manager', salary: 90000 },
  { firstName: 'Nancy', lastName: 'Lopez', email: 'nancy.lopez@company.com', department: 'Sales', position: 'Account Executive', salary: 80000 },
  { firstName: 'Thomas', lastName: 'Hill', email: 'thomas.hill@company.com', department: 'Sales', position: 'Sales Representative', salary: 70000 },
  { firstName: 'Lisa', lastName: 'Scott', email: 'lisa.scott@company.com', department: 'Sales', position: 'Business Development', salary: 85000 },
  { firstName: 'Steven', lastName: 'Green', email: 'steven.green@company.com', department: 'Sales', position: 'Sales Executive', salary: 82000 },
  { firstName: 'Betty', lastName: 'Adams', email: 'betty.adams@company.com', department: 'Sales', position: 'Account Manager', salary: 75000 },
  { firstName: 'Joseph', lastName: 'Nelson', email: 'joseph.nelson@company.com', department: 'Sales', position: 'Regional Sales Lead', salary: 95000 },
  { firstName: 'Margaret', lastName: 'Carter', email: 'margaret.carter@company.com', department: 'Sales', position: 'Sales Coordinator', salary: 65000 },
  { firstName: 'Edward', lastName: 'Mitchell', email: 'edward.mitchell@company.com', department: 'Sales', position: 'Sales Director', salary: 120000 },
  { firstName: 'Dorothy', lastName: 'Perez', email: 'dorothy.perez@company.com', department: 'Sales', position: 'Enterprise Account Executive', salary: 95000 },

  // Marketing Department (8 employees)
  { firstName: 'Ronald', lastName: 'Roberts', email: 'ronald.roberts@company.com', department: 'Marketing', position: 'Marketing Manager', salary: 88000 },
  { firstName: 'Carol', lastName: 'Phillips', email: 'carol.phillips@company.com', department: 'Marketing', position: 'Digital Marketer', salary: 75000 },
  { firstName: 'George', lastName: 'Campbell', email: 'george.campbell@company.com', department: 'Marketing', position: 'Content Marketing', salary: 72000 },
  { firstName: 'Sandra', lastName: 'Parker', email: 'sandra.parker@company.com', department: 'Marketing', position: 'Social Media Specialist', salary: 68000 },
  { firstName: 'Kenneth', lastName: 'Evans', email: 'kenneth.evans@company.com', department: 'Marketing', position: 'Marketing Coordinator', salary: 60000 },
  { firstName: 'Shirley', lastName: 'Edwards', email: 'shirley.edwards@company.com', department: 'Marketing', position: 'Brand Manager', salary: 85000 },
  { firstName: 'Matthew', lastName: 'Collins', email: 'matthew.collins@company.com', department: 'Marketing', position: 'Marketing Director', salary: 110000 },
  { firstName: 'Angela', lastName: 'Stewart', email: 'angela.stewart@company.com', department: 'Marketing', position: 'SEO Specialist', salary: 70000 },

  // Finance Department (8 employees)
  { firstName: 'Donald', lastName: 'Sanchez', email: 'donald.sanchez@company.com', department: 'Finance', position: 'Finance Manager', salary: 95000 },
  { firstName: 'Helen', lastName: 'Morris', email: 'helen.morris@company.com', department: 'Finance', position: 'Accountant', salary: 75000 },
  { firstName: 'Ashley', lastName: 'Rogers', email: 'ashley.rogers@company.com', department: 'Finance', position: 'Financial Analyst', salary: 80000 },
  { firstName: 'Brian', lastName: 'Morgan', email: 'brian.morgan@company.com', department: 'Finance', position: 'Senior Accountant', salary: 88000 },
  { firstName: 'Kathleen', lastName: 'Peterson', email: 'kathleen.peterson@company.com', department: 'Finance', position: 'Controller', salary: 110000 },
  { firstName: 'Gary', lastName: 'Gray', email: 'gary.gray@company.com', department: 'Finance', position: 'Budget Analyst', salary: 72000 },
  { firstName: 'Donna', lastName: 'Ramirez', email: 'donna.ramirez@company.com', department: 'Finance', position: 'Payroll Specialist', salary: 70000 },
  { firstName: 'Edward', lastName: 'James', email: 'edward.james@company.com', department: 'Finance', position: 'CFO', salary: 150000 },

  // Operations Department (5 employees)
  { firstName: 'Frank', lastName: 'Bennett', email: 'frank.bennett@company.com', department: 'Operations', position: 'Operations Manager', salary: 88000 },
  { firstName: 'Grace', lastName: 'Wood', email: 'grace.wood@company.com', department: 'Operations', position: 'Operations Specialist', salary: 70000 },
  { firstName: 'Henry', lastName: 'Ross', email: 'henry.ross@company.com', department: 'Operations', position: 'Logistics Coordinator', salary: 65000 },
  { firstName: 'Irene', lastName: 'Henderson', email: 'irene.henderson@company.com', department: 'Operations', position: 'Supply Chain Analyst', salary: 75000 },
  { firstName: 'Jack', lastName: 'Coleman', email: 'jack.coleman@company.com', department: 'Operations', position: 'Operations Director', salary: 105000 },

  // IT Department (5 employees)
  { firstName: 'Kevin', lastName: 'Jenkins', email: 'kevin.jenkins@company.com', department: 'IT', position: 'IT Manager', salary: 90000 },
  { firstName: 'Laura', lastName: 'Perry', email: 'laura.perry@company.com', department: 'IT', position: 'IT Support Specialist', salary: 65000 },
  { firstName: 'Michael', lastName: 'Powell', email: 'michael.powell@company.com', department: 'IT', position: 'Network Administrator', salary: 80000 },
  { firstName: 'Nancy', lastName: 'Long', email: 'nancy.long@company.com', department: 'IT', position: 'System Administrator', salary: 85000 },
  { firstName: 'Oliver', lastName: 'Patterson', email: 'oliver.patterson@company.com', department: 'IT', position: 'IT Director', salary: 115000 },
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
    const genders = ['Male', 'Female'];

    for (let i = 0; i < employeesData.length; i++) {
      const empData = employeesData[i];
      
      const employee = await Employee.create({
        employeeCode: `EMP${String(i + 1).padStart(4, '0')}`,
        firstName: empData.firstName,
        lastName: empData.lastName,
        email: empData.email,
        phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        dateOfBirth: new Date(1980 + Math.floor(Math.random() * 25), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: genders[Math.floor(Math.random() * 2)],
        address: {
          street: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
          state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
          zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          country: 'USA'
        },
        department: empData.department,
        position: empData.position,
        employmentType: ['Full-time', 'Part-time'][Math.floor(Math.random() * 2)],
        joiningDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        salary: empData.salary,
        salaryType: 'Monthly',
        status: 'Active',
        emergencyContact: {
          name: `${empData.firstName} Family`,
          relationship: 'Family',
          phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`
        },
        bankDetails: {
          accountNumber: `${Math.floor(Math.random() * 9000000000000000) + 1000000000000000}`,
          bankName: 'Chase Bank',
          ifscCode: 'CHASUS33',
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
