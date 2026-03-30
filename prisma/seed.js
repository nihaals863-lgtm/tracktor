import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const services = [
    { name: 'plough', baseRatePerHectare: 900 },
    { name: 'harrow', baseRatePerHectare: 800 },
    { name: 'ridge', baseRatePerHectare: 700 },
    { name: 'full', baseRatePerHectare: 2200 },
  ];

  console.log('Seeding services...');

  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: { baseRatePerHectare: service.baseRatePerHectare },
      create: service,
    });
  }

  console.log('Seeding demo users...');
  
  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashFarmer = await bcrypt.hash('farmer123', 10);
  const passwordHashOperator = await bcrypt.hash('operator123', 10);

  const demoUsers = [
    { name: 'Admin Demo', email: 'admin@tractorlink.com', passwordHash: passwordHashAdmin, role: 'admin', phone: '1111111111' },
    { name: 'Farmer Demo', email: 'farmer@tractorlink.com', passwordHash: passwordHashFarmer, role: 'farmer', phone: '2222222222' },
    { name: 'Operator Demo', email: 'operator@tractorlink.com', passwordHash: passwordHashOperator, role: 'operator', phone: '3333333333' }
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  console.log('Seeding demo tractor...');
  const operatorUser = await prisma.user.findUnique({ where: { email: 'operator@tractorlink.com' } });
  if (operatorUser) {
    await prisma.tractor.upsert({
      where: { plateNumber: 'TL-DEMO-01' },
      update: { operatorId: operatorUser.id },
      create: {
        modelName: 'Mahindra 575 DI',
        plateNumber: 'TL-DEMO-01',
        status: 'available',
        operatorId: operatorUser.id
      }
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
