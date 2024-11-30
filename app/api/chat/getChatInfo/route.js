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
        // Add this to handle case where chatDataInfo doesn't have an id
        return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    } catch (error) {
        console.error("getChatInfo faced an error:", error);
        // Add this to handle the error case
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}