"use client";
import React, { Suspense } from 'react';
import ChatPage from "@/features/chat/chat.page";

const ChatPageWithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ChatPage />
  </Suspense>
);

export default ChatPageWithSuspense;