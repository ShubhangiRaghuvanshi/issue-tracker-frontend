import React from 'react';
interface Ticket{
    _id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'in progress' | 'closed';
    assignee: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}
interface TicketListProps {
    tickets: Ticket[];
}
const TicketList: React.FC<TicketListProps> = ({ tickets }) => {
    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tickets</h2>
            {tickets.length === 0 ? (
                <p className="text-gray-500">No tickets available.</p>
            ) : (
                <ul className="space-y-4">
                    {tickets.map(ticket => (
                        <li key={ticket._id} className="border-b pb-4">
                            <h3 className="text-lg font-medium">{ticket.title}</h3>
                            <p className="text-gray-600">{ticket.description}</p>
                            <div className="mt-2">
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${ticket.priority === 'high' ? 'bg-red-100 text-red-800' : ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                </span>
                                <span className={`ml-2 inline-block px-2 py-1 text-xs font-semibold rounded ${ticket.status === 'open' ? 'bg-blue-100 text-blue-800' : ticket.status === 'in progress' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                Assigned to: {ticket.assignee.name} ({ticket.assignee.email})
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
export default TicketList;
