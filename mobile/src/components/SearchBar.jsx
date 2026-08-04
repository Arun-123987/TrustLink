import { TextInput, StyleSheet } from "react-native";

export default function SearchBar({
  value,
  onChangeText,
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder="Search workers..."
      value={value}
      onChangeText={onChangeText}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});