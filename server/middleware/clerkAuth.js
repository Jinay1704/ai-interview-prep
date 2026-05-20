import { clerkMiddleware, getAuth } from "@clerk/express";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Attach Clerk auth to every request
export const clerkAuth = clerkMiddleware();

// Require a signed-in user; attaches req.dbUser
export const requireAuth = async (req, res, next) => {
  try {
    const { userId, sessionClaims } = getAuth(req);

    console.log("Auth data:", sessionClaims);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      user = await User.create({
        clerkId: userId,
        email:
          sessionClaims?.email ||
          sessionClaims?.email_addresses?.[0]?.email_address ||
          "test@gmail.com", // fallback
      });

      // console.log("✅ User created:", user);
    }

    req.dbUser = user;
    next();
  } catch (err) {
    console.error(err);
    next(err);
  }
};
