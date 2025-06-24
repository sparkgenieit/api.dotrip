/*
  Warnings:

  - You are about to drop the column `dropAddress` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `pickupAddress` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `dropAddressId` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupAddressId` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `address_books_userId_fkey` ON `address_books`;

-- DropIndex
DROP INDEX `bookings_fromCityId_fkey` ON `bookings`;

-- DropIndex
DROP INDEX `bookings_toCityId_fkey` ON `bookings`;

-- DropIndex
DROP INDEX `bookings_tripTypeId_fkey` ON `bookings`;

-- DropIndex
DROP INDEX `bookings_userId_fkey` ON `bookings`;

-- DropIndex
DROP INDEX `bookings_vehicleId_fkey` ON `bookings`;

-- DropIndex
DROP INDEX `drivers_vendorId_fkey` ON `drivers`;

-- DropIndex
DROP INDEX `earnings_driverId_fkey` ON `earnings`;

-- DropIndex
DROP INDEX `earnings_vendorId_fkey` ON `earnings`;

-- DropIndex
DROP INDEX `support_tickets_userId_fkey` ON `support_tickets`;

-- DropIndex
DROP INDEX `trips_driverId_fkey` ON `trips`;

-- DropIndex
DROP INDEX `trips_riderId_fkey` ON `trips`;

-- DropIndex
DROP INDEX `trips_vehicleId_fkey` ON `trips`;

-- DropIndex
DROP INDEX `trips_vendorId_fkey` ON `trips`;

-- DropIndex
DROP INDEX `users_vendorId_fkey` ON `users`;

-- DropIndex
DROP INDEX `vehicles_vendorId_fkey` ON `vehicles`;

-- AlterTable
ALTER TABLE `bookings` DROP COLUMN `dropAddress`,
    DROP COLUMN `pickupAddress`,
    ADD COLUMN `dropAddressId` VARCHAR(191) NOT NULL,
    ADD COLUMN `pickupAddressId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `address_books` ADD CONSTRAINT `address_books_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_fromCityId_fkey` FOREIGN KEY (`fromCityId`) REFERENCES `cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_toCityId_fkey` FOREIGN KEY (`toCityId`) REFERENCES `cities`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_tripTypeId_fkey` FOREIGN KEY (`tripTypeId`) REFERENCES `trip_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vendors` ADD CONSTRAINT `vendors_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `drivers` ADD CONSTRAINT `drivers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `drivers` ADD CONSTRAINT `drivers_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_riderId_fkey` FOREIGN KEY (`riderId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `drivers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trips` ADD CONSTRAINT `trips_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `support_tickets` ADD CONSTRAINT `support_tickets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `earnings` ADD CONSTRAINT `earnings_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `drivers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `earnings` ADD CONSTRAINT `earnings_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
