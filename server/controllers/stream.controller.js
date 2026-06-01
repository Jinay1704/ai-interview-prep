// server/controllers/stream.controller.js
import { StreamClient } from '@stream-io/node-sdk';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getStreamToken = asyncHandler(async (req, res) => {
  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_SECRET_KEY;
  
  if (!apiKey || !apiSecret) {
    return res.status(500).json(ApiResponse.error("Stream keys missing"));
  }

  const client = new StreamClient(apiKey, apiSecret);
  
  const exp = Math.round(new Date().getTime() / 1000) + 60 * 60;
  const issued = Math.floor(Date.now() / 1000) - 60;
  
  const token = client.createToken(req.dbUser.clerkId || req.dbUser._id.toString(), exp, issued);

  res.json(ApiResponse.success({ token }));
});