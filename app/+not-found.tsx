import Notfound from "@/assets/images/notfound.json";

import { Stack, useRouter } from "expo-router";

import LottieView from "lottie-react-native";

import { Linking, Text, TouchableOpacity, View } from "react-native";

import { useLanguage } from "@/context/LanguageContext";

import languageData from "@/lib/language.json";

export default function NotFoundScreen() {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = languageData.notFound[language];

  const handleBackToHome = () => {
    router.replace("/");
  };

  const handleContactUs = () => {
    Linking.openURL(
      `http://wa.me/+6283150102523?text=${encodeURIComponent(copy.whatsappText)}`,
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: copy.stackTitle }} />
      <View className="flex-1 items-center justify-center">
        <View className="flex-row gap-2 items-center mb-4">
          <Text className="text-[64px] font-bold text-gray-300">4</Text>
          <LottieView
            source={Notfound}
            autoPlay
            loop
            style={{ width: 50, height: 50 }}
            resizeMode="contain"
          />
          <Text className="text-[64px] font-bold text-gray-300">4</Text>
        </View>

        <Text className="text-[20px] font-semibold text-gray-300 mb-1 text-center">
          {copy.title}
        </Text>

        <Text className="text-[14px] text-gray-300 mb-8 text-center">
          {copy.subtitle}
        </Text>

        <TouchableOpacity
          className="bg-accent-primary py-3 px-8 rounded-lg mb-6"
          onPress={handleBackToHome}
        >
          <Text className="text-white text-[16px] font-semibold">
            {copy.backToHome}
          </Text>
        </TouchableOpacity>

        <Text
          className="text-[14px] text-gray-300 text-center"
          onPress={handleContactUs}
        >
          {copy.needHelp}{" "}
          <Text className="text-accent-primary font-bold underline">
            {copy.contactUs}
          </Text>
        </Text>
      </View>
    </>
  );
}
