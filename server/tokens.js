import prisma from "@/prisma/db";
import { getUserById } from "./auth";


export async function getUserTokenBalance(userId) {
    const user = await getUserById(userId)
    return user ? user.tokenBalance : 10;
}

export async function updateUserTokenBalance(userId, amount) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { tokenBalance: { increment: amount } },
        select: { tokenBalance: true },
    });
    return user.tokenBalance;
}