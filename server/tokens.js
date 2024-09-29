import prisma from "@/prisma/db";


export async function getUserTokenBalance(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true },
    });
    return user ? user.tokenBalance : 0;
}

export async function updateUserTokenBalance(userId, amount) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: { tokenBalance: { increment: amount } },
        select: { tokenBalance: true },
    });
    return user.tokenBalance;
}