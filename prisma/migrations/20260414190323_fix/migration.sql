/*
  Warnings:

  - You are about to drop the column `scor` on the `Result` table. All the data in the column will be lost.
  - You are about to drop the column `gen` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `gen` on the `Teacher` table. All the data in the column will be lost.
  - The primary key for the `_SubjectToTeacher` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_SubjectToTeacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `score` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthday` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthday` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserSex" AS ENUM ('MALE', 'FEMALE');

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_supervisorId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_examId_fkey";

-- AlterTable
ALTER TABLE "Class" ALTER COLUMN "supervisorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "scor",
ADD COLUMN     "score" INTEGER NOT NULL,
ALTER COLUMN "examId" DROP NOT NULL,
ALTER COLUMN "assignmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "gen",
ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sex" "UserSex" NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "gen",
ADD COLUMN     "birthday" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sex" "UserSex" NOT NULL;

-- AlterTable
ALTER TABLE "_SubjectToTeacher" DROP CONSTRAINT "_SubjectToTeacher_AB_pkey";

-- DropEnum
DROP TYPE "UserGen";

-- CreateIndex
CREATE UNIQUE INDEX "_SubjectToTeacher_AB_unique" ON "_SubjectToTeacher"("A", "B");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
