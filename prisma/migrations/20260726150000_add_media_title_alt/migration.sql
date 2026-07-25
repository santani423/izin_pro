-- AlterTable (expand)
ALTER TABLE `media` ADD COLUMN `title` VARCHAR(191) NULL;
ALTER TABLE `media` ADD COLUMN `altText` VARCHAR(191) NULL;

-- Backfill baris lama (upload sebelum field ini ada) pakai nama file
-- tanpa ekstensi sbg default — bisa diedit lagi lewat preview di Media Library.
UPDATE `media` SET `title` = SUBSTRING_INDEX(`fileName`, '.', 1) WHERE `title` IS NULL;

-- AlterTable (contract) — title wajib diisi mulai sekarang
ALTER TABLE `media` MODIFY COLUMN `title` VARCHAR(191) NOT NULL;
