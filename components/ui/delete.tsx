import { Modal, Pressable, Text, ToastAndroid, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";

export function DeleteConfirmModal({
  visible,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
  iconName = "history.clear",
  iconColor = "#f97373",
  children,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-[#05060f]/70 items-center justify-center px-6">
        <View className="w-full max-w-lg bg-[#0c0d1b] border border-white/10 rounded-[32px] p-6">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-9 h-9 rounded-2xl bg-red-500/15 items-center justify-center">
              <IconSymbol name={iconName} size={20} color={iconColor} />
            </View>
            <Text
              className="text-base font-extrabold text-white"
              numberOfLines={2}
            >
              {title}
            </Text>
          </View>

          <Text className="text-sm text-social-slate-500 leading-relaxed mb-6">
            {description}
          </Text>

          {children}

          <View className="flex-row gap-3 mt-3">
            <Pressable
              onPress={onCancel}
              className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 items-center justify-center active:opacity-90"
            >
              <Text className="text-[11px] font-black uppercase tracking-widest text-white">
                {cancelLabel}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                onConfirm();
                ToastAndroid.show("Berhasil dihapus", ToastAndroid.SHORT);
              }}
              className="flex-1 py-3 rounded-2xl bg-red-500 items-center justify-center active:opacity-90"
            >
              <Text className="text-[11px] font-black uppercase tracking-widest text-white">
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
