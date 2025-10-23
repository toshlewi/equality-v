import connectDB from '../lib/mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
  await connectDB();
  console.log('Database connected for seeding.');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  try {
    let adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
      // Optionally update password if it's different
      const isSamePassword = await bcrypt.compare(adminPassword, adminUser.password);
      if (!isSamePassword) {
        adminUser.password = await bcrypt.hash(adminPassword, 10);
        await adminUser.save();
        console.log('Admin password updated.');
      }
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      adminUser = await User.create({
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'admin',
        isActive: true,
        emailVerified: true, // Mark as verified for initial admin
        permissions: [
          { resource: 'all', actions: ['create', 'read', 'update', 'delete'] }
        ]
      });
      console.log(`Admin user ${adminName} created successfully.`);
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  } finally {
    // Mongoose connection might not have a direct disconnect method if it's cached globally
    // For a script, it's usually fine to let it exit, which closes the connection.
    // If you need explicit disconnect, ensure your connectDB provides it.
    console.log('Admin seeding process finished.');
    process.exit(0);
  }
};

seedAdmin();