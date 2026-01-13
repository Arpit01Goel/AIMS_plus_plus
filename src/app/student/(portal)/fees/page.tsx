'use client';

import { useState } from 'react';

interface FeeReceipt {
  id: string;
  academicSession: string;
  amount: number;
  transactionNo: string;
  transactionDate: string;
  bank: string;
  receiptDocUrl: string;
  uploadedDate: string;
}

export default function FeesPage() {
  // Dummy data - will be replaced with database fetch later
  const [receipts, setReceipts] = useState<FeeReceipt[]>([
    {
      id: '1',
      academicSession: '2025-26 (Semester 1)',
      amount: 45000,
      transactionNo: 'TXN2025123456',
      transactionDate: '2025-08-15',
      bank: 'HDFC Bank',
      receiptDocUrl: '#',
      uploadedDate: '2025-08-16',
    },
    {
      id: '2',
      academicSession: '2024-25 (Semester 2)',
      amount: 42000,
      transactionNo: 'TXN2024789012',
      transactionDate: '2025-01-10',
      bank: 'State Bank of India',
      receiptDocUrl: '#',
      uploadedDate: '2025-01-11',
    },
    {
      id: '3',
      academicSession: '2024-25 (Semester 1)',
      amount: 42000,
      transactionNo: 'TXN2024345678',
      transactionDate: '2024-08-20',
      bank: 'ICICI Bank',
      receiptDocUrl: '#',
      uploadedDate: '2024-08-21',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    academicSession: '',
    amount: '',
    transactionNo: '',
    transactionDate: '',
    bank: '',
    receiptDoc: null as File | null,
  });

  // Filter receipts based on search query
  const filteredReceipts = receipts.filter(
    (receipt) =>
      receipt.academicSession.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.transactionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.bank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle upload (will integrate with database later)
  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const newReceipt: FeeReceipt = {
      id: Date.now().toString(),
      academicSession: uploadForm.academicSession,
      amount: parseFloat(uploadForm.amount),
      transactionNo: uploadForm.transactionNo,
      transactionDate: uploadForm.transactionDate,
      bank: uploadForm.bank,
      receiptDocUrl: '#', // Will be actual file URL from storage
      uploadedDate: new Date().toISOString().split('T')[0],
    };
    setReceipts([newReceipt, ...receipts]);
    setIsUploadModalOpen(false);
    setUploadForm({
      academicSession: '',
      amount: '',
      transactionNo: '',
      transactionDate: '',
      bank: '',
      receiptDoc: null,
    });
  };

  // Handle delete (will integrate with database later)
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      setReceipts(receipts.filter((receipt) => receipt.id !== id));
    }
  };

  // Handle download (will integrate with actual file storage later)
  const handleDownload = (receipt: FeeReceipt) => {
    alert(`Downloading receipt for ${receipt.academicSession}`);
    // Will implement actual file download later
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Fees Management</h1>
            <p className="mt-2 text-indigo-100">Manage your fee receipts and payment records</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://onlinesbi.sbi.bank.in/sbicollect/icollecthome.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-indigo-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Pay Fees
            </a>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-indigo-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Receipt
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by session, transaction number, or bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Academic Session
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Trans. No. & Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Bank
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Receipt Doc
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-2 text-sm font-medium text-slate-900">No receipts found</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {searchQuery ? 'Try adjusting your search' : 'Upload your first receipt to get started'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="transition hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{receipt.academicSession}</div>
                      <div className="text-xs text-slate-500">Uploaded: {receipt.uploadedDate}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="text-sm font-semibold text-slate-900">₹{receipt.amount.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-slate-900">{receipt.transactionNo}</div>
                      <div className="text-xs text-slate-500">{new Date(receipt.transactionDate).toLocaleDateString('en-IN')}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-slate-900">{receipt.bank}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownload(receipt)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownload(receipt)}
                          className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                          title="Download"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(receipt.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Delete"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-900 to-indigo-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Upload Fee Receipt</h2>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="rounded-lg p-1 text-white transition hover:bg-indigo-800"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleUpload} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Academic Session</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 2025-26 (Semester 1)"
                    value={uploadForm.academicSession}
                    onChange={(e) => setUploadForm({ ...uploadForm, academicSession: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="45000"
                      value={uploadForm.amount}
                      onChange={(e) => setUploadForm({ ...uploadForm, amount: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Transaction Date</label>
                    <input
                      type="date"
                      required
                      value={uploadForm.transactionDate}
                      onChange={(e) => setUploadForm({ ...uploadForm, transactionDate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Transaction Number</label>
                  <input
                    type="text"
                    required
                    placeholder="TXN2025123456"
                    value={uploadForm.transactionNo}
                    onChange={(e) => setUploadForm({ ...uploadForm, transactionNo: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Bank Name</label>
                  <input
                    type="text"
                    required
                    placeholder="HDFC Bank"
                    value={uploadForm.bank}
                    onChange={(e) => setUploadForm({ ...uploadForm, bank: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Receipt Document</label>
                  <div className="mt-1 flex justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-10 transition hover:border-indigo-500">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="mt-4 flex text-sm text-slate-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            required
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setUploadForm({ ...uploadForm, receiptDoc: e.target.files?.[0] || null })}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB</p>
                      {uploadForm.receiptDoc && (
                        <p className="mt-2 text-sm font-medium text-indigo-600">{uploadForm.receiptDoc.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-indigo-900 to-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-indigo-800 hover:to-indigo-600"
                >
                  Upload Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
