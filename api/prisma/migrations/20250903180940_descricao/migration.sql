-- CreateTable
CREATE TABLE `material` (
    `cod_material` INTEGER NOT NULL AUTO_INCREMENT,
    `pn_material` VARCHAR(191) NOT NULL,
    `lote` VARCHAR(191) NOT NULL,
    `data_validade` VARCHAR(191) NOT NULL,
    `posicao` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,

    PRIMARY KEY (`cod_material`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
