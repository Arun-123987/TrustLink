import * as Location from "expo-location";

export const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Location permission denied");
  }

  return true;
};

export const getCurrentLocation = async () => {
  await requestLocationPermission();

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};