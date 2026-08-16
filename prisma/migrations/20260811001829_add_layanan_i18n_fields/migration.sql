-- AlterTable
ALTER TABLE `service_categories` ADD COLUMN `descriptionEn` TEXT NULL,
    ADD COLUMN `descriptionZh` TEXT NULL,
    ADD COLUMN `nameEn` VARCHAR(191) NULL,
    ADD COLUMN `nameZh` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `service_packages` ADD COLUMN `featuresEn` JSON NULL,
    ADD COLUMN `featuresZh` JSON NULL,
    ADD COLUMN `nameEn` VARCHAR(191) NULL,
    ADD COLUMN `nameZh` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `services` ADD COLUMN `descriptionEn` TEXT NULL,
    ADD COLUMN `descriptionZh` TEXT NULL,
    ADD COLUMN `detailContentEn` JSON NULL,
    ADD COLUMN `detailContentZh` JSON NULL,
    ADD COLUMN `featuresEn` JSON NULL,
    ADD COLUMN `featuresZh` JSON NULL,
    ADD COLUMN `metaDescriptionEn` VARCHAR(191) NULL,
    ADD COLUMN `metaDescriptionZh` VARCHAR(191) NULL,
    ADD COLUMN `metaTitleEn` VARCHAR(191) NULL,
    ADD COLUMN `metaTitleZh` VARCHAR(191) NULL,
    ADD COLUMN `titleEn` VARCHAR(191) NULL,
    ADD COLUMN `titleZh` VARCHAR(191) NULL;
