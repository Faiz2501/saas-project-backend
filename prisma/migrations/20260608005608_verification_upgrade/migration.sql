-- AlterTable
ALTER TABLE "VerificationRequest" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "referenceId" TEXT,
ADD COLUMN     "transactionId" TEXT;
