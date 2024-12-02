/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId,ownerType]` on the table `calendars` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "deletedAt";

-- CreateIndex
CREATE INDEX "calendars_ownerId_ownerType_idx" ON "calendars"("ownerId", "ownerType");

-- CreateIndex
CREATE UNIQUE INDEX "calendars_ownerId_ownerType_key" ON "calendars"("ownerId", "ownerType");
