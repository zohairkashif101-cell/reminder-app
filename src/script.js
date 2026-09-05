document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('reminder-form');
  const titleInput = document.getElementById('title');
  const timeInput = document.getElementById('remindertime');
  const reminderList = document.getElementById('reminder-list');
  const emptyState = document.getElementById('empty-state');
  const countBadge = document.getElementById('reminder-count');

  // State array to manage reminders
  let reminders = [];

  // Backend API Endpoint
  const API_URL = '/api/reminders'; 

  // Function to set current date & time automatically into the datetime-local input
  function setDefaultDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    timeInput.value = now.toISOString().slice(0, 16);
  }

  // Initialize form default time & load data
  setDefaultDateTime();
  fetchReminders();

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!timeInput.value) {
      alert('Please select a valid date and time.');
      return;
    }

    const newReminder = {
      title: titleInput.value.trim(),
      remindertime: new Date(timeInput.value).toISOString(),
      iscompleted: false
    };

    try {
      const createdItem = await createReminderAPI(newReminder);
      // Fallback to local state if server API isn't responding yet
      reminders.push(createdItem || { ...newReminder, _id: Date.now().toString() });
      
      form.reset();
      setDefaultDateTime(); // Re-apply current time after form reset
      render();
    } catch (err) {
      console.error('Failed to create reminder:', err);
    }
  });

  // Render Reminders List to DOM
  function render() {
    reminderList.innerHTML = '';
    countBadge.textContent = `${reminders.length} items`;

    if (reminders.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    reminders.forEach((item) => {
      const li = document.createElement('li');
      li.className = `reminder-item ${item.iscompleted ? 'completed' : ''}`;

      const dateFormatted = new Date(item.remindertime).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });

      li.innerHTML = `
        <div class="reminder-info">
          <span class="reminder-title">${escapeHTML(item.title)}</span>
          <span class="reminder-date">⏰ ${dateFormatted}</span>
        </div>
        <div class="reminder-actions">
          <input 
            type="checkbox" 
            class="checkbox-btn" 
            ${item.iscompleted ? 'checked' : ''} 
            data-id="${item._id}" 
          />
          <button class="delete-btn" data-id="${item._id}">✕</button>
        </div>
      `;

      // Handlers for checkbox toggle and delete
      const checkbox = li.querySelector('.checkbox-btn');
      checkbox.addEventListener('change', () => toggleComplete(item._id));

      const deleteBtn = li.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => deleteReminder(item._id));

      reminderList.appendChild(li);
    });
  }

  // Toggle Reminder Completion
  async function toggleComplete(id) {
    reminders = reminders.map((r) => 
      r._id === id ? { ...r, iscompleted: !r.iscompleted } : r
    );
    render();
  }

  // Delete Reminder
  async function deleteReminder(id) {
    reminders = reminders.filter((r) => r._id !== id);
    render();
  }

  // Fetch Existing Reminders
  async function fetchReminders() {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        reminders = await res.json();
      }
    } catch (err) {
      console.log('Backend API not responding, running in local state mode.');
    } finally {
      render();
    }
  }

  // API Post Request Helper
  async function createReminderAPI(data) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (err) {
      return null;
    }
  }

  // Prevent XSS Injection
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});