// Cookie utility functions
export const setCookie = (name, value) => {
  if (typeof document === "undefined") return;

  const isSecure = window.location.protocol === "https:";
  const secureFlag = isSecure ? ";secure" : "";

  document.cookie = `${name}=${JSON.stringify(
    value
  )};path=/${secureFlag};samesite=strict`;
};

export const getCookie = (name) => {
  if (typeof document === "undefined") return null;

  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return JSON.parse(c.substring(nameEQ.length, c.length));
      } catch (e) {
        console.error("Error parsing cookie:", e);
        return null;
      }
    }
  }
  return null;
};

export const deleteCookie = (name) => {
  if (typeof document === "undefined") return;

  const isSecure = window.location.protocol === "https:";
  const secureFlag = isSecure ? ";secure" : "";

  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/${secureFlag}`;
};
