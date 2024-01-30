-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "uploadLink" TEXT,
    "languages" TEXT[],
    "outputs" TEXT[],

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);
