import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth, checkDashboardAccess } from "../firebase/config";

class AuthService {
  async login(email, password) {
    try {
      console.log("Starting login for:", email);
      
      // Step 1: Check dashboard access using Cloud Function
      const accessResult = await checkDashboardAccess({ email });
      console.log("Cloud Function response:", accessResult);
      
      // Check the response structure
      if (accessResult.data && accessResult.data.status !== "Success") {
        // Throw the exact message from the cloud function
        const errorMessage = accessResult.data.message || "Access denied";
        console.log("Access denied with message:", errorMessage);
        const error = new Error(errorMessage);
        error.isAccessError = true;
        throw error;
      }

      // Step 2: Sign in with Firebase Auth
      console.log("Access granted, proceeding with Firebase Auth...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      return {
        success: true,
        user: userCredential.user,
        message: "Login successful"
      };
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        code: error.code,
        isAccessError: error.isAccessError,
        fullError: error
      });
      
      // If it's already an access error from cloud function, pass it through
      if (error.isAccessError) {
        throw error;
      }
      
      // Handle specific Firebase Auth error cases
      if (error.code === 'auth/user-not-found') {
        throw new Error("User not found");
      } else if (error.code === 'auth/wrong-password') {
        throw new Error("Invalid password");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Invalid email format");
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many failed attempts. Please try again later");
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error("Network error. Please check your connection");
      } else if (error.code === 'functions/internal') {
        throw new Error("Server error. Please try again later.");
      }
      
      // For any other errors, pass the message through
      throw new Error(error.message || "Login failed. Please try again.");
    }
  }

  async logout() {
    try {
      await signOut(auth);
      return { success: true, message: "Logout successful" };
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: "Password reset email sent" };
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  }

  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  async checkUserAccess(email) {
    try {
      const result = await checkDashboardAccess({ email });
      return result.data;
    } catch (error) {
      console.error("Access check error:", error);
      throw error;
    }
  }
}

export default new AuthService();