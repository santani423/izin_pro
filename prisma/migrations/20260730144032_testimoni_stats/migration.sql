-- AlterTable
ALTER TABLE `testimoni_page_content` ADD COLUMN `stats` JSON NULL;

-- Backfill singleton row dgn statistik bawaan (copy dari TESTIMONI_STATS lama di lib/testimoni.ts)
UPDATE `testimoni_page_content`
SET `stats` = '[{"icon":"users","value":"5.000+","label":"Perizinan Selesai"},{"icon":"smile","value":"99%","label":"Kepuasan Klien"},{"icon":"building","value":"Berbagai","label":"Industri Terlayani"},{"icon":"award","value":"10+","label":"Tahun Pengalaman"}]'
WHERE `id` = '1';

-- AlterTable
ALTER TABLE `testimoni_page_content` MODIFY COLUMN `stats` JSON NOT NULL;
