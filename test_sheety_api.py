import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Get API credentials from .env
SHEETY_API_URL = os.getenv("SHEETY_API_URL")
SHEETY_API_KEY = os.getenv("SHEETY_API_KEY")

def fetch_sheety_data():
    """Fetch data from Sheety API"""
    
    # Sheety API headers with your bearer token
    headers = {
        "Authorization": f"Bearer {SHEETY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        # Make GET request to Sheety API
        response = requests.get(SHEETY_API_URL, headers=headers)
        response.raise_for_status()  # Raise exception for bad status codes
        
        # Parse JSON response
        data = response.json()
        
        # Extract sheet data 
        sheet_data = data.get("sheet1", [])
        
        print("Data fetched successfully!")
        return sheet_data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None

# Example usage
if __name__ == "__main__":
    # Fetch and display data
    data = fetch_sheety_data()
    
    if data:
        print(f"Found {len(data)} records:")
        for item in data:
            print(item)