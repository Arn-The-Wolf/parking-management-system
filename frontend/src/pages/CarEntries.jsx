import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { Card, CardHeader, CardBody } from '../components/UI/Card';
import { Table, Thead, Tbody, Th, Td, Tr, Pagination } from '../components/UI/Table';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import { Plus, Search, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './Page.css';

// ── Entry form ────────────────────────────────────────────────────────────────
const EntryForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({ plateNumber: '', parkingCode: '' });

  const { data: parkings } = useQuery({
    queryKey: ['parkings-list'],
    queryFn: () => api.get('/parkings?limit=100').then((r) => r.data.data),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="modal-form">
      <div className="form-group">
        <label>Plate Number *</label>
        <input
          value={form.plateNumber}
          onChange={(e) => setForm((p) => ({ ...p, plateNumber: e.target.value.toUpperCase() }))}
          placeholder="RAB 123 A"
          required
        />
      </div>
      <div className="form-group">
        <label>Parking *</label>
        <select
          value={form.parkingCode}
          onChange={(e) => setForm((p) => ({ ...p, parkingCode: e.target.value }))}
          required
        >
          <option value="">Select parking...</option>
          {parkings
            ?.filter((p) => p.isActive && p.availableSpaces > 0)
            .map((p) => (
              <option key={p.id} value={p.code}>
                {p.code} — {p.name} ({p.availableSpaces} spaces free)
              </option>
            ))}
        </select>
      </div>
      <div className="form-actions">
        <Button type="submit" loading={loading}>Register Entry &amp; Get Ticket</Button>
      </div>
    </form>
  );
};

// ── Ticket display ────────────────────────────────────────────────────────────
const TicketView = ({ ticket }) => (
  <div className="ticket-card">
    <div className="ticket-header">
      <div>
        <div className="ticket-title">🎫 Parking Ticket</div>
        <div className="ticket-subtitle">XWZ Parking Management System</div>
      </div>
      <div style={{ textAlign: 'right', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
        #{ticket.ticketId?.slice(0, 8).toUpperCase()}
      </div>
    </div>
    {[
      ['Plate Number', ticket.plateNumber],
      ['Parking Name', ticket.parkingName],
      ['Parking Code', ticket.parkingCode],
      ['Location', ticket.location],
      ['Entry Time', ticket.entryDateTime],
      ['Fee / Hour', `RWF ${parseFloat(ticket.chargingFeePerHour).toLocaleString()}`],
      ['Attendant', ticket.attendant],
    ].map(([label, value]) => (
      <div key={label} className="ticket-row">
        <span className="ticket-label">{label}</span>
        <span className="ticket-value">{value}</span>
      </div>
    ))}
  </div>
);

// ── Bill display ──────────────────────────────────────────────────────────────
const BillView = ({ bill }) => (
  <div className="ticket-card">
    <div className="ticket-header">
      <div>
        <div className="ticket-title">🧾 Parking Bill</div>
        <div className="ticket-subtitle">XWZ Parking Management System</div>
      </div>
    </div>
    {[
      ['Plate Number', bill.plateNumber],
      ['Parking Name', bill.parkingName],
      ['Location', bill.location],
      ['Entry Time', bill.entryDateTime],
      ['Exit Time', bill.exitDateTime],
      ['Duration', bill.duration],
      ['Hours Parked', `${bill.durationHours} hrs`],
      ['Rate', `RWF ${parseFloat(bill.chargingFeePerHour).toLocaleString()} / hr`],
    ].map(([label, value]) => (
      <div key={label} className="ticket-row">
        <span className="ticket-label">{label}</span>
        <span className="ticket-value">{value}</span>
      </div>
    ))}
    <div className="ticket-row" style={{ marginTop: 8, paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.3)' }}>
      <span className="ticket-label" style={{ fontWeight: 700, color: 'white' }}>TOTAL CHARGED</span>
      <span className="ticket-total">RWF {parseFloat(bill.totalCharged).toLocaleString()}</span>
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const CarEntries = () => {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [bill, setBill] = useState(null);
  const [exitId, setExitId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['car-entries', page, search, statusFilter],
    queryFn: () =>
      api
        .get(`/car-entries?page=${page}&limit=10&search=${search}&status=${statusFilter}`)
        .then((r) => r.data),
  });

  const entryMutation = useMutation({
    mutationFn: (d) => api.post('/car-entries', d),
    onSuccess: (res) => {
      toast.success('Car entry registered!');
      qc.invalidateQueries(['car-entries']);
      qc.invalidateQueries(['dashboard']);
      qc.invalidateQueries(['parkings-list']);
      setShowAdd(false);
      setTicket(res.data.data.ticket);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to register entry'),
  });

  const exitMutation = useMutation({
    mutationFn: (id) => api.put(`/car-entries/${id}/exit`),
    onSuccess: (res) => {
      toast.success('Car exit registered!');
      qc.invalidateQueries(['car-entries']);
      qc.invalidateQueries(['dashboard']);
      qc.invalidateQueries(['parkings-list']);
      setExitId(null);
      setBill(res.data.data.bill);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to register exit'),
  });

  const fmt = (d) => (d ? format(new Date(d), 'MMM dd, yyyy HH:mm') : '—');

  return (
    <div className="page animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Car Entries</h1>
          <p>Register vehicle entries and exits — tickets and bills generated automatically</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAdd(true)}>
          Register Entry
        </Button>
      </div>

      {/* Table card */}
      <Card>
        <CardHeader>
          <h3>All Car Entries</h3>
          <div className="filters-row">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              <option value="parked">Parked</option>
              <option value="exited">Exited</option>
            </select>
            <div className="search-box">
              <Search size={16} />
              <input
                placeholder="Search plate or parking code..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
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
                    <Th>Plate Number</Th>
                    <Th>Parking</Th>
                    <Th>Entry Time</Th>
                    <Th>Exit Time</Th>
                    <Th>Amount (RWF)</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {!data?.data?.length ? (
                    <Tr>
                      <Td className="empty-cell" colSpan={7}>No car entries found</Td>
                    </Tr>
                  ) : (
                    data.data.map((e) => (
                      <Tr key={e.id}>
                        <Td><strong>{e.plateNumber}</strong></Td>
                        <Td>
                          <span className="code-badge">{e.parkingCode}</span>
                          {e.parking && (
                            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                              {e.parking.name}
                            </div>
                          )}
                        </Td>
                        <Td>{fmt(e.entryDateTime)}</Td>
                        <Td>{fmt(e.exitDateTime)}</Td>
                        <Td>
                          {parseFloat(e.chargedAmount) > 0 ? (
                            <strong style={{ color: 'var(--success)' }}>
                              {parseFloat(e.chargedAmount).toLocaleString()}
                            </strong>
                          ) : (
                            <span style={{ color: 'var(--gray-400)' }}>—</span>
                          )}
                        </Td>
                        <Td>
                          <span className={`badge ${e.status === 'parked' ? 'badge-warning' : 'badge-success'}`}>
                            {e.status}
                          </span>
                        </Td>
                        <Td>
                          <div className="action-btns">
                            {e.status === 'parked' && (
                              <button
                                className="icon-btn delete"
                                onClick={() => setExitId(e.id)}
                                title="Register Exit & Generate Bill"
                              >
                                <LogOut size={15} />
                              </button>
                            )}
                          </div>
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

      {/* Register Entry Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Register Car Entry">
        <EntryForm
          onSubmit={(d) => entryMutation.mutate(d)}
          loading={entryMutation.isPending}
        />
      </Modal>

      {/* Ticket Modal */}
      <Modal isOpen={!!ticket} onClose={() => setTicket(null)} title="Entry Ticket Generated">
        {ticket && <TicketView ticket={ticket} />}
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setTicket(null)}>Close</Button>
        </div>
      </Modal>

      {/* Bill Modal */}
      <Modal isOpen={!!bill} onClose={() => setBill(null)} title="Exit Bill Generated">
        {bill && <BillView bill={bill} />}
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setBill(null)}>Close</Button>
        </div>
      </Modal>

      {/* Confirm Exit Modal */}
      <Modal isOpen={!!exitId} onClose={() => setExitId(null)} title="Confirm Car Exit" size="sm">
        <p style={{ marginBottom: 20, color: 'var(--gray-600)', lineHeight: 1.6 }}>
          Register exit for this vehicle? The parking fee will be calculated automatically based on duration.
        </p>
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setExitId(null)}>Cancel</Button>
          <Button
            variant="success"
            loading={exitMutation.isPending}
            onClick={() => exitMutation.mutate(exitId)}
          >
            Confirm Exit
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CarEntries;
