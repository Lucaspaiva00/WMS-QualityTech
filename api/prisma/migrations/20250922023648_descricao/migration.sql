-- CreateTable
CREATE TABLE `Saida` (
    `cod_saida` INTEGER NOT NULL AUTO_INCREMENT,
    `cod_material` INTEGER NOT NULL,
    `pn_material` VARCHAR(191) NOT NULL,
    `lote` VARCHAR(191) NOT NULL,
    `data_validade` VARCHAR(191) NOT NULL,
    `posicao` VARCHAR(191) NOT NULL,
    `nf_entrada` VARCHAR(191) NOT NULL,
    `observacao` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`cod_saida`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Saida` ADD CONSTRAINT `Saida_cod_material_fkey` FOREIGN KEY (`cod_material`) REFERENCES `material`(`cod_material`) ON DELETE RESTRICT ON UPDATE CASCADE;
