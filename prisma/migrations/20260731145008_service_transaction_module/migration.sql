-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_updatedById_fkey`;

-- AlterTable
ALTER TABLE `service_categories` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `icon` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `sortOrder` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `service_packages` ADD COLUMN `estimatedDurationLabel` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `services` ADD COLUMN `basePrice` DECIMAL(12, 2) NULL,
    ADD COLUMN `estimatedDurationLabel` VARCHAR(191) NULL,
    ADD COLUMN `gallery` JSON NULL,
    ADD COLUMN `requiredDocuments` JSON NULL;

-- DropTable
DROP TABLE `orders`;

-- CreateTable
CREATE TABLE `service_workflow_templates` (
    `id` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `deletedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_workflow_template_steps` (
    `id` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `order` INTEGER NOT NULL,
    `estimatedDays` INTEGER NULL,
    `requiredDocuments` JSON NULL,
    `defaultStatus` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REVISION', 'REJECTED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',

    INDEX `service_workflow_template_steps_templateId_idx`(`templateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerEmail` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NOT NULL,
    `customerCompany` VARCHAR(191) NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NULL,
    `workflowTemplateId` VARCHAR(191) NULL,
    `assignedStaffId` VARCHAR(191) NULL,
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `startDate` DATETIME(3) NULL,
    `estimatedCompletionDate` DATETIME(3) NULL,
    `completionDate` DATETIME(3) NULL,
    `totalPrice` DECIMAL(12, 2) NOT NULL,
    `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `tax` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `grandTotal` DECIMAL(12, 2) NOT NULL,
    `paymentStatus` ENUM('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
    `status` ENUM('DRAFT', 'WAITING_PAYMENT', 'PAID', 'PROCESSING', 'ON_HOLD', 'REVISION', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `internalNotes` TEXT NULL,
    `customerNotes` TEXT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,
    `deletedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `service_transactions_code_key`(`code`),
    UNIQUE INDEX `service_transactions_invoiceNumber_key`(`invoiceNumber`),
    INDEX `service_transactions_status_idx`(`status`),
    INDEX `service_transactions_paymentStatus_idx`(`paymentStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_transaction_workflows` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `templateStepId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `order` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REVISION', 'REJECTED', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `updatedById` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `progressPercent` INTEGER NOT NULL DEFAULT 0,
    `estimatedDays` INTEGER NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `service_transaction_workflows_transactionId_idx`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `method` VARCHAR(191) NULL,
    `paidAt` DATETIME(3) NOT NULL,
    `note` TEXT NULL,
    `recordedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payments_transactionId_idx`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_transaction_attachments` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `workflowStepId` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `visibleToCustomer` BOOLEAN NOT NULL DEFAULT false,
    `uploadedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `service_transaction_attachments_transactionId_idx`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_transaction_logs` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `previousValue` JSON NULL,
    `newValue` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `device` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `service_transaction_logs_transactionId_idx`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_tracking_histories` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `device` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `service_tracking_histories_transactionId_idx`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `service_workflow_templates` ADD CONSTRAINT `service_workflow_templates_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_workflow_templates` ADD CONSTRAINT `service_workflow_templates_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_workflow_templates` ADD CONSTRAINT `service_workflow_templates_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_workflow_templates` ADD CONSTRAINT `service_workflow_templates_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_workflow_template_steps` ADD CONSTRAINT `service_workflow_template_steps_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `service_workflow_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transactions` ADD CONSTRAINT `service_transactions_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transactions` ADD CONSTRAINT `service_transactions_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `service_packages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transactions` ADD CONSTRAINT `service_transactions_workflowTemplateId_fkey` FOREIGN KEY (`workflowTemplateId`) REFERENCES `service_workflow_templates`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transactions` ADD CONSTRAINT `service_transactions_assignedStaffId_fkey` FOREIGN KEY (`assignedStaffId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transactions` ADD CONSTRAINT `service_transactions_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transactions` ADD CONSTRAINT `service_transactions_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transactions` ADD CONSTRAINT `service_transactions_deletedById_fkey` FOREIGN KEY (`deletedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transaction_workflows` ADD CONSTRAINT `service_transaction_workflows_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `service_transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transaction_workflows` ADD CONSTRAINT `service_transaction_workflows_templateStepId_fkey` FOREIGN KEY (`templateStepId`) REFERENCES `service_workflow_template_steps`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transaction_workflows` ADD CONSTRAINT `service_transaction_workflows_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `service_transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transaction_attachments` ADD CONSTRAINT `service_transaction_attachments_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `service_transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transaction_attachments` ADD CONSTRAINT `service_transaction_attachments_workflowStepId_fkey` FOREIGN KEY (`workflowStepId`) REFERENCES `service_transaction_workflows`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transaction_attachments` ADD CONSTRAINT `service_transaction_attachments_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transaction_logs` ADD CONSTRAINT `service_transaction_logs_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `service_transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_transaction_logs` ADD CONSTRAINT `service_transaction_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_tracking_histories` ADD CONSTRAINT `service_tracking_histories_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `service_transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

