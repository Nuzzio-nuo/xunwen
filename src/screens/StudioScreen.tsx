import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Share,
  Switch
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { imageGeneration } from "../services/index";

const STYLES = ["苏绣", "蜡染", "剪纸", "云锦", "皮影", "青花"];
const CARRIERS = ["平面图", "丝巾", "手机壳", "手帕", "礼盒", "明信片"];
const STYLE_PATTERN_MAP: Record<string, { motif: string; palette: string }> = {
  苏绣: {
    motif: "花鸟写意、丝线层次、细密渐变",
    palette: "粉青、米白、藕荷"
  },
  蜡染: {
    motif: "几何回纹、留白裂纹、手工防染",
    palette: "靛蓝、月白、深墨"
  },
  剪纸: {
    motif: "对称镂空、吉祥纹、边框连续纹",
    palette: "朱红、米白、赭石"
  },
  云锦: {
    motif: "团花团龙、金线质感、层层叠织",
    palette: "赤金、绛红、玄青"
  },
  皮影: {
    motif: "镂空轮廓、戏曲人物、高对比边缘",
    palette: "赭红、墨黑、暖黄"
  },
  青花: {
    motif: "缠枝莲、回纹边、青料晕染",
    palette: "钴蓝、釉白、灰蓝"
  }
};

const CARRIER_RENDER_GUIDE: Record<string, string> = {
  平面图: "输出为平面纹样设计稿，正视角，干净背景，无实物产品。",
  丝巾: "输出为丝巾实物展示图，方巾材质和垂坠感明显，纹样印在丝巾上。",
  手机壳: "输出为手机壳产品图，镜头开孔清晰，纹样完整印在壳体表面。",
  手帕: "输出为手帕实物图，布料质感和折边可见，纹样位于手帕主体区域。",
  礼盒: "输出为礼盒产品图，盒体结构清晰，纹样应用在盒盖主视觉。",
  明信片: "输出为明信片成品图，卡纸边缘与版式可见，纹样位于明信片画面。"
};
const CARRIER_SCENE_GUIDE: Record<string, string> = {
  平面图: "仅展示纹样设计稿本身，不出现其他产品外形。",
  丝巾: "展示完整丝巾成品，可见丝巾轮廓、折叠或悬垂状态。",
  手机壳: "展示手机壳成品样机，壳体轮廓和镜头孔位清晰，纹样覆盖壳体。",
  手帕: "展示手帕成品，四角与布料肌理清晰，纹样位于手帕主体。",
  礼盒: "展示礼盒成品，盒盖、盒身结构明确，纹样用于包装主视觉。",
  明信片: "展示明信片成品，卡片边缘和版式清晰，纹样作为卡面图案。"
};

const StudioScreen: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState("剪纸");
  const [selectedCarrier, setSelectedCarrier] = useState(0);
  const [description, setDescription] = useState("");
  const [colorTone, setColorTone] = useState<"原色" | "雅致" | "浓烈">("原色");
  const [complexity, setComplexity] = useState<"简约" | "均衡" | "繁复">("均衡");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPattern, setGeneratedPattern] = useState<string | null>(null);
  const [patternDescription, setPatternDescription] = useState("");
  const [version, setVersion] = useState(1);
  const [enableAIRefine, setEnableAIRefine] = useState(true);

  const getCarrierStyle = () => {
    const carrier = CARRIERS[selectedCarrier];
    if (carrier === "手帕") return { borderRadius: 999, borderWidth: 2, borderColor: "#d1d5db" };
    if (carrier === "礼盒") return { borderRadius: 10, borderWidth: 6, borderColor: "#7f1d1d" };
    if (carrier === "明信片") return { borderRadius: 6, borderWidth: 2, borderColor: "#9ca3af" };
    return { borderRadius: 24, borderWidth: 0, borderColor: "transparent" };
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      Alert.alert("提示", "请输入纹样描述");
      return;
    }

    setIsGenerating(true);

    try {
      const stylePreset = STYLE_PATTERN_MAP[selectedStyle];
      const carrier = CARRIERS[selectedCarrier];
      const carrierGuide = CARRIER_RENDER_GUIDE[carrier];
      const sceneGuide = CARRIER_SCENE_GUIDE[carrier];
      const quickDescription = `第${version}版：已生成「${selectedStyle}」技法的「${carrier}」应用图。核心元素：${stylePreset.motif}；推荐配色：${stylePreset.palette}；色调：${colorTone}；纹样复杂度：${complexity}；主题表达：${description}。`;
      setPatternDescription(quickDescription);
      const basePrompt = `中国非遗纹样应用设计。技法:${selectedStyle}。载体:${carrier}。主题:${description}。核心元素:${stylePreset.motif}。配色:${stylePreset.palette}。色调:${colorTone}。复杂度:${complexity}。输出要求:${carrierGuide}。场景约束:${sceneGuide}。硬性要求:最终图必须是${carrier}对应样品图，并将非遗纹样真实应用在该载体表面。禁止输出其他载体，禁止只给平面纹样，禁止文字水印。`;
      const refinedPrompt = enableAIRefine
        ? `${basePrompt} 画面高细节，高质量，真实材质，产品边缘清晰，避免卡通感。`
        : basePrompt;
      const optimizedPrompt = imageGeneration.optimizePrompt(refinedPrompt);
      const imageUrl = await imageGeneration.generatePattern(optimizedPrompt);
      if (!imageUrl) {
        throw new Error("AI未返回可用图片");
      }
      setGeneratedPattern(imageUrl);
      if (enableAIRefine) {
        setPatternDescription(`${quickDescription}\n已启用 AI 精绘增强。`);
      }
      setVersion((v) => v + 1);
    } catch (error) {
      console.error("生成纹样失败:", error);
      Alert.alert("错误", "AI 生成失败，请检查网络后重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (!description.trim()) {
      Alert.alert("提示", "请先输入描述再进行再生成");
      return;
    }
    handleGenerate();
  };

  const handleSave = async () => {
    if (!generatedPattern) return;
    
    try {
      const creation = {
        id: Date.now().toString(),
        image: generatedPattern,
        description: patternDescription,
        style: selectedStyle,
        carrier: CARRIERS[selectedCarrier],
        createdAt: Date.now()
      };
      
      // 获取现有创作
      const savedCreations = await AsyncStorage.getItem("@xunwen_creations");
      const creations = savedCreations ? JSON.parse(savedCreations) : [];
      
      // 添加新创作
      creations.unshift(creation);
      
      // 保存回存储
      await AsyncStorage.setItem("@xunwen_creations", JSON.stringify(creations));
      
      Alert.alert("保存成功", "纹样已保存到我的创作");
    } catch (error) {
      console.error("保存失败:", error);
      Alert.alert("错误", "保存失败，请重试");
    }
  };

  const handleShare = async () => {
    if (!generatedPattern) return;
    try {
      await Share.share({
        message: `我在「寻纹」创作了一个${selectedStyle}风格纹样（载体：${CARRIERS[selectedCarrier]}）。\n\n${patternDescription}\n\n预览图：${generatedPattern}`,
        url: generatedPattern,
        title: "寻纹-我的纹样创作"
      });
    } catch (error) {
      console.error("分享失败:", error);
      Alert.alert("提示", "暂时无法分享，请稍后重试");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>纹样工坊</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.previewBox}>
          {generatedPattern ? (
            <View style={[styles.mockupFrame, getCarrierStyle()]}>
              <Image source={{ uri: generatedPattern }} style={styles.previewImage} />
            </View>
          ) : (
            <View>
              <Text style={styles.previewHint}>在此预览生成的纹样</Text>
              <Text style={styles.previewSubHint}>
                当前技法：{selectedStyle}（{STYLE_PATTERN_MAP[selectedStyle].motif}）
              </Text>
            </View>
          )}
        </View>

        {generatedPattern && patternDescription && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>纹样描述</Text>
            <Text style={styles.resultText}>{patternDescription}</Text>
          </View>
        )}

        <View style={styles.block}>
          <Text style={styles.label}>1. 选择非遗技法</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STYLES.map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.tag,
                  selectedStyle === style && styles.tagActive
                ]}
                onPress={() => setSelectedStyle(style)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedStyle === style && styles.tagTextActive
                  ]}
                >
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>2. 描述画面</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="例如：一对喜鹊站在梅花枝头，喜气洋洋"
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={200}
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.label}>3. 应用载体</Text>
          <View style={styles.gridWrap}>
            {CARRIERS.map((item, index) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.gridItem,
                  selectedCarrier === index && styles.gridItemActive
                ]}
                onPress={() => setSelectedCarrier(index)}
              >
                <Text
                  style={[
                    styles.gridText,
                    selectedCarrier === index && styles.gridTextActive
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.block}>
          <Text style={styles.label}>4. 风格选择</Text>
          <View style={styles.refineRow}>
            <Text style={styles.refineLabel}>AI精绘增强</Text>
            <Switch value={enableAIRefine} onValueChange={setEnableAIRefine} />
          </View>
          <View style={styles.editRow}>
            {(["原色", "雅致", "浓烈"] as const).map((tone) => (
              <TouchableOpacity
                key={tone}
                style={[styles.editChip, colorTone === tone && styles.editChipActive]}
                onPress={() => setColorTone(tone)}
              >
                <Text style={[styles.editChipText, colorTone === tone && styles.editChipTextActive]}>{tone}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.editRow}>
            {(["简约", "均衡", "繁复"] as const).map((lv) => (
              <TouchableOpacity
                key={lv}
                style={[styles.editChip, complexity === lv && styles.editChipActive]}
                onPress={() => setComplexity(lv)}
              >
                <Text style={[styles.editChipText, complexity === lv && styles.editChipTextActive]}>{lv}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>开始生成</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleRegenerate} disabled={isGenerating}>
          <Text style={styles.secondaryButtonText}>同风格再生成</Text>
        </TouchableOpacity>

        {generatedPattern && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>保存</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
              <Text style={styles.shareButtonText}>分享</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f4"
  },
  header: {
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937"
  },
  content: {
    padding: 20,
    paddingBottom: 120
  },
  previewBox: {
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24
  },
  previewHint: {
    color: "#9ca3af",
    fontSize: 14
  },
  previewSubHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280"
  },
  mockupFrame: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    backgroundColor: "#fff"
  },
  block: {
    marginBottom: 20
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 8
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8
  },
  tagActive: {
    backgroundColor: "#7f1d1d",
    borderColor: "#7f1d1d"
  },
  tagText: {
    fontSize: 12,
    color: "#4b5563"
  },
  tagTextActive: {
    color: "#ffffff"
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 12,
    minHeight: 80,
    justifyContent: "center"
  },
  textAreaPlaceholder: {
    fontSize: 13,
    color: "#9ca3af"
  },
  gridWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8
  },
  gridItem: {
    width: "31%",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center"
  },
  gridItemActive: {
    borderColor: "#7f1d1d",
    backgroundColor: "#fef2f2"
  },
  gridText: {
    fontSize: 12,
    color: "#4b5563"
  },
  gridTextActive: {
    color: "#7f1d1d"
  },
  button: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: "#7f1d1d",
    paddingVertical: 14,
    alignItems: "center"
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    paddingVertical: 12,
    alignItems: "center"
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600"
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24
  },
  resultBox: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  resultText: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 18
  },
  editRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8
  },
  refineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  refineLabel: {
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "600"
  },
  editChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff"
  },
  editChipActive: {
    borderColor: "#7f1d1d",
    backgroundColor: "#fef2f2"
  },
  editChipText: {
    fontSize: 12,
    color: "#4b5563"
  },
  editChipTextActive: {
    color: "#7f1d1d",
    fontWeight: "600"
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center"
  },
  saveButton: {
    backgroundColor: "#7f1d1d"
  },
  shareButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff"
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7f1d1d"
  }
});

export default StudioScreen;

