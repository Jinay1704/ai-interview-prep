// Clerk is initialised via @clerk/express which reads
// CLERK_SECRET_KEY from env automatically.
// This file exports a helper to verify webhook signatures.
import { Webhook } from "svix";

export const verifyClerkWebhook = (req) => {
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
  const headers = {
    "svix-id": req.headers["svix-id"],
    "svix-timestamp": req.headers["svix-timestamp"],
    "svix-signature": req.headers["svix-signature"],
  };
  // req.body is raw Buffer when hitting /api/webhooks
  return wh.verify(req.body, headers);
};
