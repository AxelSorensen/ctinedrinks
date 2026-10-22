export const addEmailToWaitlist = async (
  email: string,
  buttonPosition: "top" | "bottom",
): Promise<boolean> => {
  try {
    // Load Firebase only when someone actually joins
    const [{ db }, { collection, addDoc }] = await Promise.all([
      import("./firebaseConfig"),
      import("firebase/firestore"),
    ]);
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
