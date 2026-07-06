-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'maker', 'admin');
CREATE TYPE "ProductStatus" AS ENUM ('pending', 'scheduled', 'approved', 'rejected');
CREATE TYPE "NewsletterStatus" AS ENUM ('draft', 'scheduled', 'published');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "bio" TEXT NOT NULL DEFAULT '',
    "twitter" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","role")
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Category" (
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("slug")
);

CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "screenshotUrls" TEXT[],
    "categoryId" TEXT NOT NULL,
    "tags" TEXT[],
    "launchDate" DATE NOT NULL,
    "website" TEXT NOT NULL,
    "makerId" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'pending',
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vote" (
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_pkey" PRIMARY KEY ("userId","productId")
);

CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Follow" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followingId")
);

CREATE TABLE "Newsletter" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "shortDescription" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "featuredProductIds" TEXT[],
    "publishDate" DATE NOT NULL,
    "status" "NewsletterStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Newsletter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "unsubscribeToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_status_launchDate_idx" ON "Product"("status", "launchDate" DESC);
CREATE INDEX "Vote_productId_idx" ON "Vote"("productId");
CREATE INDEX "Comment_productId_createdAt_idx" ON "Comment"("productId", "createdAt" DESC);
CREATE UNIQUE INDEX "Newsletter_slug_key" ON "Newsletter"("slug");
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
CREATE UNIQUE INDEX "NewsletterSubscriber_unsubscribeToken_key" ON "NewsletterSubscriber"("unsubscribeToken");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_makerId_fkey" FOREIGN KEY ("makerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
