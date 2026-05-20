import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { ARTICLES, Article } from "@/lib/data/articles";
import { useLoansStore } from "@/lib/store/loans";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "basics", label: "Basics" },
  { key: "interest", label: "Interest" },
  { key: "strategy", label: "Strategy" },
  { key: "life", label: "Life" },
  { key: "refinancing", label: "Refi" },
  { key: "forgiveness", label: "Forgiveness" },
  { key: "budgeting", label: "Budgeting" },
];

const CATEGORY_COLORS: Record<string, string> = {
  basics: "bg-blue-100",
  interest: "bg-red-100",
  strategy: "bg-brand-100",
  life: "bg-green-100",
  refinancing: "bg-purple-100",
  forgiveness: "bg-teal-100",
  budgeting: "bg-orange-100",
};

function ArticleCard({ article, onPress }: { article: Article; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card variant="elevated">
        <View className="flex-row items-start gap-x-3">
          <View className="w-12 h-12 rounded-2xl bg-brand-100 items-center justify-center">
            <Text className="text-2xl">{article.emoji}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-x-2 mb-1">
              <View className={`${CATEGORY_COLORS[article.category] ?? "bg-brand-100"} rounded-lg px-2 py-0.5`}>
                <Text className="text-xs font-semibold text-brand-800 capitalize">
                  {article.category}
                </Text>
              </View>
              <Text className="text-xs text-brand-500">{article.readingTime} min read</Text>
            </View>
            <Text className="font-bold text-brand-900 leading-snug">{article.title}</Text>
            <Text className="text-sm text-brand-600 mt-1 leading-relaxed" numberOfLines={2}>
              {article.excerpt}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function ArticleModal({ article, onClose }: { article: Article; onClose: () => void }) {
  const { earnMilestone, earnedMilestoneIds } = useLoansStore();

  const handleClose = () => {
    if (!earnedMilestoneIds.includes("first_article")) {
      earnMilestone("first_article");
    }
    onClose();
  };

  const paragraphs = article.content.split("\n\n").filter(Boolean);

  return (
    <Modal animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-brand-50">
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <TouchableOpacity onPress={handleClose}>
            <Text className="text-brand-600 font-semibold">← Back</Text>
          </TouchableOpacity>
          <Text className="text-xs text-brand-500">{article.readingTime} min read</Text>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pb-12">
            <View className="items-center py-8">
              <Text style={{ fontSize: 56 }}>{article.emoji}</Text>
              <View className={`${CATEGORY_COLORS[article.category] ?? "bg-brand-100"} rounded-xl px-3 py-1 mt-3`}>
                <Text className="text-xs font-bold text-brand-800 uppercase tracking-wide capitalize">
                  {article.category}
                </Text>
              </View>
              <Text className="text-2xl font-bold text-brand-900 text-center mt-3 leading-snug px-2">
                {article.title}
              </Text>
            </View>

            {paragraphs.map((para, i) => {
              if (para.startsWith("**") && para.endsWith("**") && !para.slice(2).includes("**")) {
                return (
                  <Text key={i} className="text-lg font-bold text-brand-900 mb-2 mt-4">
                    {para.replace(/\*\*/g, "")}
                  </Text>
                );
              }
              const rendered = para.replace(/\*\*([^*]+)\*\*/g, "$1");
              return (
                <Text key={i} className="text-base text-brand-800 leading-relaxed mb-3">
                  {rendered}
                </Text>
              );
            })}

            <View className="mt-6 bg-brand-400 rounded-2xl p-4">
              <Text className="font-bold text-brand-900 mb-1">Cloan tip</Text>
              <Text className="text-sm text-brand-800 leading-relaxed">
                Knowledge + action = results. Use what you learned here in your Cloan settings.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function LearnScreen() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filtered =
    selectedCategory === "all"
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === selectedCategory);

  return (
    <SafeAreaView className="flex-1 bg-brand-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-brand-900">Learn</Text>
          <Text className="text-brand-600 mt-1">
            Understand your loans. Make better decisions.
          </Text>
        </View>

        <View className="px-6 mt-4 gap-y-4 pb-8">
          {/* Featured */}
          <TouchableOpacity
            onPress={() => setSelectedArticle(ARTICLES[2])}
            activeOpacity={0.8}
          >
            <View className="bg-brand-900 rounded-3xl p-5">
              <View className="flex-row items-center gap-x-2 mb-3">
                <View className="bg-brand-400 rounded-lg px-2 py-0.5">
                  <Text className="text-xs font-bold text-brand-900">FEATURED</Text>
                </View>
                <Text className="text-brand-400 text-xs">{ARTICLES[2].readingTime} min read</Text>
              </View>
              <Text className="text-3xl mb-2">{ARTICLES[2].emoji}</Text>
              <Text className="text-white text-lg font-bold leading-snug">
                {ARTICLES[2].title}
              </Text>
              <Text className="text-brand-400 text-sm mt-2 leading-relaxed" numberOfLines={2}>
                {ARTICLES[2].excerpt}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Category filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
            <View className="flex-row px-1 gap-x-2">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setSelectedCategory(cat.key)}
                  className={`px-4 py-2 rounded-full border ${
                    selectedCategory === cat.key
                      ? "bg-brand-400 border-brand-400"
                      : "bg-white border-brand-200"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedCategory === cat.key ? "text-brand-900" : "text-brand-600"
                    }`}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Article list */}
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onPress={() => setSelectedArticle(article)}
            />
          ))}
        </View>
      </ScrollView>

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </SafeAreaView>
  );
}
