import { auth, currentUser } from '@clerk/nextjs/server';
import AIAssistant from './AIAssistant';

export const dynamic = 'force-dynamic';

const AIAssistantContainer = async () => {
  const { sessionClaims } = await auth();
  const clerkUser = await currentUser();

  const role = (sessionClaims?.metadata as { role?: string })?.role || '';
  const userName = clerkUser?.firstName || '';

  return <AIAssistant userName={userName} role={role} />;
};

export default AIAssistantContainer;
