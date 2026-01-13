-- AlterTable
ALTER TABLE "content_items" ADD COLUMN     "canonical_url" TEXT,
ADD COLUMN     "seo_description" TEXT,
ADD COLUMN     "seo_keywords" TEXT,
ADD COLUMN     "seo_title" TEXT;

-- AlterTable
ALTER TABLE "interactive_runs" ADD COLUMN     "crisis_trigger_type" TEXT,
ADD COLUMN     "crisis_triggered" BOOLEAN NOT NULL DEFAULT false;
