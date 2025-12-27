document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addTaskForm = document.getElementById('addTaskForm');
    const editTaskForm = document.getElementById('editTaskForm');
    const editModal = document.getElementById('editModal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelModalBtn = document.getElementById('cancelEditBtn');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    // Task completion toggles
    const completionToggles = document.querySelectorAll('.completion-toggle input');
    
    // Initialize app
    initApp();
    
    function initApp() {
        // Add task form submission
        if (addTaskForm) {
            addTaskForm.addEventListener('submit', handleAddTask);
        }
        
        // Edit task form submission
        if (editTaskForm) {
            editTaskForm.addEventListener('submit', handleEditTask);
        }
        
        // Modal close functionality
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeEditModal);
        }
        
        if (cancelModalBtn) {
            cancelModalBtn.addEventListener('click', closeEditModal);
        }
        
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === modalOverlay) {
                    closeEditModal();
                }
            });
        }
        
        // Set up completion toggles
        completionToggles.forEach(toggle => {
            toggle.addEventListener('change', handleCompletionToggle);
        });
        
        // Set up edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEditClick);
        });
        
        // Set min date for due date inputs to today
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('input[type="date"]').forEach(input => {
            input.min = today;
        });
        
        // Update task stats
        updateTaskStats();
    }
    
    function handleAddTask(e) {
        e.preventDefault();
        
        const formData = new FormData(addTaskForm);
        const task = formData.get('task');
        
        if (!task.trim()) {
            showNotification('Please enter a task description', 'error');
            return;
        }
        
        // Add visual feedback
        const submitBtn = addTaskForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        submitBtn.disabled = true;
        
        // Submit the form
        setTimeout(() => {
            addTaskForm.submit();
        }, 500);
    }
    
    function handleEditClick(e) {
        e.preventDefault();
        
        const taskId = this.dataset.taskId;
        
        // Show loading state
        openEditModal();
        showLoadingInModal();
        
        // Fetch task details from server
        fetch(`/task/${taskId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch task details');
                }
                return response.json();
            })
            .then(task => {
                // Populate edit form with task data
                populateEditForm(task);
                hideLoadingInModal();
            })
            .catch(error => {
                console.error('Error fetching task:', error);
                hideLoadingInModal();
                showNotification('Failed to load task details', 'error');
                closeEditModal();
            });
    }
    
    function populateEditForm(task) {
        // Populate form fields
        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTask').value = task.task || '';
        
        // Set category - ensure the option exists
        const categorySelect = document.getElementById('editCategory');
        const categoryValue = task.category || 'General';
        
        // Check if the category exists in options
        let categoryExists = false;
        for (let option of categorySelect.options) {
            if (option.value === categoryValue) {
                categoryExists = true;
                break;
            }
        }
        
        // If category doesn't exist, add it
        if (!categoryExists && categoryValue) {
            const newOption = document.createElement('option');
            newOption.value = categoryValue;
            newOption.textContent = categoryValue;
            categorySelect.appendChild(newOption);
        }
        
        categorySelect.value = categoryValue;
        
        // Set priority
        document.getElementById('editPriority').value = task.priority || 'Medium';
        
        // Set due date
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const formattedDate = dueDate.toISOString().split('T')[0];
            document.getElementById('editDueDate').value = formattedDate;
        } else {
            document.getElementById('editDueDate').value = '';
        }
        
        // Set completed status
        document.getElementById('editCompleted').value = task.completed ? 'true' : 'false';
        
        // Update form action
        const editForm = document.getElementById('editTaskForm');
        editForm.action = `/update/${task.id}`;
    }
    
    function showLoadingInModal() {
        const modalContent = document.querySelector('.edit-modal');
        if (!modalContent) return;
        
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'modalLoadingOverlay';
        loadingOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 253, 245, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            border-radius: 16px;
        `;
        
        loadingOverlay.innerHTML = `
            <div class="text-center">
                <i class="fas fa-spinner fa-spin text-3xl text-ginger-base mb-3"></i>
                <p class="text-ginger-deep font-semibold">Loading task details...</p>
            </div>
        `;
        
        modalContent.appendChild(loadingOverlay);
    }
    
    function hideLoadingInModal() {
        const loadingOverlay = document.getElementById('modalLoadingOverlay');
        if (loadingOverlay && loadingOverlay.parentNode) {
            loadingOverlay.parentNode.removeChild(loadingOverlay);
        }
    }
    
    function handleEditTask(e) {
        e.preventDefault();
        
        const formData = new FormData(editTaskForm);
        const task = formData.get('task');
        
        if (!task.trim()) {
            showNotification('Please enter a task description', 'error');
            return;
        }
        
        // Add visual feedback
        const submitBtn = editTaskForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        submitBtn.disabled = true;
        
        // Submit the form
        setTimeout(() => {
            editTaskForm.submit();
        }, 500);
    }
    
    function handleCompletionToggle(e) {
        const taskId = this.dataset.taskId;
        const isCompleted = this.checked;
        
        // Send request to toggle completion
        fetch(`/toggle/${taskId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        })
        .then(response => {
            if (response.ok) {
                // Update UI
                const taskElement = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
                if (taskElement) {
                    taskElement.classList.toggle('completed', isCompleted);
                    taskElement.querySelector('.task-title').style.textDecoration = 
                        isCompleted ? 'line-through' : 'none';
                    
                    // Update stats
                    updateTaskStats();
                    
                    showNotification(`Task marked as ${isCompleted ? 'completed' : 'incomplete'}`, 'success');
                }
            } else {
                // Revert toggle on error
                this.checked = !isCompleted;
                showNotification('Failed to update task', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            this.checked = !isCompleted;
            showNotification('Failed to update task', 'error');
        });
    }
    
    function openEditModal() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeEditModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
        
    function updateTaskStats() {
        const totalTasks = document.querySelectorAll('.task-item').length;
        const completedTasks = document.querySelectorAll('.task-item.completed').length;
        const pendingTasks = totalTasks - completedTasks;
        
        // Update stats display if elements exist
        const totalElement = document.querySelector('.stat-total .stat-number');
        const completedElement = document.querySelector('.stat-completed .stat-number');
        const pendingElement = document.querySelector('.stat-pending .stat-number');
        
        if (totalElement) totalElement.textContent = totalTasks;
        if (completedElement) completedElement.textContent = completedTasks;
        if (pendingElement) pendingElement.textContent = pendingTasks;
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#9BC5A1' : type === 'error' ? '#D64045' : '#C68E56'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1001;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            min-width: 300px;
            max-width: 400px;
            transform: translateX(150%);
            transition: transform 0.3s ease-out;
        `;
        
        // Add close button styles
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Add content styles
        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Add close functionality
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(150%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(150%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Close modal with Escape key
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeEditModal();
        }
    });
    
    // Add some fun animations
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.05}s`;
        item.classList.add('animate-in');
    });
    
    // Add animation class
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: slideIn 0.4s ease-out forwards;
            opacity: 0;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Loading spinner styles */
        .fa-spinner {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});