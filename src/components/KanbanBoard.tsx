import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Ticket {
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
}

interface KanbanBoardProps {
  tickets: Ticket[];
  onStatusChange: () => void;
}

const statusMap = {
  'open': 'To Do',
  'in-progress': 'In Progress',
  'closed': 'Done',
};

const statusOrder: Array<keyof typeof statusMap> = ['open', 'in-progress', 'closed'];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tickets, onStatusChange }) => {
  const [columns, setColumns] = useState(() => {
    const grouped: Record<string, Ticket[]> = { 'open': [], 'in-progress': [], 'closed': [] };
    tickets.forEach(ticket => grouped[ticket.status].push(ticket));
    return grouped;
  });

  React.useEffect(() => {
    // Update columns if tickets prop changes
    const grouped: Record<string, Ticket[]> = { 'open': [], 'in-progress': [], 'closed': [] };
    tickets.forEach(ticket => grouped[ticket.status].push(ticket));
    setColumns(grouped);
  }, [tickets]);

  const onDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;
    if (sourceCol === destCol && source.index === destination.index) return;

    // Find the ticket
    const ticket = columns[sourceCol][source.index];
    if (!ticket) return;

    // Remove from source
    const newSourceTickets = Array.from(columns[sourceCol]);
    newSourceTickets.splice(source.index, 1);
    // Add to destination
    const newDestTickets = Array.from(columns[destCol]);
    const updatedTicket = { ...ticket, status: destCol as Ticket['status'] };
    newDestTickets.splice(destination.index, 0, updatedTicket);

    const newColumns = {
      ...columns,
      [sourceCol]: newSourceTickets,
      [destCol]: newDestTickets,
    };
    setColumns(newColumns);

    // Save status change via API
    try {
      const token = localStorage.getItem('token');
      await fetch(`https://issue-tracker-backend-3.onrender.com/api/tickets/${ticket._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: destCol }),
      });
      onStatusChange();
    } catch (err) {
      // Optionally handle error
      console.error('Failed to update ticket status', err);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6">
        {statusOrder.map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided: any, snapshot: any) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 bg-gray-50 rounded-lg p-4 min-h-[400px] shadow ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
              >
                <h3 className="text-lg font-bold mb-4 text-gray-700">{statusMap[status]}</h3>
                {columns[status].map((ticket, idx) => (
                  <Draggable draggableId={ticket._id} index={idx} key={ticket._id}>
                    {(provided: any, snapshot: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`mb-4 p-4 bg-white rounded shadow border-l-4 ${
                          ticket.priority === 'high' ? 'border-red-500' : ticket.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
                        } ${snapshot.isDragging ? 'bg-blue-100' : ''}`}
                      >
                        <div className="font-semibold text-gray-900">{ticket.title}</div>
                        <div className="text-sm text-gray-600 mb-2">{ticket.description}</div>
                        <div className="flex items-center text-xs gap-2">
                          <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700">{ticket.priority}</span>
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            {ticket.assignee && typeof ticket.assignee === 'object' && ticket.assignee.name
                              ? ticket.assignee.name
                              : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard; 