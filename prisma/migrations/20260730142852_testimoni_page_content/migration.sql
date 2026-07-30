-- CreateTable
CREATE TABLE `testimoni_page_content` (
    `id` VARCHAR(191) NOT NULL DEFAULT '1',
    `heroKicker` VARCHAR(191) NULL,
    `heroTitle` VARCHAR(191) NOT NULL,
    `heroTitleHighlight` VARCHAR(191) NOT NULL,
    `heroDescription` TEXT NOT NULL,
    `heroImageUrl` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `testimoni_page_content` ADD CONSTRAINT `testimoni_page_content_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
