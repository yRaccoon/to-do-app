from flask import Flask, render_template, request, jsonify, redirect, url_for
import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')

# Sheety API Configuration
SHEETY_API_URL = os.getenv('SHEETY_API_URL')
SHEETY_API_KEY = os.getenv('SHEETY_API_KEY')
SHEETY_HEADERS = {
    'Authorization': f'Bearer {SHEETY_API_KEY}',
    'Content-Type': 'application/json'
}

def get_tasks():
    """Fetch tasks from Sheety API"""
    try:
        response = requests.get(SHEETY_API_URL, headers=SHEETY_HEADERS)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching tasks: {e}")
        return {'sheet1': []}

def get_task(task_id):
    """Get a single task by ID"""
    try:
        url = f"{SHEETY_API_URL}/{task_id}"
        response = requests.get(url, headers=SHEETY_HEADERS)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching task {task_id}: {e}")
        return None

def update_task(task_id, data):
    """Update a task in Sheety"""
    try:
        url = f"{SHEETY_API_URL}/{task_id}"
        response = requests.put(url, headers=SHEETY_HEADERS, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error updating task: {e}")
        return None

def create_task(data):
    """Create a new task in Sheety"""
    try:
        response = requests.post(SHEETY_API_URL, headers=SHEETY_HEADERS, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error creating task: {e}")
        return None

def delete_task(task_id):
    """Delete a task from Sheety"""
    try:
        url = f"{SHEETY_API_URL}/{task_id}"
        response = requests.delete(url, headers=SHEETY_HEADERS)
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error deleting task: {e}")
        return False

@app.route('/')
def index():
    """Render the main to-do page"""
    tasks_data = get_tasks()
    tasks = tasks_data.get('sheet1', [])
    
    # Convert string dates to datetime objects for sorting
    for task in tasks:
        if task.get('dueDate'):
            try:
                task['dueDate_dt'] = datetime.strptime(task['dueDate'], '%Y-%m-%d')
            except ValueError:
                task['dueDate_dt'] = None
    
    # Sort tasks by due date (oldest first) and completion status
    tasks.sort(key=lambda x: (
        x.get('completed', False),
        x.get('dueDate_dt') or datetime.max
    ))
    
    return render_template('todo.html', tasks=tasks)

@app.route('/task/<int:task_id>')
def get_task_details(task_id):
    """Get task details for editing"""
    task_data = get_task(task_id)
    if task_data and 'sheet1' in task_data:
        task = task_data['sheet1']
        return jsonify({
            'id': task.get('id'),
            'task': task.get('task'),
            'category': task.get('category', 'General'),
            'priority': task.get('priority', 'Medium'),
            'dueDate': task.get('dueDate'),
            'completed': task.get('completed', False)
        })
    return jsonify({'error': 'Task not found'}), 404

@app.route('/add', methods=['POST'])
def add_task():
    """Add a new task"""
    task_data = {
        'sheet1': {
            'task': request.form.get('task'),
            'category': request.form.get('category', 'General'),
            'priority': request.form.get('priority', 'Medium'),
            'dueDate': request.form.get('dueDate'),
            'completed': False,
            'creationDate': datetime.now().strftime('%Y-%m-%d')
        }
    }
    
    result = create_task(task_data)
    if result:
        return redirect(url_for('index'))
    return redirect(url_for('index'))

@app.route('/update/<int:task_id>', methods=['POST'])
def update_task_route(task_id):
    """Update an existing task"""
    task_data = {
        'sheet1': {
            'task': request.form.get('task'),
            'category': request.form.get('category', 'General'),
            'priority': request.form.get('priority', 'Medium'),
            'dueDate': request.form.get('dueDate'),
            'completed': request.form.get('completed') == 'true'
        }
    }
    
    result = update_task(task_id, task_data)
    if result:
        return redirect(url_for('index'))
    return redirect(url_for('index'))

@app.route('/toggle/<int:task_id>')
def toggle_task(task_id):
    """Toggle task completion status"""
    tasks_data = get_tasks()
    tasks = tasks_data.get('sheet1', [])
    
    task_to_toggle = next((task for task in tasks if task.get('id') == task_id), None)
    if task_to_toggle:
        task_data = {
            'sheet1': {
                'completed': not task_to_toggle.get('completed', False)
            }
        }
        update_task(task_id, task_data)
    
    return redirect(url_for('index'))

@app.route('/delete/<int:task_id>')
def delete_task_route(task_id):
    """Delete a task"""
    success = delete_task(task_id)
    return redirect(url_for('index'))

@app.route('/api/tasks')
def api_tasks():
    """API endpoint to get tasks as JSON"""
    tasks_data = get_tasks()
    return jsonify(tasks_data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)