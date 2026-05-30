import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Card, CardHeader, CardBody } from '../components/UI/Card';
import { Table, Thead, Tbody, Th, Td, Tr, Pagination } from '../components/UI/Table';
import Button from '../components/UI/Button';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import './Page.css';
import './Reports.css';

const ReportPage = ({ type }) => {
  const isOutgoing = type === 'outgoing';
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // queryDates holds the committed dates used for the actual query
  const [queryDates, setQueryDates] = useState(null);

  // Convert datetime-local value (YYYY-MM-DDTHH:mm) to ISO string
  const toISO = (val) => val ? new Date(val).toISOString() : '';

  const { data, isLoading } = useQuery({
    queryKey: [`report-${type}`, page, queryDates],
    queryFn: () =>
      api.get(
        `/reports/${type}?startDate=${toISO(queryDates.start)}&endDate=${toISO(queryDates.end)}&page=${page}&limit=10`
      ).then((r) => r.data),
    enabled: !!queryDates,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    setPage(1);
    setQueryDates({ start: startDate, end: endDate });
  };

  const formatDate = (d) => d ? format(new Date(d), 'MMM dd, yyyy HH:mm') : '—';

  return (
    <div className="page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>{isOutgoing ? 'Outgoing Cars Report' : 'Entered Cars Report'}</h1>
          <p>
            {isOutgoing
              ? 'All cars that exited — with total amount charged'
              : 'All cars that entered the parking in a given period'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h3>Filter by Date Range</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSearch} className="report-filter-form">
            <div className="form-group">
              <label>Start Date &amp; Time</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date &amp; Time</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" icon={Search} loading={isLoading}>
              Generate Report
            </Button>
          </form>
        </CardBody>
      </Card>

      {queryDates && data && (
        <>
          <div className="report-summary">
            <div className="summary-item">
              <span className="summary-label">Total Cars</span>
              <span className="summary-value">{data.summary?.totalCars ?? 0}</span>
            </div>
            {isOutgoing && (
              <div className="summary-item summary-highlight">
                <span className="summary-label">Total Amount Charged</span>
                <span className="summary-value">
                  RWF {parseFloat(data.summary?.totalAmountCharged || 0).toLocaleString()}
                </span>
              </div>
            )}
            <div className="summary-item">
              <span className="summary-label">Period</span>
              <span className="summary-value" style={{ fontSize: 13 }}>
                {data.summary?.period?.from} → {data.summary?.period?.to}
              </span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <h3>Results ({data.meta?.total ?? 0} records)</h3>
            </CardHeader>
            <CardBody style={{ padding: 0 }}>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Plate Number</Th>
                    <Th>Parking Code</Th>
                    <Th>Location</Th>
                    <Th>Entry Time</Th>
                    {isOutgoing && <Th>Exit Time</Th>}
                    {isOutgoing && <Th>Amount (RWF)</Th>}
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data?.data?.length === 0 ? (
                    <Tr>
                      <Td className="empty-cell" colSpan={isOutgoing ? 7 : 5}>
                        No records found for this period
                      </Td>
                    </Tr>
                  ) : (
                    data?.data?.map((e) => (
                      <Tr key={e.id}>
                        <Td><strong>{e.plateNumber}</strong></Td>
                        <Td><span className="code-badge">{e.parkingCode}</span></Td>
                        <Td>{e.parking?.location || '—'}</Td>
                        <Td>{formatDate(e.entryDateTime)}</Td>
                        {isOutgoing && <Td>{formatDate(e.exitDateTime)}</Td>}
                        {isOutgoing && (
                          <Td>
                            <strong style={{ color: 'var(--success)' }}>
                              {parseFloat(e.chargedAmount || 0).toLocaleString()}
                            </strong>
                          </Td>
                        )}
                        <Td>
                          <span className={`badge ${e.status === 'parked' ? 'badge-warning' : 'badge-success'}`}>
                            {e.status}
                          </span>
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
            </CardBody>
          </Card>
        </>
      )}

      {queryDates && isLoading && (
        <div className="table-loading" style={{ padding: 48 }}>
          <div className="spinner" />
        </div>
      )}
    </div>
  );
};

export const OutgoingReport = () => <ReportPage type="outgoing" />;
export const EnteredReport = () => <ReportPage type="entered" />;
