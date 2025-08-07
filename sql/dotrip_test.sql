-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Aug 07, 2025 at 06:51 PM
-- Server version: 8.2.0
-- PHP Version: 8.2.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dotrip_test`
--

-- --------------------------------------------------------

--
-- Table structure for table `addressbook`
--

DROP TABLE IF EXISTS `addressbook`;
CREATE TABLE IF NOT EXISTS `addressbook` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `type` enum('HOME','OFFICE','OTHER','PICKUP','DROP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pinCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `AddressBook_userId_type_address_key` (`userId`,`type`,`address`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `addressbook`
--

INSERT INTO `addressbook` (`id`, `userId`, `type`, `address`, `city`, `pinCode`, `createdAt`) VALUES
(1, 13, 'PICKUP', 'Pickup Address 2', NULL, NULL, '2025-08-07 18:20:48.976'),
(2, 16, 'PICKUP', 'Pickup Address 5', NULL, NULL, '2025-08-07 18:20:48.977'),
(3, 14, 'PICKUP', 'Pickup Address 3', NULL, NULL, '2025-08-07 18:20:48.976'),
(4, 12, 'PICKUP', 'Pickup Address 1', NULL, NULL, '2025-08-07 18:20:48.976'),
(5, 15, 'PICKUP', 'Pickup Address 4', NULL, NULL, '2025-08-07 18:20:48.976'),
(6, 14, 'DROP', 'Drop Address 3', NULL, NULL, '2025-08-07 18:20:49.028'),
(7, 12, 'DROP', 'Drop Address 1', NULL, NULL, '2025-08-07 18:20:49.027'),
(8, 13, 'DROP', 'Drop Address 2', NULL, NULL, '2025-08-07 18:20:49.028'),
(9, 15, 'DROP', 'Drop Address 4', NULL, NULL, '2025-08-07 18:20:49.028'),
(10, 16, 'DROP', 'Drop Address 5', NULL, NULL, '2025-08-07 18:20:49.029');

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
CREATE TABLE IF NOT EXISTS `booking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `vehicleTypeId` int NOT NULL,
  `pickupAddressId` int NOT NULL,
  `dropAddressId` int NOT NULL,
  `pickupDateTime` datetime(3) NOT NULL,
  `fromCityId` int NOT NULL,
  `toCityId` int NOT NULL,
  `tripTypeId` int NOT NULL,
  `fare` double NOT NULL,
  `numPersons` int NOT NULL DEFAULT '1',
  `numVehicles` int NOT NULL DEFAULT '1',
  `bookingType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'individual',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `vendorId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Booking_vendorId_fkey` (`vendorId`),
  KEY `Booking_userId_fkey` (`userId`),
  KEY `Booking_vehicleTypeId_fkey` (`vehicleTypeId`),
  KEY `Booking_pickupAddressId_fkey` (`pickupAddressId`),
  KEY `Booking_dropAddressId_fkey` (`dropAddressId`),
  KEY `Booking_fromCityId_fkey` (`fromCityId`),
  KEY `Booking_toCityId_fkey` (`toCityId`),
  KEY `Booking_tripTypeId_fkey` (`tripTypeId`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`id`, `userId`, `vehicleTypeId`, `pickupAddressId`, `dropAddressId`, `pickupDateTime`, `fromCityId`, `toCityId`, `tripTypeId`, `fare`, `numPersons`, `numVehicles`, `bookingType`, `status`, `createdAt`, `vendorId`) VALUES
(1, 12, 1, 4, 7, '2025-07-21 08:00:00.000', 1, 1, 1, 12, 1, 1, 'individual', 'PENDING', '2025-08-07 18:20:49.046', NULL),
(2, 13, 1, 1, 8, '2025-07-22 08:00:00.000', 1, 1, 2, 13, 1, 1, 'individual', 'PENDING', '2025-08-07 18:20:49.052', NULL),
(3, 14, 1, 3, 6, '2025-07-23 08:00:00.000', 1, 1, 1, 14, 1, 1, 'individual', 'PENDING', '2025-08-07 18:20:49.052', NULL),
(4, 16, 1, 2, 10, '2025-07-25 08:00:00.000', 1, 1, 1, 16, 1, 1, 'individual', 'PENDING', '2025-08-07 18:20:49.053', NULL),
(5, 15, 1, 5, 9, '2025-07-24 08:00:00.000', 1, 1, 2, 15, 1, 1, 'individual', 'PENDING', '2025-08-07 18:20:49.052', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `city`
--

DROP TABLE IF EXISTS `city`;
CREATE TABLE IF NOT EXISTS `city` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `citydistance`
--

DROP TABLE IF EXISTS `citydistance`;
CREATE TABLE IF NOT EXISTS `citydistance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fromCityId` int NOT NULL,
  `toCityId` int NOT NULL,
  `distanceKm` double NOT NULL,
  `fromCityName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toCityName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CityDistance_fromCityId_toCityId_key` (`fromCityId`,`toCityId`),
  KEY `CityDistance_toCityId_fkey` (`toCityId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `corporatebooking`
--

DROP TABLE IF EXISTS `corporatebooking`;
CREATE TABLE IF NOT EXISTS `corporatebooking` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bookingId` int DEFAULT NULL,
  `companyName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactPerson` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactEmail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactPhone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numberOfVehicles` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estimatedPassengers` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialRequirements` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budgetRange` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `CorporateBooking_bookingId_key` (`bookingId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `driver`
--

DROP TABLE IF EXISTS `driver`;
CREATE TABLE IF NOT EXISTS `driver` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `licenseNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `licenseExpiry` datetime(3) NOT NULL,
  `isPartTime` tinyint(1) NOT NULL DEFAULT '0',
  `isAvailable` tinyint(1) NOT NULL DEFAULT '1',
  `licenseImage` json NOT NULL,
  `rcImage` json NOT NULL,
  `assignedVehicleId` int DEFAULT NULL,
  `vendorId` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Driver_assignedVehicleId_key` (`assignedVehicleId`),
  KEY `Driver_vendorId_fkey` (`vendorId`),
  KEY `Driver_userId_fkey` (`userId`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `driver`
--

INSERT INTO `driver` (`id`, `fullName`, `phone`, `email`, `licenseNumber`, `licenseExpiry`, `isPartTime`, `isAvailable`, `licenseImage`, `rcImage`, `assignedVehicleId`, `vendorId`, `userId`) VALUES
(1, 'Driver 1', '7000000001', 'driver1@mail.com', 'LICDRV12025', '2027-01-01 18:30:00.000', 1, 1, '\"uploads/drivers/license_driver_1.jpg\"', '\"uploads/drivers/rc_driver_1.jpg\"', NULL, 1, 2),
(2, 'Driver 4', '7000000004', 'driver4@mail.com', 'LICDRV42025', '2027-01-04 18:30:00.000', 0, 1, '\"uploads/drivers/license_driver_4.jpg\"', '\"uploads/drivers/rc_driver_4.jpg\"', NULL, 1, 3),
(3, 'Driver 2', '7000000002', 'driver2@mail.com', 'LICDRV22025', '2027-01-02 18:30:00.000', 0, 1, '\"uploads/drivers/license_driver_2.jpg\"', '\"uploads/drivers/rc_driver_2.jpg\"', NULL, 1, 4),
(4, 'Driver 3', '7000000003', 'driver3@mail.com', 'LICDRV32025', '2027-01-03 18:30:00.000', 1, 1, '\"uploads/drivers/license_driver_3.jpg\"', '\"uploads/drivers/rc_driver_3.jpg\"', NULL, 1, 5),
(5, 'Driver 8', '7000000008', 'driver8@mail.com', 'LICDRV82025', '2027-01-08 18:30:00.000', 0, 1, '\"uploads/drivers/license_driver_8.jpg\"', '\"uploads/drivers/rc_driver_8.jpg\"', NULL, 1, 9),
(6, 'Driver 6', '7000000006', 'driver6@mail.com', 'LICDRV62025', '2027-01-06 18:30:00.000', 0, 1, '\"uploads/drivers/license_driver_6.jpg\"', '\"uploads/drivers/rc_driver_6.jpg\"', NULL, 1, 8),
(7, 'Driver 7', '7000000007', 'driver7@mail.com', 'LICDRV72025', '2027-01-07 18:30:00.000', 1, 1, '\"uploads/drivers/license_driver_7.jpg\"', '\"uploads/drivers/rc_driver_7.jpg\"', NULL, 1, 7),
(8, 'Driver 5', '7000000005', 'driver5@mail.com', 'LICDRV52025', '2027-01-05 18:30:00.000', 1, 1, '\"uploads/drivers/license_driver_5.jpg\"', '\"uploads/drivers/rc_driver_5.jpg\"', NULL, 1, 6),
(9, 'Driver 9', '7000000009', 'driver9@mail.com', 'LICDRV92025', '2027-01-10 00:00:00.000', 1, 1, '\"uploads/drivers/license_driver_9.jpg\"', '\"uploads/drivers/rc_driver_9.jpg\"', NULL, 1, 10),
(10, 'Driver 10', '70000000010', 'driver10@mail.com', 'LICDRV102025', '2027-01-11 00:00:00.000', 0, 1, '\"uploads/drivers/license_driver_10.jpg\"', '\"uploads/drivers/rc_driver_10.jpg\"', NULL, 1, 11);

-- --------------------------------------------------------

--
-- Table structure for table `driverupdate`
--

DROP TABLE IF EXISTS `driverupdate`;
CREATE TABLE IF NOT EXISTS `driverupdate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `driverId` int NOT NULL,
  `tripId` int NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `statusMessage` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `DriverUpdate_driverId_fkey` (`driverId`),
  KEY `DriverUpdate_tripId_fkey` (`tripId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `earnings`
--

DROP TABLE IF EXISTS `earnings`;
CREATE TABLE IF NOT EXISTS `earnings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vendorId` int NOT NULL,
  `amount` double NOT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Earnings_vendorId_fkey` (`vendorId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tripId` int NOT NULL,
  `riderId` int NOT NULL,
  `driverId` int DEFAULT NULL,
  `driverRating` int NOT NULL,
  `vehicleRating` int NOT NULL,
  `serviceRating` int NOT NULL,
  `comment` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `feedbackTime` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Feedback_tripId_key` (`tripId`),
  KEY `Feedback_riderId_fkey` (`riderId`),
  KEY `Feedback_driverId_fkey` (`driverId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
CREATE TABLE IF NOT EXISTS `invoice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoiceNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` double NOT NULL,
  `vendorCommission` double NOT NULL,
  `adminCommission` double NOT NULL,
  `totalAmount` double NOT NULL,
  `pdfUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `tripId` int NOT NULL,
  `vendorId` int NOT NULL,
  `userId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Invoice_invoiceNumber_key` (`invoiceNumber`),
  UNIQUE KEY `Invoice_tripId_key` (`tripId`),
  KEY `Invoice_vendorId_fkey` (`vendorId`),
  KEY `Invoice_userId_fkey` (`userId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `price`
--

DROP TABLE IF EXISTS `price`;
CREATE TABLE IF NOT EXISTS `price` (
  `id` int NOT NULL AUTO_INCREMENT,
  `priceType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` double NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quote`
--

DROP TABLE IF EXISTS `quote`;
CREATE TABLE IF NOT EXISTS `quote` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bookingId` int NOT NULL,
  `vendorId` int NOT NULL,
  `amount` double NOT NULL,
  `approved` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Quote_bookingId_fkey` (`bookingId`),
  KEY `Quote_vendorId_fkey` (`vendorId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trip`
--

DROP TABLE IF EXISTS `trip`;
CREATE TABLE IF NOT EXISTS `trip` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bookingId` int NOT NULL,
  `riderId` int NOT NULL,
  `driverId` int NOT NULL,
  `vehicleId` int NOT NULL,
  `vendorId` int NOT NULL,
  `corporateBookingId` int DEFAULT NULL,
  `startTime` datetime(3) NOT NULL,
  `endTime` datetime(3) DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ONGOING',
  `distance` double DEFAULT NULL,
  `fare` double DEFAULT NULL,
  `breakdownReported` tinyint(1) NOT NULL DEFAULT '0',
  `breakdownNotes` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Trip_bookingId_fkey` (`bookingId`),
  KEY `Trip_riderId_fkey` (`riderId`),
  KEY `Trip_driverId_fkey` (`driverId`),
  KEY `Trip_vehicleId_fkey` (`vehicleId`),
  KEY `Trip_vendorId_fkey` (`vendorId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `triptype`
--

DROP TABLE IF EXISTS `triptype`;
CREATE TABLE IF NOT EXISTS `triptype` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TripType_label_key` (`label`),
  UNIQUE KEY `TripType_slug_key` (`slug`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trip_assistances`
--

DROP TABLE IF EXISTS `trip_assistances`;
CREATE TABLE IF NOT EXISTS `trip_assistances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tripId` int NOT NULL,
  `driverId` int DEFAULT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reply` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `messageStatus` enum('READ','UNREAD') COLLATE utf8mb4_unicode_ci DEFAULT 'UNREAD',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `trip_assistances_tripId_fkey` (`tripId`),
  KEY `trip_assistances_driverId_fkey` (`driverId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('RIDER','VENDOR','DRIVER','ADMIN','SUPPORT_AGENT','SUPER_ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'RIDER',
  `token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_phone_key` (`phone`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `phone`, `age`, `gender`, `role`, `token`, `createdAt`, `updatedAt`) VALUES
(1, 'Vendor 1', 'vendor1@mail.com', 'hashedpass', '9000000000', NULL, NULL, 'VENDOR', NULL, '2025-08-07 18:20:48.735', '2025-08-07 18:20:48.735'),
(2, 'Driver 1', 'driver1@mail.com', 'hashedpass', '7000000001', NULL, NULL, 'DRIVER', NULL, '2025-08-07 18:20:48.848', '2025-08-07 18:20:48.848'),
(3, 'Driver 4', 'driver4@mail.com', 'hashedpass', '7000000004', NULL, NULL, 'DRIVER', NULL, '2025-08-07 18:20:48.851', '2025-08-07 18:20:48.851'),
(4, 'Driver 2', 'driver2@mail.com', 'hashedpass', '7000000002', NULL, NULL, 'DRIVER', NULL, '2025-08-07 18:20:48.849', '2025-08-07 18:20:48.849'),
(5, 'Driver 3', 'driver3@mail.com', 'hashedpass', '7000000003', NULL, NULL, 'DRIVER', NULL, '2025-08-07 18:20:48.850', '2025-08-07 18:20:48.850'),
(6, 'Driver 5', 'driver5@mail.com', 'hashedpass', '7000000005', NULL, NULL, 'DRIVER', NULL, '2025-08-07 18:20:48.851', '2025-08-07 18:20:48.851'),
(7, 'Driver 7', 'driver7@mail.com', 'hashedpass', '7000000007', NULL, NULL, 'DRIVER', NULL, '2025-08-07 18:20:48.852', '2025-08-07 18:20:48.852'),
(8, 'Driver 6', 'driver6@mail.com', 'hashedpass', '7000000006', NULL, NULL, 'DRIVER', NULL, '2025-08-07 18:20:48.852', '2025-08-07 18:20:48.852'),
(9, 'Driver 8', 'driver8@mail.com', 'hashedpass', '7000000008', NULL, NULL, 'DRIVER', NULL, '2025-08-07 18:20:48.852', '2025-08-07 18:20:48.852'),
(10, 'Driver 9', 'driver9@mail.com', 'hashedpass', '7000000009', NULL, NULL, 'DRIVER', NULL, '2025-08-07 18:20:48.852', '2025-08-07 18:20:48.852'),
(11, 'Driver 10', 'driver10@mail.com', 'hashedpass', '70000000010', NULL, NULL, 'DRIVER', NULL, '2025-08-07 18:20:48.852', '2025-08-07 18:20:48.852'),
(12, 'Rider 1', 'rider1@mail.com', 'hashedpass', '8000000001', NULL, NULL, 'RIDER', NULL, '2025-08-07 18:20:48.970', '2025-08-07 18:20:48.970'),
(13, 'Rider 2', 'rider2@mail.com', 'hashedpass', '8000000002', NULL, NULL, 'RIDER', NULL, '2025-08-07 18:20:48.970', '2025-08-07 18:20:48.970'),
(14, 'Rider 3', 'rider3@mail.com', 'hashedpass', '8000000003', NULL, NULL, 'RIDER', NULL, '2025-08-07 18:20:48.971', '2025-08-07 18:20:48.971'),
(15, 'Rider 4', 'rider4@mail.com', 'hashedpass', '8000000004', NULL, NULL, 'RIDER', NULL, '2025-08-07 18:20:48.972', '2025-08-07 18:20:48.972'),
(16, 'Rider 5', 'rider5@mail.com', 'hashedpass', '8000000005', NULL, NULL, 'RIDER', NULL, '2025-08-07 18:20:48.973', '2025-08-07 18:20:48.973');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle`
--

DROP TABLE IF EXISTS `vehicle`;
CREATE TABLE IF NOT EXISTS `vehicle` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` json NOT NULL,
  `capacity` int NOT NULL,
  `registrationNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` int NOT NULL DEFAULT '0',
  `originalPrice` int NOT NULL DEFAULT '0',
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `comfortLevel` int NOT NULL,
  `lastServicedDate` datetime(3) DEFAULT NULL,
  `vehicleTypeId` int NOT NULL,
  `createdBy` enum('RIDER','VENDOR','DRIVER','ADMIN','SUPPORT_AGENT','SUPER_ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VENDOR',
  `vendorId` int DEFAULT NULL,
  `driverOwnerId` int DEFAULT NULL,
  `priceId` int NOT NULL DEFAULT '10',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Vehicle_registrationNumber_key` (`registrationNumber`),
  KEY `Vehicle_vendorId_fkey` (`vendorId`),
  KEY `Vehicle_driverOwnerId_fkey` (`driverOwnerId`),
  KEY `Vehicle_vehicleTypeId_fkey` (`vehicleTypeId`),
  KEY `Vehicle_priceId_fkey` (`priceId`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle`
--

INSERT INTO `vehicle` (`id`, `name`, `model`, `image`, `capacity`, `registrationNumber`, `price`, `originalPrice`, `status`, `comfortLevel`, `lastServicedDate`, `vehicleTypeId`, `createdBy`, `vendorId`, `driverOwnerId`, `priceId`) VALUES
(1, 'Car 2', '2021', '[\"uploads/vehicles/sample.jpg\"]', 4, 'MH12AB1231', 16, 0, 'available', 2, '2025-08-07 18:20:48.934', 1, 'VENDOR', 1, 3, 10),
(2, 'Car 1', '2020', '[\"uploads/vehicles/sample.jpg\"]', 4, 'MH12AB1230', 15, 0, 'available', 1, '2025-08-07 18:20:48.934', 1, 'VENDOR', 1, 1, 10),
(3, 'Car 3', '2022', '[\"uploads/vehicles/sample.jpg\"]', 4, 'MH12AB1232', 17, 0, 'available', 3, '2025-08-07 18:20:48.934', 1, 'VENDOR', 1, 4, 10),
(4, 'Car 5', '2021', '[\"uploads/vehicles/sample.jpg\"]', 4, 'MH12AB1234', 19, 0, 'available', 2, '2025-08-07 18:20:48.934', 1, 'VENDOR', 1, 8, 10),
(5, 'Car 4', '2020', '[\"uploads/vehicles/sample.jpg\"]', 4, 'MH12AB1233', 18, 0, 'available', 1, '2025-08-07 18:20:48.934', 1, 'VENDOR', 1, 2, 10),
(6, 'Car 6', '2022', '[\"uploads/vehicles/sample.jpg\"]', 4, 'MH12AB1235', 20, 0, 'available', 3, '2025-08-07 18:20:48.934', 1, 'VENDOR', 1, 6, 10),
(7, 'Car 7', '2020', '[\"uploads/vehicles/sample.jpg\"]', 4, 'MH12AB1236', 21, 0, 'available', 1, '2025-08-07 18:20:48.934', 1, 'VENDOR', 1, 7, 10),
(8, 'Car 8', '2021', '[\"uploads/vehicles/sample.jpg\"]', 4, 'MH12AB1237', 22, 0, 'available', 2, '2025-08-07 18:20:48.934', 1, 'VENDOR', 1, 5, 10),
(9, 'Car 10', '2020', '[\"uploads/vehicles/sample.jpg\"]', 4, 'MH12AB1239', 24, 0, 'available', 1, '2025-08-07 18:20:48.935', 1, 'VENDOR', 1, 10, 10),
(10, 'Car 9', '2022', '[\"uploads/vehicles/sample.jpg\"]', 4, 'MH12AB1238', 23, 0, 'available', 3, '2025-08-07 18:20:48.934', 1, 'VENDOR', 1, 9, 10);

-- --------------------------------------------------------

--
-- Table structure for table `vehicletype`
--

DROP TABLE IF EXISTS `vehicletype`;
CREATE TABLE IF NOT EXISTS `vehicletype` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estimatedRatePerKm` double NOT NULL DEFAULT '10',
  `baseFare` double NOT NULL DEFAULT '0',
  `seatingCapacity` int NOT NULL DEFAULT '4',
  PRIMARY KEY (`id`),
  UNIQUE KEY `VehicleType_name_key` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

DROP TABLE IF EXISTS `vendors`;
CREATE TABLE IF NOT EXISTS `vendors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `companyReg` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vendors_companyReg_key` (`companyReg`),
  UNIQUE KEY `vendors_userId_key` (`userId`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `name`, `companyReg`, `createdAt`, `userId`) VALUES
(1, 'Vendor 1', 'VND12345', '2025-08-07 18:20:48.789', 4);

-- --------------------------------------------------------

--
-- Table structure for table `_bookingstopcities`
--

DROP TABLE IF EXISTS `_bookingstopcities`;
CREATE TABLE IF NOT EXISTS `_bookingstopcities` (
  `A` int NOT NULL,
  `B` int NOT NULL,
  UNIQUE KEY `_BookingStopCities_AB_unique` (`A`,`B`),
  KEY `_BookingStopCities_B_index` (`B`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
