/*
  Warnings:

  - You are about to drop the column `recurringGroupId` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "recurringGroupId",
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false;
