const ApplicationCard = ({ application, countdown, onApprove, onReject }) => (
  <div className="p-6">
    <div className="grid grid-cols-2 gap-2">
      <div><b>Student ID:</b> {application.studentId}</div>
      <div><b>Name:</b> {application.firstName} {application.lastName}</div>
      <div><b>Email:</b> {application.email}</div>
      <div><b>Program:</b> {application.program}</div>
      <div><b>Card Type:</b> {application.cardType}</div>
      <div><b>Request Type:</b> {application.requestType}</div>
      <div>
        <b>Photo:</b><br />
        {application.photo
          ? <img src={`/uploads/${application.photo}`} alt="photo" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
          : 'N/A'}
      </div>
      <div><b>GD Copy:</b> {application.gdCopy}</div>
      <div><b>Old ID Image:</b> {application.oldIdImage || 'N/A'}</div>
      <div><b>Status:</b> {application.status}</div>
      <div><b>Created At:</b> {new Date(application.createdAt).toLocaleString()}</div>
    </div>
    <div className="mt-4 flex gap-2">
      <button onClick={onApprove} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
      <button onClick={() => {
        const reason = prompt("Reason for rejection:");
        if (reason) onReject(reason);
      }} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
    </div>
    {countdown !== undefined && (
      <div className="mt-2 text-blue-600">
        Estimated Ready (days): {countdown}
      </div>
    )}
  </div>
);

export default ApplicationCard;