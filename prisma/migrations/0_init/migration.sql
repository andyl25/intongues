-- CreateTable
CREATE TABLE "File" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "s3Name" TEXT NOT NULL,
    "languages" TEXT[],
    "owner" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "credits_available" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "File_pkey" PRIMARY KEY ("s3Name")
);

-- CreateTable
CREATE TABLE "outputFile" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "language" TEXT NOT NULL,
    "orig_file_id" TEXT NOT NULL,

    CONSTRAINT "outputFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "File_s3Name_key" ON "File"("s3Name");

-- AddForeignKey
ALTER TABLE "outputFile" ADD CONSTRAINT "outputFile_orig_file_id_fkey" FOREIGN KEY ("orig_file_id") REFERENCES "File"("s3Name") ON DELETE RESTRICT ON UPDATE CASCADE;

