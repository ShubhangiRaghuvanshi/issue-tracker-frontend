import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Users, UserPlus, UserMinus, Edit2 } from 'lucide-react';
import TicketForm from './TicketForm';
import TicketList from './TicketList';
import Dashboard from './Dashboard';
import KanbanBoard from './KanbanBoard';

interface ITicket {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  createdBy: {
    _id: string;
    name: string;
  };
  assignee: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

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

const ProjectDetails: React.FC<{ selectedProject?: string }> = ({ selectedProject }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState({ title: '', description: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [copiedProjectId, setCopiedProjectId] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`https://issue-tracker-backend-3.onrender.com/api/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch project');
      const data = await response.json();
      setProject(data);
      setEditedProject({ title: data.title, description: data.description });
      await fetchTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ projectId: id || '' });
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (assigneeFilter) params.append('assignee', assigneeFilter);
      if (search) params.append('search', search);
      const response = await fetch(`https://issue-tracker-backend-3.onrender.com/api/tickets?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      const transformed = data.map((ticket: any) => ({
        ...ticket,
        assignee: {
          _id: ticket.assignee?._id || '',
          name: ticket.assignee?.name || 'Unassigned',
          email: ticket.assignee?.email || 'unassigned@example.com'
        }
      }));
      setTickets(transformed);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    }
  };

  useEffect(() => {
    if (id) fetchTickets();
    // eslint-disable-next-line
  }, [id, statusFilter, priorityFilter, assigneeFilter, search]);

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`https://issue-tracker-backend-3.onrender.com/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editedProject)
      });
      if (!response.ok) throw new Error('Failed to update project');
      const data = await response.json();
      setProject(data);
      setIsEditing(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`https://issue-tracker-backend-3.onrender.com/api/projects/${id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newMemberEmail })
      });
      if (!response.ok) throw new Error('Failed to add team member');
      const data = await response.json();
      setProject(data);
      setShowAddMemberModal(false);
      setNewMemberEmail('');
      navigate(`/projects/${id}`); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`https://issue-tracker-backend-3.onrender.com/api/projects/${id}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to remove team member');
      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member');
    }
  };

  const handleCopyProjectId = () => {
    if (!project) return;
    navigator.clipboard.writeText(project._id);
    setCopiedProjectId(true);
    setTimeout(() => setCopiedProjectId(false), 1500);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!project) return <div className="text-center p-4">Project not found</div>;

  const isOwner = project.teamMembers.some(
    member => member.user._id === user?.id && member.role === 'owner'
  );

  const teamMembers = project.teamMembers.map(member => member.user);

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
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Project Management</h1>
                    <p className="text-blue-100 text-sm">Manage your project details and team</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Active Project
                  </span>
                </div>
              </div>
            </div>

            <div className="px-8 py-8">
              {isEditing ? (
                <form onSubmit={handleUpdateProject} className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Project Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editedProject.title}
                          onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                          placeholder="Enter project title"
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={editedProject.description}
                          onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                          placeholder="Enter project description"
                          rows={6}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-400 resize-none"
                          required
                        />
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Edit Guidelines</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Keep titles concise and descriptive
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Include key project objectives in description
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Update information regularly for team clarity
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
                    <button 
                      type="submit" 
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{project.title}</h3>
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-600 leading-relaxed text-base">{project.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {isOwner && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200 shadow-sm">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Owner Actions
                          </h4>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 shadow-sm"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Project Details
                          </button>
                        </div>
                      )}
                      <div id="project-stats" className="bg-gradient-to-br from-slate-50 to-gray-100 p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Tickets</span>
                            <span className="text-lg font-bold text-blue-600">{tickets?.length || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Team Members</span>
                            <span className="text-lg font-bold text-green-600">{teamMembers?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Team Management Section */}
          {isOwner && (
            <div  className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-xl mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Team Management</h2>
                    <p className="text-green-100 text-sm">Manage your project team members</p>
                  </div>
                </div>
              </div>
              <div  id="team-members" className="px-8 py-8">
                <div className="mb-8">
                  <button
                    onClick={() => setShowAddMemberModal(!showAddMemberModal)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {showAddMemberModal ? 'Close Member Form' : 'Add Team Member'}
                  </button>
                </div>

                {showAddMemberModal && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-lg border border-green-200 mb-8 shadow-inner">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New Team Member</h3>
                    <form onSubmit={handleAddMember} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Member Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <input
                              type="email"
                              value={newMemberEmail}
                              onChange={(e) => setNewMemberEmail(e.target.value)}
                              placeholder="Enter team member email address"
                              required
                              className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-400"
                            />
                          </div>
                          <button
                            type="submit"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 whitespace-nowrap"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Member
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Ticket Management Section */}
          {isOwner && (
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-xl mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Ticket Management</h2>
                    <p className="text-purple-100 text-sm">Create and manage project tickets</p>
                  </div>
                </div>
              </div>
              <div className="px-8 py-8">
                <div className="mb-8">
                  <button 
                    onClick={() => setShowTicketForm(!showTicketForm)} 
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {showTicketForm ? 'Close Ticket Form' : 'Create New Ticket'}
                  </button>
                </div>
                {showTicketForm && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-lg border border-purple-200 mb-8 shadow-inner">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Create New Ticket</h3>
                    <TicketForm projectId={project._id} teamMembers={teamMembers} onTicketCreated={fetchTickets} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Tickets List Section */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-gray-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Project Tickets</h2>
                    <p className="text-gray-300 text-sm">View and manage all project tickets</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    {tickets?.length || 0} Total Tickets
                  </span>
                </div>
              </div>
            </div>
            <div className="px-8 py-8">
              <div className="mb-4 flex gap-2">
                <button
                  className={`px-4 py-2 rounded-l-lg font-semibold border ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
                  onClick={() => setViewMode('kanban')}
                >
                  Kanban View
                </button>
                <button
                  className={`px-4 py-2 rounded-r-lg font-semibold border ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
                  onClick={() => setViewMode('list')}
                >
                  List View
                </button>
              </div>
              <div className="mb-6 flex flex-wrap gap-4 items-center">
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  style={{ minWidth: 200 }}
                />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select
                  value={assigneeFilter}
                  onChange={e => setAssigneeFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All Assignees</option>
                  {teamMembers.map(member => (
                    <option key={member._id} value={member._id}>{member.name}</option>
                  ))}
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
              {viewMode === 'kanban' ? (
                <KanbanBoard tickets={tickets} onStatusChange={fetchTickets} />
              ) : (
                <TicketList tickets={tickets} user={user} project={project} onTicketUpdated={fetchTickets} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;