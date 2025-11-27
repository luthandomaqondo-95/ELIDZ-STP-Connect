"use client"

import { useEffect, useState, useRef } from "react"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Send, Loader2 } from "lucide-react"
import { useChat } from "@/hooks/use-chat"
import { cn } from "@/lib/utils"

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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Mark as read when selecting a chat
    useEffect(() => {
        if (selectedChat) {
            markAsRead(selectedChat.id);
        }
    }, [selectedChat, markAsRead]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-[calc(100vh-2rem)]">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Message Center</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {/* Sidebar / List */}
                <Card className="col-span-1 h-full flex flex-col">
                    <CardHeader className="pb-3 border-b">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search messages..." 
                                className="pl-8" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0">
                        {loading ? (
                            <div className="flex justify-center items-center h-full p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                No conversations found
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {filteredChats.map((chat) => {
                                    const otherUser = chat.otherUser;
                                    const name = otherUser?.name || chat.name || "Unknown User";
                                    const isSelected = selectedChat?.id === chat.id;
                                    
                                    return (
                                        <div 
                                            key={chat.id} 
                                            className={cn(
                                                "flex gap-3 p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                                                isSelected && "bg-muted",
                                                chat.unreadCount && chat.unreadCount > 0 && "bg-blue-50/50 dark:bg-blue-900/10"
                                            )}
                                            onClick={() => setSelectedChat(chat)}
                                        >
                                            <Avatar>
                                                <AvatarImage src={otherUser?.avatar} />
                                                <AvatarFallback>{getInitials(name)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={cn(
                                                        "text-sm truncate pr-2",
                                                        (chat.unreadCount || 0) > 0 ? "font-bold" : "font-medium"
                                                    )}>
                                                        {name}
                                                    </span>
                                                    {chat.updated_at && (
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                            {formatDate(chat.updated_at)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className={cn(
                                                        "text-xs truncate max-w-[180px]",
                                                        (chat.unreadCount || 0) > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                                    )}>
                                                        {chat.lastMessage?.content || "No messages yet"}
                                                    </p>
                                                    {(chat.unreadCount || 0) > 0 && (
                                                        <div className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                                            {chat.unreadCount}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Message View */}
                <Card className="col-span-1 md:col-span-2 h-full flex flex-col overflow-hidden">
                    {selectedChat ? (
                        <>
                            <div className="p-4 border-b flex items-center gap-3 bg-card">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedChat.otherUser?.avatar} />
                                    <AvatarFallback>
                                        {getInitials(selectedChat.otherUser?.name || selectedChat.name || "U")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold">
                                        {selectedChat.otherUser?.name || selectedChat.name || "Unknown User"}
                                    </h3>
                                    {selectedChat.otherUser?.role && (
                                        <p className="text-xs text-muted-foreground">
                                            {selectedChat.otherUser.role}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                                {messages.map((msg, index) => {
                                    const isMe = msg.sender_id === currentUser?.id;
                                    const showAvatar = !isMe && (index === 0 || messages[index - 1].sender_id !== msg.sender_id);
                                    
                                    return (
                                        <div 
                                            key={msg.id} 
                                            className={cn(
                                                "flex gap-2 max-w-[80%]",
                                                isMe ? "ml-auto flex-row-reverse" : ""
                                            )}
                                        >
                                            {!isMe && (
                                                <div className="w-8 flex-shrink-0">
                                                    {showAvatar && (
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={msg.sender?.avatar} />
                                                            <AvatarFallback className="text-xs">
                                                                {getInitials(msg.sender?.name || "U")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className={cn(
                                                "rounded-lg p-3 text-sm",
                                                isMe 
                                                    ? "bg-primary text-primary-foreground" 
                                                    : "bg-background border shadow-sm"
                                            )}>
                                                {msg.content}
                                                <div className={cn(
                                                    "text-[10px] mt-1 text-right opacity-70",
                                                    isMe ? "text-primary-foreground" : "text-muted-foreground"
                                                )}>
                                                    {formatDate(msg.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 border-t bg-card">
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Type a message..." 
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleSend} size="icon" disabled={!newMessage.trim()}>
                                        <Send className="h-4 w-4" />
                                        <span className="sr-only">Send</span>
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
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
