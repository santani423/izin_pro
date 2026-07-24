-- AlterTable
ALTER TABLE `settings` ADD COLUMN `maintenanceMode` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `settings` ADD COLUMN `maintenanceMessage` TEXT NULL;
