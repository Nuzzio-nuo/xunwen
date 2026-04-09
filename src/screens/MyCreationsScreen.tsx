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
  CREATIONS: "@xunwen_creations"
};

type CreationItem = {
  id: string;
  image: string;
  description: string;
  style: string;
  carrier: string;
  createdAt: number;
};

const MyCreationsScreen: React.FC = () => {
  const [creations, setCreations] = useState<CreationItem[]>([]);
  const [selectedCreation, setSelectedCreation] = useState<CreationItem | null>(null);

  useEffect(() => {
    loadCreations();
  }, []);

  const loadCreations = async () => {
    try {
      const savedCreations = await AsyncStorage.getItem(STORAGE_KEYS.CREATIONS);
      if (savedCreations) {
        const parsedCreations: CreationItem[] = JSON.parse(savedCreations);
        setCreations(parsedCreations);
      }
    } catch (error) {
      console.error("加载创作失败:", error);
    }
  };

  const handleClearCreations = () => {
    Alert.alert(
      "清除创作",
      "确定要清除所有创作吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "清除",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEYS.CREATIONS);
              setCreations([]);
              Alert.alert("成功", "创作已清除");
            } catch (error) {
              console.error("清除创作失败:", error);
              Alert.alert("错误", "清除创作失败");
            }
          }
        }
      ]
    );
  };

  const handleRemoveCreation = (id: string) => {
    Alert.alert(
      "移除创作",
      "确定要移除这个创作吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "移除",
          style: "destructive",
          onPress: async () => {
            try {
              const newCreations = creations.filter(item => item.id !== id);
              setCreations(newCreations);
              await AsyncStorage.setItem(STORAGE_KEYS.CREATIONS, JSON.stringify(newCreations));
              Alert.alert("成功", "创作已移除");
            } catch (error) {
              console.error("移除创作失败:", error);
              Alert.alert("错误", "移除创作失败");
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderCreationItem = ({ item }: { item: CreationItem }) => (
    <TouchableOpacity style={styles.creationItem} onPress={() => setSelectedCreation(item)} activeOpacity={0.9}>
      <Image source={{ uri: item.image }} style={styles.creationImage} />
      <View style={styles.creationContent}>
        <Text style={styles.creationDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.creationDetails}>
          <Text style={styles.creationDetail}>{item.style}</Text>
          <Text style={styles.creationDetail}>{item.carrier}</Text>
        </View>
        <Text style={styles.creationTime}>{formatDate(item.createdAt)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveCreation(item.id)}
      >
        <Text style={styles.removeButtonText}>移除</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的创作</Text>
        {creations.length > 0 && (
          <TouchableOpacity onPress={handleClearCreations}>
            <Text style={styles.clearButton}>清除</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={creations}
        keyExtractor={(item) => item.id}
        renderItem={renderCreationItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无创作</Text>
            <Text style={styles.emptySubtext}>使用工坊功能生成纹样</Text>
          </View>
        }
      />
      <Modal
        visible={!!selectedCreation}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCreation(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>创作详情</Text>
              <TouchableOpacity onPress={() => setSelectedCreation(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedCreation && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
                <Image source={{ uri: selectedCreation.image }} style={styles.modalImage} />
                <Text style={styles.modalText}>{selectedCreation.description}</Text>
                <Text style={styles.modalMeta}>技法：{selectedCreation.style}  载体：{selectedCreation.carrier}</Text>
              </ScrollView>
            )}
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
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937"
  },
  clearButton: {
    fontSize: 14,
    color: "#7f1d1d",
    fontWeight: "600"
  },
  listContent: {
    padding: 20,
    paddingBottom: 100
  },
  creationItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  creationImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12
  },
  creationContent: {
    flex: 1
  },
  creationDescription: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 8
  },
  creationDetails: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8
  },
  creationDetail: {
    fontSize: 12,
    color: "#9ca3af",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  creationTime: {
    fontSize: 12,
    color: "#9ca3af"
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
    height: 240,
    borderRadius: 12,
    marginBottom: 10
  },
  modalText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8
  },
  modalMeta: {
    fontSize: 12,
    color: "#6b7280"
  }
});

export default MyCreationsScreen;