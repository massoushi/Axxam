import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { clearSession } from "../auth/session";
import { RootStackParamList } from "../navigation/RootNavigator";
import { getUser } from "../auth/session";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await getUser();
      if (cancelled) return;
      setName(u?.displayName || "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = async () => {
    await clearSession();
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Text style={styles.title}>Accueil</Text>
          <Text style={styles.subtitle}>
            {name ? `Connecté : ${name}` : "Connecté"}
          </Text>

          <TouchableOpacity style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>Déconnexion</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            MVP : prochaine étape = browse biens + détail + réservation (même que le web).
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 80, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "800", color: "#111827", marginBottom: 8 },
  subtitle: { color: "#374151", marginBottom: 18 },
  button: { backgroundColor: "#D4A017", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "white", fontWeight: "800", fontSize: 14 },
  note: { marginTop: 24, color: "#6B7280", lineHeight: 20 },
});

