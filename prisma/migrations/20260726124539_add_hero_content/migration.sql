-- CreateTable
CREATE TABLE `hero_content` (
    `id` VARCHAR(191) NOT NULL DEFAULT '1',
    `titleLine1` VARCHAR(191) NOT NULL,
    `titleHighlight` VARCHAR(191) NOT NULL,
    `titleLine3` VARCHAR(191) NOT NULL,
    `subtitle` TEXT NOT NULL,
    `highlights` JSON NOT NULL,
    `ctaPrimaryLabel` VARCHAR(191) NOT NULL,
    `ctaSecondaryLabel` VARCHAR(191) NOT NULL,
    `ctaSecondaryHref` VARCHAR(191) NOT NULL,
    `updatedById` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hero_content` ADD CONSTRAINT `hero_content_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
