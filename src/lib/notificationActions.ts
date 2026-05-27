'use server';

import prisma from './prisma';

export const markNotificationRead = async ({
  userId,
  itemId,
  itemType,
}: {
  userId: string;
  itemId: number;
  itemType: string;
}) => {
  try {
    await prisma.notificationRead.upsert({
      where: {
        userId_itemId_itemType: { userId, itemId, itemType },
      },
      update: {},
      create: { userId, itemId, itemType },
    });
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};
