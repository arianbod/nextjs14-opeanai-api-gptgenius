import { getChatInfo } from "@/server/chat";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { chatId } = await request.json()
        if (!chatId) {
            console.log("there is no chatId in getChatInfo API");
            return NextResponse.json({ error: "chatId is required" }, { status: 400 })
        }
        const chatDataInfo = await getChatInfo(chatId)
        if (chatDataInfo?.id) {
            return NextResponse.json({ chatDataInfo }, { status: 200 })
        }
    } catch (error) {
        console.error("getChatInfo faced an error:", error);

    }

}