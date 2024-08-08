// Store the malicious URLs in a Set for fast lookup
let allMaliciousUrls = new Set();

// Load the list of malicious URLs from local storage
async function loadMaliciousUrls() {
  const { maliciousUrls, customUrls } = await browser.storage.local.get(['maliciousUrls', 'customUrls']);
  allMaliciousUrls = new Set([...(maliciousUrls || []), ...(customUrls || [])]);
}

// Check if a specific URL is in the list of malicious URLs
function isMaliciousUrl(url) {
  return allMaliciousUrls.has(url);
}

// Block requests to malicious URLs
browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (isMaliciousUrl(details.url)) {
      console.log(`Blocked attempt to visit: ${details.url}`);
      const blockedUrl = encodeURIComponent(details.url);
      return { redirectUrl: browser.runtime.getURL(`blocked.html?url=${blockedUrl}`) };
    }
    return { cancel: false };
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Update the database of malicious URLs
async function updateMaliciousUrls() {
  const defaultUrls = [
    "https://urlhaus.abuse.ch/downloads/text/",
    "https://openphish.com/feed.txt",
    "http://www.malwaredomainlist.com/hostslist/hosts.txt",
    "http://www.nothink.org/blacklist/blacklist_malware_http.txt",
    "http://winhelp2002.mvps.org/hosts.txt",
    "https://www.blocklist.de/downloads/phishing.txt",
    "https://cybercrime-tracker.net/all.php"
  ];

  const { customLists } = await browser.storage.local.get('customLists');
  const urls = [...defaultUrls, ...(customLists || [])];

  let newMaliciousUrls = new Set();

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const text = await response.text();
      const lines = text.split("\n");

      for (const line of lines) {
        if (line && !line.startsWith("#")) {
          const trimmedLine = line.trim();
          
          // Check if the line is in hosts file format and extract the domain
          const parts = trimmedLine.split(/\s+/);
          if (parts.length > 1 && (parts[0] === "0.0.0.0" || parts[0] === "127.0.0.1")) {
            const domain = parts[1];
            if (domain) {
              newMaliciousUrls.add(`http://${domain}`);
              newMaliciousUrls.add(`https://${domain}`);
            }
          } else {
            // If it's a regular URL, get the hostname
            try {
              const urlObject = new URL(trimmedLine);
              newMaliciousUrls.add(urlObject.href);
            } catch (e) {
              console.error(`Invalid line format: ${line}`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to update from ${url}:`, error);
    }
  }

  browser.storage.local.set({ maliciousUrls: Array.from(newMaliciousUrls) });
  allMaliciousUrls = newMaliciousUrls;
  console.log("Malicious URLs updated successfully.");
}

// Initial loading of malicious URLs
loadMaliciousUrls();

// Schedule updates every 24 hours
setInterval(updateMaliciousUrls, 24 * 60 * 60 * 1000);
