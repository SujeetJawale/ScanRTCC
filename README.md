
# Scanify  
### Smart Invoice Scanning App — Built with React Native + Expo

**Scanify** automates invoice scanning, data extraction, and record management for vendors, supervisors, and accountants.  
By combining OCR technology, smart parsing, and offline capabilities, Scanify transforms tedious manual invoice work into a one-click digital workflow.

---

## 🚀 Inspiration

While working as a supervisor handling daily vendor invoices, I often had to manually enter vendor names, totals, and dates — then scan, email, and archive each document.  
**Scanify** was built to simplify that repetitive process.  
It allows users to capture invoices via camera, automatically extract key details, and organize them into searchable digital records.

---

## 💡 What It Does

**Scanify** streamlines invoice management in three key steps:

1. 📸 **Smart Scan**  
   - Capture one or multiple invoice pages using your mobile camera.  
   - Images are auto-enhanced for optimal OCR readability.

2. 🧠 **AI-Powered OCR Extraction**  
   - Extracts vendor name, invoice number, date, and total using OCR + regex parsing.  
   - Alerts users if any field needs manual input or correction.

3. 💾 **Auto Organization & Export**  
   - Generates a polished PDF for each invoice.  
   - Creates a daily Excel summary sheet automatically.  
   - Emails all files directly to the manager.

---

## 🛠️ How We Built It

**Tech Stack**

- **Frontend**: React Native (Expo)
- **Camera & Filesystem**: Expo Camera, Expo FileSystem, Expo Print
- **OCR**: OCR.Space API + Custom Regex Parsing
- **Storage**: AsyncStorage (local persistence)
- **UI Components**: React Native, Tailwind-style custom styles
- **Animations**: Framer Motion (Moti)
- **PDF/Excel**: Expo Print + SheetJS (for XLSX export)

**Architecture**

1. React Native app built with Expo Router for navigation.  
2. Each scanned page is processed individually, OCR’d, and merged into one PDF.  
3. Parsed text is normalized using intelligent regex (for vendor, total, and date).  
4. Data stored locally in AsyncStorage and available offline.  
5. Summary and History pages show all saved invoices, allow edit/delete, and export to email.

---

## ⚙️ Features

- 📄 Multi-page invoice scanning  
- 🧠 Smart OCR text recognition (auto-parsing vendor/date/total)  
- 🚫 Duplicate invoice number detection  
- 🏷️ Auto vendor dropdown (remembers last 5 vendors)  
- 💌 One-tap email export (PDF + Excel)  
- 🔄 Re-run OCR manually if extraction fails  
- 🌙 Modern responsive UI with clean gradient background  
- 💾 Offline local storage (no backend required)

---

## 🧩 Challenges We Faced

- **OCR Accuracy**: Different invoice formats required extensive regex tuning and fallback logic.  
- **State Persistence**: Preserving form data across multi-page scans without losing progress.  
- **File Handling**: iOS and Android have different filesystem permissions — ensuring safe cross-platform PDF saving was tricky.  
- **UI Responsiveness**: Making the interface clean and consistent across multiple screen sizes.

---

## 🏆 Accomplishments

- Built a fully functional, multi-page OCR invoice scanner app from scratch.  
- Designed an intelligent parsing system that can detect vendor names and totals even from noisy OCR text.  
- Achieved seamless UX — users can scan, review, and export without leaving the app.  
- Created a minimal, modern UI inspired by financial and productivity tools.

---

## 📚 What We Learned

- OCR text normalization and pattern detection are critical for reliable automation.  
- Managing navigation and form state in Expo Router can be done cleanly with async params.  
- Building for both iOS and Android requires careful filesystem and permission handling.  
- Subtle animations and color consistency make the app feel far more professional.

---

## 🔮 What's Next for Scanify

- 🤖 Integrate local OCR using **Tesseract.js** for offline text extraction.  
- ☁️ Add cloud sync via Firebase or Supabase for multi-device access.  
- 📊 Build a web dashboard (PWA) for managers to view uploaded invoices.  
- 🧾 Add receipt categorization and analytics by vendor/date range.  
- ✨ Launch a public beta on Expo Go and Play Store.

---

## 🧱 Built With

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **OCR**: OCR.Space API, Regex-based parsing
- **Storage**: AsyncStorage
- **PDF & Excel**: Expo Print, SheetJS
- **UI & Animations**: React Native, Framer Motion, Expo Linear Gradient

---

## 📸 App Preview

| Home Screen | Review Screen | Summary |
|--------------|---------------|----------|
| <img width="150" height="450" alt="Screenshot 2025-10-28 at 4 52 57 PM" src="https://github.com/user-attachments/assets/0814f15f-31c7-41da-84f2-f45628bbc06d" />| <img width="150" height="450" alt="Screenshot 2025-10-28 at 4 54 14 PM" src="https://github.com/user-attachments/assets/4046ed9b-5b0e-486a-bda9-c9cc7245da2c" />| <img width="150" height="450" alt="Screenshot 2025-10-28 at 4 55 05 PM" src="https://github.com/user-attachments/assets/848251d1-642e-4de4-8b76-40d750ce7bd3" /> |

---

## 🧩 Installation & Run Locally

```bash
# Clone the repo
git clone https://github.com/SujeetJawale/Scanify.git
cd Scanify

# Install dependencies
npm install

# Run in Expo
npx expo start
