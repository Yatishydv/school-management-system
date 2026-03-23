import { create } from 'zustand';

export const useChatStore = create((set) => ({
    messages: [],
    contacts: [],
    activeChatId: null,
    setContacts: (contacts) => set({ contacts }),
    setActiveChatId: (id) => set({ activeChatId: id }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    setMessages: (messages) => set({ messages }),
}));