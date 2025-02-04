/*
  Warnings:

  - You are about to drop the column `firebase_token` on the `USER` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "USER" DROP COLUMN "firebase_token",
ADD COLUMN     "device_token" TEXT;
