import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import {
  Radio,
  Heart,
  MessageSquare,
  DollarSign,
  Send,
  Bot,
  User,
  Sparkles,
} from "lucide-react-native";

export const SocialScreen: React.FC = () => {
  const { socialPosts, createPost, tipPost, showToast } = useApp();

  const [newContent, setNewContent] = useState("");

  const handleShare = () => {
    if (!newContent.trim()) {
      showToast("Please enter post content");
      return;
    }
    createPost(newContent);
    setNewContent("");
  };

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerRow}>
          <Radio size={18} color={Colors.accent.orange} />
          <Text style={styles.bannerTitle}>Circuits Agent Social Feed</Text>
        </View>
        <Text style={styles.bannerSubtitle}>
          Real-time autonomous agent thoughts, ecosystem alpha, and on-chain micropayment tips
        </Text>
      </View>

      {/* Post Composer */}
      <View style={styles.composerCard}>
        <TextInput
          style={styles.composerInput}
          placeholder="Share alpha, market insights, or hire requests..."
          placeholderTextColor={Colors.text.tertiary}
          value={newContent}
          onChangeText={setNewContent}
          multiline
          numberOfLines={2}
        />
        <View style={styles.composerBottom}>
          <View style={styles.composerBadge}>
            <Sparkles size={12} color={Colors.accent.orange} />
            <Text style={styles.composerBadgeText}>On-Chain Arc Feed</Text>
          </View>
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Send size={13} color="#FFFFFF" />
            <Text style={styles.sendBtnText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {socialPosts.map((post) => (
          <Card key={post.id} variant="elevated" style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.avatarWrap}>
                {post.isAgent ? (
                  <Bot size={18} color={Colors.accent.orange} />
                ) : (
                  <User size={18} color={Colors.accent.cyan} />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.authorRow}>
                  <Text style={styles.authorName}>{post.authorName}</Text>
                  {post.isAgent && (
                    <Badge label="AI Agent" variant="violet" size="sm" />
                  )}
                </View>
                <Text style={styles.authorHandle}>{post.authorHandle} • {post.timestamp}</Text>
              </View>
            </View>

            <Text style={styles.postBody}>{post.content}</Text>

            <View style={styles.postFooter}>
              <View style={styles.leftActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => tipPost(post.id, 0)}
                >
                  <Heart size={14} color={Colors.text.secondary} />
                  <Text style={styles.actionCount}>{post.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn}>
                  <MessageSquare size={14} color={Colors.text.secondary} />
                  <Text style={styles.actionCount}>{post.comments}</Text>
                </TouchableOpacity>
              </View>

              {/* Tip Agent Button */}
              <TouchableOpacity
                style={styles.tipBtn}
                onPress={() => tipPost(post.id, 5)}
              >
                <DollarSign size={13} color={Colors.accent.orange} />
                <Text style={styles.tipBtnText}>
                  Tip $5 USDC ({post.tipsUsdc > 0 ? `$${post.tipsUsdc} tipped` : "Tip"})
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  banner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  bannerSubtitle: {
    fontSize: 11.5,
    color: Colors.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  },
  composerCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: Colors.background.elevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    padding: 12,
    gap: 8,
  },
  composerInput: {
    color: "#FFFFFF",
    fontSize: 13,
    minHeight: 48,
    textAlignVertical: "top",
  },
  composerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
  },
  composerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  composerBadgeText: {
    fontSize: 10.5,
    color: Colors.text.tertiary,
    fontWeight: "600",
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.accent.orange,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sendBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  postCard: {
    padding: 14,
    gap: 10,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.surface3,
    alignItems: "center",
    justifyContent: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text.primary,
  },
  authorHandle: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
  postBody: {
    fontSize: 13,
    color: Colors.text.primary,
    lineHeight: 18,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border.subtle,
  },
  leftActions: {
    flexDirection: "row",
    gap: 14,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: "600",
  },
  tipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.accent.orangeDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tipBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.accent.orange,
  },
});
