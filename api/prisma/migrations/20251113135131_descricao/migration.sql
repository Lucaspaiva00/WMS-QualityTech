-- AlterTable
ALTER TABLE `material` ADD COLUMN `operadorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `saida` ADD COLUMN `operadorId` INTEGER NULL;

-- CreateTable
CREATE TABLE `operador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `usuario` VARCHAR(191) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `operador_usuario_key`(`usuario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `material` ADD CONSTRAINT `material_operadorId_fkey` FOREIGN KEY (`operadorId`) REFERENCES `operador`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `saida` ADD CONSTRAINT `saida_operadorId_fkey` FOREIGN KEY (`operadorId`) REFERENCES `operador`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
