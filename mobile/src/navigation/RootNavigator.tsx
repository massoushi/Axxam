import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { getToken } from "../auth/session";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";
import HomeScreen from "../screens/HomeScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email?: string } | undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (cancelled) return;
      setAuthed(Boolean(token));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (authed === null) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={authed ? "Home" : "Login"}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="VerifyEmail"
          component={VerifyEmailScreen}
          options={{ title: "Vérification e-mail" }}
        />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

