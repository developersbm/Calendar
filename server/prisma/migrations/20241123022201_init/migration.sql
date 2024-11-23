/*
  Warnings:

  - You are about to drop the column `maxFriends` on the `memberships` table. All the data in the column will be lost.
  - You are about to drop the column `maxGroups` on the `memberships` table. All the data in the column will be lost.
  - You are about to drop the column `maxSavingPlans` on the `memberships` table. All the data in the column will be lost.
  - You are about to drop the column `maxTemplates` on the `memberships` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "memberships" DROP COLUMN "maxFriends",
DROP COLUMN "maxGroups",
DROP COLUMN "maxSavingPlans",
DROP COLUMN "maxTemplates";
