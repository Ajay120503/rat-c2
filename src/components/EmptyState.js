import React from 'react';
import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ icon: Icon = FiInbox, title, description, action }) {
  return (
    <div className="card p-12 text-center">
      <Icon className="text-5xl text-gray-600 mx-auto mb-4" />
      <p className="text-lg text-gray-400">{title || 'No data available'}</p>
      {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}