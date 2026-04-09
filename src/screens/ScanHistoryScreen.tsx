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
  SCAN_HISTORY: "@xunwen_scan_history"
};

type ScanHistoryItem = {
  id: string;
  name: string;
  description: string;
  symbolism?: string;
  designTips?: string;
  confidence?: number;
  era: string;
  technique: string;
  image: string;
  capturedImage?: string;
  scannedAt: number;
};

const ScanHistoryScreen: React.FC = () => {
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ScanHistoryItem | null>(null);

  useEffect(() => {
    loadScanHistory();
  }, []);

  const loadScanHistory = async () => {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.SCAN_HISTORY);
      if (history) {
        const historyArray: ScanHistoryItem[] = JSON.parse(history);
        setScanHistory(historyArray);
      }
    } catch (error) {
      console.error("加载扫描历史失败:", error);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      "清除历史",
      "确定要清除所有扫描历史吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "清除",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEYS.SCAN_HISTORY);
              setScanHistory([]);
              Alert.alert("成功", "扫描历史已清除");
            } catch (error) {
              console.error("清除扫描历史失败:", error);
              Alert.alert("错误", "清除扫描历史失败");
            }
          }
        }
      ]
    );
  };

  const handleRemoveItem = (id: string) => {
    Alert.alert(
      "移除记录",
      "确定要移除这个扫描记录吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "移除",
          style: "destructive",
          onPress: async () => {
            try {
              const newHistory = scanHistory.filter(item => item.id !== id);
              setScanHistory(newHistory);
              await AsyncStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(newHistory));
              Alert.alert("成功", "记录已移除");
            } catch (error) {
              console.error("移除记录失败:", error);
              Alert.alert("错误", "移除记录失败");
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

  const renderHistoryItem = ({ item }: { item: ScanHistoryItem }) => (
    <TouchableOpacity style={styles.historyItem} onPress={() => setSelectedItem(item)} activeOpacity={0.9}>
      <Image source={{ uri: item.capturedImage || item.image }} style={styles.historyImage} />
      <View style={styles.historyContent}>
        <Text style={styles.historyTitle}>{item.name}</Text>
        <Text style={styles.historyDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.historyDetails}>
          <Text style={styles.historyDetail}>{item.era}</Text>
          <Text style={styles.historyDetail}>{item.technique}</Text>
          {typeof item.confidence === "number" && (
            <Text style={styles.historyDetail}>置信度 {Math.round(item.confidence * 100)}%</Text>
          )}
        </View>
        {!!item.symbolism && (
          <Text style={styles.historyMeaning} numberOfLines={2}>
            背后意义：{item.symbolism}
          </Text>
        )}
        <Text style={styles.historyTime}>{formatDate(item.scannedAt)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
      >
        <Text style={styles.removeButtonText}>移除</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>扫描历史</Text>
        {scanHistory.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={styles.clearButton}>清除</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={scanHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无扫描记录</Text>
            <Text style={styles.emptySubtext}>使用识遗功能扫描纹样</Text>
          </View>
        }
      />
      <Modal
        visible={!!selectedItem}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>扫描详情</Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedItem && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 480 }}>
                <Image source={{ uri: selectedItem.capturedImage || selectedItem.image }} style={styles.modalImage} />
                <Text style={styles.modalName}>{selectedItem.name}</Text>
                <Text style={styles.modalText}>{selectedItem.description}</Text>
                <Text style={styles.modalMeta}>朝代：{selectedItem.era}  技艺：{selectedItem.technique}</Text>
                {!!selectedItem.symbolism && (
                  <Text style={styles.modalText}>背后意义：{selectedItem.symbolism}</Text>
                )}
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
  historyItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12
  },
  historyContent: {
    flex: 1
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4
  },
  historyDescription: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18,
    marginBottom: 8
  },
  historyDetails: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8
  },
  historyDetail: {
    fontSize: 12,
    color: "#9ca3af",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  historyTime: {
    fontSize: 12,
    color: "#9ca3af"
  },
  historyMeaning: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 6
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
  modalName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6
  },
  modalText: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
    marginBottom: 6
  },
  modalMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6
  }
});

export default ScanHistoryScreen;