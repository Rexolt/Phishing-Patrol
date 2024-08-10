// Globális változók
let whitelistUrls = new Set();
let safeModeEnabled = false;
let detailedLoggingEnabled = false;
let allMaliciousUrls = new Set();
const honeypotUrls = new Set([
    "http://nonexistent-malicious-site-1234567890.com",
    "https://fake-malware-site-0987654321.org"
]);

// Funkciók az adatok betöltésére
async function loadWhitelistUrls() {
    const { storedWhitelistUrls } = await browser.storage.local.get('storedWhitelistUrls');
    whitelistUrls = new Set(storedWhitelistUrls || []);
}

async function loadSafeMode() {
    const { safeMode } = await browser.storage.local.get('safeMode');
    safeModeEnabled = safeMode || false;
}

async function loadLoggingSetting() {
    const { detailedLogging } = await browser.storage.local.get('detailedLogging');
    detailedLoggingEnabled = detailedLogging || false;
}

async function loadMaliciousUrls() {
    const { storedMaliciousUrls, storedCustomUrls } = await browser.storage.local.get(['storedMaliciousUrls', 'storedCustomUrls']);
    allMaliciousUrls = new Set([...(storedMaliciousUrls || []), ...(storedCustomUrls || []), ...honeypotUrls]);
}

async function initialize() {
    await loadWhitelistUrls();
    await loadSafeMode();
    await loadLoggingSetting();
    await loadMaliciousUrls();
}

// Gyanús URL-ek azonosítása
function isSuspiciousUrl(url) {
    const suspiciousKeywords = ["free", "bonus", "win", "prize"];
    return suspiciousKeywords.some(keyword => url.includes(keyword));
}

// Blokkolási logika
function isWhitelistedUrl(url) {
    return whitelistUrls.has(url);
}

function isMaliciousUrl(url) {
    return allMaliciousUrls.has(url);
}

// Blokkolási logika eseménykezelője
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        if (detailedLoggingEnabled) {
            console.log(`Request details: ${JSON.stringify(details)}`);
        }

        const url = details.url;

        if (isWhitelistedUrl(url)) {
            console.log(`Whitelisted URL allowed: ${url}`);
            return { cancel: false };
        }

        if (isMaliciousUrl(url) || (safeModeEnabled && isSuspiciousUrl(url))) {
            if (honeypotUrls.has(url)) {
                console.warn(`Honeypot URL accessed: ${url}`);
            } else {
                console.log(`Blocked attempt to visit: ${url}`);
            }
            const blockedUrl = encodeURIComponent(url);
            return { redirectUrl: browser.runtime.getURL(`blocked.html?url=${blockedUrl}`) };
        }

        return { cancel: false };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// Frissítési funkció
async function updateMaliciousUrls() {
    const { integrityCheckEnabled } = await browser.storage.local.get('integrityCheckEnabled');

    const defaultUrls = [
        "https://urlhaus.abuse.ch/downloads/text/",
        "https://openphish.com/feed.txt",
        "https://www.malwaredomainlist.com/hostslist/hosts.txt",
        "https://www.nothink.org/blacklist/blacklist_malware_http.txt",
        "https://winhelp2002.mvps.org/hosts.txt",
        "https://www.blocklist.de/downloads/phishing.txt",
        "https://cybercrime-tracker.net/all.php"
    ];

    const { customLists } = await browser.storage.local.get('customLists');
    const urls = [...defaultUrls, ...(customLists || [])].filter(url => url.startsWith('https://'));

    let newMaliciousUrls = new Set();

    for (const url of urls) {
        try {
            const response = await fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit' });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const text = await response.text();

            if (integrityCheckEnabled) {
                const fetchedHash = computeHash(text);
                const previousHash = await browser.storage.local.get(`hash_${url}`);
                if (previousHash[`hash_${url}`] === fetchedHash) {
                    console.log(`No changes detected in the list from: ${url}`);
                    continue;
                }
                await browser.storage.local.set({ [`hash_${url}`]: fetchedHash });
            }

            const lines = text.split("\n");

            for (const line of lines) {
                if (line && !line.startsWith("#")) {
                    const trimmedLine = line.trim();

                    const parts = trimmedLine.split(/\s+/);
                    if (parts.length > 1 && (parts[0] === "0.0.0.0" || parts[0] === "127.0.0.1")) {
                        const domain = parts[1];
                        if (domain) {
                            newMaliciousUrls.add(`http://${domain}`);
                            newMaliciousUrls.add(`https://${domain}`);
                        }
                    } else {
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

    // Include honeypot URLs in the stored list
    browser.storage.local.set({
        storedMaliciousUrls: Array.from(newMaliciousUrls),
    });
    allMaliciousUrls = new Set([...newMaliciousUrls, ...honeypotUrls]);
    console.log("Malicious URLs updated successfully.");
}

// Inicializálás és frissítési ütemezés
initialize().then(() => {
    setInterval(updateMaliciousUrls, 24 * 60 * 60 * 1000);
});
