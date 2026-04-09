import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { textAI, ChatMessage, imageGeneration } from "../services/index";
import { findPatternKnowledge } from "../data/patternKnowledge";

let NativeSpeechModule: any = null;
try {
  // 在 Expo Go 等不包含原生模块的环境中，这里会失败，后续自动降级
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  NativeSpeechModule = require("expo-speech-recognition").ExpoSpeechRecognitionModule;
} catch {
  NativeSpeechModule = null;
}

type Message = {
  id: string;
  type: "user" | "bot";
  content: string;
  image?: string;
  isFavorite?: boolean;
  timestamp?: number;
  isLoading?: boolean;
  isGeneratingImage?: boolean;
};

type Pattern = {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEYS = {
  CONVERSATIONS: "@xunwen_conversations",
  CURRENT_CONVERSATION: "@xunwen_current_conversation",
  FAVORITES: "@xunwen_favorites",
  CHAT_PENDING_QUESTION: "@xunwen_chat_pending_question"
};

const SAMPLE_PATTERNS: Pattern[] = [
  {
    id: "1",
    name: "云锦团龙纹",
    description: "明清御用织物，寓意皇权与祥瑞",
    image: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=400&q=80",
    category: "龙纹"
  },
  {
    id: "2",
    name: "苏绣荷花鲤鱼",
    description: "寓意连年有余，清雅高洁",
    image: "https://images.unsplash.com/photo-1526404783904-8828f5349228?w=400&q=80",
    category: "花鸟纹"
  },
  {
    id: "3",
    name: "苗族蝴蝶妈妈",
    description: "苗族刺绣核心纹样，象征生命起源",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80",
    category: "动物纹"
  },
  {
    id: "4",
    name: "青花缠枝莲纹",
    description: "明代经典纹样，寓意生生不息",
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80",
    category: "植物纹"
  }
];

const SYSTEM_PROMPT = `你是一个专业的非遗纹样助手"纹心"，专注于中国传统非物质文化遗产纹样的介绍和推荐。

你的职责：
1. 根据用户的需求，推荐合适的非遗纹样
2. 详细介绍纹样的历史背景、寓意和文化内涵
3. 提供纹样的应用场景和设计建议
4. 语言风格亲切专业，富有文化底蕴

回答格式要求：
- 默认回答长度控制在3-5句，优先给结论，再给1-2个关键理由
- 如果用户询问特定纹样，简要介绍其历史、寓意、特点
- 如果用户寻求设计灵感，推荐合适的纹样并说明理由
- 仅当用户明确要求“详细/深入/展开”时再写长回答
- 可以提及相关的非遗技艺（如苏绣、云锦、蜡染等）

请用中文回答，保持专业且易懂的风格。`;

const ChatScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [responseMode, setResponseMode] = useState<"简洁" | "标准" | "详细">("简洁");
  const [isListening, setIsListening] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const shouldGeneratePatternImage = (text: string) => {
    const normalized = text.toLowerCase();
    const keywords = [
      "生成",
      "出图",
      "图片",
      "图案",
      "纹样图",
      "帮我做",
      "设计一版",
      "做一版",
      "做个",
      "画一个",
      "创作"
    ];
    return keywords.some((k) => normalized.includes(k));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" || !NativeSpeechModule) return;
    const resultSub = NativeSpeechModule.addListener("result", (event: any) => {
      const transcript =
        event?.results?.[0]?.transcript ||
        event?.results?.[0] ||
        event?.transcript ||
        "";
      if (transcript) {
        setInputText((prev) => (prev ? `${prev}${transcript}` : transcript));
      }
    });
    const endSub = NativeSpeechModule.addListener("end", () => {
      setIsListening(false);
    });
    const errorSub = NativeSpeechModule.addListener("error", () => {
      setIsListening(false);
      Alert.alert("语音输入", "语音识别失败，请重试。");
    });
    return () => {
      resultSub.remove();
      endSub.remove();
      errorSub.remove();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const consumePendingQuestion = async () => {
        const pending = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_PENDING_QUESTION);
        if (pending) {
          setInputText(pending);
          await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_PENDING_QUESTION);
        }
      };
      consumePendingQuestion();
    }, [])
  );

  const loadData = async () => {
    try {
      const savedConversations = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      const savedCurrentId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION);
      const savedFavorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      
      if (savedConversations) {
        const parsedConversations: Conversation[] = JSON.parse(savedConversations);
        setConversations(parsedConversations);
        
        if (savedCurrentId && parsedConversations.find(c => c.id === savedCurrentId)) {
          setCurrentConversationId(savedCurrentId);
        } else if (parsedConversations.length > 0) {
          setCurrentConversationId(parsedConversations[0].id);
        } else {
          createNewConversation();
        }
      } else {
        createNewConversation();
      }
      
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error("加载数据失败:", error);
      createNewConversation();
    }
  };

  const saveConversations = async (newConversations: Conversation[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(newConversations));
    } catch (error) {
      console.error("保存对话失败:", error);
    }
  };

  const saveCurrentConversationId = async (id: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION, id);
    } catch (error) {
      console.error("保存当前对话ID失败:", error);
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
    } catch (error) {
      console.error("保存收藏失败:", error);
    }
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "新对话",
      messages: [
        {
          id: "1",
          type: "bot",
          content: "你好，我是纹心。想了解哪种非遗纹样，或者需要寻找设计灵感？",
          timestamp: Date.now()
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const newConversations = [newConversation, ...conversations];
    setConversations(newConversations);
    setCurrentConversationId(newConversation.id);
    saveConversations(newConversations);
    saveCurrentConversationId(newConversation.id);
    setShowConversationList(false);
  };

  const switchConversation = (id: string) => {
    setCurrentConversationId(id);
    saveCurrentConversationId(id);
    setShowConversationList(false);
  };

  const deleteConversation = (id: string) => {
    Alert.alert(
      "删除对话",
      "确定要删除这个对话吗？",
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: async () => {
            const newConversations = conversations.filter(c => c.id !== id);
            setConversations(newConversations);
            saveConversations(newConversations);
            
            if (currentConversationId === id) {
              if (newConversations.length > 0) {
                switchConversation(newConversations[0].id);
              } else {
                createNewConversation();
              }
            }
          }
        }
      ]
    );
  };

  const updateConversationMessages = (newMessages: Message[]) => {
    const newConversations = conversations.map(c => 
      c.id === currentConversationId 
        ? { ...c, messages: newMessages, updatedAt: Date.now() }
        : c
    );
    
    const updatedConversation = newConversations.find(c => c.id === currentConversationId);
    if (updatedConversation && updatedConversation.messages.length > 1) {
      const firstUserMessage = updatedConversation.messages.find(m => m.type === "user");
      if (firstUserMessage) {
        const index = newConversations.indexOf(updatedConversation);
        newConversations[index].title = 
          firstUserMessage.content.substring(0, 20) + (firstUserMessage.content.length > 20 ? "..." : "");
      }
    }
    
    setConversations(newConversations);
    saveConversations(newConversations);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputText,
      timestamp: Date.now()
    };

    const newMessages = [...(currentConversation?.messages || []), userMsg];
    updateConversationMessages(newMessages);
    const currentInput = inputText;
    setInputText("");
    setIsLoading(true);
    setIsStopped(false);
    abortRef.current = new AbortController();
    const needGenerateImage = shouldGeneratePatternImage(currentInput);

    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: "",
      isLoading: true,
      timestamp: Date.now()
    };

    updateConversationMessages([...newMessages, loadingMsg]);

    try {
      const isFirstMessage = newMessages.filter(m => m.type === "user").length === 1;
      
      const chatMessages: ChatMessage[] = isFirstMessage 
        ? [
            {
              role: "system",
              content: `${SYSTEM_PROMPT}\n当前回答长度档位：${responseMode}。`
            },
            ...newMessages.filter(m => m.type !== "bot" || !m.isLoading).map(m => {
              const role: "user" | "assistant" = m.type === "user" ? "user" : "assistant";
              return { role, content: m.content };
            }),
            { role: "user", content: currentInput }
          ]
        : [
            {
              role: "system",
              content: `当前回答长度档位：${responseMode}。简洁=2-3句，标准=3-5句，详细=6-10句。`
            },
            ...newMessages.filter(m => m.type !== "bot" || !m.isLoading).map(m => {
              const role: "user" | "assistant" = m.type === "user" ? "user" : "assistant";
              return { role, content: m.content };
            }),
            { role: "user", content: currentInput }
          ];

      const response = await textAI.generateResponse(chatMessages, { signal: abortRef.current.signal });
      const matchedKnowledge = findPatternKnowledge(`${currentInput}\n${response}`);
      const enrichedResponse = matchedKnowledge
        ? `${response}\n\n【背后意义】${matchedKnowledge.symbolism}\n【文化脉络】${matchedKnowledge.story}\n【当代应用建议】${matchedKnowledge.designTips}`
        : response;
      const finalResponse = needGenerateImage ? enrichedResponse : response;
      
      const botMsg: Message = {
        id: loadingMsg.id,
        type: "bot",
        content: finalResponse,
        isLoading: false,
        isGeneratingImage: needGenerateImage,
        timestamp: Date.now()
      };

      const updatedMessages = [...newMessages, botMsg];
      updateConversationMessages(updatedMessages);

      if (needGenerateImage) {
        try {
          const optimizedPrompt = imageGeneration.optimizePrompt(enrichedResponse);
          const generatedImage = await imageGeneration.generatePattern(optimizedPrompt);
          
          if (generatedImage) {
            const finalMsg: Message = {
              ...botMsg,
              image: generatedImage,
              isGeneratingImage: false
            };

            const finalMessages = [...newMessages, finalMsg];
            updateConversationMessages(finalMessages);
          } else {
            const fallbackMsg: Message = {
              ...botMsg,
              image: matchedKnowledge?.image || findMatchingPattern(enrichedResponse)?.image,
              isGeneratingImage: false
            };

            const fallbackMessages = [...newMessages, fallbackMsg];
            updateConversationMessages(fallbackMessages);
          }
        } catch (imageError) {
          console.error("图片生成失败，使用备用图片:", imageError);
          const fallbackMsg: Message = {
            ...botMsg,
            image: matchedKnowledge?.image || findMatchingPattern(enrichedResponse)?.image,
            isGeneratingImage: false
          };

          const fallbackMessages = [...newMessages, fallbackMsg];
          updateConversationMessages(fallbackMessages);
        }
      }
    } catch (error) {
      console.error("AI调用失败:", error);
      if ((error as Error)?.name === "AbortError") {
        const stoppedMsg: Message = {
          id: loadingMsg.id,
          type: "bot",
          content: "已停止本次回答。",
          isLoading: false,
          timestamp: Date.now()
        };
        updateConversationMessages([...newMessages, stoppedMsg]);
        return;
      }
      const fallbackKnowledge = findPatternKnowledge(currentInput);
      const errorMsg: Message = {
        id: loadingMsg.id,
        type: "bot",
        content: fallbackKnowledge
          ? `我暂时无法连接在线模型，先给你一个本地知识解读：\n\n【推荐纹样】${fallbackKnowledge.name}\n【背后意义】${fallbackKnowledge.symbolism}\n【文化脉络】${fallbackKnowledge.story}\n【当代应用建议】${fallbackKnowledge.designTips}`
          : "抱歉，我暂时无法回答你的问题。请检查网络连接或稍后再试。",
        image: fallbackKnowledge?.image,
        isLoading: false,
        timestamp: Date.now()
      };

      const updatedMessages = [...newMessages, errorMsg];
      updateConversationMessages(updatedMessages);
      
      Alert.alert("提示", "AI服务暂时不可用，请检查网络或API配置");
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const findMatchingPattern = (text: string): Pattern | undefined => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("龙") || lowerText.includes("吉祥")) {
      return SAMPLE_PATTERNS[0];
    } else if (lowerText.includes("荷花") || lowerText.includes("鲤鱼") || lowerText.includes("植物")) {
      return SAMPLE_PATTERNS[1];
    } else if (lowerText.includes("蝴蝶") || lowerText.includes("苗族") || lowerText.includes("动物")) {
      return SAMPLE_PATTERNS[2];
    } else if (lowerText.includes("青花") || lowerText.includes("莲")) {
      return SAMPLE_PATTERNS[3];
    }
    return SAMPLE_PATTERNS[Math.floor(Math.random() * SAMPLE_PATTERNS.length)];
  };

  const toggleFavorite = (messageId: string) => {
    const newFavorites = favorites.includes(messageId)
      ? favorites.filter(id => id !== messageId)
      : [...favorites, messageId];
    
    setFavorites(newFavorites);
    saveFavorites(newFavorites);

    const updatedConversations = conversations.map(conv => ({
      ...conv,
      messages: conv.messages.map(msg => 
        msg.id === messageId ? { ...msg, isFavorite: !favorites.includes(messageId) } : msg
      )
    }));
    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    if (!favorites.includes(messageId)) {
      Alert.alert("收藏成功", "已添加到收藏夹");
    }
  };

  const handleQuickAsk = (text: string) => {
    setInputText(text);
  };

  const handleFollowUp = (kind: "history" | "meaning" | "design", source: string) => {
    const promptMap = {
      history: "讲讲历史",
      meaning: "解释寓意",
      design: "设计建议"
    };
    setInputText(promptMap[kind]);
  };

  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      setIsStopped(true);
    }
  };

  const cycleResponseMode = () => {
    setResponseMode((prev) => (prev === "简洁" ? "标准" : prev === "标准" ? "详细" : "简洁"));
  };

  const handleVoiceInput = () => {
    if (Platform.OS !== "web") {
      if (!NativeSpeechModule) {
        Alert.alert("语音输入", "当前运行环境不支持原生语音识别，请使用系统键盘语音输入。");
        return;
      }
      if (isListening) {
        NativeSpeechModule.stop();
        setIsListening(false);
        return;
      }
      NativeSpeechModule.requestPermissionsAsync().then((result: any) => {
        if (!result?.granted) {
          Alert.alert("语音输入", "请先授予麦克风/语音识别权限。");
          return;
        }
        setIsListening(true);
        NativeSpeechModule.start({
          lang: "zh-CN",
          interimResults: false,
          continuous: false
        });
      });
      return;
    }

    const Win = window as any;
    const SpeechRecognition = Win.SpeechRecognition || Win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Alert.alert("语音输入", "当前浏览器不支持语音识别。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      setInputText((prev) => (prev ? `${prev}${transcript}` : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      Alert.alert("语音输入", "识别失败，请重试。");
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.bubbleWrapper,
        item.type === "user" ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft
      ]}
    >
      <View
        style={[
          styles.bubble,
          item.type === "user" ? styles.bubbleUser : styles.bubbleBot
        ]}
      >
        {item.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#7f1d1d" />
            <Text style={styles.loadingText}>纹心正在思考...</Text>
          </View>
        ) : (
          <>
            <Text style={item.type === "user" ? styles.textUser : styles.textBot}>
              {item.content}
            </Text>
            {item.isGeneratingImage ? (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="small" color="#7f1d1d" />
                <Text style={styles.imageLoadingText}>正在生成纹样图片...</Text>
              </View>
            ) : item.image ? (
              <Image source={{ uri: item.image }} style={styles.patternImage} />
            ) : null}
            {item.type === "bot" && !item.isGeneratingImage && (
              <>
                <View style={styles.followUpRow}>
                  <TouchableOpacity style={styles.followUpChip} onPress={() => handleFollowUp("history", item.content)}>
                    <Text style={styles.followUpText}>讲讲历史</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.followUpChip} onPress={() => handleFollowUp("meaning", item.content)}>
                    <Text style={styles.followUpText}>解释寓意</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.followUpChip} onPress={() => handleFollowUp("design", item.content)}>
                    <Text style={styles.followUpText}>设计建议</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Text style={[styles.favoriteText, favorites.includes(item.id) && styles.favoriteTextActive]}>
                    {favorites.includes(item.id) ? "❤️ 已收藏" : "🤍 收藏"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>
    </View>
  );

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        item.id === currentConversationId && styles.conversationItemActive
      ]}
      onPress={() => switchConversation(item.id)}
    >
      <View style={styles.conversationItemContent}>
        <Text style={styles.conversationItemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.conversationItemTime}>
          {new Date(item.updatedAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteConversation(item.id)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={() => setShowConversationList(true)}
        >
          <Text style={styles.newChatButtonText}>💬</Text>
        </TouchableOpacity>
        <View style={styles.headerMark} />
        <Text style={styles.headerTitle}>寻纹</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={cycleResponseMode} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>🧭 {responseMode}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowHistory(true)} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>📜 历史</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowFavorites(true)} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>⭐ 收藏</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={currentConversation?.messages || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={renderMessage}
      />

      {currentConversation && currentConversation.messages.length <= 1 && (
        <View style={styles.quickArea}>
          {["🐉 找一个寓意吉祥的龙纹", "🌿 适合做丝巾的植物纹样", "🦋 苗族传统纹样"].map((text, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickChip}
              onPress={() => handleQuickAsk(text)}
            >
              <Text style={styles.quickText}>{text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.inputArea}>
        <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceInput} disabled={isListening || isLoading}>
          <Text style={styles.voiceButtonText}>{isListening ? "🎙️" : "🎤"}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入你的问题..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.sendButtonText}>发送</Text>
          )}
        </TouchableOpacity>
        {isLoading && !isStopped && (
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <Text style={styles.stopButtonText}>停止</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showConversationList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConversationList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>对话列表</Text>
              <TouchableOpacity onPress={() => setShowConversationList(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.newConversationButton} onPress={createNewConversation}>
              <Text style={styles.newConversationButtonText}>+ 新建对话</Text>
            </TouchableOpacity>
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              renderItem={renderConversationItem}
              ListEmptyComponent={
                <Text style={styles.emptyText}>暂无对话</Text>
              }
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showHistory}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>历史记录</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={currentConversation?.messages.filter(m => m.type === "bot" && !m.isLoading) || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.historyItem}
                  onPress={() => {
                    setInputText(item.content);
                    setShowHistory(false);
                  }}
                >
                  <Text style={styles.historyText} numberOfLines={2}>
                    {item.content}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>暂无历史记录</Text>
              }
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showFavorites}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFavorites(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>我的收藏</Text>
              <TouchableOpacity onPress={() => setShowFavorites(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={conversations.flatMap(c => c.messages).filter(m => favorites.includes(m.id))}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.favoriteItem}>
                  <Text style={styles.favoriteItemText} numberOfLines={3}>
                    {item.content}
                  </Text>
                  {item.image && <Image source={{ uri: item.image }} style={styles.favoriteItemImage} />}
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>暂无收藏</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
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
    backgroundColor: "rgba(255,255,255,0.9)",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb"
  },
  newChatButton: {
    marginRight: 8
  },
  newChatButtonText: {
    fontSize: 20
  },
  headerMark: {
    width: 8,
    height: 20,
    backgroundColor: "#7f1d1d",
    borderRadius: 3,
    marginRight: 8
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    flex: 1
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8
  },
  headerButton: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  headerButtonText: {
    fontSize: 12,
    color: "#7f1d1d"
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 200
  },
  bubbleWrapper: {
    marginBottom: 10,
    flexDirection: "row"
  },
  bubbleWrapperRight: {
    justifyContent: "flex-end"
  },
  bubbleWrapperLeft: {
    justifyContent: "flex-start"
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  bubbleUser: {
    backgroundColor: "#1f2937",
    borderBottomRightRadius: 2
  },
  bubbleBot: {
    backgroundColor: "#ffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    borderTopLeftRadius: 2
  },
  textUser: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 20
  },
  textBot: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 20
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  loadingText: {
    fontSize: 14,
    color: "#7f1d1d"
  },
  imageLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 12
  },
  imageLoadingText: {
    fontSize: 12,
    color: "#7f1d1d"
  },
  patternImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginTop: 8
  },
  favoriteButton: {
    marginTop: 8,
    alignSelf: "flex-start"
  },
  favoriteText: {
    fontSize: 12,
    color: "#9ca3af"
  },
  favoriteTextActive: {
    color: "#7f1d1d"
  },
  followUpRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    flexWrap: "wrap"
  },
  followUpChip: {
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  followUpText: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "500"
  },
  quickArea: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "transparent"
  },
  quickChip: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 6
  },
  quickText: {
    fontSize: 12,
    color: "#4b5563"
  },
  inputArea: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    color: "#111827"
  },
  voiceButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2
  },
  voiceButtonText: {
    fontSize: 16
  },
  sendButton: {
    backgroundColor: "#7f1d1d",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 60
  },
  sendButtonDisabled: {
    backgroundColor: "#d1d5db"
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center"
  },
  stopButton: {
    backgroundColor: "#111827",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  stopButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827"
  },
  modalClose: {
    fontSize: 24,
    color: "#9ca3af"
  },
  newConversationButton: {
    margin: 16,
    padding: 14,
    backgroundColor: "#7f1d1d",
    borderRadius: 12,
    alignItems: "center"
  },
  newConversationButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600"
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  conversationItemActive: {
    backgroundColor: "#fef2f2"
  },
  conversationItemContent: {
    flex: 1
  },
  conversationItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4
  },
  conversationItemTime: {
    fontSize: 12,
    color: "#9ca3af"
  },
  deleteButton: {
    padding: 8
  },
  deleteButtonText: {
    fontSize: 16
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  historyText: {
    fontSize: 14,
    color: "#4b5563"
  },
  favoriteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  favoriteItemText: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8
  },
  favoriteItemImage: {
    width: 100,
    height: 100,
    borderRadius: 8
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    padding: 40,
    fontSize: 14
  }
});

export default ChatScreen;
