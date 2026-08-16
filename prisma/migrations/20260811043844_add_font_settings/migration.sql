-- AlterTable
ALTER TABLE `settings` ADD COLUMN `fontFamilyEn` VARCHAR(191) NOT NULL DEFAULT 'inter',
    ADD COLUMN `fontFamilyId` VARCHAR(191) NOT NULL DEFAULT 'plus-jakarta-sans',
    ADD COLUMN `fontFamilyZh` VARCHAR(191) NOT NULL DEFAULT 'noto-sans-sc';
