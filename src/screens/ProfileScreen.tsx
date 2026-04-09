import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";

export type RootStackParamList = {
  Profile: undefined;
  Favorites: undefined;
  ScanHistory: undefined;
  MyCreations: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Profile">;

const ProfileScreen: React.FC = () => {
  const CACHE_GROUPS: Array<{ title: string; keys: string[] }> = [
    {
      title: "对话缓存",
      keys: ["@xunwen_conversations", "@xunwen_current_conversation", "@xunwen_favorites"]
    },
    {
      title: "识遗缓存",
      keys: ["@xunwen_scan_history", "@xunwen_chat_pending_question"]
    },
    {
      title: "工坊缓存",
      keys: ["@xunwen_creations"]
    },
    {
      title: "个人资料缓存",
      keys: ["@xunwen_user_name", "@xunwen_user_bio", "@xunwen_user_avatar", "@xunwen_dark_mode"]
    }
  ];

  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [userName, setUserName] = useState("纹样爱好者");
  const [userBio, setUserBio] = useState("热爱传统纹样的文化爱好者");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("纹样爱好者");
  const [editBio, setEditBio] = useState("热爱传统纹样的文化爱好者");

  useEffect(() => {
    loadUserProfile();
    loadDarkMode();
  }, []);

  const loadUserProfile = async () => {
    try {
      const savedName = await AsyncStorage.getItem("@xunwen_user_name");
      const savedBio = await AsyncStorage.getItem("@xunwen_user_bio");
      const savedAvatar = await AsyncStorage.getItem("@xunwen_user_avatar");
      if (savedName) {
        setUserName(savedName);
        setEditName(savedName);
      }
      if (savedBio) {
        setUserBio(savedBio);
        setEditBio(savedBio);
      }
      if (savedAvatar) {
        setAvatarUri(savedAvatar);
      }
    } catch (error) {
      console.error("加载用户资料失败:", error);
    }
  };

  const handleEditAvatar = () => {
    Alert.alert("编辑头像", "请选择操作", [
      { text: "取消", style: "cancel" },
      {
        text: "拍照",
        onPress: pickImageFromCamera
      },
      {
        text: "从相册选择",
        onPress: pickImageFromLibrary
      },
      ...(avatarUri
        ? [
            {
              text: "移除头像",
              style: "destructive" as const,
              onPress: removeAvatar
            }
          ]
        : [])
    ]);
  };

  const pickImageFromCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("提示", "需要相机权限才能拍照上传头像");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        await AsyncStorage.setItem("@xunwen_user_avatar", uri);
      }
    } catch (error) {
      console.error("拍照设置头像失败:", error);
      Alert.alert("错误", "拍照失败，请重试");
    }
  };

  const pickImageFromLibrary = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("提示", "需要相册权限才能选择头像");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;
        setAvatarUri(uri);
        await AsyncStorage.setItem("@xunwen_user_avatar", uri);
      }
    } catch (error) {
      console.error("选择头像失败:", error);
      Alert.alert("错误", "选择头像失败，请重试");
    }
  };

  const removeAvatar = async () => {
    try {
      setAvatarUri(null);
      await AsyncStorage.removeItem("@xunwen_user_avatar");
    } catch (error) {
      console.error("移除头像失败:", error);
    }
  };

  const loadDarkMode = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem("@xunwen_dark_mode");
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    } catch (error) {
      console.error("加载深色模式设置失败:", error);
    }
  };

  const handleEditProfile = () => {
    setEditName(userName);
    setEditBio(userBio);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("提示", "请输入用户名");
      return;
    }

    try {
      await AsyncStorage.setItem("@xunwen_user_name", editName.trim());
      await AsyncStorage.setItem("@xunwen_user_bio", editBio.trim());
      setUserName(editName.trim());
      setUserBio(editBio.trim());
      setShowEditModal(false);
      Alert.alert("成功", "个人资料已更新");
    } catch (error) {
      console.error("保存个人资料失败:", error);
      Alert.alert("错误", "保存失败，请重试");
    }
  };

  const handleDarkModeChange = async (value: boolean) => {
    setDarkMode(value);
    try {
      await AsyncStorage.setItem("@xunwen_dark_mode", JSON.stringify(value));
    } catch (error) {
      console.error("保存深色模式设置失败:", error);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      "清理缓存",
      "请选择要清理的模块",
      [
        { text: "取消", style: "cancel" },
        ...CACHE_GROUPS.map((group) => ({
          text: group.title,
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(group.keys);
              Alert.alert("成功", `已清理${group.title}`);
            } catch (error) {
              console.error("清除缓存失败:", error);
              Alert.alert("错误", "清除缓存失败");
            }
          }
        })),
        {
          text: "全部清理",
          style: "destructive" as const,
          onPress: async () => {
            try {
              const allKeys = CACHE_GROUPS.flatMap((g) => g.keys);
              await AsyncStorage.multiRemove(allKeys);
              Alert.alert("成功", "缓存已全部清理");
            } catch (error) {
              console.error("清除缓存失败:", error);
              Alert.alert("错误", "清除缓存失败");
            }
          }
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "关于寻纹",
      "大家好~这是关于中国传统非遗纹样的一个小应用，欢迎大家使用与提供修改意见喔~"
    );
  };

  // 根据深色模式状态获取样式
  const getStyles = () => {
    const baseStyles = {
      container: {
        ...styles.container,
        backgroundColor: darkMode ? "#111827" : "#fdfbf7"
      },
      header: {
        ...styles.header,
        backgroundColor: darkMode ? "rgba(17, 24, 39, 0.9)" : "rgba(253,251,247,0.9)",
        borderBottomColor: darkMode ? "#374151" : "#e5e7eb"
      },
      headerTitle: {
        ...styles.headerTitle,
        color: darkMode ? "#f3f4f6" : "#1f2937"
      },
      profileInfo: styles.profileInfo,
      userName: {
        ...styles.userName,
        color: darkMode ? "#f3f4f6" : "#111827"
      },
      userBio: {
        ...styles.userBio,
        color: darkMode ? "#9ca3af" : "#6b7280"
      },
      editButton: {
        ...styles.editButton,
        borderColor: darkMode ? "#d1d5db" : "#7f1d1d"
      },
      editButtonText: {
        ...styles.editButtonText,
        color: darkMode ? "#d1d5db" : "#7f1d1d"
      },
      sectionTitle: {
        ...styles.sectionTitle,
        color: darkMode ? "#9ca3af" : "#6b7280"
      },
      menuItem: {
        ...styles.menuItem,
        borderBottomColor: darkMode ? "#374151" : "#f3f4f6"
      },
      menuText: {
        ...styles.menuText,
        color: darkMode ? "#f3f4f6" : "#111827"
      },
      menuArrow: {
        ...styles.menuArrow,
        color: darkMode ? "#6b7280" : "#9ca3af"
      },
      logoutButton: {
        ...styles.logoutButton,
        backgroundColor: darkMode ? "#374151" : "#f3f4f6"
      },
      logoutButtonText: {
        ...styles.logoutButtonText,
        color: darkMode ? "#d1d5db" : "#7f1d1d"
      },
      modalContent: {
        ...styles.modalContent,
        backgroundColor: darkMode ? "#1f2937" : "#fdfbf7"
      },
      modalHeader: {
        ...styles.modalHeader,
        borderBottomColor: darkMode ? "#374151" : "#e5e7eb"
      },
      modalTitle: {
        ...styles.modalTitle,
        color: darkMode ? "#f3f4f6" : "#111827"
      },
      inputLabel: {
        ...styles.inputLabel,
        color: darkMode ? "#d1d5db" : "#4b5563"
      },
      input: {
        ...styles.input,
        backgroundColor: darkMode ? "#374151" : "#ffffff",
        borderColor: darkMode ? "#4b5563" : "#e5e7eb",
        color: darkMode ? "#f3f4f6" : "#111827"
      },
      cancelButton: {
        ...styles.cancelButton,
        backgroundColor: darkMode ? "#374151" : "#f3f4f6",
        borderColor: darkMode ? "#4b5563" : "#e5e7eb"
      },
      cancelButtonText: {
        ...styles.cancelButtonText,
        color: darkMode ? "#d1d5db" : "#4b5563"
      },
      saveButton: styles.saveButton,
      saveButtonText: styles.saveButtonText
    };
    return baseStyles;
  };

  const dynamicStyles = getStyles();

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>我的</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatar} onPress={handleEditAvatar} activeOpacity={0.85}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
            )}
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditBadgeText}>✎</Text>
            </View>
          </TouchableOpacity>
          <View style={dynamicStyles.profileInfo}>
            <Text style={dynamicStyles.userName}>{userName}</Text>
            <Text style={dynamicStyles.userBio}>{userBio}</Text>
          </View>
          <TouchableOpacity style={dynamicStyles.editButton} onPress={handleEditProfile}>
            <Text style={dynamicStyles.editButtonText}>编辑资料</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>我的功能</Text>
          <TouchableOpacity style={dynamicStyles.menuItem} onPress={() => navigation.navigate("Favorites")}>
            <Text style={styles.menuIcon}>📱</Text>
            <Text style={dynamicStyles.menuText}>我的收藏</Text>
            <Text style={dynamicStyles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.menuItem} onPress={() => navigation.navigate("ScanHistory")}>
            <Text style={styles.menuIcon}>📋</Text>
            <Text style={dynamicStyles.menuText}>扫描历史</Text>
            <Text style={dynamicStyles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.menuItem} onPress={() => navigation.navigate("MyCreations")}>
            <Text style={styles.menuIcon}>🎨</Text>
            <Text style={dynamicStyles.menuText}>我的创作</Text>
            <Text style={dynamicStyles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>设置</Text>
          <View style={dynamicStyles.menuItem}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={dynamicStyles.menuText}>通知</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: darkMode ? "#374151" : "#e5e7eb", true: darkMode ? "#4b5563" : "#fef2f2" }}
              thumbColor={notifications ? "#7f1d1d" : darkMode ? "#6b7280" : "#d1d5db"}
            />
          </View>
          <View style={dynamicStyles.menuItem}>
            <Text style={styles.menuIcon}>🌙</Text>
            <Text style={dynamicStyles.menuText}>深色模式</Text>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeChange}
              trackColor={{ false: darkMode ? "#374151" : "#e5e7eb", true: darkMode ? "#4b5563" : "#fef2f2" }}
              thumbColor={darkMode ? "#7f1d1d" : darkMode ? "#6b7280" : "#d1d5db"}
            />
          </View>
          <TouchableOpacity style={dynamicStyles.menuItem} onPress={handleClearCache}>
            <Text style={styles.menuIcon}>🗑️</Text>
            <Text style={dynamicStyles.menuText}>清除缓存</Text>
            <Text style={dynamicStyles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={dynamicStyles.menuItem} onPress={handleAbout}>
            <Text style={styles.menuIcon}>ℹ️</Text>
            <Text style={dynamicStyles.menuText}>关于</Text>
            <Text style={dynamicStyles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={dynamicStyles.logoutButton}>
          <Text style={dynamicStyles.logoutButtonText}>退出登录</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 编辑资料模态框 */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={dynamicStyles.modalContent}>
            <View style={dynamicStyles.modalHeader}>
              <Text style={dynamicStyles.modalTitle}>编辑个人资料</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>用户名</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="请输入用户名"
                  placeholderTextColor={darkMode ? "#6b7280" : "#9ca3af"}
                  maxLength={20}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={dynamicStyles.inputLabel}>个人简介</Text>
                <TextInput
                  style={[dynamicStyles.input, styles.textArea]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="请输入个人简介"
                  placeholderTextColor={darkMode ? "#6b7280" : "#9ca3af"}
                  multiline
                  maxLength={100}
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, dynamicStyles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={dynamicStyles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, dynamicStyles.saveButton]}
                onPress={handleSaveProfile}
              >
                <Text style={dynamicStyles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  content: {
    padding: 20,
    paddingBottom: 100
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#7f1d1d",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff"
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40
  },
  avatarEditBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#111827",
    borderWidth: 1.5,
    borderColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarEditBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700"
  },
  profileInfo: {
    flex: 1
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4
  },
  userBio: {
    fontSize: 14,
    color: "#6b7280"
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#7f1d1d",
    borderRadius: 20
  },
  editButtonText: {
    fontSize: 12,
    color: "#7f1d1d",
    fontWeight: "600"
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
    marginBottom: 12
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: "#111827"
  },
  menuArrow: {
    fontSize: 20,
    color: "#9ca3af"
  },
  logoutButton: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24
  },
  logoutButtonText: {
    fontSize: 15,
    color: "#7f1d1d",
    fontWeight: "600"
  },
  // 编辑资料模态框样式
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#fdfbf7",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32
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
  modalBody: {
    padding: 20
  },
  inputGroup: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 8
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827"
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center"
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb"
  },
  cancelButtonText: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "600"
  },
  saveButton: {
    backgroundColor: "#7f1d1d"
  },
  saveButtonText: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "600"
  }
});

export default ProfileScreen;
