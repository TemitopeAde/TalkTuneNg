/*
  Warnings:

  - You are about to drop the column `authorImage` on the `blogs` table. All the data in the column will be lost.
  - You are about to drop the column `authorTitle` on the `blogs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."blogs" DROP COLUMN "authorImage",
DROP COLUMN "authorTitle";
