"use client"

import { useEffect, useState, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Search, Loader2, MessagesSquare } from "lucide-react"
import { useChat } from "@/hooks/use-chat"
import { cn } from "@/lib/utils"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"

const PANEL_CLASS =
    "flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]"

const AVATAR_SHADOW = "shadow-[0_4px_10px_rgba(0,0,0,0.35)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.8)]"

export default function MessageCenterPage() {
    const { 
        chats, 
        messages, 
        loading, 
        currentUser, 
        selectedChat, 
        setSelectedChat, 
        sendMessage,
        markAsRead
    } = useChat();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Mark as read when selecting a chat
    useEffect(() => {
        if (selectedChat) {
            markAsRead(selectedChat.id);
        }
    }, [selectedChat, markAsRead]);

    // Scroll only the conversation to the newest message, so the page itself does not jump on phones.
    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, [messages, selectedChat]);

    const filteredChats = chats.filter(chat => {
        const otherName = chat.otherUser?.name || chat.name || "Unknown";
        const lastMsg = chat.lastMessage?.content || "";
        return otherName.toLowerCase().includes(searchQuery.toLowerCase()) || 
               lastMsg.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        const msg = newMessage;
        setNewMessage(""); // Clear immediately
        await sendMessage(msg);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            }).format(date);
        } else if (days < 7) {
            return new Intl.DateTimeFormat('en-US', {
                weekday: 'short'
            }).format(date);
        } else {
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric'
            }).format(date);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex h-[calc(100dvh-5.5rem)] min-h-0 flex-col gap-3 sm:h-[calc(100dvh-6rem)] sm:gap-4">
            {/* On phones an open conversation takes the whole screen, like WhatsApp. */}
            <div className={cn("flex flex-col gap-3 sm:gap-4", selectedChat && "max-md:hidden")}>
                <DashboardPageHeader title="Message Center" icon={<MessagesSquare className="h-5 w-5" />} />
                <p className="hidden max-w-3xl text-sm italic text-muted-foreground sm:block">
                    Connect with tenants, investors, and team members through one streamlined conversation hub with real-time updates.
                </p>
            </div>
            
            <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] gap-3 sm:gap-4 md:grid-cols-3">
                {/* Conversation list */}
                <Card className={cn(PANEL_CLASS, "pb-0", selectedChat && "max-md:hidden")}>
                    <CardHeader className="pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Search messages..." 
                                className="h-10 rounded-full border-0 bg-orange-100/80 pl-9 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-0 sm:p-0">
                        {loading ? (
                            <div className="flex justify-center items-center h-full p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                No conversations found
                            </div>
                        ) : (
                            <div className="flex flex-col pb-2">
                                {filteredChats.map((chat) => {
                                    const otherUser = chat.otherUser;
                                    const name = otherUser?.name || chat.name || "Unknown User";
                                    const isSelected = selectedChat?.id === chat.id;
                                    const unread = chat.unreadCount || 0;
                                    
                                    return (
                                        <button
                                            type="button"
                                            key={chat.id} 
                                            className={cn(
                                                "mx-2 my-0.5 flex items-center gap-3 rounded-2xl p-2.5 text-left transition-colors sm:my-1 sm:p-3",
                                                isSelected && "bg-orange-100/70 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] dark:bg-orange-900/25 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)]",
                                                !isSelected && "hover:bg-slate-100/70 active:bg-slate-100 dark:hover:bg-slate-800/60 dark:active:bg-slate-800",
                                                unread > 0 && !isSelected && "bg-blue-50/50 dark:bg-blue-900/10"
                                            )}
                                            onClick={() => setSelectedChat(chat)}
                                        >
                                            <Avatar className={cn("size-12 sm:size-10", AVATAR_SHADOW)}>
                                                <AvatarImage src={otherUser?.avatar} />
                                                <AvatarFallback>{getInitials(name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline justify-between gap-2">
                                                    <span className={cn(
                                                        "truncate text-[15px] sm:text-sm",
                                                        unread > 0 ? "font-bold" : "font-medium"
                                                    )}>
                                                        {name}
                                                    </span>
                                                    {chat.updated_at && (
                                                        <span className={cn(
                                                            "shrink-0 text-xs",
                                                            unread > 0 ? "font-semibold text-orange-600 dark:text-orange-300" : "text-muted-foreground"
                                                        )}>
                                                            {formatDate(chat.updated_at)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-0.5 flex items-center justify-between gap-2">
                                                    <p className={cn(
                                                        "min-w-0 truncate text-sm sm:text-xs",
                                                        unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                                    )}>
                                                        {chat.lastMessage?.content || "No messages yet"}
                                                    </p>
                                                    {unread > 0 && (
                                                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white shadow-[0_4px_10px_-2px_rgba(234,88,12,0.6)] dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.85)]">
                                                            {unread}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Conversation */}
                <Card className={cn(PANEL_CLASS, "gap-0 py-0 md:col-span-2", !selectedChat && "max-md:hidden")}>
                    {selectedChat ? (
                        <>
                            <div className="relative z-10 flex items-center gap-2 bg-card p-2.5 shadow-[0_8px_16px_-10px_rgba(0,0,0,0.45)] sm:gap-3 sm:p-4 dark:shadow-[0_8px_18px_-10px_rgba(0,0,0,0.9)]">
                                <button
                                    type="button"
                                    aria-label="Back to conversations"
                                    onClick={() => setSelectedChat(null)}
                                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 shadow-[0_6px_14px_-2px_rgba(0,0,0,0.45)] transition-colors hover:bg-orange-200/80 md:hidden dark:bg-orange-900/30 dark:text-orange-200 dark:shadow-[0_6px_16px_-2px_rgba(0,0,0,0.85)] dark:hover:bg-orange-900/50"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <Avatar className={cn("size-10", AVATAR_SHADOW)}>
                                    <AvatarImage src={selectedChat.otherUser?.avatar} />
                                    <AvatarFallback>
                                        {getInitials(selectedChat.otherUser?.name || selectedChat.name || "U")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <h3 className="truncate font-semibold leading-tight">
                                        {selectedChat.otherUser?.name || selectedChat.name || "Unknown User"}
                                    </h3>
                                    {selectedChat.otherUser?.role && (
                                        <p className="truncate text-xs text-muted-foreground">
                                            {selectedChat.otherUser.role}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div
                                ref={scrollRef}
                                className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/20 px-2.5 py-3 sm:p-4"
                            >
                                {messages.map((msg, index) => {
                                    const isMe = msg.sender_id === currentUser?.id;
                                    const showAvatar = index === 0 || messages[index - 1].sender_id !== msg.sender_id;
                                    const author = isMe ? (currentUser ?? msg.sender) : msg.sender;
                                    
                                    return (
                                        <div 
                                            key={msg.id} 
                                            className={cn(
                                                "flex max-w-[85%] gap-2 sm:max-w-[75%]",
                                                showAvatar ? "mt-3 first:mt-0" : "mt-1",
                                                isMe ? "ml-auto flex-row-reverse" : ""
                                            )}
                                        >
                                            <div className="w-8 flex-shrink-0">
                                                {showAvatar && (
                                                    <Avatar className={cn("h-8 w-8", AVATAR_SHADOW)}>
                                                        <AvatarImage src={author?.avatar} />
                                                        <AvatarFallback
                                                            className={cn(
                                                                "text-xs",
                                                                isMe && "bg-orange-100 font-semibold text-orange-800 dark:bg-orange-900/40 dark:text-orange-200"
                                                            )}
                                                        >
                                                            {getInitials(author?.name || (isMe ? "Me" : "U"))}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                            
                                            <div className={cn(
                                                "min-w-0 rounded-2xl px-3 py-2 text-sm",
                                                showAvatar && (isMe ? "rounded-tr-md" : "rounded-tl-md"),
                                                isMe 
                                                    ? "bg-primary text-primary-foreground shadow-[0_10px_24px_-10px_rgba(0,0,0,0.55)] dark:shadow-[0_10px_26px_-10px_rgba(0,0,0,0.9)]" 
                                                    : "bg-background shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45)] dark:shadow-[0_10px_26px_-10px_rgba(0,0,0,0.85)]"
                                            )}>
                                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                                <div className={cn(
                                                    "mt-0.5 text-right text-[10px] opacity-70",
                                                    isMe ? "text-primary-foreground" : "text-muted-foreground"
                                                )}>
                                                    {formatDate(msg.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="relative z-10 bg-card p-2.5 shadow-[0_-8px_16px_-10px_rgba(0,0,0,0.45)] sm:p-4 dark:shadow-[0_-8px_18px_-10px_rgba(0,0,0,0.9)]">
                                <div className="flex items-center gap-2">
                                    <Input 
                                        placeholder="Type a message..." 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        enterKeyHint="send"
                                        className="h-10 flex-1 rounded-full border-0 bg-orange-100/80 px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                                    />
                                    <AnimatedDashboardButton
                                        label="Send"
                                        className="h-10 shrink-0 rounded-full px-4"
                                        onClick={handleSend}
                                        disabled={!newMessage.trim()}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] dark:bg-slate-800 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)]">
                                <Search className="h-8 w-8 opacity-50" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No Chat Selected</h3>
                            <p className="max-w-xs mx-auto">
                                Select a conversation from the list to view messages or start a new one.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
