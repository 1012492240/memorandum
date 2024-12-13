-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "hasReminder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderTime" TIMESTAMP(3);
