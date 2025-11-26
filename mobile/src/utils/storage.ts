import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER: '@elidz_user',
  AUTH_TOKEN: '@elidz_auth_token',
  TENANTS: '@elidz_tenants',
  OPPORTUNITIES: '@elidz_opportunities',
  EVENTS: '@elidz_events',
  RESOURCES: '@elidz_resources',
  NEWS: '@elidz_news',
  CONNECTIONS: '@elidz_connections',
  MESSAGES: '@elidz_messages',
  CHATS: '@elidz_chats',
  OFFLINE_DOCUMENTS: '@elidz_offline_docs',
  SHARED_OPPORTUNITIES: '@elidz_shared_opps',
  GOOGLE_LOGIN: '@elidz_google_login',
};

export const storage = {
  async setUser(user: any) {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },
  
  async getUser() {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },
  
  async setAuthToken(token: string) {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
  },
  
  async getAuthToken() {
    return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  },
  
  async setTenants(tenants: any[]) {
    await AsyncStorage.setItem(KEYS.TENANTS, JSON.stringify(tenants));
  },
  
  async getTenants() {
    const data = await AsyncStorage.getItem(KEYS.TENANTS);
    return data ? JSON.parse(data) : [];
  },
  
  async setOpportunities(opportunities: any[]) {
    await AsyncStorage.setItem(KEYS.OPPORTUNITIES, JSON.stringify(opportunities));
  },
  
  async getOpportunities() {
    const data = await AsyncStorage.getItem(KEYS.OPPORTUNITIES);
    return data ? JSON.parse(data) : [];
  },
  
  async setEvents(events: any[]) {
    await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  },
  
  async getEvents() {
    const data = await AsyncStorage.getItem(KEYS.EVENTS);
    return data ? JSON.parse(data) : [];
  },
  
  async setResources(resources: any[]) {
    await AsyncStorage.setItem(KEYS.RESOURCES, JSON.stringify(resources));
  },
  
  async getResources() {
    const data = await AsyncStorage.getItem(KEYS.RESOURCES);
    return data ? JSON.parse(data) : [];
  },
  
  async setNews(news: any[]) {
    await AsyncStorage.setItem(KEYS.NEWS, JSON.stringify(news));
  },
  
  async getNews() {
    const data = await AsyncStorage.getItem(KEYS.NEWS);
    return data ? JSON.parse(data) : [];
  },
  
  async setConnections(connections: any[]) {
    await AsyncStorage.setItem(KEYS.CONNECTIONS, JSON.stringify(connections));
  },
  
  async getConnections() {
    const data = await AsyncStorage.getItem(KEYS.CONNECTIONS);
    return data ? JSON.parse(data) : [];
  },
  
  async setMessages(messages: any[]) {
    await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
  },
  
  async getMessages() {
    const data = await AsyncStorage.getItem(KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  },

  async setChats(chats: any[]) {
    await AsyncStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
  },

  async getChats() {
    const data = await AsyncStorage.getItem(KEYS.CHATS);
    return data ? JSON.parse(data) : [];
  },

  async setOfflineDocuments(documents: any[]) {
    await AsyncStorage.setItem(KEYS.OFFLINE_DOCUMENTS, JSON.stringify(documents));
  },

  async getOfflineDocuments() {
    const data = await AsyncStorage.getItem(KEYS.OFFLINE_DOCUMENTS);
    return data ? JSON.parse(data) : [];
  },

  async setSharedOpportunities(shared: any[]) {
    await AsyncStorage.setItem(KEYS.SHARED_OPPORTUNITIES, JSON.stringify(shared));
  },

  async getSharedOpportunities() {
    const data = await AsyncStorage.getItem(KEYS.SHARED_OPPORTUNITIES);
    return data ? JSON.parse(data) : [];
  },

  async setGoogleToken(token: string) {
    await AsyncStorage.setItem(KEYS.GOOGLE_LOGIN, token);
  },

  async getGoogleToken() {
    return await AsyncStorage.getItem(KEYS.GOOGLE_LOGIN);
  },
  
  async clearAll() {
    await AsyncStorage.multiRemove([
      KEYS.USER,
      KEYS.AUTH_TOKEN,
      KEYS.TENANTS,
      KEYS.OPPORTUNITIES,
      KEYS.EVENTS,
      KEYS.RESOURCES,
      KEYS.NEWS,
      KEYS.CONNECTIONS,
      KEYS.MESSAGES,
      KEYS.CHATS,
      KEYS.OFFLINE_DOCUMENTS,
      KEYS.SHARED_OPPORTUNITIES,
      KEYS.GOOGLE_LOGIN,
    ]);
  },
};

