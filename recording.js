const {
  EgressClient,
  EncodedFileOutput,
  RoomServiceClient,
  SegmentedFileOutput,
  EncodingOptionsPreset,
} = require("livekit-server-sdk");
const path = require("path");


const LIVEKIT_HOST = "";
const LIVEKIT_API_KEY = "";
const LIVEKIT_SECRET = "";

const AWS_KEY = "";
const AWS_SECRET = "";
// const BUCKET_NAME = "arn:aws:s3:::rahul-bigstt";
const BUCKET_NAME = "";

const egressClient = new EgressClient(
  LIVEKIT_HOST,
  LIVEKIT_API_KEY,
  LIVEKIT_SECRET
);
const roomService = new RoomServiceClient(
  LIVEKIT_HOST,
  LIVEKIT_API_KEY,
  LIVEKIT_SECRET
);
const ACTIVE_STATUSES = [0, 1,2,3]; // Starting, Active, Ending, Complete,

async function getActiveEgresses(roomName) {
  const egressList = await egressClient.listEgress(roomName);

  return egressList.filter((item) => ACTIVE_STATUSES.includes(item.status));
}

async function startRecording(roomName, duration = 60 * 60) {
  try {
    // const activeRecordings = await getActiveEgresses(roomName);
    // if (activeRecordings.length > 0) {
    //   console.log(
    //     "Active recording found, not starting a new one",
    //     activeRecordings[0].result
    //   );
    //   return {};
    // }
    const outputs = {
      segments: new SegmentedFileOutput({
        filenamePrefix: roomName + "-" + Date.now(),
        playlistName: roomName + ".m3u8",
        livePlaylistName: roomName + "-live.m3u8",
        segmentDuration: duration,
        output: {
          case: "s3",
          value: {
            accessKey: AWS_KEY,
            secret: AWS_SECRET,
            bucket: BUCKET_NAME,
            region: "us-east-1",
          },
        },
      }),
    };

    const activeRecordings =await getActiveEgresses(roomName);
    if (activeRecordings.length > 0) {
      return {
        message: "Recording already started",
        data: activeRecordings[0].result,
      };
    }
      
    const result = await egressClient.startRoomCompositeEgress(
      roomName,
      outputs,
      {
        layout: "speaker",
        // customBaseUrl: li,
        encodingOptions: EncodingOptionsPreset.H264_1080P_30,
        audioOnly: true,
      }
    );
    return {
      message: "Recording started successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error starting recording:", error);
    return {
      message: "Error starting recording",
      data: error,
    };
  }
}

async function stopRecording(egressId) {
  try {
    const result = await egressClient.stopEgress(egressId);
    return {
      message: "Recording stopped successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error stopping recording:", error);
    return {
      message: "Error stopping recording",
      data: error,
    };
  }
}

module.exports = { startRecording, stopRecording };
// EG_Nxb7Wu6Uquss
