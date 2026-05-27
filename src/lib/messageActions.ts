'use server';

import prisma from './prisma';

export const sendMessage = async ({
  conversationId,
  content,
  senderId,
  senderRole,
}: {
  conversationId: number;
  content: string;
  senderId: string;
  senderRole: string;
}) => {
  try {
    await prisma.message.create({
      data: {
        content,
        senderId,
        senderRole,
        conversationId,
      },
    });
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};

export const startConversation = async ({
  currentUserId,
  currentUserRole,
  targetUserId,
  targetUserRole,
}: {
  currentUserId: string;
  currentUserRole: string;
  targetUserId: string;
  targetUserRole: string;
}) => {
  try {
    const conversation = await prisma.conversation.create({
      data: {
        members: {
          create: [
            { userId: currentUserId, userRole: currentUserRole },
            { userId: targetUserId, userRole: targetUserRole },
          ],
        },
      },
    });
    return conversation;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const markMessagesAsRead = async ({
  conversationId,
  userId,
}: {
  conversationId: number;
  userId: string;
}) => {
  try {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};
