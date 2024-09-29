/*
  Warnings:

  - You are about to drop the `Token` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tour` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[token]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `animalSelection` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_clerkId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "animalSelection" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "lastLoginAttempt" TIMESTAMP(3),
ADD COLUMN     "loginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "token" TEXT NOT NULL,
ADD COLUMN     "tokens" INTEGER NOT NULL DEFAULT 3000;

-- DropTable
DROP TABLE "Token";

-- DropTable
DROP TABLE "Tour";

-- CreateIndex
CREATE UNIQUE INDEX "User_token_key" ON "User"("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
