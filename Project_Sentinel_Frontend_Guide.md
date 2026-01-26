# Project Sentinel - Frontend Guide

The frontend for Project Sentinel has been built to match your designs exactly, using **React (Vite)** and **Vanilla CSS** for precise styling control.

## 🚀 Running the App

The development server is currently running. You can access the dashboard at:
**[http://localhost:5173/](http://localhost:5173/)**

If you need to restart it later:
```bash
cd frontend
npm install
npm run dev
```

## 🖥️ Screens Implemented

We have implemented all 5 screens from your design mockups:

1.  **Risk Summary (Executive Dashboard)**
    *   **URL**: [`/risk-summary`](http://localhost:5173/risk-summary)
    *   **Design**: Matches Image 1. Includes Executive Insight card, Stats (High/Medium/Low), Risk Trend Chart, and Projected Impact.

2.  **Remediation Plan**
    *   **URL**: [`/remediation`](http://localhost:5173/remediation)
    *   **Design**: Matches Image 2. Features "Quick Wins" (Green), "High Impact" (Red) with code diffs, and "Long-term Hardening".

3.  **Threat Modeling (Active Scan)**
    *   **URL**: [`/threat-modeling`](http://localhost:5173/threat-modeling)
    *   **Design**: Matches Image 3. Two-column layout with findings list on the left and detailed analysis (Code + Agent reasoning) on the right.

4.  **Security Review**
    *   **URL**: [`/security-review`](http://localhost:5173/security-review)
    *   **Design**: Matches Image 5. Data table of findings with status indicators and a detailed analysis pane below.

5.  **Add Artifact (Input)**
    *   **URL**: [`/add-artifact`](http://localhost:5173/add-artifact)
    *   **Design**: Matches Image 4. Dark input forms for Architecture, Code, Logs, and Logic.

## 🎨 Tech Stack & Styling

-   **Framework**: React 19 + Vite
-   **Styling**: Vanilla CSS with CSS Variables (`src/index.css`) for consistent Dark Mode theming.
-   **Icons**: `lucide-react` (Clean, modern icons matching the mockup).
-   **Charts**: `recharts` for the Risk Trend graph.

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── layout/      # Sidebar and Main Layout
│   ├── pages/
│   │   ├── RiskSummary.jsx    # Executive Dashboard
│   │   ├── Remediation.jsx    # Remediation Plan
│   │   ├── ThreatModeling.jsx # Active Scan / Threat Model
│   │   ├── SecurityReview.jsx # detailed Review Table
│   │   └── ArtifactInput.jsx  # Add Artifact Screen
│   ├── App.jsx          # Routing
│   └── index.css        # Global Variables (Colors, Fonts)
```
