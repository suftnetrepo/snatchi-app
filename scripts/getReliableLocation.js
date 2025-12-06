import BackgroundGeolocation from "react-native-background-geolocation";
import Geolocation from "@react-native-community/geolocation";

export const getCurrentLocation = async () => {
  console.log("📍 [LOC] getReliableLocation() START ------------------------");

  let finalLocation = null;

  // --- 1) First attempt: BackgroundGeolocation ---
  console.log("📍 [LOC] Attempting BGGeolocation...");
  try {
    const loc = await BackgroundGeolocation.getCurrentPosition({
      timeout: 30,
      persist: true,
      maximumAge: 5000,
      desiredAccuracy: 10,
      samples: 3,
    });

    console.log("🟩 [LOC] BGGeolocation success:", loc);

    finalLocation = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      provider: "background-geolocation",
    };
  } catch (err) {
    console.log("⚠️ [LOC] BGGeolocation failed:", err);
    console.log("➡️ [LOC] Falling back to RN Geolocation...");
  }

  // --- 2) Fallback: RN geolocation if BG fails ---
  if (!finalLocation) {
    finalLocation = await new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          console.log("🟩 [LOC] RN Geolocation success:", position);

          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            provider: "rn-geolocation",
          });
        },
        (error) => {
          console.log("❌ [LOC] RN Geolocation failed:", error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 5000,
        }
      );
    });
  }

  console.log("📌 [LOC] FINAL resolved location:", finalLocation);
  console.log("📍 [LOC] getReliableLocation() END --------------------------");

  return finalLocation;
};
