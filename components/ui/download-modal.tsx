import * as React from "react";

import { LinearGradient } from "expo-linear-gradient";

import Svg, { Circle } from "react-native-svg";

import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";

import { socialPalette } from "@/lib/pallate";

function formatPercent(p: number) {
  if (!Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(100, Math.round(p)));
}

export function DownloadProgressModal({
  visible,
  fileName,
  progressPercent,
  statusPillText,
  statusSubText,
  speedText,
  remainingText,
  downloadedTotalText,
  qualityText,
  isPaused,
  isSaving,
  pauseLabel,
  cancelLabel,
  onPause,
  onCancel,
  onRequestClose,
}: DownloadProgressModalProps) {
  const pct = formatPercent(progressPercent);
  const radius = 86;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct / 100);

  const effectivePillText =
    statusPillText ?? (pct >= 100 ? "Completed" : "Downloading");
  const effectiveSubText = statusSubText ?? "Completed";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View className="flex-1 bg-[#05060f]/60 items-center justify-center px-6">
        <View className="w-full max-w-sm bg-[#0c0d1b] border border-white/5 rounded-[40px] p-8 shadow-2xl shadow-black/50 flex flex-col items-center">
          <View className="w-full flex flex-col items-center mb-10 text-center">
            <View className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff3d57]/10 text-[#ff3d57] text-[10px] font-black uppercase tracking-widest mb-4">
              <View className="w-1.5 h-1.5 rounded-full bg-[#ff3d57]" />
              <Text className="text-[#ff3d57]">{effectivePillText}</Text>
            </View>

            <Text className="text-xl font-bold text-white truncate line-clamp-2 w-full px-4">
              {fileName || "Download"}
            </Text>
          </View>

          <View className="relative flex items-center justify-center mb-10">
            <Svg width="192" height="192" viewBox="0 0 192 192">
              <Circle
                cx="96"
                cy="96"
                r={radius}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="8"
                fill="transparent"
              />
              <Circle
                cx="96"
                cy="96"
                r={radius}
                stroke={socialPalette.accent}
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 96 96)"
              />
            </Svg>

            <View className="absolute flex flex-col items-center justify-center">
              <Text className="text-5xl font-extrabold text-white tracking-tighter">
                {pct}%
              </Text>
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                {pct >= 100 ? effectiveSubText : "Completed"}
              </Text>
            </View>
          </View>

          <View className="w-full grid grid-cols-2 gap-4 mb-10">
            <View className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center">
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                Speed
              </Text>
              {speedText ? (
                <Text className="text-white font-bold">{speedText}</Text>
              ) : (
                <View className="items-center">
                  <ActivityIndicator color={socialPalette.accent} />
                </View>
              )}
            </View>

            <View className="p-4 rounded-3xl bg-white/5 border border-white/5 text-center">
              <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                Remaining
              </Text>
              <Text className="text-white font-bold">
                {remainingText ?? "--:--"}
              </Text>
            </View>

            <View className="col-span-2 px-4 py-3 flex flex-row items-center justify-between">
              <Text className="text-[11px] font-medium text-slate-400">
                {downloadedTotalText ?? ""}
              </Text>
              {!!qualityText && (
                <Text className="text-[#ff3d57] text-[11px] font-black uppercase tracking-widest">
                  {qualityText}
                </Text>
              )}
            </View>
          </View>

          <View className="w-full flex flex-col gap-3">
            <Pressable
              disabled={!onPause || pct >= 100 || isSaving}
              onPress={onPause}
              className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-3 active:opacity-90 disabled:opacity-40"
            >
              {isPaused ? (
                <LinearGradient
                  colors={[socialPalette.accent, socialPalette.accentEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 12,
                    width: "100%",
                  }}
                >
                  <Text className="text-white font-bold text-center">
                    {pauseLabel ?? "RESUME DOWNLOAD"}
                  </Text>
                </LinearGradient>
              ) : (
                <LinearGradient
                  colors={[socialPalette.accent, socialPalette.accentEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 12,
                    width: "100%",
                  }}
                >
                  <Text className="text-white font-bold text-center">
                    {pauseLabel ?? "PAUSE DOWNLOAD"}
                  </Text>
                </LinearGradient>
              )}
            </Pressable>

            <Pressable
              disabled={!onCancel || pct >= 100 || isSaving}
              onPress={onCancel}
              className="w-full py-4 rounded-2xl bg-white/5 flex-row items-center justify-center gap-3 active:opacity-90 disabled:opacity-40"
            >
              <Text className="text-slate-400 font-bold">
                {cancelLabel ?? "CANCEL"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
