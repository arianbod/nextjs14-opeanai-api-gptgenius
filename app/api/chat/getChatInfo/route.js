// /api/chat/getChatInfo/route.js
import { getChatInfo } from "@/server/chat";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId, chatId } = await request.json()
        // console.log("userId:", userId, "chatId:", chatId);

        if (!chatId) {
            console.log("there is no chatId in getChatInfo API");
            return NextResponse.json({ error: "chatId is required" }, { status: 400 })
        }

        if (!userId) {
            console.log("there is no userId in getChatInfo API");
            return NextResponse.json({ error: "userId is required" }, { status: 400 })
        }

        const chatDataInfo = await getChatInfo(chatId)
        console.log("getChatInfo is fine *****************************", chatDataInfo)
        if (chatDataInfo?.id) {
            return NextResponse.json({ chatDataInfo }, { status: 200 })
        }
        return NextResponse.json({ error: "Chat not found" }, { status: 504 })
    } catch (error) {
        console.error("getChatInfo faced an error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}