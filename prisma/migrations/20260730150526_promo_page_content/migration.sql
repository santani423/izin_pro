-- CreateTable
CREATE TABLE `promo_page_content` (
    `id` VARCHAR(191) NOT NULL DEFAULT '1',
    `heroKicker` VARCHAR(191) NULL,
    `heroTitle` VARCHAR(191) NOT NULL,
    `heroTitleHighlight` VARCHAR(191) NOT NULL,
    `heroDescription` TEXT NOT NULL,
    `heroImageUrl` VARCHAR(191) NULL,
    `highlights` JSON NOT NULL,
    `packagesTitlePrefix` VARCHAR(191) NOT NULL,
    `packagesTitleHighlight` VARCHAR(191) NOT NULL,
    `packagesTitleSuffix` VARCHAR(191) NOT NULL,
    `packagesSubtitle` VARCHAR(191) NOT NULL,
    `countdownTitlePrefix` VARCHAR(191) NOT NULL,
    `countdownTitleHighlight` VARCHAR(191) NOT NULL,
    `countdownDescription` TEXT NOT NULL,
    `whyTitlePrefix` VARCHAR(191) NOT NULL,
    `whyTitleHighlight` VARCHAR(191) NOT NULL,
    `whyItems` JSON NOT NULL,
    `stepsTitle` VARCHAR(191) NOT NULL,
    `steps` JSON NOT NULL,
    `consultTitlePrefix` VARCHAR(191) NOT NULL,
    `consultTitleHighlight` VARCHAR(191) NOT NULL,
    `consultDescription` TEXT NOT NULL,
    `consultImageUrl` VARCHAR(191) NULL,
    `ctaTitle` VARCHAR(191) NOT NULL,
    `ctaSubtitle` TEXT NOT NULL,
    `ctaButtonLabel` VARCHAR(191) NOT NULL,
    `updatedById` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `promo_page_content` ADD CONSTRAINT `promo_page_content_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
