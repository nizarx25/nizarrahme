-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Brandable',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "shortDescription" TEXT NOT NULL DEFAULT '',
    "useCases" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'Available',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "price" INTEGER,
    "showPrice" BOOLEAN NOT NULL DEFAULT false,
    "saleType" TEXT NOT NULL DEFAULT 'Make an Offer',
    "sourceMarketplace" TEXT,
    "sourceUrl" TEXT,
    "registrar" TEXT,
    "domainScore" REAL,
    "tldsTaken" INTEGER,
    "tldsDeveloped" INTEGER,
    "expirationDate" DATETIME,
    "legalReviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "publicNotes" TEXT NOT NULL DEFAULT '',
    "internalNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domainId" TEXT,
    "inquiryType" TEXT NOT NULL DEFAULT 'domain_offer',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "offerAmount" INTEGER,
    "intendedUse" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "adminNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Inquiry_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contactEmail" TEXT NOT NULL DEFAULT 'info@nizarrahme.com',
    "socialLinks" TEXT NOT NULL DEFAULT '{}',
    "featuredDomainIds" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_key" ON "Domain"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex (performance: see audit DB-5)
CREATE INDEX "Domain_status_idx" ON "Domain"("status");
CREATE INDEX "Domain_featured_idx" ON "Domain"("featured");
CREATE INDEX "Domain_category_idx" ON "Domain"("category");
CREATE INDEX "Domain_extension_idx" ON "Domain"("extension");
CREATE INDEX "Domain_sourceMarketplace_idx" ON "Domain"("sourceMarketplace");
CREATE INDEX "Domain_createdAt_idx" ON "Domain"("createdAt");
CREATE INDEX "Domain_name_normalized_idx" ON "Domain"("normalizedName");
CREATE INDEX "Inquiry_status_idx" ON "Inquiry"("status");
CREATE INDEX "Inquiry_createdAt_idx" ON "Inquiry"("createdAt");
CREATE INDEX "Inquiry_email_idx" ON "Inquiry"("email");

