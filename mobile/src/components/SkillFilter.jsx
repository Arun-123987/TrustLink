import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

const skills = [
  "All",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Construction",
];

export default function SkillFilter({
  selected,
  onSelect,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {skills.map((skill) => (
        <TouchableOpacity
          key={skill}
          style={[
            styles.chip,
            selected === skill && styles.active,
          ]}
          onPress={() => onSelect(skill)}
        >
          <Text
            style={[
              styles.text,
              selected === skill && {
                color: "#fff",
              },
            ]}
          >
            {skill}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#eee",
    borderRadius: 20,
    marginRight: 10,
  },

  active: {
    backgroundColor: "#007AFF",
  },

  text: {
    fontWeight: "600",
  },
});