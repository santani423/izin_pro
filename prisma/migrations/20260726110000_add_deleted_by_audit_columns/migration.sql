-- AlterTable
ALTER TABLE `users` ADD COLUMN `deletedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `blog_posts` ADD COLUMN `deletedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `services` ADD COLUMN `deletedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `testimonials` ADD COLUMN `deletedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `partners` ADD COLUMN `deletedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `menus` ADD COLUMN `deletedById` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `menu_items` ADD COLUMN `deletedById` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partners` ADD CONSTRAINT `partners_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menus` ADD CONSTRAINT `menus_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_items` ADD CONSTRAINT `menu_items_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
