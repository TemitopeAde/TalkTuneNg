-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'KID');

-- CreateEnum
CREATE TYPE "public"."AgeGroup" AS ENUM ('CHILD', 'TEENAGER', 'YOUNG_ADULT', 'ELDERLY_45_65', 'OLD_70_PLUS');

-- CreateEnum
CREATE TYPE "public"."VoiceMood" AS ENUM ('ANGRY', 'HAPPY', 'ANXIOUS', 'DRAMA', 'SURPRISED', 'SCARED', 'LAX', 'SAD', 'EXCITED', 'DISAPPOINTED', 'STRICT');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "otp" INTEGER,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ALTER COLUMN "phoneNumber" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "public"."scripts" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "uploadMode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "audioFileName" TEXT,
    "audioFileSize" INTEGER,
    "audioFileUrl" TEXT,
    "audioGenerated" BOOLEAN NOT NULL DEFAULT false,
    "elevenLabsVoiceId" TEXT,
    "audioSettings" JSONB,
    "userId" INTEGER NOT NULL,
    "voiceProfileId" TEXT,

    CONSTRAINT "scripts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."voice_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "ageGroup" "public"."AgeGroup" NOT NULL,
    "language" TEXT NOT NULL,
    "voiceMood" "public"."VoiceMood" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "voice_profiles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."scripts" ADD CONSTRAINT "scripts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scripts" ADD CONSTRAINT "scripts_voiceProfileId_fkey" FOREIGN KEY ("voiceProfileId") REFERENCES "public"."voice_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."voice_profiles" ADD CONSTRAINT "voice_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
