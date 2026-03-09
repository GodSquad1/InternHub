 
// INTERNHUB - COMPLETE VANILLA JS APPLICATION
 

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5bbdw9K7hx738oYGxWCDKlYBs4CZJnpo",
  authDomain: "internconnect-ec09e.firebaseapp.com",
  projectId: "internconnect-ec09e",
  storageBucket: "internconnect-ec09e.firebasestorage.app",
  messagingSenderId: "617689931580",
  appId: "1:617689931580:web:a5f6e6437cedae296d8839",
  measurementId: "G-QHKGHHM7KP"
};


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

 
// STATE MANAGEMENT
 

const state = {
  currentPage: "home",
  internships: [],
  filters: {
    search: "",
    location: "all",
    type: "all",
    experience: "all",
  },
  practiceMode: {
    selectedRole: null,
    score: 0,
    level: 1,
    currentModule: 0,
    currentChallenge: 0,
    completedChallenges: {},
  },
  communityFilters: {
    sort: "recent",
    company: "",
    rating: "all",
    verified: false,
    warnings: false,
  },
  resumeAnalysis: null,
  selectedRole: null,
  showReviewForm: false,
  searchQuery: "",
  reviews: [],
  // Interview Coach State
  interview: {
    isActive: false,
    field: "Software Engineering",
    experienceLevel: "Internship",
    focus: "balanced",
    company: "",
    conversationHistory: [],
    currentDepth: 0,
    questionCount: 0,
    maxQuestions: 8,
    isLoading: false,
    isRecording: false,
    isSpeaking: false,
    voiceId: "EXAVITQu4vr4xnSDxMaL", // Default ElevenLabs voice
  }
};

 
// UTILITY FUNCTIONS
 

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

let activeElementInfo = null;

function saveFocus() {
  const activeElement = document.activeElement;
  if (activeElement && activeElement.id) {
    activeElementInfo = {
      id: activeElement.id,
      selectionStart: activeElement.selectionStart,
      selectionEnd: activeElement.selectionEnd,
      value: activeElement.value
    };
  }
}

function restoreFocus() {
  if (activeElementInfo) {
    const element = document.getElementById(activeElementInfo.id);
    if (element && element.value === activeElementInfo.value) {
      element.focus();
      if (activeElementInfo.selectionStart !== null) {
        element.setSelectionRange(
          activeElementInfo.selectionStart,
          activeElementInfo.selectionEnd
        );
      }
    }
  }
  activeElementInfo = null;
}

const debouncedRender = debounce(() => render(), 250);

const MOCK_INTERNSHIPS = [
  {
    id: 1,
    title: "Software Engineering Intern",
    company: "Google",
    location: "Mountain View, CA",
    type: "Full-time",
    experience: "Entry Level",
    salary: "$8,000/mo",
    verified: true,
    rating: 4.8,
    tags: ["React", "Python", "Cloud"],
    description: "Build scalable web applications with cutting-edge technology.",
    posted: "2 days ago",
  },
  {
    id: 2,
    title: "Frontend Developer Intern",
    company: "Meta",
    location: "Menlo Park, CA",
    type: "Full-time",
    experience: "Entry Level",
    salary: "$7,500/mo",
    verified: true,
    rating: 4.7,
    tags: ["React", "JavaScript", "UI/UX"],
    description: "Create beautiful and intuitive user interfaces.",
    posted: "1 week ago",
  },
  {
    id: 3,
    title: "Data Science Intern",
    company: "Amazon",
    location: "Seattle, WA",
    type: "Full-time",
    experience: "Entry Level",
    salary: "$7,000/mo",
    verified: true,
    rating: 4.6,
    tags: ["Python", "ML", "SQL"],
    description: "Analyze large datasets and build predictive models.",
    posted: "3 days ago",
  },
  {
    id: 4,
    title: "Product Design Intern",
    company: "Figma",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "Entry Level",
    salary: "$6,500/mo",
    verified: true,
    rating: 4.9,
    tags: ["Figma", "UI/UX", "Design"],
    description: "Design next-generation collaboration tools.",
    posted: "5 days ago",
  },
  {
    id: 5,
    title: "Backend Engineer Intern",
    company: "Stripe",
    location: "Remote",
    type: "Remote",
    experience: "Entry Level",
    salary: "$8,500/mo",
    verified: true,
    rating: 4.8,
    tags: ["Node.js", "Go", "APIs"],
    description: "Build robust payment infrastructure.",
    posted: "1 day ago",
  },
  {
    id: 6,
    title: "Mobile Developer Intern",
    company: "Spotify",
    location: "New York, NY",
    type: "Hybrid",
    experience: "Entry Level",
    salary: "$7,200/mo",
    verified: true,
    rating: 4.7,
    tags: ["React Native", "iOS", "Android"],
    description: "Develop features for millions of music lovers.",
    posted: "4 days ago",
  },
];

const PRACTICE_ROLES = [
  {
    id: "software",
    title: "Software Engineer",
    icon: "💻",
    difficulty: "Medium",
    skills: ["JavaScript", "Algorithms", "Problem Solving"],
    challenges: 15,
    description: "Master fundamental programming concepts and algorithms",
    color: "#6366f1",
    modules: [
      {
        id: "js-basics",
        title: "JavaScript Fundamentals",
        description: "Variables, functions, arrays, and objects",
        challenges: [
          {
            id: "challenge-1",
            title: "Reverse a String",
            description: "Write a function that reverses a string",
            difficulty: "Easy",
            points: 10,
            starterCode: `function reverseString(str) {\n  // Your code here\n  return str;\n}`,
            solution: `function reverseString(str) {\n  return str.split('').reverse().join('');\n}`,
            testCases: [
              { input: 'hello', expected: 'olleh' },
              { input: 'world', expected: 'dlrow' },
              { input: '', expected: '' }
            ],
            hints: [
              "Try using the split() method to convert string to array",
              "Arrays have a reverse() method",
              "Use join() to convert array back to string"
            ]
          },
          {
            id: "challenge-2",
            title: "Find Maximum in Array",
            description: "Find the largest number in an array",
            difficulty: "Easy",
            points: 10,
            starterCode: `function findMax(arr) {\n  // Your code here\n  return 0;\n}`,
            solution: `function findMax(arr) {\n  return Math.max(...arr);\n}`,
            testCases: [
              { input: [1, 5, 3, 9, 2], expected: 9 },
              { input: [-1, -5, -3], expected: -1 },
              { input: [42], expected: 42 }
            ],
            hints: [
              "Consider using the spread operator with Math.max()",
              "Or use a loop to iterate through the array",
              "Don't forget to handle empty arrays"
            ]
          },
          {
            id: "challenge-3",
            title: "FizzBuzz",
            description: "Print numbers 1-100, replace multiples of 3 with 'Fizz', 5 with 'Buzz', both with 'FizzBuzz'",
            difficulty: "Easy",
            points: 15,
            starterCode: `function fizzBuzz() {\n  const result = [];\n  for (let i = 1; i <= 100; i++) {\n    // Add your logic here\n  }\n  return result;\n}`,
            solution: `function fizzBuzz() {\n  const result = [];\n  for (let i = 1; i <= 100; i++) {\n    if (i % 3 === 0 && i % 5 === 0) result.push('FizzBuzz');\n    else if (i % 3 === 0) result.push('Fizz');\n    else if (i % 5 === 0) result.push('Buzz');\n    else result.push(i);\n  }\n  return result;\n}`,
            testCases: [
              { input: null, expected: Array.from({length: 100}, (_, i) => {
                const n = i + 1;
                if (n % 15 === 0) return 'FizzBuzz';
                if (n % 3 === 0) return 'Fizz';
                if (n % 5 === 0) return 'Buzz';
                return n;
              }) }
            ],
            hints: [
              "Use the modulo operator (%) to check for multiples",
              "Check for multiples of both 3 and 5 first",
              "Then check for individual multiples"
            ]
          }
        ]
      },
      {
        id: "algorithms",
        title: "Data Structures & Algorithms",
        description: "Arrays, objects, sorting, and searching",
        challenges: [
          {
            id: "challenge-4",
            title: "Two Sum",
            description: "Find two numbers in an array that add up to a target",
            difficulty: "Medium",
            points: 20,
            starterCode: `function twoSum(nums, target) {\n  // Your code here\n  return [];\n}`,
            solution: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
            testCases: [
              { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
              { input: [[3, 2, 4], 6], expected: [1, 2] },
              { input: [[3, 3], 6], expected: [0, 1] }
            ],
            hints: [
              "Consider using a hash map to store numbers you've seen",
              "For each number, calculate what number would complete the sum",
              "Check if that complement exists in your map"
            ]
          },
          {
            id: "challenge-5",
            title: "Binary Search",
            description: "Implement binary search on a sorted array",
            difficulty: "Medium",
            points: 25,
            starterCode: `function binarySearch(arr, target) {\n  // Your code here\n  return -1;\n}`,
            solution: `function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    else if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
            testCases: [
              { input: [[1, 3, 5, 7, 9, 11], 7], expected: 3 },
              { input: [[1, 3, 5, 7, 9, 11], 2], expected: -1 },
              { input: [[1], 1], expected: 0 }
            ],
            hints: [
              "Binary search requires a sorted array",
              "Start with the middle element",
              "Eliminate half the search space each iteration"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "data",
    title: "Data Scientist",
    icon: "📊",
    difficulty: "Hard",
    skills: ["Python", "ML", "Statistics"],
    challenges: 12,
    description: "Master data analysis and machine learning concepts",
    color: "#06b6d4",
    modules: [
      {
        id: "python-basics",
        title: "Python for Data Science",
        description: "NumPy, Pandas, and basic data manipulation",
        challenges: [
          {
            id: "challenge-7",
            title: "Data Cleaning",
            description: "Clean and preprocess a dataset",
            difficulty: "Medium",
            points: 20,
            starterCode: `import pandas as pd\nimport numpy as np\n\ndef clean_data(df):\n    # Your code here\n    return df`,
            solution: `import pandas as pd\nimport numpy as np\n\ndef clean_data(df):\n    df = df.drop_duplicates()\n    df = df.fillna(df.mean())\n    return df`,
            testCases: [
              { input: 'sample_dataframe', expected: 'cleaned_dataframe' }
            ],
            hints: [
              "Use pandas drop_duplicates() to remove duplicates",
              "Handle missing values with fillna()",
              "Consider using statistical methods for outlier detection"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "frontend",
    title: "Frontend Developer",
    icon: "🎨",
    difficulty: "Medium",
    skills: ["React", "CSS", "UI/UX"],
    challenges: 10,
    description: "Build beautiful and responsive user interfaces",
    color: "#f59e0b",
    modules: []
  },
  {
    id: "backend",
    title: "Backend Developer",
    icon: "⚙️",
    difficulty: "Hard",
    skills: ["Node.js", "APIs", "Databases"],
    challenges: 14,
    description: "Build scalable server-side applications",
    color: "#10b981",
    modules: []
  }
];

const TRENDING_SKILLS = [
  { name: "React", demand: 92, growth: "+15%" },
  { name: "Python", demand: 88, growth: "+22%" },
  { name: "TypeScript", demand: 85, growth: "+18%" },
  { name: "AWS", demand: 82, growth: "+12%" },
  { name: "Node.js", demand: 78, growth: "+10%" },
  { name: "Docker", demand: 75, growth: "+25%" },
  { name: "Figma", demand: 72, growth: "+30%" },
  { name: "SQL", demand: 70, growth: "+8%" },
];

const REVIEWS = [
  {
    id: 1,
    company: "Google",
    rating: 5,
    author: "Sarah K.",
    role: "SWE Intern",
    verified: true,
    text: "Amazing mentorship and learning opportunities. The team was incredibly supportive.",
    warnings: [],
    helpful: 142,
    date: "2 weeks ago",
  },
  {
    id: 2,
    company: "Meta",
    rating: 4,
    author: "John D.",
    role: "Product Intern",
    verified: true,
    text: "Great experience overall. Work-life balance could be better during peak seasons.",
    warnings: ["Long Hours"],
    helpful: 98,
    date: "1 month ago",
  },
  {
    id: 3,
    company: "Startup XYZ",
    rating: 2,
    author: "Mike T.",
    role: "Dev Intern",
    verified: true,
    text: "Unpaid overtime expected. No clear mentorship structure. Would not recommend.",
    warnings: ["Unpaid OT", "Poor Management", "No Mentorship"],
    helpful: 234,
    date: "3 weeks ago",
  },
];

const INTERVIEW_FIELDS = [
  "Software Engineering", "Frontend Development", "Backend Development",
  "Data Science", "Machine Learning", "Product Management",
  "UX Design", "DevOps", "Cybersecurity", "Mobile Development"
];

const INTERVIEW_VOICES = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (Female)" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel (Male)" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum (Male)" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte (Female)" },
];

 
// ROUTING
 

function navigate(page) {
  state.currentPage = page;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

 
// NAVIGATION COMPONENT
 

function Navigation() {
  const user = auth.currentUser;
  const pages = [
    { id: "home", label: "Home", icon: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { id: "explore", label: "Explore", icon: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' },
    { id: "practice", label: "Practice", icon: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>' },
    { id: "resume", label: "Resume AI", icon: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>' },
    { id: "trends", label: "Trends", icon: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>' },
    { id: "community", label: "Community", icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
    { id: "interview", label: "AI Interview", icon: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>' },
  ];

  return `
    <nav class="navbar" id="navbar">
      <div class="nav-container">
        <a href="#" onclick="navigate('home'); return false;" class="logo">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <span class="logo-text">INTERNHUB</span>
        </a>
        <div class="nav-links">
          ${pages.map(page => `
            <a href="#" onclick="navigate('${page.id}'); return false;" class="nav-link ${state.currentPage === page.id ? "active" : ""}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${page.icon}</svg>
              ${page.label}
            </a>
          `).join("")}
        </div>
        <div class="nav-actions">
          ${user
            ? `<span class="welcome-text">Welcome, ${user.email}</span>
               <button class="btn btn-ghost" onclick="signOutUser()">Sign Out</button>`
            : `<button class="btn btn-ghost" onclick="navigate('signIn'); return false;">Sign In</button>
               <button class="btn btn-primary" onclick="navigate('getStarted'); return false;">Get Started</button>`
          }
        </div>
      </div>
    </nav>
  `;
}

 
// HOME PAGE
 

function HomePage() {
  return `
    <section class="hero">
      <div class="hero-bg">
        <div class="grid-overlay"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title animate-slide-up">
          Break the <span class="gradient-text">Gatekeeping</span><br/>Find Real Opportunities
        </h1>
        <p class="hero-subtitle animate-slide-up">
          The internship aggregator built by students, for students. No more fake listings, hidden requirements, or endless scrolling.
        </p>
        <div class="search-box animate-slide-up">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input type="text" id="heroSearch" placeholder="Search internships, companies, roles..." class="search-input"
                 value="${state.searchQuery}" onkeypress="if(event.key==='Enter') searchFromHero()">
          <button class="btn btn-primary" onclick="searchFromHero()">Search</button>
        </div>
        <div class="hero-badges animate-slide-up">
          <span class="badge">✓ Verified Listings Only</span>
          <span class="badge">✓ AI-Powered Matching</span>
          <span class="badge">✓ Real Reviews</span>
          <span class="badge">✓ AI Interview Coach</span>
        </div>
      </div>
    </section>

    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-value gradient-text">10K+</div><div class="stat-label">Internships</div></div>
          <div class="stat-card"><div class="stat-value gradient-text">500+</div><div class="stat-label">Companies</div></div>
          <div class="stat-card"><div class="stat-value gradient-text">95%</div><div class="stat-label">Success Rate</div></div>
          <div class="stat-card"><div class="stat-value gradient-text">24/7</div><div class="stat-label">Support</div></div>
        </div>
      </div>
    </section>

    <section class="features-preview">
      <div class="container">
        <h2 class="section-title">Everything You Need to Land Your Dream Internship</h2>
        <div class="features-grid">
          ${[
            { page: "explore", icon: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>', title: "Smart Search", desc: "Advanced filtering with AI-powered recommendations" },
            { page: "practice", icon: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>', title: "Practice Mode", desc: "Gamified simulations to build real skills" },
            { page: "resume", icon: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>', title: "Resume AI", desc: "Get instant feedback and skill gap analysis" },
            { page: "trends", icon: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>', title: "Market Trends", desc: "Stay ahead with real-time industry insights" },
            { page: "community", icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>', title: "Real Reviews", desc: "Community-verified company experiences" },
            { page: "interview", icon: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>', title: "AI Interview Coach", desc: "Practice with a real AI interviewer using voice" },
          ].map(feature => `
            <a href="#" onclick="navigate('${feature.page}'); return false;" class="feature-card">
              <div class="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${feature.icon}</svg>
              </div>
              <h3>${feature.title}</h3>
              <p>${feature.desc}</p>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

 
// AUTH PAGES
 

function SignInPage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Sign In</h1>
        <p class="page-subtitle">Access your InternHub account</p>
      </div>
      <form class="auth-form" onsubmit="signIn(event)">
        <div class="form-group"><label>Email</label><input type="email" id="signInEmail" required></div>
        <div class="form-group"><label>Password</label><input type="password" id="signInPassword" required></div>
        <button type="submit" class="btn btn-primary btn-full">Sign In</button>
        <p class="form-footer">Don't have an account? <a href="#" onclick="navigate('getStarted'); return false;">Get Started</a></p>
      </form>
    </div>
  `;
}

function GetStartedPage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Get Started</h1>
        <p class="page-subtitle">Create your InternHub account</p>
      </div>
      <form class="auth-form" onsubmit="signUp(event)">
        <div class="form-group"><label>Email</label><input type="email" id="signUpEmail" required></div>
        <div class="form-group"><label>Password</label><input type="password" id="signUpPassword" required></div>
        <button type="submit" class="btn btn-primary btn-full">Create Account</button>
        <p class="form-footer">Already have an account? <a href="#" onclick="navigate('signIn'); return false;">Sign In</a></p>
      </form>
    </div>
  `;
}

function signIn(event) {
  event.preventDefault();
  const email = document.getElementById("signInEmail").value;
  const password = document.getElementById("signInPassword").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(cred => { alert(`Welcome back, ${cred.user.email}`); state.currentPage = "home"; render(); })
    .catch(err => alert(err.message));
}

function signUp(event) {
  event.preventDefault();
  const email = document.getElementById("signUpEmail").value;
  const password = document.getElementById("signUpPassword").value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => { alert(`Account created! Welcome, ${email}`); navigate("home"); })
    .catch(err => alert(err.message));
}

function signOutUser() {
  auth.signOut()
    .then(() => { alert("You have signed out successfully."); state.currentPage = "home"; render(); })
    .catch(err => alert("Error signing out: " + err.message));
}

 
// EXPLORE PAGE
 

function ExplorePage() {
  const filteredInternships = MOCK_INTERNSHIPS.filter(internship => {
    const matchesSearch = !state.filters.search ||
      internship.title.toLowerCase().includes(state.filters.search.toLowerCase()) ||
      internship.company.toLowerCase().includes(state.filters.search.toLowerCase()) ||
      internship.tags.some(tag => tag.toLowerCase().includes(state.filters.search.toLowerCase()));
    const matchesLocation = state.filters.location === "all" || internship.location.includes(state.filters.location);
    const matchesType = state.filters.type === "all" || internship.type === state.filters.type;
    return matchesSearch && matchesLocation && matchesType;
  });

  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Explore Internships</h1>
        <p class="page-subtitle">Discover verified opportunities from top companies</p>
      </div>
      <div class="filters-bar">
        <div class="search-filter">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" id="exploreSearch" placeholder="Search by role, company, or skill..." class="filter-input"
                 value="${state.filters.search}"
                 oninput="updateFilter('search', this.value)">
        </div>
        <select class="filter-select" onchange="updateFilter('location', this.value)">
          <option value="all">All Locations</option>
          <option value="CA">California</option>
          <option value="NY">New York</option>
          <option value="Remote">Remote</option>
          <option value="WA">Washington</option>
        </select>
        <select class="filter-select" onchange="updateFilter('type', this.value)">
          <option value="all">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        <select class="filter-select" onchange="sortInternships(this.value)">
          <option value="recent">Most Recent</option>
          <option value="salary-high">Highest Salary</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
      <div class="results-summary"><span>${filteredInternships.length} opportunities found</span></div>
      <div class="internships-grid">
        ${filteredInternships.map(internship => `
          <div class="internship-card">
            <div class="card-header">
              <div>
                <h3 class="internship-title">${internship.title}</h3>
                <div class="company-info">
                  <span class="company-name">${internship.company}</span>
                  ${internship.verified ? '<span class="verified-badge">✓ Verified</span>' : ""}
                </div>
              </div>
              <div class="rating">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ${internship.rating}
              </div>
            </div>
            <p class="internship-description">${internship.description}</p>
            <div class="internship-details">
              <span class="detail-item">📍 ${internship.location}</span>
              <span class="detail-item">🗓 ${internship.type}</span>
              <span class="detail-item salary">${internship.salary}</span>
            </div>
            <div class="tags">${internship.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
            <div class="card-footer">
              <span class="posted-time">${internship.posted}</span>
              <button class="btn btn-primary btn-sm" onclick="applyToInternship(${internship.id})">Apply Now</button>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

 
// PRACTICE PAGE


function PracticePage() {
  const isLoggedIn = auth.currentUser !== null;
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Practice Simulations</h1>
        <p class="page-subtitle">Build real skills through gamified challenges</p>
      </div>
      <div class="practice-stats">
        <div class="practice-stat"><span class="stat-label">Current Level</span><span class="stat-value gradient-text">${state.practiceMode.level}</span></div>
        <div class="practice-stat"><span class="stat-label">Total Score</span><span class="stat-value gradient-text">${state.practiceMode.score}</span></div>
        <div class="practice-stat"><span class="stat-label">Challenges Completed</span><span class="stat-value gradient-text">${state.practiceMode.challengesCompleted || 0}</span></div>
      </div>
      <h2 class="section-subtitle">Choose Your Path</h2>
      <div class="roles-grid">
        ${PRACTICE_ROLES.map(role => {
          const isSelected = state.practiceMode.selectedRole === role.id;
          const completedChallenges = state.practiceMode.completedChallenges?.[role.id] || 0;
          return `
            <div class="role-card ${isSelected ? 'selected' : ''}" onclick="selectPracticeRole('${role.id}')">
              <div class="role-icon">${role.icon}</div>
              <h3 class="role-title">${role.title}</h3>
              <div class="role-difficulty difficulty-${role.difficulty.toLowerCase()}">${role.difficulty}</div>
              <p class="role-description">${role.description}</p>
              <div class="role-skills">${role.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join("")}</div>
              ${isLoggedIn ? `
                <div class="role-progress">
                  <div class="progress-bar"><div class="progress-fill" style="width: ${(completedChallenges / role.challenges) * 100}%"></div></div>
                  <span class="progress-text">${completedChallenges}/${role.challenges} completed</span>
                </div>
              ` : `
                <div class="role-locked">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Sign in to track progress
                </div>
              `}
              <button class="btn ${isSelected ? 'btn-primary' : 'btn-ghost'} btn-full"
                      onclick="event.stopPropagation(); handleStartPractice('${role.id}')">
                ${isLoggedIn ? (completedChallenges > 0 ? 'Continue' : 'Start') : 'View Challenges'}
              </button>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function PracticeSessionPage() {
  if (!state.practiceMode.selectedRole) {
    return `<div class="page-container"><div class="page-header"><h1 class="page-title">No Role Selected</h1></div>
      <div class="practice-session"><button class="btn btn-primary" onclick="navigate('practice')">Go to Practice</button></div></div>`;
  }
  const role = PRACTICE_ROLES.find(r => r.id === state.practiceMode.selectedRole);
  if (!role) { navigate('practice'); return ''; }
  if (!role.modules || role.modules.length === 0) {
    return `<div class="page-container"><div class="page-header"><h1 class="page-title">${role.title}</h1></div>
      <div class="practice-session"><h2>Coming Soon!</h2><p>${role.description}</p>
      <button class="btn btn-primary" onclick="navigate('practice')">Back to Practice</button></div></div>`;
  }
  const currentModule = role.modules[state.practiceMode.currentModule || 0];
  const currentChallenge = currentModule?.challenges?.[state.practiceMode.currentChallenge || 0];
  if (!currentChallenge) {
    return `<div class="page-container"><div class="page-header"><h1 class="page-title">${role.title}</h1></div>
      <div class="practice-session"><h2>Module Complete!</h2><button class="btn btn-primary" onclick="navigate('practice')">Back</button></div></div>`;
  }
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">${role.title} — ${currentModule.title}</h1>
        <div class="session-progress">
          <div class="progress-bar"><div class="progress-fill" style="width: ${((state.practiceMode.currentChallenge || 0) / currentModule.challenges.length) * 100}%"></div></div>
          <span class="progress-text">Challenge ${(state.practiceMode.currentChallenge || 0) + 1} of ${currentModule.challenges.length}</span>
        </div>
      </div>
      <div class="practice-session">
        <div class="challenge-header">
          <h2>${currentChallenge.title}</h2>
          <div class="challenge-meta">
            <span class="difficulty-badge ${currentChallenge.difficulty.toLowerCase()}">${currentChallenge.difficulty}</span>
            <span class="points-badge">+${currentChallenge.points} points</span>
          </div>
        </div>
        <div class="challenge-description"><p>${currentChallenge.description}</p></div>
        <div class="code-editor-container">
          <div class="editor-header">
            <span>Code Editor</span>
            <div class="editor-actions">
              <button class="btn btn-sm btn-secondary" onclick="resetCode()">Reset</button>
              <button class="btn btn-sm btn-primary" onclick="runCode()">▶ Run Code</button>
            </div>
          </div>
          <div class="code-editor"><textarea id="codeInput">${currentChallenge.starterCode}</textarea></div>
        </div>
        <div class="test-results" id="testResults" style="display: none;">
          <h3>Test Results</h3><div id="testOutput"></div>
        </div>
        <div class="hints-section">
          <h3>Need Help?</h3>
          <div class="hints-container">
            ${currentChallenge.hints.map((hint, index) => `
              <div class="hint-item" onclick="toggleHint(${index})">
                <div class="hint-header"><span>Hint ${index + 1}</span><span class="hint-toggle">+</span></div>
                <div class="hint-content" id="hint-${index}" style="display: none;">${hint}</div>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="challenge-actions">
          ${state.practiceMode.currentChallenge > 0
            ? '<button class="btn btn-secondary" onclick="previousChallenge()">← Previous</button>'
            : '<button class="btn btn-secondary" onclick="navigate(\'practice\')">← Back to Practice</button>'
          }
          <button class="btn btn-primary" onclick="nextChallenge()">
            ${state.practiceMode.currentChallenge < currentModule.challenges.length - 1 ? 'Next Challenge →' : 'Complete Module ✓'}
          </button>
        </div>
      </div>
    </div>
  `;
}

// Practice helpers
function selectPracticeRole(roleId) {
  state.practiceMode.selectedRole = roleId;
  render();
}

function handleStartPractice(roleId) {
  if (!auth.currentUser) {
    const role = PRACTICE_ROLES.find(r => r.id === roleId);
    if (role && role.modules && role.modules.length > 0) {
      state.practiceMode.selectedRole = roleId;
      state.practiceMode.currentModule = 0;
      state.practiceMode.currentChallenge = 0;
      state.currentPage = "practiceSession";
      render();
    } else {
      alert("No challenges available yet for this role.");
    }
    return;
  }
  const role = PRACTICE_ROLES.find(r => r.id === roleId);
  if (!role) { alert("Invalid practice role."); return; }
  if (!role.modules || role.modules.length === 0) { alert(`No challenges available for ${role.title} yet.`); return; }
  state.practiceMode.selectedRole = roleId;
  state.practiceMode.currentModule = 0;
  state.practiceMode.currentChallenge = 0;
  state.currentPage = "practiceSession";
  render();
}

function runCode() {
  const code = document.getElementById('codeInput').value;
  const role = PRACTICE_ROLES.find(r => r.id === state.practiceMode.selectedRole);
  const currentModule = role.modules[state.practiceMode.currentModule];
  const currentChallenge = currentModule.challenges[state.practiceMode.currentChallenge];
  try {
    const results = [];
    let allPassed = true;
    currentChallenge.testCases.forEach((testCase, index) => {
      try {
        const userFunction = new Function('return ' + code)();
        let result;
        if (testCase.input === null) result = userFunction();
        else if (Array.isArray(testCase.input)) result = userFunction(...testCase.input);
        else result = userFunction(testCase.input);
        const passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
        allPassed = allPassed && passed;
        results.push({ test: index + 1, passed, input: testCase.input, expected: testCase.expected, actual: result });
      } catch (error) {
        allPassed = false;
        results.push({ test: index + 1, passed: false, input: testCase.input, expected: testCase.expected, actual: `Error: ${error.message}` });
      }
    });
    displayTestResults(results, allPassed);
    if (allPassed) awardPoints(currentChallenge.points);
  } catch (error) {
    document.getElementById('testResults').style.display = 'block';
    document.getElementById('testOutput').innerHTML = `<div class="error-message">Code error: ${error.message}</div>`;
  }
}

function displayTestResults(results, allPassed) {
  const testResults = document.getElementById('testResults');
  const testOutput = document.getElementById('testOutput');
  testResults.style.display = 'block';
  const overall = allPassed
    ? '<div class="overall-result success">🎉 All tests passed!</div>'
    : '<div class="overall-result error">Some tests failed. Keep trying!</div>';
  testOutput.innerHTML = overall + results.map(r => `
    <div class="test-case ${r.passed ? 'passed' : 'failed'}">
      <div class="test-header"><span>Test ${r.test}</span><span class="test-status">${r.passed ? '✅ PASS' : '❌ FAIL'}</span></div>
      <div class="test-details">
        <div>Input: ${JSON.stringify(r.input)}</div>
        <div>Expected: ${JSON.stringify(r.expected)}</div>
        <div>Actual: ${JSON.stringify(r.actual)}</div>
      </div>
    </div>
  `).join('');
}

function awardPoints(points) {
  state.practiceMode.score += points;
  state.practiceMode.challengesCompleted = (state.practiceMode.challengesCompleted || 0) + 1;
  if (auth.currentUser) savePracticeProgress();
  setTimeout(() => alert(`🎉 You earned ${points} points! Total: ${state.practiceMode.score}`), 300);
}

function resetCode() {
  const role = PRACTICE_ROLES.find(r => r.id === state.practiceMode.selectedRole);
  const challenge = role.modules[state.practiceMode.currentModule].challenges[state.practiceMode.currentChallenge];
  document.getElementById('codeInput').value = challenge.starterCode;
  document.getElementById('testResults').style.display = 'none';
}

function toggleHint(index) {
  const content = document.getElementById(`hint-${index}`);
  const toggle = document.querySelector(`[onclick="toggleHint(${index})"] .hint-toggle`);
  if (content.style.display === 'none') { content.style.display = 'block'; toggle.textContent = '−'; }
  else { content.style.display = 'none'; toggle.textContent = '+'; }
}

function nextChallenge() {
  const role = PRACTICE_ROLES.find(r => r.id === state.practiceMode.selectedRole);
  const currentModule = role.modules[state.practiceMode.currentModule];
  if (state.practiceMode.currentChallenge < currentModule.challenges.length - 1) {
    state.practiceMode.currentChallenge++;
    render();
  } else if (state.practiceMode.currentModule < role.modules.length - 1) {
    state.practiceMode.currentModule++;
    state.practiceMode.currentChallenge = 0;
    render();
  } else {
    alert(`🎉 You've completed all ${role.title} challenges!`);
    navigate('practice');
  }
}

function previousChallenge() {
  if (state.practiceMode.currentChallenge > 0) {
    state.practiceMode.currentChallenge--;
  } else if (state.practiceMode.currentModule > 0) {
    state.practiceMode.currentModule--;
    const role = PRACTICE_ROLES.find(r => r.id === state.practiceMode.selectedRole);
    state.practiceMode.currentChallenge = role.modules[state.practiceMode.currentModule].challenges.length - 1;
  }
  render();
}

async function savePracticeProgress() {
  if (!auth.currentUser) return;
  try {
    await db.collection('practiceProgress').doc(auth.currentUser.uid).set({
      totalScore: state.practiceMode.score,
      challengesCompleted: state.practiceMode.challengesCompleted || 0,
      completedChallenges: state.practiceMode.completedChallenges || {},
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) { console.error("Error saving progress:", error); }
}

async function loadPracticeProgress() {
  if (!auth.currentUser) return;
  try {
    const doc = await db.collection('practiceProgress').doc(auth.currentUser.uid).get();
    if (doc.exists) {
      const p = doc.data();
      state.practiceMode.score = p.totalScore || 0;
      state.practiceMode.challengesCompleted = p.challengesCompleted || 0;
      state.practiceMode.completedChallenges = p.completedChallenges || {};
    }
  } catch (error) { console.error("Error loading progress:", error); }
}

 
// RESUME PAGE


function ResumePage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">AI Resume Analyzer</h1>
        <p class="page-subtitle">Upload your resume and coding projects for AI-powered skill gap analysis</p>
      </div>
      <div class="resume-upload-section">
        <div class="dual-upload-container">
          <div class="upload-card">
            <div class="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <h3>Upload Resume</h3>
            <p>PDF or DOCX format</p>
            <input type="file" id="resumeInput" accept=".pdf,.docx" onchange="handleResumeUpload(this)" style="display: none;">
            <button class="btn btn-primary" onclick="document.getElementById('resumeInput').click()">Choose Resume</button>
            <div id="resumeFileName" class="file-name"></div>
          </div>
          <div class="upload-card">
            <div class="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
            </div>
            <h3>Upload Coding Files</h3>
            <p>ZIP file with your projects</p>
            <input type="file" id="codingFilesInput" accept=".zip" onchange="handleCodingUpload(this)" style="display: none;">
            <button class="btn btn-secondary" onclick="document.getElementById('codingFilesInput').click()">Choose ZIP File</button>
            <div id="codingFileName" class="file-name"></div>
          </div>
        </div>
        <button class="btn btn-gradient btn-analyze" onclick="analyzeResume()" id="analyzeBtn" disabled>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          Analyze with AI
        </button>
        ${state.resumeAnalysis ? `
          <div class="analysis-results">
            <h2 class="results-title">AI Analysis Results</h2>
            <div class="score-card">
              <div class="score-circle">
                <svg width="120" height="120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#2a2a35" stroke-width="10"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#gradient)" stroke-width="10"
                          stroke-dasharray="${(state.resumeAnalysis.overallScore || 0) * 3.14}"
                          stroke-dashoffset="0" transform="rotate(-90 60 60)"/>
                  <defs><linearGradient id="gradient"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs>
                </svg>
                <div class="score-text">
                  <span class="score-number">${state.resumeAnalysis.overallScore ?? 0}</span>
                  <span class="score-label">/100</span>
                </div>
              </div>
              <p class="score-description">${state.resumeAnalysis.summary || state.resumeAnalysis.message || ''}</p>
            </div>
            <div class="analysis-sections">
              <div class="analysis-section">
                <h3>Strengths</h3>
                <ul class="analysis-list">${(state.resumeAnalysis?.strengths || []).map(s => `<li class="strength-item">${s}</li>`).join("")}</ul>
              </div>
              <div class="analysis-section">
                <h3>Areas to Improve</h3>
                <ul class="analysis-list">${(state.resumeAnalysis?.improvements || []).map(i => `<li class="improvement-item">${i}</li>`).join("")}</ul>
              </div>
              <div class="analysis-section">
                <h3>Recommended Skills</h3>
                <div class="skills-grid">${(state.resumeAnalysis?.recommendedSkills || []).map(skill => `<span class="skill-badge">${skill.name || skill}</span>`).join("")}</div>
              </div>
            </div>
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

 
// TRENDS PAGE
 

function TrendsPage() {
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Market Trends</h1>
        <p class="page-subtitle">Stay ahead with real-time industry insights</p>
      </div>
      <div class="trends-grid">
        <div class="trend-card highlight-card">
          <h3>Most In-Demand Skills</h3>
          <div class="skills-chart">
            ${TRENDING_SKILLS.map((skill, index) => `
              <div class="skill-bar" style="animation-delay: ${index * 0.1}s">
                <div class="skill-info">
                  <span class="skill-name">${skill.name}</span>
                  <span class="skill-growth ${skill.growth.startsWith('+') ? 'positive' : 'negative'}">${skill.growth}</span>
                </div>
                <div class="skill-progress"><div class="skill-fill" style="width: ${skill.demand}%"></div></div>
                <span class="skill-demand">${skill.demand}% demand</span>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="trend-card">
          <h3>Top Hiring Companies</h3>
          <div class="companies-list">
            ${["Google", "Meta", "Amazon", "Microsoft", "Apple"].map((company, index) => `
              <div class="company-item" style="animation-delay: ${index * 0.1}s">
                <span class="company-rank">#${index + 1}</span>
                <span class="company-name">${company}</span>
                <span class="openings">${Math.floor(Math.random() * 50 + 20)} openings</span>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="trend-card">
          <h3>Average Salaries</h3>
          <div class="salary-chart">
            ${[
              { role: "Software Engineer", salary: 95000 },
              { role: "Data Scientist", salary: 88000 },
              { role: "Product Manager", salary: 82000 },
              { role: "UX Designer", salary: 72000 },
              { role: "Marketing", salary: 65000 },
            ].map((item, index) => `
              <div class="salary-item" style="animation-delay: ${index * 0.1}s">
                <span class="role-name">${item.role}</span>
                <div class="salary-bar"><div class="salary-fill" style="width: ${(item.salary / 100000) * 100}%"></div></div>
                <span class="salary-amount">$${(item.salary / 1000).toFixed(0)}K</span>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="trend-card">
          <h3>Industry Growth</h3>
          <div class="growth-stats">
            ${[
              { sector: "Tech", growth: 5.2 },
              { sector: "Finance", growth: 16.2 },
              { sector: "Healthcare", growth: 17.2 },
              { sector: "E-commerce", growth: 18.7 },
            ].map((item, index) => `
              <div class="growth-item" style="animation-delay: ${index * 0.1}s">
                <div class="growth-header"><span>${item.sector}</span><span class="growth-percent">+${item.growth}%</span></div>
                <div class="growth-bar"><div class="growth-fill" style="width: ${item.growth * 3}%"></div></div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

 
// COMMUNITY PAGE
 

function CommunityPage() {
  let filteredReviews = state.reviews ? [...state.reviews] : [];
  if (state.communityFilters.company) {
    filteredReviews = filteredReviews.filter(r => r.company.toLowerCase().includes(state.communityFilters.company.toLowerCase()));
  }
  if (state.communityFilters.rating !== "all") {
    filteredReviews = filteredReviews.filter(r => r.rating >= parseInt(state.communityFilters.rating));
  }
  if (state.communityFilters.verified) filteredReviews = filteredReviews.filter(r => r.verified);
  if (state.communityFilters.warnings) filteredReviews = filteredReviews.filter(r => r.warnings && r.warnings.length > 0);
  if (state.communityFilters.sort === "rating-high") filteredReviews.sort((a, b) => b.rating - a.rating);
  else if (state.communityFilters.sort === "rating-low") filteredReviews.sort((a, b) => a.rating - b.rating);
  else if (state.communityFilters.sort === "helpful") filteredReviews.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));

  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Community Reviews</h1>
        <p class="page-subtitle">Real experiences from real interns</p>
      </div>
      <div class="community-controls">
        <div class="filters-bar">
          <div class="search-filter">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" id="communitySearch" placeholder="Search by company..." class="filter-input"
                   value="${state.communityFilters.company}" oninput="updateCommunityFilter('company', this.value)">
          </div>
          <select class="filter-select" onchange="updateCommunityFilter('rating', this.value)">
            <option value="all">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>
          <select class="filter-select" onchange="updateCommunityFilter('sort', this.value)">
            <option value="recent">Most Recent</option>
            <option value="rating-high">Highest Rated</option>
            <option value="rating-low">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
          <label class="filter-checkbox">
            <input type="checkbox" onchange="updateCommunityFilter('verified', this.checked)"><span>Verified Only</span>
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" onchange="updateCommunityFilter('warnings', this.checked)"><span>With Warnings</span>
          </label>
        </div>
        <button class="btn btn-gradient" onclick="toggleReviewForm()">+ Write a Review</button>
      </div>
      <div class="results-summary"><span>${filteredReviews.length} reviews found</span></div>
      ${state.showReviewForm ? `
        <div class="review-form-container">
          <div class="review-form">
            <h2>Share Your Experience</h2>
            <p class="form-subtitle">Help future interns make informed decisions</p>
            <form onsubmit="submitReview(event)">
              <div class="form-group"><label>Company Name *</label><input type="text" id="reviewCompany" required placeholder="e.g., Google"></div>
              <div class="form-group"><label>Your Role *</label><input type="text" id="reviewRole" required placeholder="e.g., SWE Intern"></div>
              <div class="form-row">
                <div class="form-group"><label>Your Name *</label><input type="text" id="reviewAuthor" required placeholder="e.g., John D."></div>
                <div class="form-group">
                  <label>Rating *</label>
                  <select id="reviewRating" required>
                    <option value="">Select rating</option>
                    <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                    <option value="4">⭐⭐⭐⭐ Good</option>
                    <option value="3">⭐⭐⭐ Average</option>
                    <option value="2">⭐⭐ Below Average</option>
                    <option value="1">⭐ Poor</option>
                  </select>
                </div>
              </div>
              <div class="form-group"><label>Your Experience *</label><textarea id="reviewText" rows="5" required placeholder="Share your honest experience..."></textarea></div>
              <div class="form-group">
                <label>Warning Flags</label>
                <div class="warning-checkboxes">
                  <label><input type="checkbox" name="warnings" value="Unpaid OT"> Unpaid Overtime</label>
                  <label><input type="checkbox" name="warnings" value="Poor Management"> Poor Management</label>
                  <label><input type="checkbox" name="warnings" value="No Mentorship"> No Mentorship</label>
                  <label><input type="checkbox" name="warnings" value="Long Hours"> Long Hours</label>
                  <label><input type="checkbox" name="warnings" value="Toxic Culture"> Toxic Culture</label>
                  <label><input type="checkbox" name="warnings" value="Unpaid"> Unpaid Position</label>
                </div>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="toggleReviewForm()">Cancel</button>
                <button type="submit" class="btn btn-gradient">Submit Review</button>
              </div>
            </form>
          </div>
        </div>
      ` : ""}
      <div class="reviews-list">
        ${filteredReviews.map((review, index) => `
          <div class="review-card" style="animation-delay: ${index * 0.1}s">
            <div class="review-header">
              <div class="reviewer-info">
                <div class="reviewer-avatar">${review.author[0]}</div>
                <div>
                  <div class="reviewer-name">${review.author} ${review.verified ? '<span class="verified-badge">✓ Verified</span>' : ""}</div>
                  <div class="reviewer-role">${review.role} at ${review.company}</div>
                </div>
              </div>
              <div class="review-rating">
                ${Array(5).fill(0).map((_, i) => `
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${i < review.rating ? "currentColor" : "none"}" stroke="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                `).join("")}
              </div>
            </div>
            ${review.warnings && review.warnings.length > 0 ? `
              <div class="review-warnings">${review.warnings.map(w => `<span class="warning-badge">⚠ ${w}</span>`).join("")}</div>
            ` : ""}
            <p class="review-text">${review.text}</p>
            <div class="review-footer">
              <span class="review-date">${review.date || 'Recently'}</span>
              <button class="helpful-btn" onclick="markHelpful('${review.id}')">👍 Helpful (${review.helpful || 0})</button>
            </div>
          </div>
        `).join("")}
        ${filteredReviews.length === 0 ? '<div class="no-results"><p>No reviews found. Be the first to write one!</p></div>' : ''}
      </div>
    </div>
  `;
}

 
// AI INTERVIEW COACH PAGE
 

function InterviewPage() {
  const { isActive, field, experienceLevel, focus, company, conversationHistory, isLoading, isSpeaking, isRecording } = state.interview;

  if (!isActive) {
    return `
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">🎯 AI Interview Coach</h1>
          <p class="page-subtitle">Practice with a real AI interviewer — complete with voice. Get honest, adaptive feedback.</p>
        </div>

        <div class="interview-setup-grid">
          <div class="interview-panel">
            <h2 style="margin-bottom:1.5rem; font-size:1.5rem;">Configure Your Interview</h2>

            <div class="form-group">
              <label>Interview Field</label>
              <select id="interviewField" class="filter-select" style="width:100%">
                ${INTERVIEW_FIELDS.map(f => `<option value="${f}" ${f === field ? 'selected' : ''}>${f}</option>`).join("")}
              </select>
            </div>

            <div class="form-group">
              <label>Experience Level</label>
              <select id="interviewLevel" class="filter-select" style="width:100%">
                <option value="Internship" ${experienceLevel === 'Internship' ? 'selected' : ''}>Internship</option>
                <option value="Entry Level" ${experienceLevel === 'Entry Level' ? 'selected' : ''}>Entry Level</option>
                <option value="Junior" ${experienceLevel === 'Junior' ? 'selected' : ''}>Junior</option>
                <option value="Mid-Level" ${experienceLevel === 'Mid-Level' ? 'selected' : ''}>Mid-Level</option>
              </select>
            </div>

            <div class="form-group">
              <label>Interview Focus</label>
              <div class="field-tags">
                <span class="field-tag ${focus === 'balanced' ? 'active' : ''}" onclick="setInterviewFocus('balanced')">⚖️ Balanced</span>
                <span class="field-tag ${focus === 'technical_deep' ? 'active' : ''}" onclick="setInterviewFocus('technical_deep')">💻 Deep Technical</span>
                <span class="field-tag ${focus === 'behavioral' ? 'active' : ''}" onclick="setInterviewFocus('behavioral')">🤝 Behavioral</span>
                <span class="field-tag ${focus === 'system_design' ? 'active' : ''}" onclick="setInterviewFocus('system_design')">🏗️ System Design</span>
              </div>
            </div>

            <div class="form-group">
              <label>Target Company (Optional)</label>
              <input type="text" id="interviewCompany" class="filter-input" placeholder="e.g., Google, Meta, Amazon..."
                     value="${company}" style="width:100%; padding:0.75rem 1rem; background:var(--bg-card); border:1px solid var(--border-color); border-radius:0.75rem; color:var(--text-primary);">
            </div>

            <div class="form-group">
              <label>AI Voice</label>
              <select id="interviewVoice" class="filter-select" style="width:100%">
                ${INTERVIEW_VOICES.map(v => `<option value="${v.id}" ${state.interview.voiceId === v.id ? 'selected' : ''}>${v.name}</option>`).join("")}
              </select>
            </div>

            <button class="btn btn-gradient" style="width:100%; margin-top:1rem; padding:1rem; font-size:1.1rem;" onclick="startInterview()">
              🎙️ Start Interview
            </button>
          </div>

          <div class="interview-panel">
            <h2 style="margin-bottom:1.5rem; font-size:1.5rem;">What to Expect</h2>
            <div style="display:flex; flex-direction:column; gap:1.25rem;">
              ${[
                { icon: "🤖", title: "AI Interviewer", desc: "A strict, realistic AI interviewer that adapts based on your answers" },
                { icon: "🎙️", title: "Voice Responses", desc: "The responder can respond with voice synthesis for a real feel" },
                { icon: "🎯", title: "Adaptive Questions", desc: "Questions get harder or easier based on your performance" },
                { icon: "📊", title: "Detailed Feedback", desc: "Full performance report after your interview session" },
                { icon: "💡", title: "Get Hints", desc: "Stuck? Request a hint without ending the interview" },
              ].map(item => `
                <div style="display:flex; gap:1rem; align-items:flex-start; padding:1rem; background:rgba(99,102,241,0.05); border-radius:0.75rem; border:1px solid var(--border-color);">
                  <span style="font-size:1.75rem;">${item.icon}</span>
                  <div><strong style="color:var(--text-primary);">${item.title}</strong><p style="color:var(--text-secondary); margin:0.25rem 0 0; font-size:0.9rem;">${item.desc}</p></div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Active interview session
  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">🎙️ Live Interview Session</h1>
        <p class="page-subtitle">${field} • ${experienceLevel}${company ? ` • ${company}` : ''} • Question ${state.interview.questionCount}/${state.interview.maxQuestions}</p>
      </div>

      <div class="interview-session-layout">
        <div>
          <!-- Interviewer Avatar -->
          <div class="interviewer-header">
            <div class="interviewer-avatar ${isSpeaking ? 'speaking' : ''} ${isLoading ? '' : ''}" id="interviewerAvatar">
              🤖
              <div class="status-badge ${isSpeaking ? 'speaking active' : ''} ${isRecording ? 'listening active' : ''}"></div>
            </div>
            <div>
              <h3 style="color:var(--text-primary); font-size:1.25rem; margin-bottom:0.5rem;">Alex — AI Interviewer</h3>
              <p style="color:var(--text-secondary); font-size:0.9rem;">${field} Specialist</p>
              <div class="visualizer ${isSpeaking ? 'active' : ''}" id="audioVisualizer">
                ${Array(7).fill(0).map((_, i) => `<div class="viz-bar" style="animation-delay:${i * 0.15}s"></div>`).join('')}
              </div>
            </div>
            <div style="margin-left:auto; text-align:right;">
              <div style="font-size:0.85rem; color:var(--text-muted);">Progress</div>
              <div style="font-size:1.5rem; font-weight:800; color:var(--accent-primary);">${state.interview.questionCount}/${state.interview.maxQuestions}</div>
              <div class="progress-bar" style="width:120px; margin-top:0.5rem;">
                <div class="progress-fill" style="width:${(state.interview.questionCount / state.interview.maxQuestions) * 100}%"></div>
              </div>
            </div>
          </div>

          <!-- Chat Messages -->
          <div class="chat-container" id="chatContainer">
            ${conversationHistory.length === 0 && isLoading ? `
              <div style="text-align:center; padding:2rem;">
                <div class="thinking-dots"><span></span><span></span><span></span></div>
                <p style="color:var(--text-muted);">Alex is preparing your interview...</p>
              </div>
            ` : conversationHistory.map(msg => `
              <div class="message ${msg.role === 'interviewer' ? 'message-interviewer' : 'message-user'}">
                <div>${msg.content}</div>
                <div class="message-meta">${msg.role === 'interviewer' ? '🤖 Alex' : '👤 You'} • ${msg.time || 'just now'}</div>
              </div>
            `).join("")}
            ${isLoading && conversationHistory.length > 0 ? `
              <div class="message message-interviewer">
                <div class="thinking-dots"><span></span><span></span><span></span></div>
              </div>
            ` : ""}
          </div>

          <!-- Input Area -->
          <div class="interview-input-area">
            <div class="interview-input-row">
              <input type="text" id="interviewInput" class="filter-input" placeholder="Type your answer or click the mic..."
                     style="flex:1; padding:0.875rem 1rem; background:var(--bg-card); border:1px solid var(--border-color); border-radius:0.75rem; color:var(--text-primary);"
                     onkeypress="if(event.key==='Enter' && !event.shiftKey) { sendInterviewAnswer(); }"
                     ${isLoading ? 'disabled' : ''}>
              <button class="mic-btn ${isRecording ? 'recording' : ''}" onclick="toggleVoiceInput()" title="${isRecording ? 'Stop Recording' : 'Start Voice Input'}">
                ${isRecording ? '⏹' : '🎙️'}
              </button>
              <button class="btn btn-primary" onclick="sendInterviewAnswer()" ${isLoading ? 'disabled' : ''}>Send</button>
            </div>
            <div class="interview-actions">
              <button class="btn btn-secondary btn-sm" onclick="requestHint()" ${isLoading ? 'disabled' : ''}>💡 Get Hint</button>
              <button class="btn btn-secondary btn-sm" onclick="skipQuestion()" ${isLoading ? 'disabled' : ''}>⏭ Skip</button>
              <button class="btn btn-secondary btn-sm" onclick="replayLastMessage()">🔊 Replay Audio</button>
              <button class="btn btn-gradient btn-sm" onclick="endInterview()">🏁 End & Get Feedback</button>
            </div>
          </div>
        </div>

        <!-- Side Panel -->
        <div class="side-panel">
          <div class="info-card">
            <h4>Session Info</h4>
            <ul class="topic-list">
              <li>📌 Field: ${field}</li>
              <li>🎯 Level: ${experienceLevel}</li>
              <li>🔍 Focus: ${focus.replace('_', ' ')}</li>
              ${company ? `<li>🏢 Company: ${company}</li>` : ''}
              <li>❓ Q ${state.interview.questionCount}/${state.interview.maxQuestions}</li>
            </ul>
          </div>

          <div class="info-card">
            <h4>Topics Covered</h4>
            <div id="topicsCovered" style="font-size:0.85rem; color:var(--text-secondary);">
              ${state.interview.topicsCovered && state.interview.topicsCovered.length > 0
                ? state.interview.topicsCovered.map(t => `<span class="skill-tag" style="margin:0.25rem;">${t}</span>`).join("")
                : '<span style="color:var(--text-muted);">Topics will appear here...</span>'}
            </div>
          </div>

          <div class="info-card">
            <h4>Quick Tips</h4>
            <ul class="topic-list">
              <li>Be specific with examples</li>
              <li>Use STAR method for behavioral questions</li>
              <li>Think aloud when solving problems</li>
              <li>Ask clarifying questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

 
// INTERVIEW COACH 

function setInterviewFocus(focus) {
  state.interview.focus = focus;
  render();
}

async function startInterview() {
  const field = document.getElementById('interviewField').value;
  const level = document.getElementById('interviewLevel').value;
  const company = document.getElementById('interviewCompany').value;
  const voiceId = document.getElementById('interviewVoice').value;

  state.interview.field = field;
  state.interview.experienceLevel = level;
  state.interview.company = company;
  state.interview.voiceId = voiceId;
  state.interview.isActive = true;
  state.interview.conversationHistory = [];
  state.interview.questionCount = 0;
  state.interview.currentDepth = 0;
  state.interview.topicsCovered = [];
  state.interview.isLoading = true;

  render();

  try {
    const response = await fetch('http://localhost:3000/api/interview/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field,
        experienceLevel: level,
        focus: state.interview.focus,
        company,
        conversationHistory: [],
        currentDepth: 0,
        isIntroduction: true
      })
    });

    const data = await response.json();
    if (data.success) {
      state.interview.questionCount = 1;
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      state.interview.conversationHistory.push({ role: 'interviewer', content: data.question, time });
      state.interview.isLoading = false;
      render();
      scrollChatToBottom();
      await speakInterviewText(data.question);
    }
  } catch (err) {
    console.error('Interview start error:', err);
    state.interview.isLoading = false;
    const fallback = `Hello! I'm Alex, your AI interviewer for this ${field} session. Let's begin. Can you start by telling me about yourself and what drew you to ${field}?`;
    state.interview.conversationHistory.push({ role: 'interviewer', content: fallback, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    state.interview.questionCount = 1;
    render();
    scrollChatToBottom();
    await speakInterviewText(fallback);
  }
}

async function sendInterviewAnswer() {
  const input = document.getElementById('interviewInput');
  if (!input) return;
  const answer = input.value.trim();
  if (!answer || state.interview.isLoading) return;

  input.value = '';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  state.interview.conversationHistory.push({ role: 'candidate', content: answer, time });
  state.interview.isLoading = true;
  render();
  scrollChatToBottom();

  if (state.interview.questionCount >= state.interview.maxQuestions) {
    await endInterview();
    return;
  }

  try {
    // Analyze the answer first
    const analysisRes = await fetch('http://localhost:3000/api/interview/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer, field: state.interview.field, experienceLevel: state.interview.experienceLevel })
    });
    const analysisData = await analysisRes.json();
    if (analysisData.success && analysisData.analysis.topics) {
      state.interview.topicsCovered = [...new Set([...(state.interview.topicsCovered || []), ...analysisData.analysis.topics])];
      state.interview.currentDepth = analysisData.analysis.depth || state.interview.currentDepth;
    }

    // Get next question
    const questionRes = await fetch('http://localhost:3000/api/interview/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field: state.interview.field,
        experienceLevel: state.interview.experienceLevel,
        focus: state.interview.focus,
        company: state.interview.company,
        conversationHistory: state.interview.conversationHistory,
        currentDepth: state.interview.currentDepth,
        isIntroduction: false
      })
    });
    const questionData = await questionRes.json();
    if (questionData.success) {
      state.interview.questionCount++;
      const qTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      state.interview.conversationHistory.push({ role: 'interviewer', content: questionData.question, time: qTime });
      state.interview.isLoading = false;
      render();
      scrollChatToBottom();
      await speakInterviewText(questionData.question);
    }
  } catch (err) {
    console.error('Interview answer error:', err);
    state.interview.isLoading = false;
    state.interview.questionCount++;
    const fallback = "That's an interesting answer. Let's dive deeper — can you walk me through a specific challenge you've faced and how you solved it?";
    state.interview.conversationHistory.push({ role: 'interviewer', content: fallback, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    render();
    scrollChatToBottom();
    await speakInterviewText(fallback);
  }
}

async function requestHint() {
  if (state.interview.isLoading) return;
  const lastQuestion = [...state.interview.conversationHistory].reverse().find(m => m.role === 'interviewer');
  if (!lastQuestion) return;

  state.interview.isLoading = true;
  render();

  try {
    const res = await fetch('http://localhost:3000/api/interview/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: lastQuestion.content, field: state.interview.field, experienceLevel: state.interview.experienceLevel })
    });
    const data = await res.json();
    const hint = data.success ? `💡 Hint: ${data.hint}` : "💡 Think about breaking down the problem step by step and consider edge cases.";
    state.interview.conversationHistory.push({ role: 'interviewer', content: hint, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    state.interview.isLoading = false;
    render();
    scrollChatToBottom();
    await speakInterviewText(data.hint || hint);
  } catch (err) {
    state.interview.isLoading = false;
    render();
  }
}

async function skipQuestion() {
  if (state.interview.isLoading) return;
  const skipMsg = "No problem, let's move on. Next question:";
  state.interview.conversationHistory.push({ role: 'candidate', content: '[Skipped this question]', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
  state.interview.isLoading = true;
  render();

  try {
    const res = await fetch('http://localhost:3000/api/interview/question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        field: state.interview.field,
        experienceLevel: state.interview.experienceLevel,
        focus: state.interview.focus,
        company: state.interview.company,
        conversationHistory: state.interview.conversationHistory,
        currentDepth: 0,
        isIntroduction: false
      })
    });
    const data = await res.json();
    if (data.success) {
      state.interview.questionCount++;
      state.interview.conversationHistory.push({ role: 'interviewer', content: data.question, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
      state.interview.isLoading = false;
      render();
      scrollChatToBottom();
      await speakInterviewText(data.question);
    }
  } catch (err) {
    state.interview.isLoading = false;
    render();
  }
}

async function endInterview() {
  state.interview.isLoading = true;
  render();

  try {
    const res = await fetch('http://localhost:3000/api/interview/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationHistory: state.interview.conversationHistory,
        field: state.interview.field,
        experienceLevel: state.interview.experienceLevel,
        company: state.interview.company
      })
    });
    const data = await res.json();
    state.interview.isActive = false;
    state.interview.isLoading = false;
    state.interview.feedback = data.success ? data.feedback : "Interview complete! You did great — keep practicing.";
    state.currentPage = 'interviewFeedback';
    render();
  } catch (err) {
    console.error('End interview error:', err);
    state.interview.isActive = false;
    state.interview.isLoading = false;
    state.interview.feedback = "Interview complete! Great job practicing. Keep it up!";
    state.currentPage = 'interviewFeedback';
    render();
  }
}

function InterviewFeedbackPage() {
  const feedback = state.interview.feedback || "Interview complete!";
  const formattedFeedback = feedback
    .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
    .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\* (.*?)(\n|$)/g, '<li>$1</li>')
    .replace(/\n/g, '<br>');

  return `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">📊 Interview Feedback</h1>
        <p class="page-subtitle">Detailed performance analysis for your ${state.interview.field} interview</p>
      </div>

      <div style="max-width:900px; margin:0 auto;">
        <div class="score-card" style="margin-bottom:2rem;">
          <div style="font-size:3rem; margin-bottom:1rem;">🏆</div>
          <h2 style="font-size:1.75rem; margin-bottom:0.5rem; color:var(--text-primary);">Interview Complete!</h2>
          <p style="color:var(--text-secondary);">${state.interview.field} • ${state.interview.experienceLevel} • ${state.interview.questionCount} questions</p>
        </div>

        <div class="analysis-section" style="margin-bottom:2rem;">
          <h3 style="font-size:1.5rem; margin-bottom:1.5rem; color:var(--text-primary);">Detailed Feedback</h3>
          <div class="feedback-result" style="line-height:1.8; color:var(--text-secondary);">
            ${formattedFeedback}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:2rem;">
          <div class="analysis-section">
            <h3>Topics Covered</h3>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:1rem;">
              ${(state.interview.topicsCovered || []).map(t => `<span class="skill-badge">${t}</span>`).join("") || '<p style="color:var(--text-muted)">No specific topics tracked</p>'}
            </div>
          </div>
          <div class="analysis-section">
            <h3>Session Stats</h3>
            <ul style="list-style:none; padding:0; margin-top:1rem; color:var(--text-secondary);">
              <li style="padding:0.5rem 0; border-bottom:1px solid var(--border-color);">Questions Answered: ${state.interview.questionCount}</li>
              <li style="padding:0.5rem 0; border-bottom:1px solid var(--border-color);">Field: ${state.interview.field}</li>
              <li style="padding:0.5rem 0; border-bottom:1px solid var(--border-color);">Level: ${state.interview.experienceLevel}</li>
              <li style="padding:0.5rem 0;">Focus: ${state.interview.focus.replace('_', ' ')}</li>
            </ul>
          </div>
        </div>

        <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
          <button class="btn btn-gradient" onclick="restartInterview()" style="padding:1rem 2rem;">🔄 Practice Again</button>
          <button class="btn btn-secondary" onclick="navigate('interview')" style="padding:1rem 2rem;">⚙️ New Configuration</button>
          <button class="btn btn-secondary" onclick="navigate('practice')" style="padding:1rem 2rem;">💻 Code Practice</button>
        </div>
      </div>
    </div>
  `;
}

function restartInterview() {
  state.interview.conversationHistory = [];
  state.interview.questionCount = 0;
  state.interview.isActive = true;
  state.interview.topicsCovered = [];
  state.interview.feedback = null;
  state.currentPage = 'interview';
  startInterview();
}

// ElevenLabs TTS via backend proxy
let lastSpokenText = '';
async function speakInterviewText(text) {
  if (!text || !state.interview.voiceId) return;
  lastSpokenText = text;
  state.interview.isSpeaking = true;
  const avatar = document.getElementById('interviewerAvatar');
  const visualizer = document.getElementById('audioVisualizer');
  if (avatar) avatar.classList.add('speaking');
  if (visualizer) visualizer.classList.add('active');

  try {
    const response = await fetch('http://localhost:3000/api/interview/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.substring(0, 500), voiceId: state.interview.voiceId })
    });

    if (!response.ok) {
      console.warn('TTS failed, skipping audio');
      return;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.onended = () => {
      state.interview.isSpeaking = false;
      if (avatar) avatar.classList.remove('speaking');
      if (visualizer) visualizer.classList.remove('active');
      URL.revokeObjectURL(audioUrl);
    };
    await audio.play();
  } catch (err) {
    console.warn('TTS error:', err);
    state.interview.isSpeaking = false;
    if (avatar) avatar.classList.remove('speaking');
    if (visualizer) visualizer.classList.remove('active');
  }
}

async function replayLastMessage() {
  if (lastSpokenText) await speakInterviewText(lastSpokenText);
}

// Voice input using Web Speech API
let recognition = null;
function toggleVoiceInput() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Voice input is not supported in your browser. Please use Chrome.');
    return;
  }

  if (state.interview.isRecording) {
    if (recognition) recognition.stop();
    state.interview.isRecording = false;
    render();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    state.interview.isRecording = true;
    render();
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
    const input = document.getElementById('interviewInput');
    if (input) input.value = transcript;
  };

  recognition.onend = () => {
    state.interview.isRecording = false;
    render();
  };

  recognition.onerror = (e) => {
    console.error('Speech recognition error:', e);
    state.interview.isRecording = false;
    render();
  };

  recognition.start();
}

function scrollChatToBottom() {
  setTimeout(() => {
    const chat = document.getElementById('chatContainer');
    if (chat) chat.scrollTop = chat.scrollHeight;
  }, 100);
}

 
// FOOTER


function Footer() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <div class="logo">
              <div class="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <span class="logo-text">InternHub</span>
            </div>
            <p class="footer-tagline">Breaking gatekeeping, one internship at a time.</p>
          </div>
          <div class="footer-links">
            <div class="footer-column">
              <h4>Product</h4>
              <a href="#" onclick="navigate('explore'); return false;">Explore</a>
              <a href="#" onclick="navigate('practice'); return false;">Practice</a>
              <a href="#" onclick="navigate('resume'); return false;">Resume AI</a>
              <a href="#" onclick="navigate('interview'); return false;">AI Interview</a>
            </div>
            <div class="footer-column">
              <h4>Resources</h4>
              <a href="#" onclick="navigate('trends'); return false;">Trends</a>
              <a href="#" onclick="navigate('community'); return false;">Community</a>
              <a href="#">Blog</a>
            </div>
            <div class="footer-column">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 InternHub. Built by students, for students.</p>
        </div>
      </div>
    </footer>
  `;
}


// EVENT HANDLERS


function handleResumeUpload(input) {
  if (input.files && input.files[0]) {
    document.getElementById("resumeFileName").textContent = `✓ ${input.files[0].name}`;
    checkAnalyzeButton();
  }
}

function handleCodingUpload(input) {
  if (input.files && input.files[0]) {
    document.getElementById("codingFileName").textContent = `✓ ${input.files[0].name}`;
    checkAnalyzeButton();
  }
}

function checkAnalyzeButton() {
  const resumeFile = document.getElementById("resumeInput")?.files[0];
  const codingFile = document.getElementById("codingFilesInput")?.files[0];
  const analyzeBtn = document.getElementById("analyzeBtn");
  if (resumeFile && codingFile && analyzeBtn) analyzeBtn.disabled = false;
}

function searchFromHero() {
  const input = document.getElementById("heroSearch");
  if (input && input.value.trim()) {
    state.filters.search = input.value.trim();
    state.searchQuery = input.value.trim();
    navigate("explore");
  }
}

function updateFilter(key, value) {
  state.filters[key] = value;
  debouncedRender();
}

function updateCommunityFilter(key, value) {
  state.communityFilters[key] = value;
  debouncedRender();
}

function sortInternships(sortBy) { render(); }

async function analyzeResume() {
  const resumeFile = document.getElementById('resumeInput')?.files[0];
  const codeFile = document.getElementById('codingFilesInput')?.files[0];
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (!resumeFile || !codeFile) { alert('Please select both a resume and a code ZIP file.'); return; }
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing...';
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('code', codeFile);
  try {
    const response = await fetch('http://localhost:3000/api/analyze', { method: 'POST', body: formData });
    const result = await response.json();
    if (!result.success || !result.analysis) { alert(result.error || 'Analysis failed.'); return; }
    state.resumeAnalysis = result.analysis;
    render();
  } catch (err) {
    console.error('Error analyzing resume:', err);
    alert('Error analyzing resume. Is the server running on port 3000?');
  } finally {
    const btn = document.getElementById('analyzeBtn');
    if (btn) { btn.disabled = false; btn.textContent = 'Analyze with AI'; }
  }
}

function applyToInternship(id) {
  alert(`Application started for internship #${id}!`);
}

function markHelpful(reviewId) {
  db.collection("reviews").doc(String(reviewId)).update({
    helpful: firebase.firestore.FieldValue.increment(1)
  }).then(() => render()).catch(err => console.error("Error updating helpful:", err));
}

function toggleReviewForm() {
  state.showReviewForm = !state.showReviewForm;
  render();
  if (state.showReviewForm) {
    setTimeout(() => document.querySelector(".review-form-container")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }
}

function submitReview(event) {
  event.preventDefault();
  const warnings = Array.from(document.querySelectorAll('input[name="warnings"]:checked')).map(cb => cb.value);
  db.collection("reviews").add({
    company: document.getElementById("reviewCompany").value,
    role: document.getElementById("reviewRole").value,
    author: document.getElementById("reviewAuthor").value,
    rating: Number(document.getElementById("reviewRating").value),
    text: document.getElementById("reviewText").value,
    warnings,
    verified: false,
    helpful: 0,
    date: "Just now",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => { alert("Review submitted!"); navigate("community"); })
    .catch(err => { console.error(err); alert("Error submitting review."); });
}

async function fetchReviews() {
  try {
    const snapshot = await db.collection("reviews").orderBy("createdAt", "desc").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn("Could not fetch reviews:", err);
    return REVIEWS; // fallback to mock
  }
}

 
// SCROLL & ANIMATION HELPERS
 

function initScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll(".stat-card, .feature-card, .internship-card, .role-card, .trend-card, .review-card").forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "all 0.6s ease-out";
    observer.observe(el);
  });
}

function initNavbarScroll() {
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 50) navbar?.classList.add("scrolled");
    else navbar?.classList.remove("scrolled");
  });
}

 
// MAIN RENDER FUNCTION
 

async function render() {
  saveFocus();
  const app = document.getElementById("app");
  let content = "";

  try {
    if (auth.currentUser && (state.currentPage === "practice" || state.currentPage === "practiceSession")) {
      await loadPracticeProgress().catch(err => console.warn("Progress load failed:", err));
    }
    if (state.currentPage === "community") {
      state.reviews = await fetchReviews().catch(() => REVIEWS);
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }

  switch (state.currentPage) {
    case "home": content = HomePage(); break;
    case "explore": content = ExplorePage(); break;
    case "practice": content = PracticePage(); break;
    case "practiceSession": content = PracticeSessionPage(); break;
    case "resume": content = ResumePage(); break;
    case "trends": content = TrendsPage(); break;
    case "community": content = CommunityPage(); break;
    case "interview": content = InterviewPage(); break;
    case "interviewFeedback": content = InterviewFeedbackPage(); break;
    case "signIn": content = SignInPage(); break;
    case "getStarted": content = GetStartedPage(); break;
    default: content = HomePage();
  }

  app.innerHTML = Navigation() + content + Footer();
  initScrollAnimations();
  initNavbarScroll();
  restoreFocus();

  // Scroll chat to bottom if on interview page
  if (state.currentPage === 'interview' && state.interview.isActive) {
    scrollChatToBottom();
  }
}

 
// INITIALIZE
 

if (location.hostname === "localhost") {
  try { db.useEmulator("localhost", 8080); } catch(e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  render();
});

