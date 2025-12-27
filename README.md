# 💀 Dead Man's Switch
> *A decentralized, cryptographic legacy protocol that ensures your critical data is transferred to a trustee if you become inactive.*

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://dead-mans-switch-eight.vercel.app/)
[![Backend Status](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://dead-mans-switch-9smm.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## 📖 Overview

**Dead Man's Switch** is a secure, automated fail-safe system designed to handle digital assets or sensitive information in the event of the owner's unavailability.

Unlike traditional methods that rely on trusting a third party with your data *now*, this application uses **Zero-Knowledge Architecture**. Your files are encrypted **locally** in your browser using AES-256 before they ever touch the server. The server holds the file, but *you* hold the key. The key is only released to your designated trustee when the inactivity timer expires.

## ✨ Key Features

* **🔒 Zero-Knowledge Encryption:** Files are encrypted client-side using **AES-256**. The server never sees the plaintext file or the decryption key.
* **⏱️ Automated Heartbeat Monitor:** A background Cron job constantly monitors user activity.
* **📨 Secure Trigger System:** If the user fails to "check-in" within the set interval (e.g., 30 seconds, 1 month), the system automatically triggers the release protocol.
* **🔥 Self-Destruct Mechanism:** Once the assets are transferred, the vault is securely wiped from the database.
* **🛡️ Firewall-Resistant Notifications:** Uses **EmailJS** API integration to bypass standard SMTP port blocks on cloud environments, ensuring 100% delivery reliability.

## 🛠️ Tech Stack

### Frontend (Client)
* **React.js (Vite):** Fast, reactive UI for vault management.
* **TailwindCSS:** Modern, responsive styling.
* **Crypto-JS:** Client-side encryption standards.
* **Axios:** Secure HTTP requests.
* **Deployment:** Vercel.

### Backend (Server)
* **Node.js & Express:** Robust REST API handling vault creation and status checks.
* **MongoDB (Mongoose):** NoSQL database for storing encrypted blobs and user metadata.
* **Node-Cron:** Precision task scheduling for inactivity checks.
* **EmailJS API:** Robust notification delivery system.
* **Deployment:** Render.

## ⚙️ How It Works

1.  **Setup:** The user uploads a file and sets a timer (e.g., "30 Days").
2.  **Encryption:** The browser generates a unique key, encrypts the file, and sends *only* the encrypted blob to the server.
3.  **Check-In:** The user visits the site periodically to reset the timer.
4.  **Trigger:** If the timer expires (User is "Gone"):
    * The server detects the inactivity.
    * An email is fired to the **Trustee** containing a unique "Claim Link".
    * The Trustee clicks the link to download and locally decrypt the asset.
    * The database entry is permanently deleted.

## 🚀 Getting Started (Local Setup)

To run this project locally on your machine:

### Prerequisites
* Node.js (v18+)
* MongoDB Account (Atlas)

### 1. Clone the Repository
```bash
git clone [https://github.com/Siddharth-singh2111/dead-mans-switch.git](https://github.com/Siddharth-singh2111/dead-mans-switch.git)
cd dead-mans-switch


cd server
npm install

Create a .env file in the server folder:
MONGO_URI=your_mongodb_connection_string
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key
PORT=5000

node server.js

cd client
npm install
npm run dev

<img width="1134" height="902" alt="image" src="https://github.com/user-attachments/assets/ff33b7d4-968c-4a58-b7f9-c5513af96d2b" />

<img width="787" height="790" alt="image" src="https://github.com/user-attachments/assets/12ab24cb-c32c-4f36-af7e-67cfdf8bb18e" />

🤝 Contributing
Contributions are welcome! Please fork this repository and submit a pull request for any features or bug fixes.

📄 License
This project is open-source and available under the MIT License.

👨‍💻 Author
Siddharth Singh


