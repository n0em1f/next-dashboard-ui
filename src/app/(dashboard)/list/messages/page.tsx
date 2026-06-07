import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import ChatClient from './ChatClient';
import { markMessagesAsRead } from '@/lib/messageActions';

export const dynamic = 'force-dynamic';

const MessagesPage = async ({
  searchParams,
}: {
  searchParams: { conversationId?: string };
}) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role || '';

  const conversationsRaw = await prisma.conversation.findMany({
    where: {
      members: { some: { userId: userId! } },
    },
    include: {
      members: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Serialize dates
  const conversations = conversationsRaw.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    messages: c.messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  const teachers = await prisma.teacher.findMany({
    select: { id: true, name: true, surname: true },
  });
  const students = await prisma.student.findMany({
    select: { id: true, name: true, surname: true },
  });
  // const parents = await prisma.parent.findMany({
  //   select: { id: true, name: true, surname: true },
  // });

  const allUsers = [
    ...teachers.map((t) => ({ ...t, role: 'teacher' })),
    ...students.map((s) => ({ ...s, role: 'student' })),
    //...parents.map((p) => ({ ...p, role: 'parent' })),
  ].filter((u) => u.id !== userId);

  const activeConversationId = searchParams.conversationId
    ? parseInt(searchParams.conversationId)
    : null;

  const activeMessagesRaw = activeConversationId
    ? await prisma.message.findMany({
        where: { conversationId: activeConversationId },
        orderBy: { createdAt: 'asc' },
      })
    : [];

  const activeMessages = activeMessagesRaw.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  if (activeConversationId && userId) {
    await markMessagesAsRead({
      conversationId: activeConversationId,
      userId,
    });
  }

  const activeConversation = activeConversationId
    ? conversations.find((c) => c.id === activeConversationId) || null
    : null;

  return (
    <ChatClient
      conversations={conversations}
      allUsers={allUsers}
      activeMessages={activeMessages}
      activeConversation={activeConversation}
      currentUserId={userId!}
      currentUserRole={role}
    />
  );
};

export default MessagesPage;
