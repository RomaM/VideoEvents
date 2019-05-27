const deviceInfo = () => {
  const userAgent = navigator.userAgent;
  let result = {};

  // Result: Device Name
  if( userAgent.match(/Android/i)) result.name = 'Android';
  else if (userAgent.match(/webOS/i)) result.name = 'webOS';
  else if (userAgent.match(/iPhone/i)) result.name = 'iPhone';
  else if (userAgent.match(/iPad/i)) result.name = 'iPad';
  else if (userAgent.match(/iPod/i)) result.name = 'iPod';
  else if (userAgent.match(/BlackBerry/i)) result.name = 'BlackBerry';
  else if (userAgent.match(/Windows Phone/i)) result.name = 'WindowsPhone';
  else result.name = 'Desktop';

  // Result: Device Browser
  if (userAgent.indexOf("Firefox") > -1) result.browser = "Firefox";
  else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) result.browser = "Opera";
  else if (userAgent.indexOf("Trident") > -1) result.browser = "IE";
  else if (userAgent.indexOf("Edge") > -1) result.browser = "Edge";
  else if (userAgent.indexOf("Chrome") > -1) result.browser = "Chrome";
  else if (userAgent.indexOf("Safari") > -1) result.browser = "Safari";
  else result.browser = "unknown";

  // Result: Device Orientation
  if (window.matchMedia("(orientation: portrait)").matches) result.orientation = 'portrait';
  else if (window.matchMedia("(orientation: landscape)").matches) result.orientation = 'landscape';
  else result.orientation = 'unknown';

  return result;
};

export default deviceInfo;