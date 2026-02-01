-- AlterTable
ALTER TABLE "Generation" ADD COLUMN     "parentGenerationId" TEXT;

-- CreateIndex
CREATE INDEX "Generation_parentGenerationId_idx" ON "Generation"("parentGenerationId");

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_parentGenerationId_fkey" FOREIGN KEY ("parentGenerationId") REFERENCES "Generation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
