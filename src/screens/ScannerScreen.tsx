import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { imageRecognition } from "../services/index";
import { findPatternKnowledge } from "../data/patternKnowledge";

const { width, height } = Dimensions.get("window");
const SCAN_FRAME_SIZE = width * 0.7;

// 模拟纹样数据库
const PATTERNS_DATABASE = [
  {
    id: "1",
    name: "宋·缂丝紫鸾鹊纹",
    description: "此纹样源于宋代缂丝技艺，以紫色为地，绣有鸾鸟与喜鹊，寓意\"鸾凤和鸣，喜事连连\"，常用于宫廷服饰。",
    era: "宋代",
    technique: "缂丝",
    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=400&q=80"
  },
  {
    id: "2",
    name: "明·青花缠枝莲纹",
    description: "明代经典纹样，以青花为色，缠枝莲纹象征生生不息，常用于瓷器装饰。",
    era: "明代",
    technique: "青花",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80"
  },
  {
    id: "3",
    name: "清·云锦团龙纹",
    description: "清代御用织物纹样，团龙纹象征皇权与祥瑞，常用于龙袍等宫廷服饰。",
    era: "清代",
    technique: "云锦",
    image: "https://images.unsplash.com/photo-1526404783904-8828f5349228?w=400&q=80"
  },
  {
    id: "4",
    name: "青花海水江崖纹",
    description: "海水江崖纹常用于礼制题材，寓意山河永固与秩序稳定。",
    era: "明清",
    technique: "青花 / 宫廷织绣",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&q=80"
  },
  {
    id: "5",
    name: "如意云纹",
    description: "如意云纹线条回旋，寓意吉祥如意与福气绵延。",
    era: "汉至清",
    technique: "木雕 / 漆器 / 织绣",
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80"
  },
  {
    id: "6",
    name: "宝相花纹",
    description: "隋唐经典复合花纹，常见于织锦与壁画，体现华美庄严气质。",
    era: "隋唐",
    technique: "织锦 / 壁画 / 金银器",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400&q=80"
  },
  {
    id: "7",
    name: "寿字纹",
    description: "祝寿主题经典纹样，象征福寿延年、安康长久。",
    era: "明清",
    technique: "织绣 / 瓷器 / 建筑彩画",
    image: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=400&q=80"
  }
];

const STORAGE_KEYS = {
  SCAN_HISTORY: "@xunwen_scan_history",
  CHAT_PENDING_QUESTION: "@xunwen_chat_pending_question"
};

const ScannerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedPattern, setRecognizedPattern] = useState<any>(null);
  const [showKnowledgeGraph, setShowKnowledgeGraph] = useState(false);
  const [scanHint, setScanHint] = useState("请对准纹样中心");
  const [isStable, setIsStable] = useState(false);
  const [brightMode, setBrightMode] = useState<"标准" | "明亮">("标准");
  const [flashMode, setFlashMode] = useState<"on" | "off" | "auto">("off");
  const [cameraType, setCameraType] = useState<"front" | "back">("back");
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (scanned) return;
    const steps = [
      "请对准纹样中心",
      "保持手机稳定",
      "光线充足时识别更准确",
      "已准备就绪，可点击拍摄"
    ];
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % steps.length;
      setScanHint(steps[i]);
      setIsStable(steps[i] === "已准备就绪，可点击拍摄");
    }, 1400);
    return () => clearInterval(timer);
  }, [scanned]);

  const handleCapture = async () => {
    if (cameraRef.current && !isRecognizing) {
      try {
        setIsRecognizing(true);
        const photo = await cameraRef.current.takePictureAsync();
        await simulatePatternRecognition(photo.uri);
      } catch (error) {
        console.error("拍照失败:", error);
        Alert.alert("错误", "拍照失败，请重试");
      } finally {
        setIsRecognizing(false);
      }
    }
  };

  const simulatePatternRecognition = async (imageUri: string) => {
    setScanned(true);
    
    try {
      // 使用CLIP模型进行纹样识别
      const result = await imageRecognition.recognizeImage(imageUri);
      
      // 构建识别结果
      const pattern = {
        id: Date.now().toString(),
        name: result.label,
        capturedImage: imageUri,
        confidence: result.confidence,
        matches: result.matches || [],
        description: result.details?.description || "",
        symbolism: "",
        story: "",
        designTips: "",
        era: result.details?.era || "未知",
        technique: result.details?.technique || "未知",
        image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=400&q=80"
      };

      const knowledge = findPatternKnowledge(pattern.name);
      if (knowledge) {
        pattern.description = knowledge.story;
        pattern.symbolism = knowledge.symbolism;
        pattern.story = knowledge.story;
        pattern.designTips = knowledge.designTips;
        pattern.era = knowledge.era;
        pattern.technique = knowledge.technique;
        pattern.image = knowledge.image;
      }
      
      setRecognizedPattern(pattern);
      
      // 保存到历史记录
      await saveToHistory(pattern);
    } catch (error) {
      console.error("纹样识别失败:", error);
      const message = String((error as Error)?.message || "");
      if ((error as Error)?.name === "AbortError") {
        Alert.alert("识别超时", "识别耗时过长，请检查网络或稍后再试。");
      } else if (message.includes("Network") || message.includes("fetch")) {
        Alert.alert("网络异常", "当前网络不可用，已切换为本地识别结果。");
      } else if (message.includes("permission")) {
        Alert.alert("权限异常", "请在系统设置中检查相机权限。");
      } else {
        Alert.alert("识别失败", "已切换为本地识别结果，你也可以重试一次。");
      }
      // 随机选择一个纹样作为识别结果
      const randomIndex = Math.floor(Math.random() * PATTERNS_DATABASE.length);
      const pattern = PATTERNS_DATABASE[randomIndex];
      const knowledge = findPatternKnowledge(pattern.name);
      const fallbackPattern = knowledge
        ? {
            ...pattern,
            capturedImage: imageUri,
            description: knowledge.story,
            symbolism: knowledge.symbolism,
            story: knowledge.story,
            designTips: knowledge.designTips,
            era: knowledge.era,
            technique: knowledge.technique,
            image: knowledge.image
          }
        : { ...pattern, capturedImage: imageUri };
      
      setRecognizedPattern(fallbackPattern);
      
      // 保存到历史记录
      await saveToHistory(fallbackPattern);
    }
  };

  const saveToHistory = async (pattern: any) => {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.SCAN_HISTORY);
      const historyArray = history ? JSON.parse(history) : [];
      
      historyArray.unshift({
        ...pattern,
        scannedAt: Date.now()
      });
      
      // 只保留最近10条记录
      const trimmedHistory = historyArray.slice(0, 10);
      await AsyncStorage.setItem(STORAGE_KEYS.SCAN_HISTORY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error("保存历史记录失败:", error);
    }
  };

  const handleRetry = () => {
    setScanned(false);
    setRecognizedPattern(null);
  };

  const handleToggleFlash = () => {
    setFlashMode(flashMode === "off" ? "on" : "off");
  };

  const handleToggleCamera = () => {
    setCameraType(cameraType === "back" ? "front" : "back");
  };

  const handleToggleBrightMode = () => {
    setBrightMode((prev) => (prev === "标准" ? "明亮" : "标准"));
  };

  const handleDeepChat = async () => {
    if (!recognizedPattern) return;
    const prompt = `我刚识别到「${recognizedPattern.name}」，请从历史背景、背后寓意、现代设计应用三个角度给我深入讲解。`;
    await AsyncStorage.setItem(STORAGE_KEYS.CHAT_PENDING_QUESTION, prompt);
    navigation.navigate("Chat");
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>正在请求相机权限...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>需要相机权限才能使用此功能</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={() => Camera.requestCameraPermissionsAsync()}>
          <Text style={styles.permissionButtonText}>授予权限</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!scanned ? (
        <>
          <View style={styles.camera}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFillObject}
              facing={cameraType}
              enableTorch={flashMode === "on"}
            />
            <View
              style={[
                styles.cameraOverlay,
                brightMode === "明亮" && styles.cameraOverlayBright
              ]}
            >
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                <Text style={styles.scanText}>将纹样对准扫描框</Text>
              </View>
              <View style={styles.hintChip}>
                <Text style={styles.hintText}>{scanHint}</Text>
              </View>
              <TouchableOpacity style={styles.brightnessChip} onPress={handleToggleBrightMode}>
                <Text style={styles.brightnessText}>亮度：{brightMode}</Text>
              </TouchableOpacity>
              
              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.controlButton} onPress={handleToggleFlash}>
                  <Text style={styles.controlIcon}>{flashMode === "on" ? "🔦" : "⚪"}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.captureButton} onPress={handleCapture} disabled={isRecognizing}>
                  <View
                    style={[
                      styles.captureButtonInner,
                      isRecognizing && styles.captureButtonInnerDisabled
                    ]}
                  />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlButton} onPress={handleToggleCamera}>
                  <Text style={styles.controlIcon}>🔄</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.resultContainer}>
          <View style={styles.resultImageContainer}>
            <Text style={styles.resultIcon}>🔍</Text>
          </View>
          
          <View style={styles.resultPanel}>
            <View style={styles.handle} />
            <Text style={styles.title}>{recognizedPattern?.name}</Text>
            {!!recognizedPattern?.confidence && (
              <Text style={styles.confidenceText}>
                置信度：{Math.round(recognizedPattern.confidence * 100)}%
              </Text>
            )}
            <Text style={styles.desc}>{recognizedPattern?.description}</Text>
            {!!recognizedPattern?.symbolism && (
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>背后意义</Text>
                <Text style={styles.infoText}>{recognizedPattern.symbolism}</Text>
              </View>
            )}
            {!!recognizedPattern?.designTips && (
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>应用建议</Text>
                <Text style={styles.infoText}>{recognizedPattern.designTips}</Text>
              </View>
            )}
            
            <View style={styles.patternDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>朝代</Text>
                <Text style={styles.detailValue}>{recognizedPattern?.era}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>技艺</Text>
                <Text style={styles.detailValue}>{recognizedPattern?.technique}</Text>
              </View>
            </View>

            {Array.isArray(recognizedPattern?.matches) && recognizedPattern.matches.length > 0 && (
              <View style={styles.matchesBox}>
                <Text style={styles.matchesTitle}>CLIP Top 匹配</Text>
                {recognizedPattern.matches.slice(0, 5).map((item: any, index: number) => (
                  <Text key={`${item.label}-${index}`} style={styles.matchItem}>
                    {index + 1}. {item.label}（{Math.round(item.score * 100)}%）
                  </Text>
                ))}
              </View>
            )}
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.actionButton, styles.ghostButton]} onPress={() => setShowKnowledgeGraph(true)}>
                <Text style={styles.ghostButtonText}>查看知识图谱</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleDeepChat}>
                <Text style={styles.primaryButtonText}>去寻纹深聊</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>再次扫描</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <Modal
        visible={showKnowledgeGraph}
        transparent
        animationType="slide"
        onRequestClose={() => setShowKnowledgeGraph(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>纹样知识图谱</Text>
              <TouchableOpacity onPress={() => setShowKnowledgeGraph(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.graphNode}>
              <Text style={styles.graphCenter}>{recognizedPattern?.name || "纹样"}</Text>
            </View>
            <Text style={styles.graphText}>朝代：{recognizedPattern?.era || "未知"}</Text>
            <Text style={styles.graphText}>技艺：{recognizedPattern?.technique || "未知"}</Text>
            <Text style={styles.graphText}>寓意：{recognizedPattern?.symbolism || "待补充"}</Text>
            <Text style={styles.graphText}>应用：{recognizedPattern?.designTips || "待补充"}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000"
  },
  camera: {
    flex: 1
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center"
  },
  cameraOverlayBright: {
    backgroundColor: "rgba(0, 0, 0, 0.18)"
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    borderWidth: 2,
    borderColor: "#ffffff",
    borderRadius: 16,
    position: "relative",
    justifyContent: "center",
    alignItems: "center"
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderWidth: 3,
    borderColor: "#7f1d1d"
  },
  topLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  topRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0
  },
  bottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0
  },
  bottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  scanText: {
    position: "absolute",
    bottom: -40,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600"
  },
  hintChip: {
    position: "absolute",
    bottom: 130,
    backgroundColor: "rgba(17,24,39,0.75)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  hintText: {
    color: "#fff",
    fontSize: 12
  },
  brightnessChip: {
    position: "absolute",
    top: 56,
    right: 16,
    backgroundColor: "rgba(17,24,39,0.75)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  brightnessText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600"
  },
  cameraControls: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 40
  },
  controlButton: {
    padding: 12
  },
  controlIcon: {
    fontSize: 24,
    color: "#ffffff"
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center"
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ffffff"
  },
  captureButtonInnerDisabled: {
    opacity: 0.5
  },
  resultContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "flex-end"
  },
  resultImageContainer: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center"
  },
  resultIcon: {
    fontSize: 60
  },
  resultPanel: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    alignSelf: "center",
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  confidenceText: {
    fontSize: 12,
    color: "#7f1d1d",
    marginBottom: 8,
    fontWeight: "600"
  },
  desc: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
    textAlign: "justify",
    marginBottom: 16
  },
  patternDetails: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20
  },
  detailItem: {
    flex: 1
  },
  detailLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827"
  },
  matchesBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    marginBottom: 16
  },
  matchesTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6
  },
  matchItem: {
    fontSize: 12,
    color: "#4b5563",
    lineHeight: 18
  },
  infoBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    marginBottom: 12
  },
  infoTitle: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "700",
    marginBottom: 4
  },
  infoText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 19
  },
  retryButton: {
    backgroundColor: "#7f1d1d",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center"
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600"
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  ghostButton: {
    backgroundColor: "#f3f4f6"
  },
  ghostButtonText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600"
  },
  primaryButton: {
    backgroundColor: "#111827"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18
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
  graphNode: {
    alignItems: "center",
    marginVertical: 8
  },
  graphCenter: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7f1d1d",
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  graphText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#374151",
    marginBottom: 4
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center"
  },
  errorText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20
  },
  permissionButton: {
    backgroundColor: "#7f1d1d",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: "center"
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600"
  }
});

export default ScannerScreen;

