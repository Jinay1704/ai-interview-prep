import { verifyClerkWebhook } from "../config/clerk.js";
import { syncUser } from "./user.controller.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const handleClerkWebhook = async (req, res) => {
  try {
    const event = verifyClerkWebhook(req);
    const { type, data } = event;

    switch (type) {
      case "user.created":
      case "user.updated": {
        const email = data.email_addresses?.[0]?.email_address ?? "";
        await syncUser({
          clerkId: data.id,
          email,
          firstName: data.first_name ?? "",
          lastName: data.last_name ?? "",
          imageUrl: data.image_url ?? "",
        });
        break;
      }

      case "user.deleted": {
        await User.findOneAndDelete({ clerkId: data.id });
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    res.status(200).json(ApiResponse.success(null, "Webhook processed"));
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).json(ApiResponse.error("Invalid webhook signature"));
  }
};
