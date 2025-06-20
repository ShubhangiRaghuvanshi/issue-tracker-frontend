import React, { useState } from 'react';
import TicketForm from './TicketForm';

interface Ticket{
    _id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in-progress' | 'closed';
    assignee: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    projectId: string;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  teamMembers: Array<{
    user: TeamMember;
    role: 'owner' | 'member';
  }>;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface TicketListProps {
    tickets: Ticket[];
    user: User | null;
    project: Project;
    onTicketUpdated: () => void;
}

const TicketList: React.FC<TicketListProps> = ({ tickets, user, project, onTicketUpdated }) => {
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
    const isOwner = project.teamMembers.some(m => m.user._id === user?.id && m.role === 'owner');

    const canEditOrDelete = (ticket: Ticket) => {
        return isOwner || ticket.createdAt === user?.id;
    };

    const handleDelete = async (ticketId: string) => {
        if (!window.confirm('Are you sure you want to delete this ticket?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`https://issue-tracker-backend-3.onrender.com/api/tickets/${ticketId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onTicketUpdated();
        } catch (err) {
            alert('Failed to delete ticket');
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Tickets</h2>
          {tickets.length === 0 ? (
            <p className="text-gray-500">No tickets available.</p>
          ) : (
            <ul className="space-y-4">
              {tickets.map((ticket) => (
                <li key={ticket._id} className="border-b pb-4">
                  <h3 className="text-lg font-medium">{ticket.title}</h3>
                  <p className="text-gray-600">{ticket.description}</p>
                  <div className="mt-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        ticket.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : ticket.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {ticket.priority.charAt(0).toUpperCase() +
                        ticket.priority.slice(1)}
                    </span>
                    <span
                      className={`ml-2 inline-block px-2 py-1 text-xs font-semibold rounded ${
                        ticket.status === "open"
                          ? "bg-blue-100 text-blue-800"
                          : ticket.status === "in-progress"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {ticket.status.charAt(0).toUpperCase() +
                        ticket.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Assigned to:{" "}
                    {ticket.assignee &&
                    typeof ticket.assignee === "object" &&
                    ticket.assignee.name ? (
                      <span>
                        {typeof ticket.assignee.name === "string"
                          ? ticket.assignee.name
                          : "[Invalid name]"}
                        {" "}
                        ({typeof ticket.assignee.email === "string"
                          ? ticket.assignee.email
                          : "[Invalid email]"})
                      </span>
                    ) : (
                      "Unassigned"
                    )}
                  </div>
                  {canEditOrDelete(ticket) && (
                    <div className="mt-2 flex gap-2">
                      <button
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setEditingTicket(ticket)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={() => setShowDeleteId(ticket._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  {showDeleteId === ticket._id && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                      <div className="bg-white p-6 rounded shadow-lg">
                        <p className="mb-4">Are you sure you want to delete this ticket?</p>
                        <div className="flex gap-4">
                          <button
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => { handleDelete(ticket._id); setShowDeleteId(null); }}
                          >
                            Yes, Delete
                          </button>
                          <button
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            onClick={() => setShowDeleteId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {editingTicket && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
              <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
                <h2 className="text-xl font-semibold mb-4">Edit Ticket</h2>
                <TicketForm
                  projectId={editingTicket.projectId}
                  teamMembers={project.teamMembers.map(m => m.user)}
                  onTicketCreated={() => { setEditingTicket(null); onTicketUpdated(); }}
                  initialData={editingTicket}
                  editMode
                />
                <button
                  className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setEditingTicket(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
    );
};
export default TicketList;
