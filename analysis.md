# Backend Analysis – JN.ai (Hackathon Submission)

## 1️⃣ What the Backend Currently Does

| File | Core Functionality |
|------|--------------------|
| **`process_tmx_opus.py`** | Parses TMX translation‑memory files and creates a flat CSV (`tatoeba_merged.csv`) that pairs English sentences with a target language (Japanese / Hindi). |
| **`embeddings_used.py`** | <ul><li>Loads the CSV (`final.csv`) in 1 000‑row chunks.</li><li>Uses `sentence‑transformers` model **`paraphrase‑multilingual‑MiniLM‑L12‑v2`** to encode every sentence into a 384‑dim vector.</li><li>Normalises the vectors, then clusters them with **DBSCAN** (`eps=0.3, min_samples=2`).</li><li>Writes a CSV (`final_output.csv`) that contains `id`, `text`, and `predicted_group_id` (the duplicate cluster).</li></ul> |
| **`test_embedding.py`** | Loads a pre‑built dataset (`tatoeba_merged.csv`), creates embeddings, then performs ad‑hoc similarity checks (random pairs, same‑group vs different‑group) to give a quick sanity‑check of the model. |

**Bottom line:** the backend already demonstrates the *core idea* – multilingual semantic embeddings + clustering – but it is a **stand‑alone script** with no API, no persistence, and minimal data‑cleaning or evaluation.

---

## 2️⃣ Strengths (What’s Good)

- **Multilingual MiniLM** – works out‑of‑the‑box for > 50 languages.
- **Chunked CSV reading** – avoids loading the whole file into memory.
- **DBSCAN** – density‑based, auto‑detects number of clusters and ignores outliers.
- **Normalization** before clustering – makes Euclidean distance comparable.
- **Simple evaluation script** (`test_embedding.py`).
- **Clear separation** of data ingestion and model pipeline.

---

## 3️⃣ Weaknesses (What Could Fail)

| Issue | Impact |
|-------|--------|
| No API / Service layer | Judges expect a live endpoint. |
| Hard‑coded file names | Limits reusability. |
| No handling of **name** vs **description** fields | Problem statement explicitly asks for both. |
| No language detection / cleaning | Noise reduces embedding quality. |
| Static DBSCAN hyper‑parameters | May under‑ or over‑cluster on different data. |
| No persistence of embeddings | Re‑computes each run → slow. |
| No vector‑search index | Can’t query duplicates in real‑time. |
| No evaluation metrics (precision/recall) | Judges love quantitative proof. |
| No tests / CI | Breaks quickly under pressure. |
| No Docker / reproducible deployment | Hackathon environments need it. |
| DBSCAN scalability ceiling (O(N²)) | Large catalogs will choke. |
| Documentation is thin | Hard for judges/team to use. |

---

## 4️⃣ Immediate Improvements (0‑2 hrs)

1. **CLI arguments** (`argparse`) for all scripts – input, output, model, eps, min‑samples.
2. **Support name & description** – concatenate them or allow separate columns.
3. **Unicode normalisation & basic cleaning** (`unicodedata.normalize('NFKC', txt)`).
4. **Orchestrator script** (`run_pipeline.py`) to chain ingestion → embedding → clustering.
5. **Add simple evaluation** (precision/recall) using the TMX pairs as ground truth.
6. **Expand README** for backend usage and add a `requirements.txt`.
7. **Add unit tests** (`pytest`) for cleaning and TMX parser.

---

## 5️⃣ Mid‑Term Improvements (2‑6 hrs)

- **FastAPI service** exposing `/detect` (POST {name, description}) → duplicate group or `null`.
- **Persist embeddings with FAISS** (or Annoy) and load the index at start‑up for O(1) queries.
- **Dynamic clustering** – switch to **HDBSCAN** or auto‑tune `eps` via k‑distance plot.
- **Threshold parameter** for similarity (e.g., cosine > 0.75) adjustable via query.
- **Dockerfile** for the backend, expose port 8000.
- **Logging** (`loguru`) and robust error handling.
- **Benchmark script** (time to embed 10k rows, API latency). Include results in README.

---

## 6️⃣ Wow‑Factor Enhancements (6‑12 hrs)

- **Hybrid architecture**: FAISS for fast NN look‑up + DBSCAN for offline grouping.
- **Incremental updates** (`/add` endpoint) that updates the FAISS index and re‑clusters locally.
- **Explainability endpoint** (`/explain`) returning top‑5 similar records with scores.
- **Language‑specific models** (optional) for higher accuracy on low‑resource languages.
- **GPU acceleration** (ONNX/torch) for massive datasets.
- **CI pipeline (GitHub Actions)** running tests, lint, and building the Docker image.
- **Demo video / GIF** of uploading a CSV and visualising duplicate groups.

---

## 7️⃣ Suggested Architecture (text diagram)

```
┌───────────────────────────────┐
│   Data Ingestion (process_tmx)  │
│   • TMX → CSV (name, description)│
└─────────────▲─────────────────────┘
              │
   (clean + normalize)
              │
┌─────────────▼─────────────────────┐
│   Embedding Service (Sentence‑Transformer) │
│   • Batch encode → embeddings (384‑d)     │
│   • Store in FAISS index (disk‑persisted)│
└─────────────▲─────────────────────┘
              │
   (optional) │  DBSCAN / HDBSCAN clustering
              │   → group_id per record
              ▼
┌───────────────────────────────┐
│   FastAPI Backend               │
│   • /detect  (POST) → nearest‑N search + similarity threshold │
│   • /add     (POST) → incremental update                    │
│   • /explain (GET) → top‑k matches                        │
└───────▲───────────────────────┘
        │
        ▼
   Frontend (React)
   • Calls /detect on each upload
   • Shows duplicate groups with glass‑morphic cards
```

---

## 8️⃣ Evaluation Metrics to Show Judges

| Metric | How to compute |
|--------|----------------|
| **Precision** | `TP / (TP + FP)` using known TMX alignments as ground truth. |
| **Recall** | `TP / (TP + FN)` same ground truth. |
| **F1‑Score** | Harmonic mean of precision & recall. |
| **Latency** | Avg response time of `/detect` (target < 150 ms). |
| **Scalability** | Time to embed 100 k records + FAISS index size. |
| **Memory** | Peak RAM during embedding (aim < 2 GB). |
| **User Experience** | Screenshot / GIF of UI highlighting duplicate groups after CSV upload. |

Include a small table with these numbers in the README once you run the benchmark.

---

## 9️⃣ Checklist to Win the Hackathon

| ✅ Item | Status |
|--------|--------|
| Clear problem statement in README (duplicate detection on name/description). | ✗ (add) |
| One‑click run (`docker compose up` or `npm run dev && python run_pipeline.py`). | ✗ (add) |
| Live API (`/detect`) callable from the React app. | ✗ (add) |
| Fast inference (< 200 ms) – demonstrated with benchmark. | ✗ (add) |
| Quantitative evaluation (precision/recall/F1) on multilingual dataset. | ✗ (add) |
| Explainability – show why two records are duplicates. | ✗ (add) |
| Robust data cleaning (unicode, punctuation). | ✗ (add) |
| Modular code (`ingest.py`, `embed.py`, `cluster.py`, `api.py`). | ✗ (refactor) |
| Unit tests + CI (GitHub Actions). | ✗ (add) |
| Dockerized backend. | ✗ (add) |
| Polished UI (already done). | ✓ |
| Documentation (setup, API spec, demo GIF). | ✗ (add) |
| Scalable design (FAISS + incremental updates). | ✗ (add) |
| Nice‑to‑have: language‑specific model, GPU acceleration, demo video. | ✗ (optional) |

---

## 10️⃣ Quick “Starter” Implementation (What to Do Right Now)

```bash
# 1. Create virtualenv
python -m venv .venv && source .venv/bin/activate

# 2. Install deps
pip install -r requirements.txt   # sentence‑transformers, fastapi, uvicorn, faiss-cpu, pandas, numpy, loguru, python‑levenshtein

# 3. Run the full pipeline (example)
python run_pipeline.py \
    --input data/tatoeba_merged.csv \
    --output results/ \
    --model paraphrase-multilingual-MiniLM-L12-v2 \
    --eps 0.3 --min-samples 2

# 4. Start the API (after embeddings are saved)
uvicorn api:app --host 0.0.0.0 --port 8000
```

**`run_pipeline.py`** (pseudo‑code) – orchestrates cleaning, embedding, clustering, FAISS persistence.
**`api.py`** – FastAPI with `/detect`, `/add`, `/explain` endpoints.

Running these steps gives you a **single command** to spin up a live backend that the React frontend can call.

---

## 📌 TL;DR
- You have the **core ML idea** already.
- Turn the scripts into a **service** (FastAPI + FAISS) and add **evaluation & documentation**.
- Follow the immediate‑mid‑term‑wow roadmap above; each tier adds a clear point boost for judges.
- Ship a Docker image with a one‑click `docker compose up` and you’ll have a **complete, reproducible, production‑grade demo** – exactly what the hackathon judges love.

Good luck – you’re now ready to turn JN.ai into a **show‑stopper**! 🚀