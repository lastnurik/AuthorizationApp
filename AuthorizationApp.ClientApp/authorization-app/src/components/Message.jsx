import React from 'react';

function Message({ type, message }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
      {message}
      <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" />
    </div>
  );
}

export default Message;