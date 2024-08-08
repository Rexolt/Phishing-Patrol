# Phishing-Patrol Phishing Protection Browser Extension


The Phishing Protection Browser Extension is designed to safeguard users from accessing malicious and phishing websites. It leverages multiple sources to detect potentially harmful URLs and blocks them effectively to ensure safe browsing.

## Features

- **Real-time URL Blocking:** Automatically blocks access to known malicious and phishing URLs to protect users.
- **Custom URL Lists:** Users can add their own URLs to the blocklist for enhanced protection.
- **Regular Updates:** The extension updates its database of malicious URLs every 24 hours using data from trusted sources.
- **Informative Blocking Page:** Provides users with a detailed warning and information when a page is blocked.
- **Optimized Performance:** Implements efficient data structures to minimize the impact on browsing speed.

## Sources Used

The extension utilizes several trusted sources for identifying malicious URLs:

- [URLhaus](https://urlhaus.abuse.ch/downloads/text/)
- [OpenPhish](https://openphish.com/feed.txt)
- [Malware Domain List](http://www.malwaredomainlist.com/hostslist/hosts.txt)
- [NoThink Malware List](http://www.nothink.org/blacklist/blacklist_malware_http.txt)
- [MVPS Hosts](http://winhelp2002.mvps.org/hosts.txt)
- [BlockList.de](https://www.blocklist.de/downloads/phishing.txt)
- [Cybercrime Tracker](https://cybercrime-tracker.net/all.php)

## Settings

- **Add Custom URLs:** Users can manually input URLs to be blocked by the extension.
- **Add Additional Lists:** Users can specify additional URL list sources within the extension settings.


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING](CONTRIBUTING.md) document for guidelines on how to get involved.

## Acknowledgments

- This extension is inspired by community efforts to enhance browser security and protect users from online threats.
