import { useState } from 'react';

function ApplicationCard({ application, countdown, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 flex flex-col border-b border-gray-200">
      {/* Top row - always visible */}
      <div className="flex justify-between items-center">
        <div>
          <p><strong>ID:</strong> {application._id}</p>
          <p><strong>Date:</strong> {new Date(application.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onApprove}
            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => {
              const reason = prompt('Enter reason for rejection:');
              if (reason) onReject(reason);
            }}
            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
          >
            Reject
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-blue-600 underline ml-2"
          >
            {expanded ? 'Hide' : 'View'}
          </button>
        </div>
      </div>

      {/* Expanded section - only visible when expanded */}
      {expanded && (
        <div className="mt-4 p-2 bg-gray-50 rounded-md">
          <p><strong>Student ID:</strong> {application.studentId || 'N/A'}</p>
          <p><strong>Name:</strong> {application.name || 'N/A'}</p>
          <p><strong>TRX ID:</strong> {application.trxid || 'N/A'}</p>
          <p><strong>Amount:</strong> {application.amount || 'N/A'}</p>
          <p><strong>Status:</strong> {application.status}</p>
          {countdown !== undefined && <p><strong>Ready in:</strong> {countdown} days</p>}
          {application.image && (
            <img
              src={application.image}
              alt="Application"
              className="w-32 h-32 object-cover rounded-md mt-2"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default ApplicationCard;
