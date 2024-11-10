/*
  Warnings:

  - You are about to drop the column `note` on the `ORDER_DETAIL` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `ORDER_DETAIL` table. All the data in the column will be lost.
  - You are about to drop the column `sweetness_level` on the `ORDER_DETAIL` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ORDER_DETAIL` DROP COLUMN `note`,
    DROP COLUMN `product_id`,
    DROP COLUMN `sweetness_level`,
    ADD COLUMN `status` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ORDER_ITEMS` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderdetail_id` INTEGER NULL,
    `product_id` INTEGER NULL,
    `sweetness_level` INTEGER NULL,
    `price` INTEGER NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ORDER_ITEMS` ADD CONSTRAINT `ORDER_ITEMS_orderdetail_id_fkey` FOREIGN KEY (`orderdetail_id`) REFERENCES `ORDER_DETAIL`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
