/*
  Warnings:

  - You are about to drop the column `readAt` on the `NotificationRead` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `Parent` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `examId` on table `Result` required. This step will fail if there are existing NULL values in that column.
  - Made the column `assignmentId` on table `Result` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_examId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_parentId_fkey";

-- DropIndex
DROP INDEX "ConversationMember_userId_conversationId_key";

-- DropIndex
DROP INDEX "NotificationRead_userId_itemId_itemType_key";

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "img" TEXT;

-- AlterTable
ALTER TABLE "ConversationMember" ALTER COLUMN "userRole" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "img" TEXT;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "recurringGroupId" TEXT;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "senderRole" SET DEFAULT '';

-- AlterTable
ALTER TABLE "NotificationRead" DROP COLUMN "readAt";

-- AlterTable
ALTER TABLE "Result" ALTER COLUMN "examId" SET NOT NULL,
ALTER COLUMN "assignmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "parentId",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "description" TEXT;

-- DropTable
DROP TABLE "Parent";

-- CreateTable
CREATE TABLE "Publication" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "url" TEXT,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
