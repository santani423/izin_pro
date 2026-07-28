-- AlterTable
ALTER TABLE `services` ADD COLUMN `aboutMediaId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_aboutMediaId_fkey` FOREIGN KEY (`aboutMediaId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
