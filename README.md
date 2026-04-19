# 🌌 JN.ai — Multilingual Semantic Deduplication

## ✨ Overview
**JN.ai** is a state-of-the-art semantic deduplication engine designed to identify duplicate records across **50+ languages**. Unlike traditional exact-match systems, JN.ai understands the *meaning* of text, allowing it to detect that "Hello World" (English) and "مرحباً بالعالم" (Arabic) refer to the same concept.

Wrapped in a **Zen-Light premium interface**, JN.ai combines high-performance 3D visuals with heavy-duty machine learning.

---

## 🚀 Key Features

- **🌐 Cross-Lingual Detection**: Seamlessly identifies duplicates between different languages (e.g., Arabic, Russian, Japanese, English).
- **🧠 Semantic Understanding**: Uses transformer-based embeddings to understand context, not just characters.
- **✨ Premium UI/UX**: 
  - **Interactive Particle Background**: OGL-powered 3D particles that react to your cursor.
  - **Glassmorphic Design**: Modern, translucent components for a clean, professional feel.
  - **Fluid Animations**: Powered by Framer Motion for smooth state transitions.
- **⚡ High Performance**: Efficient clustering using DBSCAN for large-scale datasets.

---

## 🛠️ Technology Stack

### **Frontend**
- **React 19** + **TypeScript**
- **Vite** (Fast Build Tool)
- **Tailwind CSS** (Styling)
- **OGL** (High-performance WebGL library for particles)
- **Framer Motion** (Animations)

### **Backend (Data Science Pipeline)**
- **Sentence Transformers**: `paraphrase-multilingual-MiniLM-L12-v2`
- **Scikit-Learn**: DBSCAN clustering algorithm
- **Pandas & NumPy**: Efficient data manipulation
- **XML/TMX Processing**: Industry-standard translation memory support

---

## 📂 Project Structure

```bash
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # UI Components (Particles, Comparison Engine, etc.)
│   │   └── App.tsx         # Main application logic
├── backend/                # ML Pipeline & Scripts
│   ├── embeddings_used.py  # Core clustering logic
│   ├── test_embedding.py   # Model validation scripts
│   └── input/              # TMX processing scripts
├── assets/                 # Brand assets and mockups
└── README.md               # This masterpiece
```

---

## ⚙️ Installation & Setup

### **Frontend**
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### **Backend (Python)**
1. Ensure you have Python 3.9+ installed.
2. Install the required ML libraries:
   ```bash
   pip install pandas numpy sentence-transformers scikit-learn
   ```
3. Run the clustering pipeline:
   ```bash
   python backend/embeddings_used.py
   ```

---

## 📈 Roadmap
- [ ] Live API connection between React and Python (FastAPI).
- [ ] Support for direct Excel/CSV uploads with real-time processing.
- [ ] Exportable "Conflict Resolution" reports.
- [ ] Custom similarity threshold sliders in the UI.

---

<div align="center">
  <p>Built with ❤️ for global data integrity.</p>
  <p><b>JN.ai</b> — <i>Breaking language barriers in data deduplication.</i></p>
</div>
