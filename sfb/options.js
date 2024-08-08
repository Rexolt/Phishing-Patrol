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
  
  // Load saved settings
  async function loadSettings() {
    const { customUrls, customLists } = await browser.storage.local.get(['customUrls', 'customLists']);
    document.getElementById('customUrls').value = (customUrls || []).join('\n');
    document.getElementById('customLists').value = (customLists || []).join('\n');
  }
  
  loadSettings();
  