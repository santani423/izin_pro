-- CreateTable
CREATE TABLE `kontak_page_content` (
    `id` VARCHAR(191) NOT NULL DEFAULT '1',
    `heroKicker` VARCHAR(191) NULL,
    `heroTitle` VARCHAR(191) NOT NULL,
    `heroTitleHighlight` VARCHAR(191) NOT NULL,
    `heroDescription` TEXT NOT NULL,
    `heroImageUrl` VARCHAR(191) NULL,
    `infoCards` JSON NOT NULL,
    `formTitle` VARCHAR(191) NOT NULL,
    `formSubtitle` TEXT NOT NULL,
    `sidebarTitle` VARCHAR(191) NOT NULL,
    `sidebarSubtitle` TEXT NOT NULL,
    `channels` JSON NOT NULL,
    `locationTitle` VARCHAR(191) NOT NULL,
    `mapsEmbedUrl` TEXT NOT NULL,
    `faqTitlePrefix` VARCHAR(191) NOT NULL,
    `faqTitleHighlight` VARCHAR(191) NOT NULL,
    `helpCardTitle` VARCHAR(191) NOT NULL,
    `helpCardDescription` TEXT NOT NULL,
    `helpCardButtonLabel` VARCHAR(191) NOT NULL,
    `helpCardImageUrl` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kontak_page_content` ADD CONSTRAINT `kontak_page_content_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
