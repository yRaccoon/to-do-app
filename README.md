# 🍪 Gingerbread To-Do App

A sweet and delightful task management application with a gingerbread cookie theme, built with Flask and Sheety API.

![Cookie Favicon](https://img.shields.io/badge/Favicon-🍪-brown)
![Gingerbread Theme](https://img.shields.io/badge/Theme-Gingerbread_Cookie-brown)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![Flask](https://img.shields.io/badge/Flask-2.3+-lightgrey)

<div align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/2634/2634178.png" alt="Cookie Icon" width="100">
  <p><em>Sweet task management, one cookie at a time!</em></p>
</div>

## ✨ Features

- 🍪 **Cookie-Themed UI**: Delicious gingerbread cookie design with warm, inviting colors
- ✅ **Task Management**: Add, edit, delete, and complete tasks
- 🏷️ **Categories**: Organize tasks with custom categories
- 🚨 **Priority Levels**: High, Medium, Low priority
- 📅 **Due Dates**: Set deadlines with intuitive date picker
- ☁️ **Cloud Storage**: Tasks automatically saved to Google Sheets via Sheety API
- 🍃 **Lightweight**: Fast and efficient with minimal dependencies

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Google account (for Google Sheets)
- Sheety API account (free tier available)

### Installation & Setup

#### 1. **Clone or Download the Project**
```bash
git clone https://github.com/yRaccoon/to-do-app.git
cd to-do-app
```

#### 2. **Create Virtual Environment**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 3. **Install Dependencies**
```bash
pip install -r requirements.txt
```
#### 4. **Configure Environment Variables**
#### Create .env file
```bash
touch .env  # macOS/Linux
# OR
echo. > .env  # Windows
```
#### Edit the .env file and add your Sheety credentials:
```bash
# Sheety API Configuration
SHEETY_API_URL=https://api.sheety.co/YOUR_PROJECT_ID/YOUR_SHEET_NAME/tasks
SHEETY_API_KEY=your_bearer_token_here

```
#### 5. **Run the App**
```bash
python app.py
```