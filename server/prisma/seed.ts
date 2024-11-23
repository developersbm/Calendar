import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  for (const modelName of modelNames) {
    const model: any = prisma[modelName as keyof typeof prisma];
    try {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } catch (error) {
      console.error(`Error clearing data from ${modelName}:`, error);
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "calendar.json",        // 1. Seed Calendar first
    "membership.json",      // 2. Seed Membership
    "user.json",            // 3. Seed User (after Calendar and Membership)
    "group.json",           // 4. Seed Group (after User)
    "template.json",        // 5. Seed Template
    "event.json",           // 6. Seed Event (after Calendar and User)
    "eventParticipant.json",// 7. Seed EventParticipant (after Event and User)
    "groupMember.json",     // 8. Seed GroupMember (after Group and User)
    "notification.json",    // 9. Seed Notification (after User)
    "auditLog.json",        // 10. Seed AuditLog (if applicable)
    "savingPlan.json",      // 11. Seed SavingPlan (after User or Membership)
  ];
  

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    if (!model) {
      console.error(`Model not found for file: ${fileName}`);
      continue;
    }

    try {
      for (const data of jsonData) {
        await model.create({ data });
      }
      console.log(`Seeded ${modelName} with data from ${fileName}`);
    } catch (error) {
      console.error(`Error seeding data for ${modelName}:`, error);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
