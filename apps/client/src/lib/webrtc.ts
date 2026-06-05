import { ICE_SERVERS } from "./constants";

export const createPeerConnection =
  () => {
    const peer =
      new RTCPeerConnection(
        ICE_SERVERS
      );

    console.log(
      "Peer Connection Created"
    );

    return peer;
  };