/*
  Warnings:

  - You are about to drop the `NoteShares` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "NoteShares" DROP CONSTRAINT "NoteShares_note_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isTeamMember" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "NoteShares";
