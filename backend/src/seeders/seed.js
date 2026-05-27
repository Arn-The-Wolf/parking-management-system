require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { connectDB } = require('../config/database');
const { User, Parking, CarEntry } = require('../models');

const seed = async () => {
  await connectDB();

  console.log('🗑️  Clearing existing data...');

  // Delete in correct order (child tables first)
  await CarEntry.destroy({ where: {}, truncate: true, cascade: true });
  await Parking.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });

  console.log('✅ All tables cleared.');
  console.log('🌱 Seeding fresh data...\n');

  // ── Users ──────────────────────────────────────────────────────────────────
  const admin = await User.create({
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@parking.com',
    password: 'admin123',
    role: 'admin',
  });
  console.log(`✅ Admin created:     ${admin.email} / admin123`);

  const attendant1 = await User.create({
    firstName: 'John',
    lastName: 'Mugisha',
    email: 'john@parking.com',
    password: 'john1234',
    role: 'parking_attendant',
  });
  console.log(`✅ Attendant created: ${attendant1.email} / john1234`);

  const attendant2 = await User.create({
    firstName: 'Alice',
    lastName: 'Uwase',
    email: 'alice@parking.com',
    password: 'alice1234',
    role: 'parking_attendant',
  });
  console.log(`✅ Attendant created: ${attendant2.email} / alice1234`);

  // ── Parkings ───────────────────────────────────────────────────────────────
  const parkings = [
    {
      code: 'PKG-001',
      name: 'City Center Parking',
      totalSpaces: 100,
      availableSpaces: 100,
      location: 'Kigali City Center, Rwanda',
      chargingFeePerHour: 500,
    },
    {
      code: 'PKG-002',
      name: 'Kigali Airport Parking',
      totalSpaces: 200,
      availableSpaces: 200,
      location: 'Kigali International Airport, Rwanda',
      chargingFeePerHour: 1000,
    },
    {
      code: 'PKG-003',
      name: 'Nyamirambo Parking',
      totalSpaces: 50,
      availableSpaces: 50,
      location: 'Nyamirambo, Kigali, Rwanda',
      chargingFeePerHour: 300,
    },
    {
      code: 'PKG-004',
      name: 'Remera Parking',
      totalSpaces: 80,
      availableSpaces: 80,
      location: 'Remera, Kigali, Rwanda',
      chargingFeePerHour: 400,
    },
  ];

  for (const p of parkings) {
    await Parking.create(p);
    console.log(`✅ Parking created:   ${p.code} — ${p.name}`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin:     admin@parking.com    / admin123');
  console.log('   Attendant: john@parking.com     / john1234');
  console.log('   Attendant: alice@parking.com    / alice1234');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
