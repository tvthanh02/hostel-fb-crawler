-- CreateTable
CREATE TABLE "Hostel" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "ward" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "postedBy" JSONB NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "fbLink" TEXT NOT NULL,
    "fbGroupName" TEXT NOT NULL,
    "coordinates" JSONB,
    "amenities" TEXT[],
    "rules" TEXT[],
    "images" TEXT[],
    "contactPhone" TEXT,
    "depositRequired" DOUBLE PRECISION,
    "utilities" JSONB,
    "roomType" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "rawFbData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hostel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Hostel_district_idx" ON "Hostel"("district");

-- CreateIndex
CREATE INDEX "Hostel_price_idx" ON "Hostel"("price");

-- CreateIndex
CREATE INDEX "Hostel_postedAt_idx" ON "Hostel"("postedAt");
