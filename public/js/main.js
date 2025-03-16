const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const sidebar = document.querySelector('.chat-sidebar');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
    console.log(message);
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    socket.emit('chatMessage', msg);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output functions
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
    roomName.innerText = room;
}

function outputUsers(users) {
    userList.innerHTML = `${users.map((user) => `<li>${user.username}</li>`).join('')}`;
}

// Add Toggle Users button only on mobile
function setupToggleButton() {
    const isMobile = window.innerWidth <= 700;
    const existingToggleBtn = document.querySelector('.toggle-users-btn');

    if (isMobile && !existingToggleBtn) {
        const toggleBtn = document.createElement('button');
        toggleBtn.classList.add('btn', 'toggle-users-btn');
        toggleBtn.innerHTML = '<i class="fas fa-users"></i> Toggle Users';
        toggleBtn.style.margin = '10px';
        document.querySelector('.chat-header').appendChild(toggleBtn);

        // Hide sidebar by default on mobile
        
        sidebar.style.display = 'none';

        toggleBtn.addEventListener('click', () => {
            sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
        });
    } else if (!isMobile && existingToggleBtn) {
        existingToggleBtn.remove(); // Remove button on desktop
        sidebar.style.display = 'block'; // Ensure sidebar is visible on desktop
    } else if (!isMobile) {
        sidebar.style.display = 'block'; // Ensure sidebar is visible on desktop
    }
}

// Run on load
setupToggleButton();

// Update on window resize
window.addEventListener('resize', setupToggleButton);