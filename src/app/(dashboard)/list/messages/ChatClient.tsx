'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { sendMessage, startConversation } from '@/lib/messageActions';

type User = { id: string; name: string; surname: string; role: string };
type Message = {
  id: number;
  content: string;
  senderId: string;
  senderRole: string;
  createdAt: string;
  read: boolean;
  conversationId: number;
};
type ConversationMember = {
  id: number;
  userId: string;
  userRole: string;
  conversationId: number;
};
type Conversation = {
  id: number;
  createdAt: string;
  members: ConversationMember[];
  messages: Message[];
};

const formatTime = (isoString: string) => {
  return isoString.slice(11, 16);
};

const ChatClient = ({
  conversations,
  allUsers,
  activeMessages,
  activeConversation,
  currentUserId,
  currentUserRole,
}: {
  conversations: Conversation[];
  allUsers: User[];
  activeMessages: Message[];
  activeConversation: Conversation | null;
  currentUserId: string;
  currentUserRole: string;
}) => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [activeMessages, mounted]);

  useEffect(() => {
    if (showNewChat && mounted && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showNewChat, mounted]);

  const getOtherMember = (conversation: Conversation) => {
    return conversation.members.find((m) => m.userId !== currentUserId);
  };

  const getUserName = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    return user ? `${user.name} ${user.surname}` : 'Unknown';
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      `${u.name} ${u.surname}`.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSend = async () => {
    if (!message.trim() || !activeConversation || sending) return;
    setSending(true);
    const content = message.trim();
    setMessage('');
    await sendMessage({
      conversationId: activeConversation.id,
      content,
      senderId: currentUserId,
      senderRole: currentUserRole,
    });
    setSending(false);
    router.refresh();
  };

  const handleStartConversation = async (user: User) => {
    const existing = conversations.find((c) =>
      c.members.some((m) => m.userId === user.id),
    );
    if (existing) {
      setShowNewChat(false);
      setSearch('');
      router.push(`/list/messages?conversationId=${existing.id}`);
      return;
    }

    const conv = await startConversation({
      currentUserId,
      currentUserRole,
      targetUserId: user.id,
      targetUserRole: user.role,
    });
    setShowNewChat(false);
    setSearch('');
    router.push(`/list/messages?conversationId=${conv.id}`);
    router.refresh();
  };

  if (!mounted) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] p-4 gap-4">
      {/* LEFT */}
      <div
        className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 bg-white/80 backdrop-blur-sm rounded-xl flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-lg">Messages</h2>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors text-xl font-light"
          >
            {showNewChat ? '×' : '+'}
          </button>
        </div>

        {showNewChat && (
          <div className="p-3 border-b border-gray-100 bg-blue-50">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-200 text-sm outline-none"
            />
            <div className="mt-2 max-h-48 overflow-y-auto flex flex-col gap-1">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleStartConversation(user)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-100 text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                    {user.name[0]}
                    {user.surname[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {user.name} {user.surname}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {user.role}
                    </p>
                  </div>
                </button>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">
                  No users found
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs">Click + to start a new chat</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherMember(conv);
              const lastMsg = conv.messages[0];
              const isActive = activeConversation?.id === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() =>
                    router.push(`/list/messages?conversationId=${conv.id}`)
                  }
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${isActive ? 'bg-blue-50' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                    {other ? getUserName(other.userId).charAt(0) : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {other ? getUserName(other.userId) : 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {lastMsg ? lastMsg.content : 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div
        className={`${activeConversation ? 'flex' : 'hidden md:flex'} flex-1 bg-white/80 backdrop-blur-sm rounded-xl flex-col overflow-hidden`}
      >
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <button
                onClick={() => router.push('/list/messages')}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 text-lg"
              >
                ←
              </button>
              <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                {getUserName(
                  getOtherMember(activeConversation)?.userId || '',
                ).charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {getUserName(
                    getOtherMember(activeConversation)?.userId || '',
                  )}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {getOtherMember(activeConversation)?.userRole}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {activeMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  No messages yet. Say hello!
                </div>
              ) : (
                activeMessages.map((msg) => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-blue-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}
                      >
                        <p>{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && !e.shiftKey && handleSend()
                }
                placeholder="Type a message..."
                className="flex-1 p-3 rounded-xl border border-gray-200 outline-none text-sm focus:border-blue-400 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Image
                src="/message.png"
                alt=""
                width={32}
                height={32}
                className="opacity-40"
              />
            </div>
            <p className="font-medium">Select a conversation</p>
            <p className="text-sm">or start a new one with +</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatClient;
