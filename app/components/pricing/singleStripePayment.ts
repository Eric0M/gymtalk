import { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import Stripe from "stripe";

type CheckoutMode = "payment" | "subscription";
type success_url = string;

export const getCheckoutUrl = async (
  app: FirebaseApp,
  priceId: string,
  mode: CheckoutMode,
  success_url: string
): Promise<string> => {
  const auth = getAuth(app);
  const userId = auth.currentUser?.uid;
  const email = auth.currentUser?.email;
  const displayName = auth.currentUser?.displayName;

  if (!userId) {
    window.location.href = "/login";
    return "";
  }

  const db = getFirestore(app);
  const checkoutSessionRef = collection(
    db,
    "customers",
    userId,
    "checkout_sessions"
  );
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  //   apiVersion: "2024-06-20",
  // });

  // const customer = await stripe.customers.create({
  //   name: displayName ?? "",
  //   description: "Customer for " + email,
  // });

  const docRef = await addDoc(checkoutSessionRef, {
    price: priceId,
    success_url: success_url,
    cancel_url: window.location.origin,
    mode: mode,
  });

  return new Promise<string>((resolve, reject) => {
    const unsubscribe = onSnapshot(docRef, (snap) => {
      const { error, url } = snap.data() as {
        error?: { message: string };
        url?: string;
      };
      if (error) {
        unsubscribe();
        reject(new Error(`An error occurred: ${error.message}`));
      }
      if (url) {
        unsubscribe();
        resolve(url);
      }
    });
  });
};

export const getPortalUrl = async (app: FirebaseApp): Promise<string> => {
  const auth = getAuth(app);
  const user = auth.currentUser;

  let dataWithUrl: any;
  try {
    const functions = getFunctions(app, "us-central1");
    const functionRef = httpsCallable(
      functions,
      "ext-firestore-stripe-payments-createPortalLink"
    );
    const { data } = await functionRef({
      customerId: user?.uid,
      returnUrl: window.location.origin,
    });

    // Add a type to the data
    dataWithUrl = data as { url: string };
    console.log("Reroute to Stripe portal: ", dataWithUrl.url);
  } catch (error) {
    console.error(error);
  }

  return new Promise<string>((resolve, reject) => {
    if (dataWithUrl.url) {
      resolve(dataWithUrl.url);
    } else {
      reject(new Error("No url returned"));
    }
  });
};
