import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  signInWithPopup,
  TwitterAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getAdditionalUserInfo,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signInWithTwitter: () => Promise<void>;
  signOut: () => Promise<void>;
  updateWallet: (wallet: string) => Promise<void>;
  hasWallet: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildUserDoc(input: {
  twitterUsername: string;
  twitterId: string;
  wallet?: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  const docData: Record<string, unknown> = {
    twitterUsername: input.twitterUsername,
    twitterId: input.twitterId,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
  if (input.wallet) docData.wallet = input.wallet;
  return docData;
}

async function ensureSessionCookie(firebaseUser: FirebaseUser) {
  const idToken = await firebaseUser.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to establish session");
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          await ensureSessionCookie(fbUser);
        } catch (e) {
          console.warn("Failed to set session cookie:", e);
        }

        try {
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: fbUser.uid,
              twitterUsername: userData.twitterUsername,
              twitterId: userData.twitterId,
              wallet: userData.wallet,
              highScore:
                typeof userData.highScore === "number"
                  ? userData.highScore
                  : undefined,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            });
          } else {
            const twitterUsername =
              fbUser.displayName ||
              fbUser.email?.split("@")[0] ||
              "user";
            const createdAt = new Date();
            const updatedAt = new Date();
            const twitterId = fbUser.uid;
            await setDoc(
              doc(db, "users", fbUser.uid),
              buildUserDoc({ twitterUsername, twitterId, createdAt, updatedAt })
            );
            setUser({
              id: fbUser.uid,
              twitterUsername,
              twitterId,
              wallet: undefined,
              highScore: undefined,
              createdAt,
              updatedAt,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithTwitter = async () => {
    const provider = new TwitterAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const twitterUser = result.user;

    await ensureSessionCookie(twitterUser);

    const info = getAdditionalUserInfo(result);
    const profile = (info?.profile ?? {}) as Record<string, unknown>;
    const screenName =
      (profile.screen_name as string | undefined) ||
      (profile.username as string | undefined);
    const twitterIdFromProfile =
      (profile.id_str as string | undefined) ||
      (profile.id as string | undefined);

    const twitterUsername =
      screenName ||
      twitterUser.displayName ||
      twitterUser.email?.split("@")[0] ||
      "user";
    const twitterId =
      twitterIdFromProfile ||
      twitterUser.providerData?.find((p) => p.providerId === "twitter.com")
        ?.uid ||
      twitterUser.uid;

    const userDoc = await getDoc(doc(db, "users", twitterUser.uid));

    if (!userDoc.exists()) {
      const createdAt = new Date();
      const updatedAt = new Date();
      await setDoc(
        doc(db, "users", twitterUser.uid),
        buildUserDoc({ twitterUsername, twitterId, createdAt, updatedAt })
      );
      setUser({
        id: twitterUser.uid,
        twitterUsername,
        twitterId,
        wallet: undefined,
        highScore: undefined,
        createdAt,
        updatedAt,
      });
    } else {
      const userData = userDoc.data();
      setUser({
        id: twitterUser.uid,
        twitterUsername: userData.twitterUsername || twitterUsername,
        twitterId: userData.twitterId || twitterId,
        wallet: userData.wallet,
        highScore:
          typeof userData.highScore === "number"
            ? userData.highScore
            : undefined,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: new Date(),
      });
    }
  };

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await firebaseSignOut(auth);
    setUser(null);
  };

  const updateWallet = async (wallet: string) => {
    if (!firebaseUser) throw new Error("User not authenticated");

    const res = await fetch("/api/users/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        wallet,
        ...(user?.twitterUsername && { twitterUsername: user.twitterUsername }),
        ...(user?.twitterId && { twitterId: user.twitterId }),
      }),
    });
    if (!res.ok && res.status !== 204) {
      let msg = "Failed to save wallet";
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch {
        /* empty */
      }
      throw new Error(msg);
    }

    try {
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        wallet,
        updatedAt: new Date(),
      });
    } catch {
      await setDoc(
        doc(db, "users", firebaseUser.uid),
        {
          wallet,
          updatedAt: new Date(),
          twitterUsername: user?.twitterUsername,
          twitterId: user?.twitterId,
        },
        { merge: true }
      );
    }

    setUser((prev) =>
      prev ? { ...prev, wallet, updatedAt: new Date() } : null
    );
  };

  const hasWallet = !!user?.wallet;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithTwitter,
        signOut,
        updateWallet,
        hasWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
