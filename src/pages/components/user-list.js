'use client';

import { useEffect, useState } from 'react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/users', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then((data) => setUsers(data.users ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!users.length) return <p>No users.</p>;

  return (
    <table className="w-full border">
      <thead>
        <tr className="border bg-gray-100">
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Email</th>
          <th className="p-2 text-left">Age</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="border">
            <td className="p-2">{u.firstName} {u.lastName}</td>
            <td className="p-2">{u.email}</td>
            <td className="p-2">{u.age}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}