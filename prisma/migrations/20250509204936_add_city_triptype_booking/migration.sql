/*
  Warnings:

  - You are about to drop the column `dropoff` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `pickup` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `booking` table. All the data in the column will be lost.
  - Added the required column `fare` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromCityId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupDateTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toCityId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tripTypeId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Booking_userId_fkey` ON `booking`;

-- DropIndex
DROP INDEX `Booking_vehicleId_fkey` ON `booking`;

-- AlterTable
ALTER TABLE `booking` DROP COLUMN `dropoff`,
    DROP COLUMN `endTime`,
    DROP COLUMN `pickup`,
    DROP COLUMN `startTime`,
    DROP COLUMN `status`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `fare` DOUBLE NOT NULL,
    ADD COLUMN `fromCityId` INTEGER NOT NULL,
    ADD COLUMN `pickupDateTime` DATETIME(3) NOT NULL,
    ADD COLUMN `toCityId` INTEGER NOT NULL,
    ADD COLUMN `tripTypeId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `City` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TripType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TripType_label_key`(`label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_fromCityId_fkey` FOREIGN KEY (`fromCityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_toCityId_fkey` FOREIGN KEY (`toCityId`) REFERENCES `City`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_tripTypeId_fkey` FOREIGN KEY (`tripTypeId`) REFERENCES `TripType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
