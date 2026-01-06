-- CreateTable
CREATE TABLE "public"."voice_previews" (
    "id" TEXT NOT NULL,
    "voiceId" TEXT NOT NULL,
    "voiceName" TEXT NOT NULL,
    "previewText" TEXT NOT NULL,
    "audioFileUrl" TEXT,
    "audioFileName" TEXT,
    "audioFileSize" INTEGER,
    "isGenerated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voice_previews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "voice_previews_voiceId_key" ON "public"."voice_previews"("voiceId");
