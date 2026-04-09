import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { PATTERN_KNOWLEDGE_BASE } from "../data/patternKnowledge";

const CommunityScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>社区发现</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {PATTERN_KNOWLEDGE_BASE.map((story) => (
          <View key={story.id} style={styles.card}>
            <Image source={{ uri: story.image }} style={styles.image} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{story.name}</Text>
              <Text style={styles.cardTag}>{story.era} · {story.technique}</Text>
              <Text style={styles.cardDesc}>{story.symbolism}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
    padding: 16,
    paddingBottom: 120
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6"
  },
  image: {
    width: "100%",
    height: 180
  },
  cardBody: {
    padding: 12
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4
  },
  cardTag: {
    fontSize: 12,
    color: "#7f1d1d",
    marginBottom: 6
  },
  cardDesc: {
    fontSize: 12,
    color: "#6b7280"
  }
});

export default CommunityScreen;

