import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import User from '../models/User.js';

const seedUsers = async () => {
  if (ENV.NODE_ENV === 'production') {
    console.error('Error: Seeding is disabled in production environment.');
    process.exit(1);
  }

  try {
    console.log('[Seed] Connecting to MongoDB at:', ENV.MONGODB_URI);
    await mongoose.connect(ENV.MONGODB_URI);

    const defaultPassword = 'Password123!';

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

    for (const empData of sampleEmployees) {
      const existing = await User.findOne({ email: empData.email });
      if (existing) {
        existing.employeeId = empData.employeeId;
        existing.firstName = empData.firstName;
        existing.lastName = empData.lastName;
        existing.name = empData.name;
        existing.role = empData.role;
        existing.jobTitle = empData.jobTitle;
        existing.phone = empData.phone;
        existing.location = empData.location;
        existing.joiningDate = empData.joiningDate;
        existing.status = empData.status;
        existing.isActive = empData.isActive;
        existing.password = empData.password;
        await existing.save();
        console.log(`[Seed] Updated ${empData.role} (${empData.employeeId}): ${empData.email}`);
      } else {
        await User.create(empData);
        console.log(`[Seed] Created ${empData.role} (${empData.employeeId}): ${empData.email}`);
      }
    }

    console.log('[Seed] Successfully seeded development employees.');
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
