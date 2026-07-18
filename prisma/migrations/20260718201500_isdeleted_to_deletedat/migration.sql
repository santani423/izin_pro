-- AlterTable
ALTER TABLE `menu_items` DROP COLUMN `isDeleted`, ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `menus` DROP COLUMN `isDeleted`, ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `partners` DROP COLUMN `isDeleted`, ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `isDeleted`, ADD COLUMN `deletedAt` DATETIME(3) NULL;
