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

    const sampleUsers = [
      {
        name: 'Elena Rostova',
        email: 'employee@worknest.io',
        password: defaultPassword,
        role: 'EMPLOYEE',
      },
      {
        name: 'Marcus Vance',
        email: 'manager@worknest.io',
        password: defaultPassword,
        role: 'MANAGER',
      },
      {
        name: 'Sarah Connor',
        email: 'admin@worknest.io',
        password: defaultPassword,
        role: 'ADMIN',
      },
    ];

    for (const userData of sampleUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        existing.name = userData.name;
        existing.role = userData.role;
        existing.password = userData.password;
        existing.isActive = true;
        await existing.save();
        console.log(`[Seed] Updated ${userData.role} user: ${userData.email}`);
      } else {
        await User.create(userData);
        console.log(`[Seed] Created ${userData.role} user: ${userData.email}`);
      }
    }

    console.log('[Seed] Successfully seeded development users.');
    console.log('--- Development Test Accounts ---');
    console.log('Employee: employee@worknest.io / Password123!');
    console.log('Manager:  manager@worknest.io  / Password123!');
    console.log('Admin:    admin@worknest.io    / Password123!');
    console.log('---------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Seeding failed:', error.message);
    process.exit(1);
  }
};

seedUsers();
