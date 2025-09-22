/*
  Warnings:

  - You are about to drop the column `created_at` on the `saida` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `saida` DROP FOREIGN KEY `Saida_cod_material_fkey`;

-- AlterTable
ALTER TABLE `saida` DROP COLUMN `created_at`,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pendente',
    MODIFY `observacao` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `saida` ADD CONSTRAINT `saida_cod_material_fkey` FOREIGN KEY (`cod_material`) REFERENCES `material`(`cod_material`) ON DELETE RESTRICT ON UPDATE CASCADE;
