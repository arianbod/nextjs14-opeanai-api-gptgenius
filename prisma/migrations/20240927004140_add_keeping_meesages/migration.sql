-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;