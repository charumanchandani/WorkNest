import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import User from '../models/User.js';
import Department from '../models/Department.js';

const seedUsers = async () => {
  if (ENV.NODE_ENV === 'production') {
    console.error('Error: Seeding is disabled in production environment.');
    process.exit(1);
  }

  try {
    console.log('[Seed] Connecting to MongoDB at:', ENV.MONGODB_URI);
    await mongoose.connect(ENV.MONGODB_URI);

    const defaultPassword = 'Password123!';

    // 1. Seed Core Users
    const sampleEmployees = [
      {
        employeeId: 'WN-0001',
        firstName: 'Sarah',
        lastName: 'Connor',
        name: 'Sarah Connor',
        email: 'admin@worknest.io',
        password: defaultPassword,
        role: 'ADMIN',
        jobTitle: 'Head of People Operations',
        phone: '+1 (555) 234-5678',
        location: 'New York HQ',
        joiningDate: new Date('2024-01-15'),
        status: 'ACTIVE',
        isActive: true,
      },
      {
        employeeId: 'WN-0002',
        firstName: 'Marcus',
        lastName: 'Vance',
        name: 'Marcus Vance',
        email: 'manager@worknest.io',
        password: defaultPassword,
        role: 'MANAGER',
        jobTitle: 'Engineering Operations Lead',
        phone: '+1 (555) 345-6789',
        location: 'San Francisco Hub',
        joiningDate: new Date('2024-03-01'),
        status: 'ACTIVE',
        isActive: true,
      },
      {
        employeeId: 'WN-0003',
        firstName: 'Elena',
        lastName: 'Rostova',
        name: 'Elena Rostova',
        email: 'employee@worknest.io',
        password: defaultPassword,
        role: 'EMPLOYEE',
        jobTitle: 'Senior Product Designer',
        phone: '+1 (555) 456-7890',
        location: 'Remote - Austin',
        joiningDate: new Date('2024-06-10'),
        status: 'ACTIVE',
        isActive: true,
      },
      {
        employeeId: 'WN-0004',
        firstName: 'David',
        lastName: 'Chen',
        name: 'David Chen',
        email: 'david.chen@worknest.io',
        password: defaultPassword,
        role: 'EMPLOYEE',
        jobTitle: 'Full-Stack Software Engineer',
        phone: '+1 (555) 567-8901',
        location: 'Remote - Seattle',
        joiningDate: new Date('2024-08-01'),
        status: 'ACTIVE',
        isActive: true,
      },
      {
        employeeId: 'WN-0005',
        firstName: 'Amara',
        lastName: 'Okafor',
        name: 'Amara Okafor',
        email: 'amara.okafor@worknest.io',
        password: defaultPassword,
        role: 'MANAGER',
        jobTitle: 'Workplace Experience Manager',
        phone: '+1 (555) 678-9012',
        location: 'Chicago Office',
        joiningDate: new Date('2024-04-12'),
        status: 'ACTIVE',
        isActive: true,
      },
      {
        employeeId: 'WN-0006',
        firstName: 'Liam',
        lastName: 'Nakamura',
        name: 'Liam Nakamura',
        email: 'liam.nakamura@worknest.io',
        password: defaultPassword,
        role: 'EMPLOYEE',
        jobTitle: 'HR Operations Coordinator',
        phone: '+1 (555) 789-0123',
        location: 'New York HQ',
        joiningDate: new Date('2025-01-08'),
        status: 'INACTIVE',
        isActive: false,
      },
    ];

    const savedUsersMap = {};

    for (const empData of sampleEmployees) {
      let user = await User.findOne({ email: empData.email });
      if (user) {
        user.employeeId = empData.employeeId;
        user.firstName = empData.firstName;
        user.lastName = empData.lastName;
        user.name = empData.name;
        user.role = empData.role;
        user.jobTitle = empData.jobTitle;
        user.phone = empData.phone;
        user.location = empData.location;
        user.joiningDate = empData.joiningDate;
        user.status = empData.status;
        user.isActive = empData.isActive;
        user.password = empData.password;
        await user.save();
      } else {
        user = await User.create(empData);
      }
      savedUsersMap[empData.email] = user;
    }

    // 2. Seed Standard Departments with Managers
    const sampleDepartments = [
      {
        name: 'Engineering',
        code: 'ENG',
        description: 'Software development, infrastructure, and technical product engineering.',
        managerEmail: 'manager@worknest.io',
        status: 'ACTIVE',
      },
      {
        name: 'People & Culture',
        code: 'HR',
        description: 'Human resources, talent acquisition, onboarding, and employee relations.',
        managerEmail: 'admin@worknest.io',
        status: 'ACTIVE',
      },
      {
        name: 'Product & Design',
        code: 'PROD',
        description: 'User experience design, product strategy, and user research.',
        managerEmail: 'amara.okafor@worknest.io',
        status: 'ACTIVE',
      },
      {
        name: 'Workplace Operations',
        code: 'OPS',
        description: 'Facility management, logistics, and workplace administration.',
        managerEmail: 'amara.okafor@worknest.io',
        status: 'ACTIVE',
      },
    ];

    const savedDeptsMap = {};

    for (const deptData of sampleDepartments) {
      const managerUser = savedUsersMap[deptData.managerEmail];
      let dept = await Department.findOne({ code: deptData.code });
      if (dept) {
        dept.name = deptData.name;
        dept.description = deptData.description;
        dept.manager = managerUser ? managerUser._id : null;
        dept.status = deptData.status;
        await dept.save();
      } else {
        dept = await Department.create({
          name: deptData.name,
          code: deptData.code,
          description: deptData.description,
          manager: managerUser ? managerUser._id : null,
          status: deptData.status,
        });
      }
      savedDeptsMap[deptData.code] = dept;
      console.log(`[Seed] Seeded Department [${dept.code}]: ${dept.name}`);
    }

    // 3. Link Employees to Departments
    const assignments = [
      { email: 'admin@worknest.io', deptCode: 'HR' },
      { email: 'manager@worknest.io', deptCode: 'ENG' },
      { email: 'david.chen@worknest.io', deptCode: 'ENG' },
      { email: 'elena.rostova@worknest.io', deptCode: 'PROD' },
      { email: 'employee@worknest.io', deptCode: 'PROD' },
      { email: 'amara.okafor@worknest.io', deptCode: 'OPS' },
      { email: 'liam.nakamura@worknest.io', deptCode: 'HR' },
    ];

    for (const assign of assignments) {
      const u = savedUsersMap[assign.email];
      const d = savedDeptsMap[assign.deptCode];
      if (u && d) {
        u.department = d._id;
        await u.save();
      }
    }

    console.log('[Seed] Successfully seeded development employees and departments.');
    console.log('--- Development Test Accounts ---');
    console.log('Admin:    admin@worknest.io    / Password123!');
    console.log('Manager:  manager@worknest.io  / Password123!');
    console.log('Employee: employee@worknest.io / Password123!');
    console.log('---------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Seeding failed:', error.message);
    process.exit(1);
  }
};

seedUsers();
