# Project Sentinel - Frontend Implementation Plan

## Overview
This task involves building a high-fidelity frontend for "Project Sentinel", a Multi-Agent AI Security Dashboard. The goal is to match the provided designs exactly using React and Vanilla CSS.

## Structure
- **Framework**: React (Vite)
- **Styling**: Vanilla CSS (using CSS variables for theming to ensure consistency)
- **Routing**: React Router DOM
- **Icons**: Lucide React (standard, clean icons matching the design)

## Design System (Inferred)
- **Theme**: Dark Mode (Cyberpunk/SecOps style)
- **Colors**:
    - Baground: `#0B1015` (Deep dark blue/black)
    - Surface/Card: `#151A21`
    - Primary Accent: `#22D3EE` (Cyan/Light Blue)
    - Risk High: `#EF4444` (Red)
    - Risk Medium: `#F59E0B` (Orange)
    - Risk Low: `#10B981` (Green)
- **Typography**: Inter (Google Fonts)

## Components
1.  **Layout**: Sidebar (Navigation), Main Content Area.
2.  **Dashboard/Risk Summary**:
    - Executive Insight Card
    - Severity Counter Cards
    - Risk Trend Chart (Mocked with simple SVG or CSS)
    - Projected Impact Card
3.  **Remediation**:
    - Quick Wins / High Impact / Hardening Sections
    - Vulnerability Card with Code Diff highlight
4.  **Threat Modeling**:
    - Two-column layout (List + Detail)
    - Code Viewer component
5.  **Security Review**:
    - Data Table for findings
    - Detail view
6.  **Input/Artifacts**:
    - Multi-section form for inputs

## Step-by-Step Implementation
1.  **Setup**: Install dependencies (`react-router-dom`, `lucide-react`, `recharts` for graphs if needed, or just CSS).
2.  **Global Styles**: Define CSS variables and reset in `index.css`.
3.  **Layout**: Build `Sidebar.jsx` and `Layout.jsx`.
4.  **Views**: Create page components for each screen.
    - `RiskSummary.jsx`
    - `Remediation.jsx`
    - `ThreatModeling.jsx`
    - `SecurityReview.jsx`
    - `ArtifactInput.jsx`
5.  **Refinement**: Polish visual details (padding, shadows, font weights) to match screenshots.
6.  **Navigation**: Ensure routing works.

## Note on "Backend Later"
All data will be mocked locally in `data/mockData.js` to ensure the UI is fully functional and populated without a backend.
