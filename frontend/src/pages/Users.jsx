import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Card, CardHeader, CardBody } from '../components/UI/Card';
import { Table, Thead, Tbody, Th, Td, Tr, Pagination } from '../components/UI/Table';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import { UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Page.css';

const Users = () => {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => api.get(`/auth/users?page=${page}&limit=10`).then((r) => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/auth/users/${id}`, payload),
    onSuccess: () => {
      toast.success('User updated!');
      qc.invalidateQueries(['users']);
      setEditUser(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Update failed'),
  });

  const fmt = (d) => (d ? format(new Date(d), 'MMM dd, yyyy') : '—');

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>View and manage system users and their roles</p>
        </div>
        <Button icon={UserPlus} onClick={() => window.open('/register', '_blank')}>
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h3>All Users</h3>
          <span className="badge badge-primary">{data?.meta?.total ?? 0} total</span>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          {isLoading ? (
            <div className="table-loading"><div className="spinner" /></div>
          ) : (
            <>
              <Table>
                <Thead>
                  <Tr>
                    <Th>User</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Joined</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {!data?.data?.length ? (
                    <Tr><Td className="empty-cell" colSpan={6}>No users found</Td></Tr>
                  ) : (
                    data.data.map((u) => (
                      <Tr key={u.id}>
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: '50%',
                              background: u.role === 'admin'
                                ? 'linear-gradient(135deg,#4f46e5,#818cf8)'
                                : 'linear-gradient(135deg,#10b981,#34d399)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0,
                            }}>
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                                {u.firstName} {u.lastName}
                              </div>
                              {u.id === currentUser?.id && (
                                <div style={{ fontSize: 11, color: 'var(--primary)' }}>You</div>
                              )}
                            </div>
                          </div>
                        </Td>
                        <Td>{u.email}</Td>
                        <Td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-gray'}`}>
                            {u.role?.replace('_', ' ')}
                          </span>
                        </Td>
                        <Td>
                          <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </Td>
                        <Td>{fmt(u.createdAt)}</Td>
                        <Td>
                          {u.id !== currentUser?.id && (
                            <button
                              className="icon-btn edit"
                              onClick={() => setEditUser(u)}
                              title="Edit user"
                            >
                              ✏️
                            </button>
                          )}
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
              <Pagination
                page={data?.meta?.page || 1}
                totalPages={data?.meta?.totalPages || 1}
                total={data?.meta?.total || 0}
                limit={10}
                onPageChange={setPage}
              />
            </>
          )}
        </CardBody>
      </Card>

      {/* Edit User Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User" size="sm">
        {editUser && (
          <div className="modal-form">
            <div style={{ marginBottom: 16, padding: 12, background: 'var(--gray-50)', borderRadius: 8 }}>
              <strong>{editUser.firstName} {editUser.lastName}</strong>
              <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{editUser.email}</div>
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                defaultValue={editUser.role}
                id="edit-role"
              >
                <option value="parking_attendant">Parking Attendant</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select defaultValue={editUser.isActive ? 'true' : 'false'} id="edit-status">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="form-actions">
              <Button variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button
                loading={updateMutation.isPending}
                onClick={() => {
                  const role = document.getElementById('edit-role').value;
                  const isActive = document.getElementById('edit-status').value === 'true';
                  updateMutation.mutate({ id: editUser.id, payload: { role, isActive } });
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
