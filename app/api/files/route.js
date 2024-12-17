// app/api/files/route.js
import { NextResponse } from 'next/server';
import prisma from '@/prisma/db';
import { getUserById } from '@/server/auth';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    const userId = searchParams.get('userId');

    try {
        const user = await getUserById(userId);
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const fileData = await prisma.fileMetadata.findUnique({
            where: {
                messageId,
            },
            include: {
                message: {
                    select: {
                        chatId: true,
                        chat: {
                            select: {
                                userId: true
                            }
                        }
                    }
                }
            }
        });

        // Verify user owns this chat
        if (fileData?.message?.chat?.userId !== userId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        return NextResponse.json({ data: fileData });
    } catch (error) {
        console.error('Error fetching file metadata:', error);
        return NextResponse.json({ error: 'Failed to fetch file data' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { userId, messageId, fileData } = await request.json();

        const user = await getUserById(userId);
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        // Verify message belongs to user's chat
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            include: {
                chat: {
                    select: {
                        userId: true
                    }
                }
            }
        });

        if (message?.chat?.userId !== userId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const metadata = await prisma.fileMetadata.create({
            data: {
                messageId,
                fileName: fileData.name,
                fileType: fileData.type,
                fileSize: fileData.size,
                contentSummary: fileData.summary,
                processingStatus: 'completed',
                analysisResult: fileData.analysis || {}
            }
        });

        return NextResponse.json({ data: metadata });
    } catch (error) {
        console.error('Error creating file metadata:', error);
        return NextResponse.json({ error: 'Failed to store file metadata' }, { status: 500 });
    }
}