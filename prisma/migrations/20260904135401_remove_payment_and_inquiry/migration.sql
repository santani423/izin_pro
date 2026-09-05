-- DropForeignKey
ALTER TABLE `inquiries` DROP FOREIGN KEY `inquiries_assignedToId_fkey`;

-- DropForeignKey
ALTER TABLE `inquiries` DROP FOREIGN KEY `inquiries_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `inquiries` DROP FOREIGN KEY `inquiries_updatedById_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_recordedById_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_transactionId_fkey`;

-- DropIndex
DROP INDEX `service_transactions_paymentStatus_idx` ON `service_transactions`;

-- AlterTable
ALTER TABLE `service_transactions` DROP COLUMN `paymentStatus`;

-- DropTable
DROP TABLE `inquiries`;

-- DropTable
DROP TABLE `payments`;

