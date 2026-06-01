import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { 
  StreamVideo, 
  StreamVideoClient, 
  StreamCall, 
  SpeakerLayout, 
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import api from "@/services/api"; 

export default function LiveVideoCall({ callId }) {
  const { user } = useUser();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    let streamClient;
    
    const initStream = async () => {
      try {
        const { data } = await api.get("/stream/token");
        
        streamClient = new StreamVideoClient({
          apiKey: import.meta.env.VITE_STREAM_API_KEY,
          user: { 
            id: user.id, 
            name: user.fullName || "User", 
            image: user.imageUrl 
          },
          token: data.data.token,
        });

        const streamCall = streamClient.call("default", callId);
        await streamCall.join({ create: true });

        // FIX: Force Camera ON, but Microphone OFF to avoid conflict with Hume AI
        try {
          await streamCall.camera.enable();
          await streamCall.microphone.disable();
        } catch (mediaErr) {
          console.error("Media device error:", mediaErr);
        }

        setClient(streamClient);
        setCall(streamCall);
      } catch (error) {
        console.error("Failed to initialize Stream", error);
      }
    };
    
    initStream();

    return () => {
      if (call) call.leave();
      if (streamClient) streamClient.disconnectUser();
    };
  }, [user, callId]);

  if (!client || !call) {
    return <div className="flex items-center justify-center h-full text-stone-400">Connecting to live server...</div>;
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        {/* Enlarged Video Container */}
        <div className="w-full h-full min-h-[350px] rounded-xl overflow-hidden bg-stone-950 border border-white/10 relative shadow-md">
          <SpeakerLayout />
          
          {/* CallControls automatically includes the Screen Share (Monitor) button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-90 hover:opacity-100 transition-opacity">
            <CallControls />
          </div>
        </div>
      </StreamCall>
    </StreamVideo>
  );
}