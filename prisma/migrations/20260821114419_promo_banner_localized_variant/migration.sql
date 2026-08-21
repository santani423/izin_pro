-- AlterTable: add new columns first (nullable / defaulted), so existing rows
-- stay valid before we backfill and enforce NOT NULL on `eyebrow`.
ALTER TABLE `promo_banners`
  ADD COLUMN `eyebrow` VARCHAR(191) NULL,
  ADD COLUMN `eyebrowEn` VARCHAR(191) NULL,
  ADD COLUMN `eyebrowZh` VARCHAR(191) NULL,
  ADD COLUMN `titleEn` VARCHAR(191) NULL,
  ADD COLUMN `titleZh` VARCHAR(191) NULL,
  ADD COLUMN `descriptionEn` TEXT NULL,
  ADD COLUMN `descriptionZh` TEXT NULL,
  ADD COLUMN `ctaLabelEn` VARCHAR(191) NULL,
  ADD COLUMN `ctaLabelZh` VARCHAR(191) NULL,
  ADD COLUMN `variant` ENUM('DISCOUNT', 'FREE', 'PACKAGE') NOT NULL DEFAULT 'DISCOUNT',
  ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;

-- Backfill: old `title` (eyebrow text, e.g. "DISKON") -> new `eyebrow`,
-- old `subtitle` (title text, e.g. "25%") -> `title`.
UPDATE `promo_banners` SET `eyebrow` = `title`;
UPDATE `promo_banners` SET `title` = `subtitle`;

-- `eyebrow` is backfilled for every existing row now, safe to enforce NOT NULL.
ALTER TABLE `promo_banners`
  MODIFY COLUMN `eyebrow` VARCHAR(191) NOT NULL,
  DROP COLUMN `subtitle`;
