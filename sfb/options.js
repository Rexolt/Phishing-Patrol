document.getElementById('saveUrls').addEventListener('click', async () => {
  const urls = document.getElementById('customUrls').value.split('\n').map(url => url.trim()).filter(url => url);
  await browser.storage.local.set({ customUrls: urls });
  alert('Custom URLs saved!');
});

document.getElementById('saveLists').addEventListener('click', async () => {
  const lists = document.getElementById('customLists').value.split('\n').map(url => url.trim()).filter(url => url);
  await browser.storage.local.set({ customLists: lists });
  alert('Custom Lists saved!');
});

document.getElementById('saveSecuritySettings').addEventListener('click', async () => {
  const encryptionEnabled = document.getElementById('encryptionEnabled').checked;
  const integrityCheckEnabled = document.getElementById('integrityCheckEnabled').checked;
  await browser.storage.local.set({ encryptionEnabled, integrityCheckEnabled });
  alert('Security settings saved!');
});

// Load saved settings
async function loadSettings() {
  const { customUrls, customLists, encryptionEnabled, integrityCheckEnabled } = await browser.storage.local.get(['customUrls', 'customLists', 'encryptionEnabled', 'integrityCheckEnabled']);
  document.getElementById('customUrls').value = (customUrls || []).join('\n');
  document.getElementById('customLists').value = (customLists || []).join('\n');
  document.getElementById('encryptionEnabled').checked = encryptionEnabled || false;
  document.getElementById('integrityCheckEnabled').checked = integrityCheckEnabled || false;
}

document.getElementById('saveWhitelistUrls').addEventListener('click', async () => {
  const urls = document.getElementById('whitelistUrls').value.split('\n').map(url => url.trim()).filter(url => url);
  await browser.storage.local.set({ storedWhitelistUrls: urls });
  alert('Whitelist URLs saved!');
});

async function loadSettings() {
  const { customUrls, customLists, storedWhitelistUrls, integrityCheckEnabled } = await browser.storage.local.get(['customUrls', 'customLists', 'storedWhitelistUrls', 'integrityCheckEnabled']);
  document.getElementById('customUrls').value = (customUrls || []).join('\n');
  document.getElementById('customLists').value = (customLists || []).join('\n');
  document.getElementById('whitelistUrls').value = (storedWhitelistUrls || []).join('\n');
  document.getElementById('integrityCheckEnabled').checked = integrityCheckEnabled || false;
}

  document.getElementById('saveSafeMode').addEventListener('click', async () => {
  const safeMode = document.getElementById('safeModeEnabled').checked;
  await browser.storage.local.set({ safeMode });
  alert('Safe Mode setting saved!');
});

document.getElementById('saveLoggingSettings').addEventListener('click', async () => {
  const detailedLogging = document.getElementById('detailedLoggingEnabled').checked;
  await browser.storage.local.set({ detailedLogging });
  alert('Logging setting saved!');
});






loadSettings();
