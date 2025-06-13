import React from 'react';
import Student from '../../assets/student.jpg';
import TPO from '../../assets/tpo.jpg';
import Management from '../../assets/management.jpg';
import Admin from '../../assets/admin.jpg';

function LandAbout() {
  const roles = [
    {
      title: "Student",
      image: Student,
      description: "Students can register, explore job opportunities, apply for jobs, and track application status with a personalized dashboard.",
      color: "bg-blue-100 border-blue-200",
      textColor: "text-blue-700"
    },
    {
      title: "Departmental Coordinators",
      image: TPO,
      description: "Coordinators manage company data, job postings, application reviews, and generate insightful reports for placement tracking.",
      color: "bg-purple-100 border-purple-200",
      textColor: "text-purple-700"
    },
    {
      title: "TPO (Training & Placement Officer)",
      image: Management,
      description: "TPOs can monitor overall placement activities, review analytics, and control system access and quality assurance.",
      color: "bg-emerald-100 border-emerald-200",
      textColor: "text-emerald-700"
    },
    {
      title: "Central Placement Cell (Admin)",
      image: Admin,
      description: "CPC handle all roles with super privileges—managing users, system settings, and ensuring smooth operations across modules.",
      color: "bg-rose-100 border-rose-200",
      textColor: "text-rose-700"
    },
  ];

  return (
    <section id="about" className="bg-gray-50 py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">About CPMS</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            "Developed by the AIML final-year students of Techno Main Salt Lake, Team Vitalis"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roles.map((role, idx) => (
            <div 
              key={idx} 
              className={`bg-white rounded-xl shadow-md overflow-hidden border-t-4 ${role.border} transition-all duration-300 hover:shadow-lg hover:-translate-y-2`}
            >
              <div className="p-6 flex flex-col items-center h-full">
                {/* Larger image container */}
                <div className="mb-6 w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={role.image}
                    alt={role.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className={`text-xl font-bold mb-3 text-center ${role.textColor}`}>
                  {role.title}
                </h3>
                <p className="text-gray-600 text-base text-center flex-grow">
                  {role.description}
                </p>
                
                <div className="mt-6 w-full pt-4 border-t border-gray-100 text-center">
                  <span className={`inline-block py-2 px-4 text-sm font-medium rounded-full ${role.color} ${role.textColor}`}>
                    Learn more
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandAbout;