import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  FAVORITES: "@xunwen_favorites",
  CONVERSATIONS: "@xunwen_conversations"
};

type Message = {
  id: string;
  type: "user" | "bot";
  content: string;
  image?: string;
  isFavorite?: boolean;
  timestamp?: number;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

const FavoritesScreen: React.FC = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [favoriteMessages, setFavoriteMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      const savedConversations = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      const parsedFavorites: string[] = savedFavorites ? JSON.parse(savedFavorites) : [];
      
      setFavorites(parsedFavorites);
      
      if (savedConversations) {
        const parsedConversations: Conversation[] = JSON.parse(savedConversations);
        setConversations(parsedConversations);
        
        // 提取收藏的消息
        const allMessages = parsedConversations.flatMap(c => c.messages);
        const filteredMessages = allMessages.filter(m => parsedFavorites.includes(m.id));
        setFavoriteMessages(filteredMessages);
      }
    } catch (error) {
      console.error("加载收藏失败:", error);
    }
  };

  const handleRemoveFavorite = (messageId: string) => {
    Alert.alert(
      "移除收藏",
      "确定要移除这个收藏吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "移除",
          style: "destructive",
          onPress: async () => {
            try {
              const newFavorites = favorites.filter(id => id !== messageId);
              setFavorites(newFavorites);
              setFavoriteMessages(favoriteMessages.filter(m => m.id !== messageId));
              
              // 更新存储
              await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
              
              // 更新对话中的收藏状态
              const updatedConversations = conversations.map(conv => ({
                ...conv,
                messages: conv.messages.map(msg => 
                  msg.id === messageId ? { ...msg, isFavorite: false } : msg
                )
              }));
              setConversations(updatedConversations);
              await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(updatedConversations));
              
              Alert.alert("成功", "已从收藏中移除");
            } catch (error) {
              console.error("移除收藏失败:", error);
              Alert.alert("错误", "移除收藏失败");
            }
          }
        }
      ]
    );
  };

  const renderFavoriteItem = ({ item }: { item: Message }) => (
    <TouchableOpacity style={styles.favoriteItem} onPress={() => setSelectedMessage(item)} activeOpacity={0.9}>
      <View style={styles.favoriteContent}>
        <Text style={styles.favoriteText} numberOfLines={3}>
          {item.content}
        </Text>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.favoriteImage} />
        )}
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item.id)}
      >
        <Text style={styles.removeButtonText}>移除</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的收藏</Text>
      </View>
      <FlatList
        data={favoriteMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无收藏</Text>
            <Text style={styles.emptySubtext}>在对话中点击收藏按钮添加内容</Text>
          </View>
        }
      />
      <Modal
        visible={!!selectedMessage}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>收藏详情</Text>
              <TouchableOpacity onPress={() => setSelectedMessage(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
              {selectedMessage?.image && (
                <Image source={{ uri: selectedMessage.image }} style={styles.modalImage} />
              )}
              <Text style={styles.modalText}>{selectedMessage?.content}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfbf7"
  },
  header: {
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(253,251,247,0.9)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937"
  },
  listContent: {
    padding: 20,
    paddingBottom: 100
  },
  favoriteItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  favoriteContent: {
    flex: 1
  },
  favoriteText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 8
  },
  favoriteImage: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    alignSelf: "flex-start",
    marginLeft: 12
  },
  removeButtonText: {
    fontSize: 12,
    color: "#7f1d1d",
    fontWeight: "600"
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827"
  },
  modalClose: {
    fontSize: 20,
    color: "#6b7280"
  },
  modalImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 10
  },
  modalText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 21
  }
});

export default FavoritesScreen;