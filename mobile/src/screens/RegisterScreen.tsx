import { useState } from "react";
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

import { registerRequest } from "../lib/api";
import { RootStackParamList } from "../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (password !== confirm) {
        setError("Les mots de passe ne correspondent pas");
        return;
      }

      const res = await registerRequest({
        role: "client",
        email: email.trim(),
        password,
        phone: phone.trim(),
        address: address.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (res.requiresVerification) {
        navigation.navigate("VerifyEmail", { email: res.user.email });
        return;
      }
      navigation.replace("Home");
    } catch (e: any) {
      setError(e?.message || "Inscription impossible");
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
        <Text style={styles.title}>Créer un compte</Text>

        <Text style={styles.label}>Prénom</Text>
        <TextInput value={firstName} onChangeText={setFirstName} style={styles.input} placeholder="Nom" />

        <Text style={styles.label}>Nom</Text>
        <TextInput value={lastName} onChangeText={setLastName} style={styles.input} placeholder="Prénom" />

        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Téléphone</Text>
        <TextInput value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />

        <Text style={styles.label}>Adresse</Text>
        <TextInput value={address} onChangeText={setAddress} style={styles.input} />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry />

        <Text style={styles.label}>Confirmer</Text>
        <TextInput value={confirm} onChangeText={setConfirm} style={styles.input} secureTextEntry />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={[styles.button, busy && { opacity: 0.6 }]} disabled={busy} onPress={submit}>
          <Text style={styles.buttonText}>{busy ? "Envoi…" : "Créer le compte"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={styles.link}>Retour connexion</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { padding: 20, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 14, color: "#111827" },
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

