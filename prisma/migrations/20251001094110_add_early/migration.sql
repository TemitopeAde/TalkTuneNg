-- CreateTable
CREATE TABLE "public"."EarlyAccess" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "EarlyAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EarlyAccess_email_key" ON "public"."EarlyAccess"("email");
