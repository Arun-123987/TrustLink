import React from "react";
import { Image } from "react-native";
import { pickProfileImage } from "@/src/services/imagePicker";
import { useWorkerRegistration } from "@/src/context/WorkerRegistrationContext";
import { Switch } from "react-native";
import { getCurrentLocation } from "@/src/services/locationService";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Controller, useForm } from "react-hook-form";

import { router } from "expo-router";

export default function RegisterWorkerScreen() {
  const {
  updateWorkerData,
  workerData,
} = useWorkerRegistration();

  const [available, setAvailable] = React.useState(true);
  const [loadingLocation, setLoadingLocation] = React.useState(false);

  const fetchLocation = async () => {
  try {
    setLoadingLocation(true);

    const location = await getCurrentLocation();

    const workerLocation = {
      type: "Point",
      coordinates: [
        location.longitude,
        location.latitude,
      ],
    };

    console.log("📍 Worker Location:", workerLocation);

    updateWorkerData({
      isAvailable: available,
      location: workerLocation,
    });

    Alert.alert("Success", "Location captured");
  } catch (error) {
    console.log("❌ Location Error:", error);
    Alert.alert("Error", error.message);
  } finally {
    setLoadingLocation(false);
  }
};


const selectImage = async () => {
  const image = await pickProfileImage();

  if (!image) return;

  updateWorkerData({
    profilePhoto: image.uri,
  });
};

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      experience: "",
      minRate: "",
      maxRate: "",
      serviceRadius: "",
      languages: "",
      bio: "",
    },
  });

  const onSubmit = (data) => {
    if (Number(data.minRate) > Number(data.maxRate)) {
      Alert.alert("Error", "Minimum rate cannot be greater than maximum.");
      return;
    }

    updateWorkerData({
      fullName: data.fullName.trim(),
      experience: Number(data.experience),
      hourlyRate: {
        min: Number(data.minRate),
        max: Number(data.maxRate),
      },
      serviceRadius: Number(data.serviceRadius),
      languages: data.languages
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      bio: data.bio.trim(),
    });

    router.push("/worker/skills");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.label}>Current Location</Text>

      <TouchableOpacity
  onPress={() => router.back()}
  style={styles.backButton}
>
  <Text style={styles.backButtonText}>← Back</Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.locationButton}
  onPress={fetchLocation}
>
  <Text style={styles.locationButtonText}>
    {loadingLocation
      ? "Fetching..."
      : "Use Current Location"}
  </Text>
</TouchableOpacity>

<View style={styles.switchRow}>
  <Text style={styles.label}>
    Available for Work
  </Text>

  <Switch
    value={available}
    onValueChange={setAvailable}
  />
</View>
      <Text style={styles.title}>Worker Registration</Text>
      <TouchableOpacity
  style={styles.imageContainer}
  onPress={selectImage}
>
  {workerData.profilePhoto ? (
  <Image
    source={{ uri: workerData.profilePhoto }}
    style={styles.image}
  />
) : (
  <Text style={styles.imageText}>
    Select Profile Photo
  </Text>
)}
</TouchableOpacity>
      <Text style={styles.label}>Full Name</Text>
      
      <Controller
        control={control}
        rules={{
          required: "Full name is required",
        }}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder="Full Name"
          />
        )}
      />

      {errors.fullName && (
        <Text style={styles.error}>{errors.fullName.message}</Text>
      )}

      <Text style={styles.label}>Experience (Years)</Text>

      <Controller
        control={control}
        rules={{
          required: "Experience is required",
        }}
        name="experience"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            placeholder="5"
          />
        )}
      />

      <Text style={styles.label}>Minimum Hourly Rate</Text>

      <Controller
        control={control}
        name="minRate"
        rules={{
          required: "Required",
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            placeholder="300"
          />
        )}
      />

      <Text style={styles.label}>Maximum Hourly Rate</Text>

      <Controller
        control={control}
        name="maxRate"
        rules={{
          required: "Required",
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            placeholder="600"
          />
        )}
      />

      <Text style={styles.label}>Service Radius (KM)</Text>

      <Controller
        control={control}
        name="serviceRadius"
        rules={{
          required: "Required",
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={value}
            onChangeText={onChange}
            placeholder="15"
          />
        )}
      />

      <Text style={styles.label}>Languages</Text>

      <Controller
        control={control}
        name="languages"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder="Kannada, English, Hindi"
          />
        )}
      />

      <Text style={styles.label}>Bio</Text>

      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, { height: 120 }]}
            multiline
            textAlignVertical="top"
            value={value}
            onChangeText={onChange}
            placeholder="Tell customers about yourself..."
          />
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 25,
  },

  label: {
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },

  error: {
    color: "red",
    marginTop: 4,
  },

  button: {
    backgroundColor: "#007AFF",
    marginTop: 30,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 40,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  imageContainer: {
  height: 140,
  width: 140,
  alignSelf: "center",
  borderRadius: 70,
  backgroundColor: "#F2F2F2",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 25,
},

image: {
  width: 140,
  height: 140,
  borderRadius: 70,
},

imageText: {
  color: "#555",
  textAlign: "center",
},

locationButton: {
  backgroundColor: "#27AE60",
  padding: 14,
  borderRadius: 10,
  marginTop: 10,
},

locationButtonText: {
  color: "#fff",
  textAlign: "center",
  fontWeight: "600",
},

switchRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 25,
},

});