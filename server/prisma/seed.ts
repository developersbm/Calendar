import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function clearData() {
  // Delete child records first, then parent records
  await prisma.eventParticipant.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.savingPlan.deleteMany();
  await prisma.event.deleteMany();

  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.group.deleteMany();
  await prisma.template.deleteMany();
  await prisma.calendar.deleteMany();

  console.log('Data cleared successfully.');
}

async function seedData() {
  const seedFiles = [
    { model: prisma.calendar, file: 'calendar.json' },
    { model: prisma.template, file: 'template.json' },
    { model: prisma.group, file: 'group.json' },
    { model: prisma.membership, file: 'membership.json' },
    { model: prisma.user, file: 'user.json' },
    { model: prisma.event, file: 'event.json' },
    { model: prisma.savingPlan, file: 'savingPlan.json' },
    { model: prisma.groupMember, file: 'groupMember.json' },
    { model: prisma.eventParticipant, file: 'eventParticipant.json' },
    { model: prisma.notification, file: 'notification.json' },
    { model: prisma.auditLog, file: 'auditLog.json' },
  ];

  for (const { model, file } of seedFiles) {
    try {
      const jsonData = JSON.parse(fs.readFileSync(`prisma/seedData/${file}`, 'utf8'));
      for (const data of jsonData) {
        try {
          // Explicitly cast the model to the correct Prisma model type
          await (model as any).create({ data });
        } catch (error) {
          console.error(`Error seeding data for ${file}:`, error);
        }
      }
      console.log(`Seeded ${file} successfully.`);
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }
}

async function main() {
  try {
    console.log('Clearing old data...');
    await clearData();
    console.log('Seeding new data...');
    await seedData();
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('An error occurred during the seeding process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
