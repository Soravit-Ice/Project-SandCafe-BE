/*
  Warnings:

  - You are about to drop the column `quanitity` on the `PRODUCT` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PRODUCT` DROP COLUMN `quanitity`,
    ADD COLUMN `name` VARCHAR(191) NULL;
