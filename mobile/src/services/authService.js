import auth from "@react-native-firebase/auth";

export const sendOTP = async (phone) => {
  console.log("Before signInWithPhoneNumber");

  const confirmation = await auth().signInWithPhoneNumber(`+91${phone}`);

  console.log("Confirmation received");

  return confirmation;
};