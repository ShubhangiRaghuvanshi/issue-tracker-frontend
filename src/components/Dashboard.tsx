import React, { ReactElement, useEffect, useState } from 'react';

const Dashboard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Array<{ _id: string; title: string }>>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');

  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject(data[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow-sm p-6 hidden md:block">
          <h2 className="text-xl font-bold mb-6">Dashboard</h2>
          <nav className="space-y-4">
            <a href="#" className="block text-blue-600 font-medium hover:underline">Project Overview</a>
            <a href="#" className="block text-gray-700 hover:text-blue-600">Team Members</a>
            <a href="#" className="block text-gray-700 hover:text-blue-600">Tickets</a>
          </nav>

          {/* Project Selector Dropdown */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200 text-sm"
            >
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border rounded px-3 py-2 text-sm shadow-sm focus:outline-none"
            >
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
