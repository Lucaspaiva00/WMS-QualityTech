-- CreateTable
CREATE TABLE `material` (
    `cod_material` INTEGER NOT NULL AUTO_INCREMENT,
    `pn_material` VARCHAR(191) NOT NULL,
    `lote` VARCHAR(191) NOT NULL,
    `data_validade` VARCHAR(191) NOT NULL,
    `posicao` VARCHAR(191) NOT NULL,
    `quantidade` INTEGER NOT NULL,
    `nf_entrada` VARCHAR(191) NOT NULL,
    `observacao` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`cod_material`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posicao` (
    `cod_posicao` INTEGER NOT NULL AUTO_INCREMENT,
    `posicao` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`cod_posicao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cliente` (
    `cod_cliente` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_cliente` VARCHAR(191) NOT NULL,
    `cnpj` VARCHAR(191) NOT NULL,
    `endereco` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`cod_cliente`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produtos` (
    `cod_produto` INTEGER NOT NULL AUTO_INCREMENT,
    `nome_produto` VARCHAR(191) NOT NULL,
    `codigo` VARCHAR(191) NOT NULL,
    `peso_uni` VARCHAR(191) NOT NULL,
    `cliente_cod_cliente` INTEGER NOT NULL,

    PRIMARY KEY (`cod_produto`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `produtos` ADD CONSTRAINT `produtos_cliente_cod_cliente_fkey` FOREIGN KEY (`cliente_cod_cliente`) REFERENCES `cliente`(`cod_cliente`) ON DELETE RESTRICT ON UPDATE CASCADE;
