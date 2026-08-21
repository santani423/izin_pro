-- CreateTable
CREATE TABLE `about_home_content` (
    `id` VARCHAR(191) NOT NULL DEFAULT '1',
    `heading` VARCHAR(191) NOT NULL,
    `headingEn` VARCHAR(191) NULL,
    `headingZh` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `descriptionEn` TEXT NULL,
    `descriptionZh` TEXT NULL,
    `points` JSON NOT NULL,
    `pointsEn` JSON NULL,
    `pointsZh` JSON NULL,
    `buttonLabel` VARCHAR(191) NOT NULL,
    `buttonLabelEn` VARCHAR(191) NULL,
    `buttonLabelZh` VARCHAR(191) NULL,
    `buttonHref` VARCHAR(191) NOT NULL DEFAULT '/tentang-kami',
    `videoTitle` VARCHAR(191) NOT NULL,
    `videoTitleEn` VARCHAR(191) NULL,
    `videoTitleZh` VARCHAR(191) NULL,
    `videoSource` ENUM('YOUTUBE', 'UPLOAD') NOT NULL DEFAULT 'YOUTUBE',
    `videoYoutubeUrl` VARCHAR(191) NULL,
    `videoUploadUrl` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `about_home_content` ADD CONSTRAINT `about_home_content_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

