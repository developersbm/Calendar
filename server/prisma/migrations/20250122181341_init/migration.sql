/*
  Warnings:

  - You are about to drop the column `templateId` on the `saving_plans` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "saving_plans" DROP CONSTRAINT "saving_plans_templateId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_calendarId_fkey";

-- AlterTable
ALTER TABLE "groups" ALTER COLUMN "iconUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "saving_plans" DROP COLUMN "templateId",
ALTER COLUMN "currentBalance" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profilePicture" TEXT,
ALTER COLUMN "calendarId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "savingPlanId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "calendars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_savingPlanId_fkey" FOREIGN KEY ("savingPlanId") REFERENCES "saving_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
