import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Card, CardHeader, CardBody } from '../components/UI/Card';
import { Table, Thead, Tbody, Th, Td, Tr, Pagination } from '../components/UI/Table';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Page.css';

const ParkingForm = ({ initial, onSubmit, loading }) => {
  const [form, setForm] = useState(initial || {
    code: '', name: '', totalSpaces: '', location: '', chargingFeePerHour: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="form-row-2">
        <div className="form-group">
          <label>Parking Code *</label>
          <input name="code" value={form.code} onChange={handleChange} placeholder="PKG-001" required disabled={!!initial} />
        </div>
        <div className="form-group">
          <label>Parking Name *</label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="City Center Parking" required />
        </div>
      </div>
      <div className="form-row-2">
        <div className="form-group">
          <label>Total Spaces *</label>
          <input type="number" name="totalSpaces" value={form.totalSpaces} onChange={handleChange} placeholder="100" min="1" required disabled={!!initial} />
        </div>
        <div className="form-group">
          <label>Fee per Hour (RWF) *</label>
          <input type="number" name="chargingFeePerHour" value={form.chargingFeePerHour} onChange={handleChange} placeholder="500" min="0" step="0.01" required />
        </div>
      </div>
      <div className="form-group">
        <label>Location *</label>
        <input name="location" value={form.location} onChange={handleChange} placeholder="Kigali, Rwanda" required />
      </div>
      <div className="form-actions">
        <Button type="submit" loading={loading}>
          {initial ? 'Update Parking' : 'Register Parking'}
        </Button>
      </div>
    </form>
  );
};

const Parkings = () => {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['parkings', page, search],
    queryFn: () => api.get(`/parkings?page=${page}&limit=10&search=${search}`).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/parkings', d),
    onSuccess: () => { toast.success('Parking registered!'); qc.invalidateQueries(['parkings']); setShowAdd(false); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/parkings/${id}`, data),
    onSuccess: () => { toast.success('Parking updated!'); qc.invalidateQueries(['parkings']); setEditItem(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/parkings/${id}`),
    onSuccess: () => { toast.success('Parking deleted!'); qc.invalidateQueries(['parkings']); setDeleteId(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Parking Management</h1>
          <p>Manage parking locations and spaces</p>
        </div>
        {isAdmin() && (
          <Button icon={Plus} onClick={() => setShowAdd(true)}>Add Parking</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <h3>All Parkings</h3>
          <div className="search-box">
            <Search size={16} />
            <input
              placeholder="Search parkings..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          {isLoading ? (
            <div className="table-loading"><div className="spinner" /></div>
          ) : (
            <>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Code</Th>
                    <Th>Name</Th>
                    <Th>Location</Th>
                    <Th>Spaces</Th>
                    <Th>Available</Th>
                    <Th>Fee/Hour</Th>
                    <Th>Status</Th>
                    {isAdmin() && <Th>Actions</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {data?.data?.length === 0 ? (
                    <Tr><Td className="empty-cell" colSpan={8}>No parkings found</Td></Tr>
                  ) : (
                    data?.data?.map((p) => (
                      <Tr key={p.id}>
                        <Td><span className="code-badge">{p.code}</span></Td>
                        <Td><strong>{p.name}</strong></Td>
                        <Td>
                          <div className="location-cell">
                            <MapPin size={13} />
                            {p.location}
                          </div>
                        </Td>
                        <Td>{p.totalSpaces}</Td>
                        <Td>
                          <span className={`badge ${p.availableSpaces === 0 ? 'badge-danger' : p.availableSpaces < p.totalSpaces * 0.2 ? 'badge-warning' : 'badge-success'}`}>
                            {p.availableSpaces}
                          </span>
                        </Td>
                        <Td>RWF {parseFloat(p.chargingFeePerHour).toLocaleString()}</Td>
                        <Td>
                          <span className={`badge ${p.isActive ? 'badge-success' : 'badge-gray'}`}>
                            {p.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </Td>
                        {isAdmin() && (
                          <Td>
                            <div className="action-btns">
                              <button className="icon-btn edit" onClick={() => setEditItem(p)} title="Edit">
                                <Edit size={15} />
                              </button>
                              <button className="icon-btn delete" onClick={() => setDeleteId(p.id)} title="Delete">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </Td>
                        )}
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

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Register New Parking">
        <ParkingForm onSubmit={(d) => createMutation.mutate(d)} loading={createMutation.isPending} />
      </Modal>

      <Modal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Parking">
        {editItem && (
          <ParkingForm
            initial={editItem}
            onSubmit={(d) => updateMutation.mutate({ id: editItem.id, data: d })}
            loading={updateMutation.isPending}
          />
        )}
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete" size="sm">
        <p style={{ marginBottom: 20, color: 'var(--gray-600)' }}>
          Are you sure you want to delete this parking? This action cannot be undone.
        </p>
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteId)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Parkings;
