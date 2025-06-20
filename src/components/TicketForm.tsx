import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface TeamMember {
  _id: string;
  name?: string;
  email: string;
}

interface TicketFormProps {
  projectId: string;
  teamMembers: TeamMember[];
  onTicketCreated?: (ticket: any) => void;
  initialData?: any;
  editMode?: boolean;
}

const TicketForm: React.FC<TicketFormProps> = ({
  projectId,
  teamMembers,
  onTicketCreated,
  initialData,
  editMode,
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    priority: initialData?.priority || "medium",
    status: initialData?.status || "open",
    assignee: initialData?.assignee?._id || initialData?.assignee || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      let response;
      if (editMode && initialData?._id) {
        response = await axios.put(
          `http://localhost:5000/api/tickets/${initialData._id}`,
          {
            ...formData,
            projectId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/tickets",
          {
            ...formData,
            projectId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (onTicketCreated) {
        onTicketCreated(response.data);
      }

      if (!editMode) {
        setFormData({
          title: "",
          description: "",
          priority: "medium",
          status: "open",
          assignee: "",
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(editMode ? "Failed to update ticket" : "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto space-y-4"
    >
      <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Ticket' : 'Create New Ticket'}</h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="text"
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
        required
        className="w-full p-2 border border-gray-300 rounded"
      />

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        required
        className="w-full p-2 border border-gray-300 rounded"
        rows={4}
      />

      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block text-sm mb-1">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="w-1/2">
          <label className="block text-sm mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Assignee</label>
        <select
          name="assignee"
          value={formData.assignee}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Select a user</option>
          {teamMembers.map((member) => (
            <option key={member._id} value={member._id}>
              {member.name || member.email}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
      >
        {loading ? (editMode ? 'Saving...' : 'Creating...') : (editMode ? 'Save Changes' : 'Create Ticket')}
      </button>
    </form>
  );
};

export default TicketForm;
