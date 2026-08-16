-- AlterTable
ALTER TABLE `menu_items` ADD COLUMN `labelEn` VARCHAR(191) NULL,
    ADD COLUMN `labelZh` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `settings` ADD COLUMN `companyNameEn` VARCHAR(191) NULL,
    ADD COLUMN `companyNameZh` VARCHAR(191) NULL,
    ADD COLUMN `descriptionEn` TEXT NULL,
    ADD COLUMN `descriptionZh` TEXT NULL,
    ADD COLUMN `operatingHoursEn` VARCHAR(191) NULL,
    ADD COLUMN `operatingHoursZh` VARCHAR(191) NULL,
    ADD COLUMN `taglineEn` VARCHAR(191) NULL,
    ADD COLUMN `taglineZh` VARCHAR(191) NULL;
