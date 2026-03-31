import React, { useCallback, useMemo, useState } from "react";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import * as DocumentPicker from "expo-document-picker";

import * as Haptics from "expo-haptics";

import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheets } from "@/components/BottomSheets";

import { DonasiHeader } from "@/components/donasi/Header";

import { IconSymbol } from "@/components/ui/icon-symbol";

import { socialPalette } from "@/lib/pallate";

const OUTPUT_FORMATS = [
  "Adobe PDF (.pdf)",
  "Microsoft Word (.docx)",
  "Plain Text (.txt)",
  "Image (.png)",
] as const;

const QUALITY_LABELS = ["LOW", "MEDIUM", "Ultra High"] as const;

const SUPPORTED_FORMATS = [
  {
    label: "PDF",
    icon: "picture-as-pdf" as const,
    color: socialPalette.docPdf,
  },
  {
    label: "DOCX",
    icon: "description" as const,
    color: socialPalette.docWord,
  },
  {
    label: "XLSX",
    icon: "border-all" as const,
    color: socialPalette.docExcel,
  },
  {
    label: "PPTX",
    icon: "slideshow" as const,
    color: socialPalette.docPpt,
  },
  {
    label: "JPG",
    icon: "image" as const,
    color: socialPalette.docImage,
  },
] as const;

const MOCK_RECENT = [
  {
    id: "1",
    name: "Business_Proposal.pdf",
    meta: "Converted to DOCX • 2.4 MB",
    icon: "picture-as-pdf" as const,
    iconBg: socialPalette.docPdfBg,
    iconColor: socialPalette.docPdf,
  },
  {
    id: "2",
    name: "Monthly_Report_Final.docx",
    meta: "Converted to PDF • 840 KB",
    icon: "description" as const,
    iconBg: socialPalette.docWordBg,
    iconColor: socialPalette.docWord,
  },
] as const;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type PickedFile = {
  name: string;
  uri: string;
  size: number | null;
  mimeType?: string;
};

export default function FilesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarOffset = 88 + insets.bottom;

  const [formatIndex, setFormatIndex] = useState(0);
  const [quality, setQuality] = useState<1 | 2 | 3>(3);
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [recentItems, setRecentItems] = useState([...MOCK_RECENT]);
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);

  const qualityLabel = useMemo(() => {
    if (quality === 3) return "High";
    if (quality === 2) return "Medium";
    return "Low";
  }, [quality]);

  const haptic = useCallback(() => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const onClearRecent = useCallback(() => {
    haptic();
    setRecentItems([]);
  }, [haptic]);

  const pickDocument = useCallback(async () => {
    haptic();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setPickedFile({
        name: asset.name,
        uri: asset.uri,
        size: asset.size ?? null,
        mimeType: asset.mimeType,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert("Tidak bisa membuka file", msg);
    }
  }, [haptic]);

  return (
    <View className="flex-1 bg-social-bg">
      <DonasiHeader title="MEDIA TOOLS" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarOffset }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mt-8 mb-8">
          <View className="flex-row items-center gap-3 mb-3">
            <View
              className="h-0.5 w-8 rounded-full"
              style={{ backgroundColor: socialPalette.accent }}
            />
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-social-accent">
              Format Factory
            </Text>
          </View>
          <Text className="font-cabinet text-4xl font-extrabold leading-tight tracking-tight text-white">
            Document{"\n"}
            <Text className="text-social-accent">Converter</Text>
          </Text>
        </View>

        <View className="px-6 mb-8">
          <Pressable
            onPress={pickDocument}
            className="w-full p-8 rounded-[40px] border-2 border-dashed border-white/10 bg-white/[0.03] items-center active:bg-white/[0.05]"
            style={
              Platform.OS === "android" ? { borderStyle: "dashed" } : undefined
            }
          >
            <View
              className="w-20 h-20 rounded-3xl items-center justify-center mb-6"
              style={{ backgroundColor: socialPalette.accentFaint }}
            >
              <MaterialIcons
                name={pickedFile ? "insert-drive-file" : "cloud-upload"}
                size={40}
                color={socialPalette.accent}
              />
            </View>
            {pickedFile ? (
              <>
                <Text
                  className="text-lg font-bold text-white mb-1 text-center px-1"
                  numberOfLines={2}
                >
                  {pickedFile.name}
                </Text>
                <Text className="text-xs text-social-slate-500 mb-1">
                  {pickedFile.size != null
                    ? formatBytes(pickedFile.size)
                    : "Ukuran tidak diketahui"}
                </Text>
                <Text className="text-[10px] text-social-accent font-bold mb-4">
                  Ketuk untuk ganti file
                </Text>
              </>
            ) : (
              <>
                <Text className="text-lg font-bold text-white mb-2">
                  Ready to convert?
                </Text>
                <Text className="text-xs text-social-slate-500 mb-6 max-w-[200px] text-center leading-relaxed">
                  Tap untuk memilih dokumen dari perangkat Anda
                </Text>
              </>
            )}
            <View
              className="px-8 py-3.5 rounded-2xl bg-social-accent active:opacity-90"
              style={{
                shadowColor: socialPalette.accent,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              <Text className="text-white text-xs font-black uppercase tracking-widest">
                {pickedFile ? "Ganti file" : "Choose File"}
              </Text>
            </View>
          </Pressable>
        </View>

        <View className="px-6 mb-10">
          <Text className="text-[10px] font-black uppercase tracking-widest text-social-slate-500 mb-4 px-2">
            Supported Formats
          </Text>
          <View className="flex-row flex-wrap gap-3 justify-between">
            {SUPPORTED_FORMATS.map((f) => (
              <Pressable
                key={f.label}
                onPress={haptic}
                className="w-[18%] min-w-[56px] aspect-square rounded-2xl bg-white/5 border border-white/5 items-center justify-center active:scale-95"
              >
                <MaterialIcons
                  name={f.icon}
                  size={22}
                  color={f.color}
                  style={{ marginBottom: 4 }}
                />
                <Text className="text-[8px] font-black text-white">
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="px-6 mb-12">
          <View className="p-6 rounded-[32px] bg-social-card-from border border-white/5">
            <View className="mb-6">
              <Text className="text-[10px] font-black text-social-slate-500 uppercase tracking-widest mb-3">
                Convert to
              </Text>
              <Pressable
                onPress={() => {
                  haptic();
                  setFormatModalOpen(true);
                }}
                className="relative w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 flex-row items-center justify-between"
              >
                <Text className="text-sm font-bold text-white flex-1 pr-6">
                  {OUTPUT_FORMATS[formatIndex]}
                </Text>
                <IconSymbol
                  name="chevron.down"
                  size={22}
                  color={socialPalette.slate500}
                />
              </Pressable>
            </View>

            <View>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-[10px] font-black text-social-slate-500 uppercase tracking-widest">
                  Output Quality
                </Text>
                <Text className="text-[10px] font-black text-social-accent uppercase tracking-widest">
                  {qualityLabel}
                </Text>
              </View>
              <View className="relative h-1.5 bg-white/10 rounded-full mb-2 justify-center">
                <View
                  className="absolute left-0 top-0 bottom-0 rounded-full bg-social-accent"
                  style={{
                    width:
                      quality === 1 ? "33%" : quality === 2 ? "66%" : "100%",
                  }}
                />
              </View>
              <View className="flex-row justify-between px-0.5 -mt-4 mb-2">
                {([1, 2, 3] as const).map((step) => (
                  <Pressable
                    key={step}
                    onPress={() => {
                      haptic();
                      setQuality(step);
                    }}
                    className="items-center flex-1"
                    hitSlop={8}
                  >
                    <View
                      className="w-[18px] h-[18px] rounded-full border-[3px] items-center justify-center"
                      style={{
                        borderColor: socialPalette.bg,
                        backgroundColor:
                          quality >= step
                            ? socialPalette.accent
                            : "transparent",
                        borderWidth: 3,
                      }}
                    />
                  </Pressable>
                ))}
              </View>
              <View className="flex-row justify-between mt-1">
                {QUALITY_LABELS.map((label) => (
                  <Text
                    key={label}
                    className="text-[8px] font-bold text-social-slate-600 flex-1 text-center"
                  >
                    {label}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View className="px-6 pb-4">
          <View className="flex-row items-center justify-between mb-6 px-2">
            <Text className="text-[10px] font-black uppercase tracking-widest text-social-slate-500">
              Recent Conversions
            </Text>
            <Pressable
              onPress={onClearRecent}
              disabled={recentItems.length === 0}
            >
              <Text
                className={`text-[9px] font-bold uppercase ${
                  recentItems.length === 0
                    ? "text-social-slate-600"
                    : "text-social-accent"
                }`}
              >
                Clear All
              </Text>
            </Pressable>
          </View>
          <View className="gap-4">
            {recentItems.map((item, index) => (
              <View
                key={item.id}
                className="flex-row items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5"
                style={{ opacity: 1 }}
              >
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center shrink-0"
                  style={{ backgroundColor: item.iconBg }}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={28}
                    color={item.iconColor}
                  />
                </View>
                <View className="flex-1 min-w-0">
                  <Text
                    className="text-sm font-bold text-white"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-[10px] text-social-slate-500 mt-1 uppercase tracking-tighter">
                    {item.meta}
                  </Text>
                </View>
                <Pressable
                  onPress={haptic}
                  className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center active:bg-social-accent"
                >
                  <IconSymbol
                    name="download"
                    size={20}
                    color={socialPalette.accent}
                  />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomSheets
        visible={formatModalOpen}
        onClose={() => setFormatModalOpen(false)}
        title="Convert to"
      >
        <View className="pb-8">
          {OUTPUT_FORMATS.map((label, i) => (
            <Pressable
              key={label}
              onPress={() => {
                haptic();
                setFormatIndex(i);
                setFormatModalOpen(false);
              }}
              className="py-4 border-b border-white/10 active:bg-white/5"
            >
              <Text
                className={`text-sm font-bold ${
                  i === formatIndex ? "text-social-accent" : "text-white"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheets>
    </View>
  );
}
