import React, { useState, useEffect, useRef } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { View, Text, ActivityIndicator, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import ChatScreen from "./src/screens/ChatScreen";
import StudioScreen from "./src/screens/StudioScreen";
import ScannerScreen from "./src/screens/ScannerScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import ScanHistoryScreen from "./src/screens/ScanHistoryScreen";
import MyCreationsScreen from "./src/screens/MyCreationsScreen";

export type RootTabParamList = {
  Chat: undefined;
  Studio: undefined;
  Scan: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Favorites: undefined;
  ScanHistory: undefined;
  MyCreations: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#fdfbf7",
    primary: "#7f1d1d"
  }
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const cloudAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 模拟应用初始化
    const initializeApp = async () => {
      try {
        // 可以在这里添加初始化逻辑，如加载本地数据等
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error("应用初始化失败:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(cloudAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [cloudAnim]);

  if (isLoading) {
    const cloudOpacity = cloudAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.72, 1]
    });
    const cloudScale = cloudAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.97, 1.03]
    });

    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fdfbf7" }}>
        <Animated.View style={{ marginBottom: 18, opacity: cloudOpacity, transform: [{ scale: cloudScale }] }}>
          <Svg width={92} height={48} viewBox="0 0 92 48">
            <Path
              d="M6 28c6-9 20-9 26 0m-10 0c4-6 12-6 16 0m6 0c6-9 20-9 26 0m-10 0c4-6 12-6 16 0"
              fill="none"
              stroke="#7f1d1d"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <Path
              d="M18 20c4-5 10-5 14 0m28 0c4-5 10-5 14 0"
              fill="none"
              stroke="#b45309"
              strokeWidth={2}
              strokeLinecap="round"
              opacity={0.8}
            />
          </Svg>
        </Animated.View>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "#7f1d1d", marginBottom: 20, lineHeight: 30 }}>寻纹</Text>
        <ActivityIndicator size="large" color="#7f1d1d" />
        <Text style={{ marginTop: 16, fontSize: 14, color: "#6b7280" }}>正在加载中...</Text>
      </View>
    );
  }

  // 主标签导航
  const getTabIcon = (routeName: keyof RootTabParamList, focused: boolean) => {
    const color = focused ? "#b91c1c" : "#a8a29d";
    const size = 22;

    switch (routeName) {
      case "Chat":
        return <Ionicons name={focused ? "chatbubble-outline" : "chatbubble-outline"} size={size} color={color} />;
      case "Studio":
        return <Ionicons name={focused ? "sparkles-outline" : "sparkles-outline"} size={size} color={color} />;
      case "Scan":
        return <Ionicons name={focused ? "camera-outline" : "camera-outline"} size={size} color={color} />;
      case "Profile":
        return <Ionicons name={focused ? "person-circle-outline" : "person-circle-outline"} size={size} color={color} />;
      default:
        return <Ionicons name="ellipse-outline" size={size} color={color} />;
    }
  };

  const MainTabs = () => (
    <Tab.Navigator
      initialRouteName="Chat"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#b91c1c",
        tabBarInactiveTintColor: "#a8a29d",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#e5e7eb",
          paddingBottom: 10,
          paddingTop: 6,
          height: 66,
          borderTopWidth: 1
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500"
        },
        tabBarIconStyle: {
          marginBottom: 1
        },
        tabBarIcon: ({ focused }) => getTabIcon(route.name as keyof RootTabParamList, focused),
        tabBarShowLabel: true
      })}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ 
          tabBarLabel: "寻纹"
        }}
      />
      <Tab.Screen
        name="Studio"
        component={StudioScreen}
        options={{ 
          tabBarLabel: "工坊"
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScannerScreen}
        options={{ 
          tabBarLabel: "识遗"
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ 
          tabBarLabel: "我的"
        }}
      />
    </Tab.Navigator>
  );

  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen 
          name="Favorites" 
          component={FavoritesScreen}
          options={{
            headerShown: true,
            title: "我的收藏",
            headerStyle: {
              backgroundColor: "#fdfbf7"
            },
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: "700",
              color: "#1f2937"
            }
          }}
        />
        <Stack.Screen 
          name="ScanHistory" 
          component={ScanHistoryScreen}
          options={{
            headerShown: true,
            title: "扫描历史",
            headerStyle: {
              backgroundColor: "#fdfbf7"
            },
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: "700",
              color: "#1f2937"
            }
          }}
        />
        <Stack.Screen 
          name="MyCreations" 
          component={MyCreationsScreen}
          options={{
            headerShown: true,
            title: "我的创作",
            headerStyle: {
              backgroundColor: "#fdfbf7"
            },
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: "700",
              color: "#1f2937"
            }
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

