-- AlterTable
ALTER TABLE `promo_banners` ADD COLUMN `imageMediaId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `promo_banners` ADD CONSTRAINT `promo_banners_imageMediaId_fkey` FOREIGN KEY (`imageMediaId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
