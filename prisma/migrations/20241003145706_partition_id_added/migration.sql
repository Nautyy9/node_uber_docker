/*
  Warnings:

  - Added the required column `partitionId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "partitionId" INTEGER NOT NULL;
