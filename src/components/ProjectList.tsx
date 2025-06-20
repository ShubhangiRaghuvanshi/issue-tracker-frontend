import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Plus, Users, Trash2, Edit2, FolderOpen, Calendar, Settings } from 'lucide-react';
import ProjectForm from './ProjectForm';

interface Project {
  _id: string;
  title: string;
  description: string;
  teamMembers: Array<{
    user: {
      _id: string;
      name: string;
      email: string;
    };
    role: 'owner' | 'member';
  }>;
  createdAt: string;
}

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://issue-tracker-backend-3.onrender.com/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: { title: string; description: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://issue-tracker-backend-3.onrender.com/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create project');
      const newProject = await response.json();
      setProjects(prev => [...prev, newProject]);
      setShowCreateModal(false);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`https://issue-tracker-backend-3.onrender.com/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete project');
      setProjects(prev => prev.filter(p => p._id !== projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-8 shadow-xl border border-gray-200/50">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium text-gray-700">Loading projects...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-xl max-w-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-xl mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <FolderOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Project Management</h1>
                    <p className="text-blue-100 text-sm">Manage and oversee all your projects</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <span className="text-white font-semibold">{projects.length}</span>
                    <span className="text-blue-100 text-sm ml-2">Total Projects</span>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-6 py-3 border border-white/20 text-sm font-semibold rounded-lg text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
                  <div className="text-sm text-gray-600">Total Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {projects.filter(p => p.teamMembers.some(m => m.user._id === user?.id && m.role === 'owner')).length}
                  </div>
                  <div className="text-sm text-gray-600">Owned Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {projects.filter(p => p.teamMembers.some(m => m.user._id === user?.id && m.role === 'member')).length}
                  </div>
                  <div className="text-sm text-gray-600">Member Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {projects.reduce((acc, p) => acc + p.teamMembers.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Team Members</div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-xl p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first project</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map(project => {
                const isOwner = project.teamMembers.some(
                  member => member.user._id === user?.id && member.role === 'owner'
                );
                const isMember = project.teamMembers.some(
                  member => member.user._id === user?.id
                );

                return (
                  <div
                    key={project._id}
                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    {/* Project Header */}
                    <div className={`px-6 py-4 ${isOwner ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                            <FolderOpen className="w-4 h-4 text-white" />
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                            {isOwner ? 'Owner' : 'Member'}
                          </span>
                        </div>
                        {isOwner && (
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/projects/${project._id}`);
                              }}
                              className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded"
                              title="Edit Project"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project._id);
                              }}
                              className="text-white/80 hover:text-red-200 transition-colors duration-200 p-1 rounded"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Project Content */}
                    <div className="px-6 py-6">
                      <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{project.title}</h2>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{project.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{project.teamMembers.length} team members</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Team Members Preview */}
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            {project.teamMembers.slice(0, 4).map((member, index) => (
                              <div
                                key={member.user._id}
                                className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm"
                                title={member.user.name}
                              >
                                {member.user.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {project.teamMembers.length > 4 && (
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white shadow-sm">
                                +{project.teamMembers.length - 4}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 ml-2">Team</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl w-full max-w-2xl border border-gray-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Create New Project</h2>
                  <p className="text-blue-100 text-sm">Set up a new project for your team</p>
                </div>
              </div>
            </div>
            <div className="px-8 py-8">
              <ProjectForm
                onSubmit={handleCreateProject}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;