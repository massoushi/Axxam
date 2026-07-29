import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { loginRequest } from "../lib/api";
import { RootStackParamList } from "../navigation/RootNavigator";
import { setSession } from "../auth/session";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await loginRequest(email.trim(), password);
      await setSession(res.token, res.user);
      navigation.replace("Home");
    } catch (e: any) {
      const msg = e?.message || "Connexion impossible";
      setError(msg);
      if (e?.code === "EMAIL_NOT_VERIFIED") {
        navigation.navigate("VerifyEmail", { email: email.trim() });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Connexion</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholder="vous@exemple.dz"
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholder="••••••••"
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={[styles.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={submit}>
          <Text style={styles.buttonText}>{busy ? "Connexion…" : "Se connecter"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Register")}
          style={{ marginTop: 16 }}
        >
          <Text style={styles.link}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { padding: 20, paddingTop: 80 },
  title: { fontSize: 28, fontWeight: "800", color: "#111827", marginBottom: 18 },
  label: { fontSize: 12, fontWeight: "700", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  error: { color: "#b91c1c", backgroundColor: "#fef2f2", padding: 10, borderRadius: 12, marginBottom: 10 },
  button: { backgroundColor: "#D4A017", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "800", fontSize: 14 },
  link: { color: "#064E3B", fontWeight: "700" },
});

