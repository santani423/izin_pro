/*
  Warnings:

  - Added the required column `teamTitleHighlight` to the `about_page_content` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `about_page_content` ADD COLUMN `teamTitleHighlight` VARCHAR(191) NOT NULL;
