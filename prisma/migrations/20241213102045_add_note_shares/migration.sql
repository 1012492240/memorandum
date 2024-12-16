-- CreateTable
CREATE TABLE "NoteShares" (
    "id" SERIAL NOT NULL,
    "note_id" INTEGER NOT NULL,
    "share_token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteShares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NoteShares_share_token_key" ON "NoteShares"("share_token");

-- AddForeignKey
ALTER TABLE "NoteShares" ADD CONSTRAINT "NoteShares_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
