document.addEventListener('DOMContentLoaded', () => {
    const authDiv = document.getElementById('auth');
    const notesDiv = document.getElementById('notes');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const createNoteForm = document.getElementById('create-note-form');
    const notesListDiv = document.getElementById('notes-list');
    const archivedNotesListDiv = document.getElementById('archived-notes-list');
    const trashedNotesListDiv = document.getElementById('trashed-notes-list');
    const searchButton = document.getElementById('search-button');
    const archivedNotesBtn = document.getElementById('archivedNotesBtn');
    const trashNotesBtn = document.getElementById('trashNotesBtn');
    let token = localStorage.getItem('token');
    let editNoteId = null;

    if (token) {
        authDiv.style.display = 'none';
        notesDiv.style.display = 'block';
        fetchNotes();
    } else {
        authDiv.style.display = 'block';
        notesDiv.style.display = 'none';
    }

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        try {
            const response = await fetch('http://localhost:5000/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) {
                alert('Signup successful! Please log in.');
            } else {
                throw new Error('Signup failed');
            }
        } catch (error) {
            console.error('Signup Error:', error.message);
            alert('Signup failed. Please try again.');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        try {
            const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
            if (response.ok) {
                const data = await response.json();
                token = data.token;
                localStorage.setItem('token', token);
                authDiv.style.display = 'none';
                notesDiv.style.display = 'block';
                fetchNotes(); // Fetch notes after successful login
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Login Error:', error.message);
            alert('Login failed. Please try again.');
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        authDiv.style.display = 'block';
        notesDiv.style.display = 'none';
    });

    createNoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        const tags = document.getElementById('note-tags').value.split(',').map(tag => tag.trim());
        const backgroundColor = document.getElementById('note-background-color').value;
        const reminder = document.getElementById('note-reminder').value;
        try {
            const url = editNoteId 
                ? `http://localhost:5000/notes/${editNoteId}` 
                : 'http://localhost:5000/notes';
            const method = editNoteId ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content, tags, backgroundColor, reminder }),
            });
            if (response.ok) {
                alert(editNoteId ? 'Note updated successfully.' : 'Note created successfully.');
                createNoteForm.reset();
                fetchNotes(); // Refresh notes after creating new note
            } else {
                throw new Error(editNoteId ? 'Update note failed' : 'Create note failed');
            }
        } catch (error) {
            console.error(editNoteId ? 'Update Note Error:' : 'Create Note Error:', error.message);
            alert(editNoteId ? 'Failed to update note. Please try again.' : 'Failed to create note. Please try again.');
        }
    });

    async function fetchNotes() {
        try {
            const response = await fetch('http://localhost:5000/notes', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const notes = await response.json();
                displayNotes(notes);
            } else {
                throw new Error('Fetch notes failed');
            }
        } catch (error) {
            console.error('Fetch Notes Error:', error.message);
            alert('Failed to fetch notes. Please try again.');
        }
    }

    async function displayNotes(notes) {
        notesListDiv.innerHTML = '';
        notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.innerHTML = `
                <div style="background-color: ${note.backgroundColor}; padding: 10px; margin-bottom: 10px;">
                    <h3>${note.title}</h3>
                    <p>${note.content}</p>
                    <p>Tags: ${note.tags.join(', ')}</p>
                    <p>Reminder: ${note.reminder ? new Date(note.reminder).toLocaleString() : 'Not set'}</p>
                    <button class="edit-btn" data-id="${note._id}">Edit</button>
                    <button class="archive-btn" data-id="${note._id}">Archive</button>
                    <button class="trash-btn" data-id="${note._id}">Trash</button>
                    <button class="delete-btn" data-id="${note._id}">Delete</button>
                </div>
            `;
            notesListDiv.appendChild(noteDiv);

            noteDiv.querySelector('.edit-btn').addEventListener('click', () => {
                editNoteId = note._id;
                document.getElementById('note-title').value = note.title;
                document.getElementById('note-content').value = note.content;
                document.getElementById('note-tags').value = note.tags.join(', ');
                document.getElementById('note-background-color').value = note.backgroundColor;
                document.getElementById('note-reminder').value = note.reminder ? new Date(note.reminder).toISOString().slice(0, 16) : '';
            });

            // Attach event listeners for archive, trash, delete buttons
            noteDiv.querySelector('.archive-btn').addEventListener('click', async (e) => {
                const noteId = e.target.dataset.id;
                try {
                    const response = await fetch(`http://localhost:5000/notes/archive/${noteId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        alert('Note archived successfully.');
                        fetchNotes(); // Refresh notes after archiving note
                    } else {
                        throw new Error('Archive note failed');
                    }
                } catch (error) {
                    console.error('Archive Note Error:', error.message);
                    alert('Failed to archive note. Please try again.');
                }
            });

            noteDiv.querySelector('.trash-btn').addEventListener('click', async (e) => {
                const noteId = e.target.dataset.id;
                try {
                    const response = await fetch(`http://localhost:5000/notes/trash/${noteId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        alert('Note trashed successfully.');
                        fetchNotes(); // Refresh notes after trashing note
                    } else {
                        throw new Error('Trash note failed');
                    }
                } catch (error) {
                    console.error('Trash Note Error:', error.message);
                    alert('Failed to trash note. Please try again.');
                }
            });

            noteDiv.querySelector('.delete-btn').addEventListener('click', async (e) => {
                const noteId = e.target.dataset.id;
                try {
                    const response = await fetch(`http://localhost:5000/notes/${noteId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        alert('Note deleted successfully.');
                        fetchNotes(); // Refresh notes after deleting note
                    } else {
                        throw new Error('Delete note failed');
                    }
                } catch (error) {
                    console.error('Delete Note Error:', error.message);
                    alert('Failed to delete note. Please try again.');
                }
            });
        });
    }

    searchButton.addEventListener('click', async () => {
        const query = document.getElementById('search-query').value;
        if (!query) {
            alert('Please enter a search query.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/notes/search?query=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                },
            });

            if (response.ok) {
                const notes = await response.json();
                displayNotes(notes);
            } else {
                throw new Error('Search notes failed');
            }
        } catch (error) {
            console.error('Search Notes Error:', error.message);
            alert('Failed to search notes. Please try again.');
        }
    });

    function displayNotes(notes) {
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = ''; // Clear previous results
    
        if (notes.length === 0) {
            notesList.innerHTML = '<p>No notes found.</p>';
            return;
        }
    
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.innerHTML = `
            <div style="background-color: ${note.backgroundColor}; padding: 10px; margin-bottom: 10px;">
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <p><strong>Tags:</strong> ${note.tags.join(', ')}</p>
                <p><strong>Reminder:</strong> ${new Date(note.reminder).toLocaleString()}</p>
            </div>
            `;
            notesList.appendChild(noteElement);
        });
    }


    archivedNotesBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:5000/notes/archived', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const notes = await response.json();
                archivedNotesListDiv.style.display = 'block';
                notesListDiv.style.display = 'none';
                trashedNotesListDiv.style.display = 'none';
                displayArchivedNotes(notes);
            } else {
                throw new Error('Fetch archived notes failed');
            }
        } catch (error) {
            console.error('Fetch Archived Notes Error:', error.message);
            alert('Failed to fetch archived notes. Please try again.');
        }
    });

    trashNotesBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:5000/notes/trashed', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const notes = await response.json();
                trashedNotesListDiv.style.display = 'block';
                notesListDiv.style.display = 'none';
                archivedNotesListDiv.style.display = 'none';
                displayTrashedNotes(notes);
            } else {
                throw new Error('Fetch trashed notes failed');
            }
        } catch (error) {
            console.error('Fetch Trashed Notes Error:', error.message);
            alert('Failed to fetch trashed notes. Please try again.');
        }
    });

    async function displayArchivedNotes(notes) {
        archivedNotesListDiv.innerHTML = '';
        notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.innerHTML = `
                <div style="background-color: ${note.backgroundColor}; padding: 10px; margin-bottom: 10px;">
                    <h3>${note.title}</h3>
                    <p>${note.content}</p>
                    <p>Tags: ${note.tags.join(', ')}</p>
                    <p>Background Color: ${note.backgroundColor}</p>
                    <p>Reminder: ${note.reminder ? new Date(note.reminder).toLocaleString() : 'Not set'}</p>
                </div>
            `;
            archivedNotesListDiv.appendChild(noteDiv);
        });
    }

    async function displayTrashedNotes(notes) {
        trashedNotesListDiv.innerHTML = '';
        notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.innerHTML = `
            <div style="background-color: ${note.backgroundColor}; padding: 10px; margin-bottom: 10px;">
                <h3>${note.title}</h3>
                <p>${note.content}</p>
                <p>Tags: ${note.tags.join(', ')}</p>
                <p>Background Color: ${note.backgroundColor}</p>
                <p>Reminder: ${note.reminder ? new Date(note.reminder).toLocaleString() : 'Not set'}</p>
            </div>
            `;
            trashedNotesListDiv.appendChild(noteDiv);
        });
    }
});
