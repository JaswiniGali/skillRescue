// ------------------ Utility ------------------
function getUsers() { return JSON.parse(localStorage.getItem('users')) || []; }
function setUsers(users) { localStorage.setItem('users', JSON.stringify(users)); }
function getSessions() { return JSON.parse(localStorage.getItem('sessions')) || []; }
function setSessions(sessions) { localStorage.setItem('sessions', JSON.stringify(sessions)); }

// Predefined skills
const predefinedSkills = [
    "Python", "Java", "Web Development", "Data Analysis",
    "AI/ML", "SQL", "Communication", "Leadership"
];

// ------------------ Register ------------------
document.getElementById('registerForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role = document.getElementById('role').value;

    let users = getUsers();
    if (users.find(u => u.email === email)) {
        alert("Email already registered");
        return;
    }

    const profilePicInput = document.getElementById('profilePic');
    let profilePic = "";

    if (profilePicInput && profilePicInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (ev) {
            profilePic = ev.target.result;
            saveUser();
        }
        reader.readAsDataURL(profilePicInput.files[0]);
    } else {
        saveUser();
    }

    function saveUser() {
        users.push({ name, email, password, role, skills: [], profilePic });
        setUsers(users);
        alert("Registered successfully!");
        window.location.href = "login.html";
    }
});

// ------------------ Login ------------------
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    let users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid credentials");
    }
});

// ------------------ Dashboard Init ------------------
window.onload = function () {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser && window.location.href.includes('dashboard')) {
        window.location.href = "login.html";
        return;
    }

    if (currentUser) {
        const welcome = document.getElementById('welcome');
        if (welcome) welcome.innerText = `Welcome, ${currentUser.name} (${currentUser.role})`;

        showMentors();
        populateMentorSelect();
        populateSkillOptions();
        showStats();
        showSessions();
        showNotifications();
    }
}

// ------------------ Mentors ------------------
function showMentors() {
    const users = getUsers();
    const mentors = users.filter(u => u.role === 'mentor');
    const mentorList = document.getElementById('mentorList');
    if (!mentorList) return;

    mentorList.innerHTML = '';
    mentors.forEach(m => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${m.profilePic || 'placeholder.png'}"
                     style="width:50px;height:50px;border-radius:50%;object-fit:cover;">
                <div>
                    <h4>${m.name}</h4>
                    <p>Skills: ${m.skills.join(', ') || 'None'}</p>
                </div>
            </div>
        `;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser.role === 'youth') {
            card.innerHTML += `<button class="btn primary" onclick="selectMentor('${m.email}')">Book Session</button>`;
        }
        mentorList.appendChild(card);
    });
}

// ------------------ Filter Mentors ------------------
function filterMentors() {
    const skill = document.getElementById('skillFilter').value.toLowerCase();
    const users = getUsers();
    const mentors = users.filter(
        u => u.role === 'mentor' && u.skills.some(s => s.toLowerCase().includes(skill))
    );
    const mentorList = document.getElementById('mentorList');
    if (!mentorList) return;

    mentorList.innerHTML = '';
    mentors.forEach(m => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <img src="${m.profilePic || 'placeholder.png'}"
                     style="width:50px;height:50px;border-radius:50%;object-fit:cover;">
                <div>
                    <h4>${m.name}</h4>
                    <p>Skills: ${m.skills.join(', ') || 'None'}</p>
                </div>
            </div>
        `;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser.role === 'youth') {
            card.innerHTML += `<button class="btn primary" onclick="selectMentor('${m.email}')">Book Session</button>`;
        }
        mentorList.appendChild(card);
    });
}

// ------------------ Add Skills ------------------
function populateSkillOptions() {
    const skillDiv = document.getElementById('skillOptions');
    if (!skillDiv) return;
    skillDiv.innerHTML = "";
    predefinedSkills.forEach(skill => {
        const label = document.createElement('label');
        label.style.display = "block";
        label.innerHTML = `<input type="checkbox" value="${skill}"> ${skill}`;
        skillDiv.appendChild(label);
    });
}

function addSkills() {
    let selected = Array.from(document.querySelectorAll('#skillOptions input:checked')).map(i => i.value);
    if (selected.length === 0) return alert("Select at least one skill");

    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.skills = [...new Set([...currentUser.skills, ...selected])];
    let users = getUsers();
    users = users.map(u => u.email === currentUser.email ? currentUser : u);
    setUsers(users);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    alert("Skills added!");
    showMentors();
    showStats();
}

// ------------------ Tabs ------------------
function showTab(tab, el) {
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(tab).style.display = 'block';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (el) el.classList.add('active');
}

// ------------------ Logout ------------------
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// ------------------ Mentor Select for Session ------------------
function populateMentorSelect() {
    const mentorSelect = document.getElementById('mentorSelect');
    if (!mentorSelect) return;
    const users = getUsers();
    const mentors = users.filter(u => u.role === 'mentor');
    mentorSelect.innerHTML = '';
    mentors.forEach(m => {
        const option = document.createElement('option');
        option.value = m.email;
        option.text = m.name;
        mentorSelect.appendChild(option);
    });
}

// ------------------ Book Session ------------------
function selectMentor(email) {
    const mentorSelect = document.getElementById('mentorSelect');
    if (mentorSelect) mentorSelect.value = email;
    showTab('sessions', document.querySelector(".tab-btn[data-tab='sessions']"));
}

function bookSession() {
    const mentorEmail = document.getElementById('mentorSelect').value;
    const date = document.getElementById('sessionDate').value;
    if (!mentorEmail || !date) return alert("Select mentor and date");

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let sessions = getSessions();
    sessions.push({ mentorEmail, youthEmail: currentUser.email, date, status: 'pending', rating: 0 });
    setSessions(sessions);
    alert("Session booked!");
    showSessions();
    showStats();
    showNotifications();
}

// ------------------ Show Sessions ------------------
function showSessions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const sessions = getSessions();
    const userSessions = sessions.filter(s => s.youthEmail === currentUser.email || s.mentorEmail === currentUser.email);
    const sessionList = document.getElementById('sessionList');
    if (!sessionList) return;

    sessionList.innerHTML = '';
    userSessions.forEach(s => {
        const card = document.createElement('div');
        card.className = 'card';
        const mentor = getUsers().find(u => u.email === s.mentorEmail);
        const youth = getUsers().find(u => u.email === s.youthEmail);

        card.innerHTML = `
            <h4>Mentor: ${mentor.name}</h4>
            <p>Youth: ${youth.name}</p>
            <p>Date: ${s.date}</p>
            <p>Status: ${s.status}</p>
        `;

        sessionList.appendChild(card);
    });
}

// ------------------ Stats ------------------
function showStats() {
    const users = getUsers();
    const sessions = getSessions();
    const statsDiv = document.getElementById('stats');
    if (!statsDiv) return;

    const mentorCount = users.filter(u => u.role === 'mentor').length;
    const youthCount = users.filter(u => u.role === 'youth').length;
    const sessionCount = sessions.length;

    statsDiv.innerHTML = `
        <div class="stat-card">Mentors: ${mentorCount}</div>
        <div class="stat-card">Youth: ${youthCount}</div>
        <div class="stat-card">Sessions: ${sessionCount}</div>
    `;
}

// ------------------ Notifications ------------------
function showNotifications() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const notificationsDiv = document.getElementById('notifications');
    if (!notificationsDiv) return;

    const sessions = getSessions();
    const today = new Date().toISOString().split('T')[0];
    const upcoming = sessions.filter(
        s => (s.mentorEmail === currentUser.email || s.youthEmail === currentUser.email) && s.date >= today
    );

    if (upcoming.length === 0) {
        notificationsDiv.innerHTML = '';
        return;
    }

    notificationsDiv.innerHTML = `<h4>Upcoming Sessions</h4>`;
    upcoming.forEach(s => {
        const mentor = getUsers().find(u => u.email === s.mentorEmail);
        const youth = getUsers().find(u => u.email === s.youthEmail);
        const div = document.createElement('div');
        div.className = 'notification';
        div.innerHTML = `
            <strong>Date:</strong> ${s.date} | 
            <strong>Mentor:</strong> ${mentor.name} | 
            <strong>Youth:</strong> ${youth.name} | 
            <strong>Status:</strong> ${s.status}
        `;
        notificationsDiv.appendChild(div);
    });
}
