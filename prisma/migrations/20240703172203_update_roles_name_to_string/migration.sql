/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ROLES` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `ROLES` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `ROLES` MODIFY `name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ROLES_name_key` ON `ROLES`(`name`);
