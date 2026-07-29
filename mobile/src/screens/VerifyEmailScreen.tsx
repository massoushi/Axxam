import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { resendVerificationRequest, verifyEmailRequest } from "../lib/api";
import { RootStackParamList } from "../navigation/RootNavigator";
import { setSession } from "../auth/session";

type Props = NativeStackScreenProps<RootStackParamList, "VerifyEmail">;

export default function VerifyEmailScreen({ route, navigation }: Props) {
  const emailParam = route.params?.email;

  const [email, setEmail] = useState(emailParam || "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await verifyEmailRequest(email.trim(), code.replace(/\D/g, "").slice(0, 6));
      if ("token" in res && res.token) {
        await setSession(res.token, res.user);
      }
      navigation.replace("Home");
    } catch (e: any) {
      setError(e?.message || "Code incorrect");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setResendBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await resendVerificationRequest(email.trim());
      setMessage(res?.alreadyVerified ? "E-mail déjà vérifié." : res?.emailSent ? "Code renvoyé." : "Demande envoyée.");
    } catch (e: any) {
      setError(e?.message || "Renvoyer impossible");
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Vérification e-mail</Text>
        <Text style={styles.subtitle}>
          Entrez le code à 6 chiffres reçu par e-mail pour activer votre compte.
        </Text>

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Code</Text>
        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
          style={[styles.input, styles.codeInput]}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="••••••"
        />

        {!!error && <Text style={styles.error}>{error}</Text>}
        {!!message && <Text style={styles.ok}>{message}</Text>}

        <TouchableOpacity style={[styles.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={submit}>
          <Text style={styles.buttonText}>{busy ? "Vérification…" : "Valider le code"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => void resend()}
          disabled={resendBusy}
          style={[styles.secondaryButton, resendBusy && { opacity: 0.6 }]}
        >
          <Text style={styles.secondaryButtonText}>{resendBusy ? "Envoi…" : "Renvoyer le code"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
          <Text style={styles.link}>Retour connexion</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { padding: 20, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 6, color: "#111827" },
  subtitle: { color: "#6B7280", marginBottom: 16, lineHeight: 18 },
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
  codeInput: { textAlign: "center", fontSize: 18, fontWeight: "800", letterSpacing: 6 },
  button: { backgroundColor: "#D4A017", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 6 },
  buttonText: { color: "white", fontWeight: "800", fontSize: 14 },
  secondaryButton: { borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: "#111827", marginTop: 12 },
  secondaryButtonText: { color: "#111827", fontWeight: "800" },
  error: { color: "#b91c1c", backgroundColor: "#fef2f2", padding: 10, borderRadius: 12, marginBottom: 10 },
  ok: { color: "#065F46", backgroundColor: "#ECFDF5", padding: 10, borderRadius: 12, marginBottom: 10 },
  link: { color: "#064E3B", fontWeight: "700" },
});

