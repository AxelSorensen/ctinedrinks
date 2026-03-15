import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export const addEmailToWaitlist = async (
  email: string,
  buttonPosition: "top" | "bottom",
): Promise<boolean> => {
  try {
    await addDoc(collection(db, "emails"), {
      email,
      buttonPosition,
      addedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error adding email to waitlist: ", error);
    return false;
  }
};
