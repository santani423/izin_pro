-- AlterTable
ALTER TABLE `team_members` ADD COLUMN `linkedinUrl` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `about_page_content` (
    `id` VARCHAR(191) NOT NULL DEFAULT '1',
    `heroKicker` VARCHAR(191) NULL,
    `heroTitle` VARCHAR(191) NOT NULL,
    `heroTitleHighlight` VARCHAR(191) NOT NULL,
    `heroSubtitleBold` VARCHAR(191) NOT NULL,
    `heroSubtitleBody` TEXT NOT NULL,
    `heroImageUrl` VARCHAR(191) NULL,
    `aboutKicker` VARCHAR(191) NOT NULL,
    `aboutTitle` VARCHAR(191) NOT NULL,
    `aboutTitleHighlight` VARCHAR(191) NOT NULL,
    `aboutParagraphs` JSON NOT NULL,
    `aboutImageUrl` VARCHAR(191) NULL,
    `stats` JSON NOT NULL,
    `valuesEnabled` BOOLEAN NOT NULL DEFAULT true,
    `valuesTitle` VARCHAR(191) NOT NULL,
    `valuesTitleHighlight` VARCHAR(191) NOT NULL,
    `valuesSubtitle` VARCHAR(191) NOT NULL,
    `values` JSON NOT NULL,
    `visiMisiEnabled` BOOLEAN NOT NULL DEFAULT true,
    `vision` TEXT NOT NULL,
    `visionImageUrl` VARCHAR(191) NULL,
    `mission` JSON NOT NULL,
    `teamEnabled` BOOLEAN NOT NULL DEFAULT true,
    `teamTitle` VARCHAR(191) NOT NULL,
    `teamSubtitle` VARCHAR(191) NOT NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `about_page_content` ADD CONSTRAINT `about_page_content_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
