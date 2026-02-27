import { useState } from 'react';

// Mock data: This represents the seniors in your database
const SENIORS = [
  { 
    id: 1, 
    name: "Aisha Sharma", 
    role: "Senior Frontend Engineer", 
    skills: ["React", "Tailwind", "System Design"], 
    initials: "AS" 
  },
  { 
    id: 2, 
    name: "Rahul Verma", 
    role: "Data Scientist", 
    skills: ["Python", "Machine Learning", "SQL"], 
    initials: "RV" 
  },
  { 
    id: 3, 
    name: "Priya Patel", 
    role: "Product Designer", 
    skills: ["UI/UX", "Figma", "Wireframing"], 
    initials: "PP" 
  },
  { 
    id: 4, 
    name: "Vikram Singh", 
    role: "Backend Lead", 
    skills: ["Node.js", "MongoDB", "AWS"], 
    initials: "VS" 
  },
];

function App() {
  const [searchSkill, setSearchSkill] = useState('');

  // Filter seniors based on the search input
  const filteredSeniors = SENIORS.filter(senior => 
    senior.skills.some(skill => skill.toLowerCase().includes(searchSkill.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 md:p-12 font-sans">
      
      {/* Header Section */}
      <header className="max-w-4xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight mb-4">
          SkillBridge
        </h1>
        <p className="text-lg text-gray-600">
          A structured, skill-based platform connecting freshers with experienced seniors for guided mentorship.
        </p>
      </header>

      {/* Search Section */}
      <section className="max-w-xl mx-auto mb-12">
        <input 
          type="text" 
          placeholder="Search by skill (e.g., React, Python, Figma)..." 
          value={searchSkill}
          onChange={(e) => setSearchSkill(e.target.value)}
          className="w-full px-5 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
        />
      </section>

      {/* Mentor Grid Section */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredSeniors.length > 0 ? (
          filteredSeniors.map((senior) => (
            <div key={senior.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center text-center">
              
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mb-4">
                {senior.initials}
              </div>
              
              {/* Info */}
              <h2 className="text-xl font-semibold text-gray-900">{senior.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{senior.role}</p>
              
              {/* Skills Tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-6 mt-auto">
                {senior.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>
              
              {/* Action Button */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
                Request Connection
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            No seniors found with that skill. Try searching something else!
          </div>
        )}
      </main>

    </div>
  )
}

export default App;