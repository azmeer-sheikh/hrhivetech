const mongoose = require('mongoose');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data (optional - remove in production)
    console.log('Clearing existing users...');
    await User.deleteMany({});
    console.log('Clearing existing employees...');
    await Employee.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@hr-portal.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    console.log('Admin user created:', adminUser.email);

    // Create HR user
    const hrUser = await User.create({
      username: 'hr_manager',
      email: 'hr@hr-portal.com',
      password: 'hr123456',
      role: 'hr',
      isActive: true
    });

    console.log('HR user created:', hrUser.email);

    // Create sample employees
    const employee1 = await Employee.create({
      employeeCode: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@hr-portal.com',
      phone: '+1234567890',
      dateOfBirth: new Date('1990-01-15'),
      gender: 'Male',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      department: 'Engineering',
      position: 'Senior Software Engineer',
      employmentType: 'Full-time',
      joiningDate: new Date('2020-01-01'),
      salary: 80000,
      salaryType: 'Annual',
      status: 'Active',
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1234567891'
      }
    });

    console.log('Sample employee created:', employee1.fullName);

    const employee2 = await Employee.create({
      employeeCode: 'EMP002',
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'sarah.smith@hr-portal.com',
      phone: '+1234567892',
      dateOfBirth: new Date('1992-05-20'),
      gender: 'Female',
      address: {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA'
      },
      department: 'Marketing',
      position: 'Marketing Manager',
      employmentType: 'Full-time',
      joiningDate: new Date('2019-06-15'),
      salary: 70000,
      salaryType: 'Annual',
      status: 'Active',
      emergencyContact: {
        name: 'Tom Smith',
        relationship: 'Brother',
        phone: '+1234567893'
      }
    });

    console.log('Sample employee created:', employee2.fullName);

    // Link employee to user
    const employeeUser = await User.create({
      username: 'john.doe',
      email: 'john.doe@hr-portal.com',
      password: 'password123',
      role: 'employee',
      employeeId: employee1._id,
      isActive: true
    });

    console.log('Employee user created:', employeeUser.email);

    console.log('\n=== Seed Data Complete ===');
    console.log('\nDefault Login Credentials:');
    console.log('Admin: admin@hr-portal.com / admin123');
    console.log('HR: hr@hr-portal.com / hr123');
    console.log('Employee: john.doe@hr-portal.com / password123');
    console.log('\n========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
