import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send,
  MessageSquare,
  User,
  ArrowRightLeft,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Shirt,
} from 'lucide-react';
import { Conversation, Message } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../../components/LoadingSpinner';

export const ChatPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const activeConvId = searchParams.get('convId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState<string>('');
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setIsLoadingList(true);
      const res = await api.getConversations();
      const list = res.conversations || [];
      setConversations(list);

      if (activeConvId) {
        const found = list.find((c: Conversation) => c.id === activeConvId);
        if (found) setActiveConversation(found);
      } else if (list.length > 0 && !activeConversation) {
        setActiveConversation(list[0]);
        setSearchParams({ convId: list[0].id });
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      setIsLoadingMessages(true);
      const res = await api.getMessages(convId);
      setMessages(res.messages || []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      const found = conversations.find((c) => c.id === activeConvId);
      if (found) {
        setActiveConversation(found);
        fetchMessages(activeConvId);
      }
    }
  }, [activeConvId, conversations]);

  // Polling for new incoming messages every 6 seconds
  useEffect(() => {
    if (!activeConvId) return;
    const interval = setInterval(() => {
      api.getMessages(activeConvId).then((res) => {
        setMessages(res.messages || []);
      });
    } , 6000);
    return () => clearInterval(interval);
  }, [activeConvId]);

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    setSearchParams({ convId: conv.id });
    fetchMessages(conv.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeConversation || isSending) return;

    try {
      setIsSending(true);
      const res = await api.sendMessage(activeConversation.id, { text: newMessageText.trim() });
      setMessages((prev) => [...prev, res.message]);
      setNewMessageText('');
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find((p) => p.id !== user?.id) || conv.participants[0];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-md flex flex-col md:flex-row h-[75vh] min-h-[550px]">
        {/* Left Side: Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-stone-200 flex flex-col ${
            activeConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 bg-[#F7F4ED] border-b border-stone-200/80 flex items-center justify-between">
            <h2 className="font-serif font-bold text-base text-stone-900">Negotiation Chats</h2>
            <span className="text-xs text-[#315C3A] font-semibold">{conversations.length} Active</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {isLoadingList ? (
              <div className="p-8 text-center">
                <LoadingSpinner size="md" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                No active conversations yet. Start a chat from any clothing listing!
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = activeConversation?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                      isSelected ? 'bg-[#E8F1E8]/40 border-l-4 border-[#315C3A]' : 'hover:bg-stone-50'
                    }`}
                  >
                    <img
                      src={other?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={other?.name}
                      className="w-11 h-11 rounded-full object-cover border border-stone-200 shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-stone-900 truncate font-serif">{other?.name}</p>
                        {conv.unreadCount && conv.unreadCount > 0 ? (
                          <span className="w-2 h-2 rounded-full bg-[#315C3A]" />
                        ) : null}
                      </div>

                      {conv.item && (
                        <p className="text-[11px] text-[#315C3A] font-medium truncate flex items-center gap-1">
                          <Shirt className="w-3 h-3" />
                          <span>{conv.item.title}</span>
                        </p>
                      )}

                      <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                        {conv.lastMessage?.text || 'Started conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Thread */}
        <div className={`flex-1 flex flex-col ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
          {activeConversation ? (
            <>
              {/* Active Header */}
              {(() => {
                const other = getOtherParticipant(activeConversation);
                return (
                  <div className="p-4 bg-[#F7F4ED] border-b border-stone-200/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveConversation(null)}
                        className="md:hidden p-1 rounded-full text-stone-600 hover:bg-stone-200"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <img
                        src={other?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={other?.name}
                        className="w-10 h-10 rounded-full object-cover border border-stone-200"
                      />
                      <div>
                        <h3 className="text-sm font-serif font-bold text-stone-900">{other?.name}</h3>
                        <p className="text-[11px] text-stone-500">{other?.location || 'India'}</p>
                      </div>
                    </div>

                    {activeConversation.item && (
                      <Link
                        to={`/item/${activeConversation.item.id}`}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:text-[#315C3A]"
                      >
                        <img
                          src={activeConversation.item.images[0]}
                          alt="Item"
                          className="w-6 h-6 rounded-md object-cover"
                        />
                        <span className="truncate max-w-[140px]">{activeConversation.item.title}</span>
                      </Link>
                    )}
                  </div>
                );
              })()}

              {/* Message Thread Feed */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/50">
                {isLoadingMessages ? (
                  <div className="py-12 text-center">
                    <LoadingSpinner size="md" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-stone-400">
                    No messages yet. Send a friendly greeting to coordinate your clothing exchange!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-[#315C3A] text-white rounded-br-xs'
                              : 'bg-white text-stone-900 border border-stone-200/80 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-stone-400 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3.5 bg-white border-t border-stone-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type your message (negotiate swap, arrange pickup/courier)..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 focus:ring-2 focus:ring-[#315C3A]"
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim() || isSending}
                  className="w-10 h-10 rounded-2xl bg-[#315C3A] text-white flex items-center justify-center hover:bg-[#25472c] transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <MessageSquare className="w-12 h-12 stroke-1 mb-2 text-stone-300" />
              <p className="text-sm font-medium text-stone-600">Select a negotiation chat to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
