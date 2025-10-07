export const formatLocation = (location) => {
  if (!location) {
    return "N/A";
  }

  if (typeof location === "string") {
    return location;
  }

  if (typeof location === "object" && location !== null) {
    if (location.latitude != null && location.longitude != null) {
      return `${location.latitude}, ${location.longitude}`;
    }
    return JSON.stringify(location);
  }

  return "N/A";
};
