-- CreateEnum
CREATE TYPE "roomStatus" AS ENUM ('PUBLIC', 'PROTECTED', 'PRIVATE');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
    "user_name" VARCHAR(50),
    "image_url" VARCHAR(100) NOT NULL,
    "tfa_secret" TEXT,
    "is_tfa_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "conversationId" INTEGER,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend_request" (
    "id" SERIAL NOT NULL,
    "from_id" INTEGER NOT NULL,
    "to_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "friend_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" SERIAL NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "user_id" INTEGER NOT NULL,
    "winStrike" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "id" SERIAL NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "winner_id" INTEGER,
    "loser_id" INTEGER,
    "host_id" INTEGER NOT NULL,
    "guest_id" INTEGER,
    "host_score" INTEGER NOT NULL DEFAULT 0,
    "guest_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" SERIAL NOT NULL,
    "ident" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "roomStatus" NOT NULL DEFAULT 'PUBLIC',
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_Conv" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "is_admin" BOOLEAN NOT NULL,
    "is_owner" BOOLEAN NOT NULL,

    CONSTRAINT "user_Conv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_friends" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_banned_users" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_user_name_key" ON "user"("user_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_tfa_secret_key" ON "user"("tfa_secret");

-- CreateIndex
CREATE UNIQUE INDEX "friend_request_from_id_to_id_key" ON "friend_request"("from_id", "to_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_user_id_key" ON "profile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_name_key" ON "conversation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_Conv_userId_conversationId_key" ON "user_Conv"("userId", "conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "_friends_AB_unique" ON "_friends"("A", "B");

-- CreateIndex
CREATE INDEX "_friends_B_index" ON "_friends"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_banned_users_AB_unique" ON "_banned_users"("A", "B");

-- CreateIndex
CREATE INDEX "_banned_users_B_index" ON "_banned_users"("B");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_request" ADD CONSTRAINT "friend_request_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_request" ADD CONSTRAINT "friend_request_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend_request" ADD CONSTRAINT "friend_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_loser_id_fkey" FOREIGN KEY ("loser_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_Conv" ADD CONSTRAINT "user_Conv_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_Conv" ADD CONSTRAINT "user_Conv_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_banned_users" ADD CONSTRAINT "_banned_users_A_fkey" FOREIGN KEY ("A") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_banned_users" ADD CONSTRAINT "_banned_users_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
