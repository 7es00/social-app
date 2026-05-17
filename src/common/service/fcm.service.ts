import admin from "firebase-admin";
import { config } from "../../config";

let initialized = false;

export const initializeFirebase = (): void => {
  if (initialized || !config.firebase.projectId) return;
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey,
    }),
  });
  initialized = true;
  console.log("✅ Firebase initialized");
};

export const sendFCMNotification = async (
  token: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<void> => {
  if (!initialized) return;
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data,
      android: { priority: "high" },
      apns: { payload: { aps: { badge: 1, sound: "default" } } },
    });
  } catch (error) {
    console.error("FCM Error:", error);
  }
};

export const sendFCMToMultiple = async (
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
): Promise<void> => {
  if (!initialized || !tokens.length) return;
  const validTokens = tokens.filter(Boolean);
  if (!validTokens.length) return;
  try {
    await admin.messaging().sendEachForMulticast({
      tokens: validTokens,
      notification: { title, body },
      data,
    });
  } catch (error) {
    console.error("FCM Multicast Error:", error);
  }
};
