import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "./context/AuthContext";
import { FriendsProvider } from "./context/friends";
import { ProfileProvider } from "./context/profile";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <ProfileProvider>
          <FriendsProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="admin-home"
                options={{
                  gestureEnabled: false,
                }}
              />
              <Stack.Screen
                name="modal"
                options={{
                  presentation: "modal",
                  title: "Modal",
                  headerShown: true,
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </FriendsProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
