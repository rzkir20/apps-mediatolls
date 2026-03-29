import { router, usePathname } from "expo-router";

import { useEffect, useRef } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  STORAGE_KEY_PERMISSION_SETUP_COMPLETED,
  STORAGE_KEY_WELCOME_COMPLETED,
} from "@/lib/config";

export default function Index() {
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    let rafId: number | null = null;
    const checkUserAndRedirect = async () => {
      if (hasRedirected.current) return;
      if (pathname !== "/") return;

      hasRedirected.current = true;
      const completed = await AsyncStorage.getItem(
        STORAGE_KEY_WELCOME_COMPLETED,
      );
      if (completed === "true") {
        const permissionSetupCompleted = await AsyncStorage.getItem(
          STORAGE_KEY_PERMISSION_SETUP_COMPLETED,
        );
        if (permissionSetupCompleted === "true") {
          router.replace("/(tabs)/social");
        } else {
          router.replace("/permission");
        }
      } else {
        router.replace("/welcome");
      }
    };
    rafId = requestAnimationFrame(() => {
      checkUserAndRedirect();
    });
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [pathname]);

  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  return null;
}
