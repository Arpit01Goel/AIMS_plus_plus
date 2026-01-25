'use client';

import { useState, useEffect } from 'react';

interface AcademicSession {
  id: string;
  code: string;
}

interface CourseMeeting {
  id: string;
  dayOfWeek: number; // 1-7
  startTime: string;
  endTime: string;
  location: string | null;
}

interface CourseOffering {
  id: string;
  course: {
    code: string;
    title: string;
    department: { code: string } | null;
  };
  courseMeetings: CourseMeeting[];
  primaryInstructor: {
    user: { name: string | null };
  } | null;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ScheduleManagementPage() {
  // State
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedOffering, setSelectedOffering] = useState<CourseOffering | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    dayOfWeek: 1,
    startTime: '',
    endTime: '',
    location: ''
  });

  // Fetch Data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let url = '/api/admin/schedule';
        
        // Only append param if we actually have a selection. 
        // If not, the API will pick the default (current) session.
        if (selectedSessionId) {
            url += `?academicSessionId=${selectedSessionId}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            setOfferings(data.offerings);
            setSessions(data.sessions);
            
            // If we didn't have a selection (initial load), set it to what the API used
            if (!selectedSessionId && data.currentSessionId) {
                // This will trigger a re-render and re-fetch, but that's acceptable to ensure sync
                setSelectedSessionId(data.currentSessionId);
            }
        }
      } catch (err) {
        console.error("Error fetching schedule:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedSessionId]);

  // Handlers
  const handleAddMeeting = async () => {
    if (!selectedOffering || !newMeeting.startTime || !newMeeting.endTime) return;
    
    try {
        const res = await fetch('/api/admin/meetings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                offeringId: selectedOffering.id,
                ...newMeeting
            })
        });
        
        if (res.ok) {
            const addedMeeting = await res.json();
            // Update local state
            const updatedOffering = {
                ...selectedOffering,
                courseMeetings: [...selectedOffering.courseMeetings, addedMeeting].sort((a,b) => a.dayOfWeek - b.dayOfWeek)
            };
            
            setSelectedOffering(updatedOffering);
            setOfferings(prev => prev.map(o => o.id === updatedOffering.id ? updatedOffering : o));
            
            // Reset form
            setNewMeeting({
                dayOfWeek: 1,
                startTime: '',
                endTime: '',
                location: ''
            });
        }
    } catch (err) {
        console.error("Error adding meeting:", err);
        alert("Failed to add meeting");
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    
    try {
        const res = await fetch(`/api/admin/meetings/${meetingId}`, { method: 'DELETE' });
        if (res.ok) {
             if (selectedOffering) {
                 const updatedMeetings = selectedOffering.courseMeetings.filter(m => m.id !== meetingId);
                 const updatedOffering = { ...selectedOffering, courseMeetings: updatedMeetings };
                 setSelectedOffering(updatedOffering);
                 setOfferings(prev => prev.map(o => o.id === updatedOffering.id ? updatedOffering : o));
             }
        }
    } catch (err) {
        console.error("Error deleting meeting:", err);
    }
  };

  const filteredOfferings = offerings.filter(o => 
      o.course.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-900 p-8 shadow-lg text-white">
        <h1 className="text-3xl font-bold">Schedule Management</h1>
        <p className="mt-2 text-indigo-100 opacity-90"> Manage weekly timings and locations for course offerings</p>
      </div>

      {/* Controls */}
      {/* Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
              <input 
                  type="text" 
                  placeholder="Search courses..." 
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
          <select 
              className="rounded-xl border border-slate-200 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-w-[200px]"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
          >
              {sessions.map(s => (
                  <option key={s.id} value={s.id}>{s.code}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
          <div className="flex h-64 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOfferings.map(offering => (
                <div key={offering.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-indigo-200 flex flex-col">
                    <div className="p-5 flex-1">
                        <div className="flex justify-between items-start mb-2">
                             <span className="bg-slate-100 text-slate-600 rounded-md px-2 py-1 text-xs font-bold">{offering.course.department?.code || 'GEN'}</span>
                             <span className="text-xs text-slate-500 font-mono">{offering.courseMeetings.length} meetings</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                            {offering.course.code}
                        </h3>
                        <p className="text-sm font-medium text-slate-600 mb-4 line-clamp-1">{offering.course.title}</p>
                        
                        <div className="space-y-2">
                            {offering.courseMeetings.length > 0 ? (
                                offering.courseMeetings.map(m => (
                                    <div key={m.id} className="flex items-center text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 relative">
                                        <span className="font-bold w-10 text-indigo-600">{DAYS[m.dayOfWeek - 1]}</span>
                                        <span className="mx-2">|</span>
                                        <span>{m.startTime} - {m.endTime}</span>
                                        {m.location && <span className="ml-auto text-slate-400">{m.location}</span>}
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-slate-400 italic">No meetings scheduled</div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 border-t border-slate-100">
                        <button 
                            onClick={() => {
                                setSelectedOffering(offering);
                                setIsModalOpen(true);
                            }}
                            className="w-full rounded-lg bg-white border border-slate-200 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                        >
                            Manage Schedule
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedOffering && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-indigo-900 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Manage Schedule</h2>
                        <p className="text-indigo-200 text-sm">{selectedOffering.course.code}: {selectedOffering.course.title}</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="p-6">
                    {/* Schedule List */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Current Meetings</h3>
                        <div className="space-y-3">
                             {selectedOffering.courseMeetings.map(m => (
                                 <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl group hover:border-indigo-200 transition-colors">
                                     <div className="flex items-center gap-4">
                                         <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm">
                                             {DAYS[m.dayOfWeek - 1]}
                                         </div>
                                         <div>
                                             <div className="font-semibold text-slate-900 text-sm">{m.startTime} - {m.endTime}</div>
                                             <div className="text-xs text-slate-500">{m.location || 'No Location'}</div>
                                         </div>
                                     </div>
                                     <button 
                                        onClick={() => handleDeleteMeeting(m.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                     >
                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                     </button>
                                 </div>
                             ))}
                             {selectedOffering.courseMeetings.length === 0 && (
                                 <p className="text-sm text-slate-400 italic text-center py-4">No meetings scheduled yet.</p>
                             )}
                        </div>
                    </div>

                    {/* Add New Form */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Add New Meeting</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <select 
                                className="md:col-span-1 rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={newMeeting.dayOfWeek}
                                onChange={e => setNewMeeting({...newMeeting, dayOfWeek: parseInt(e.target.value)})}
                            >
                                {DAYS.map((d, i) => <option key={i} value={i+1}>{d}</option>)}
                            </select>
                            
                            <input 
                                type="time" 
                                className="md:col-span-1 rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={newMeeting.startTime}
                                onChange={e => setNewMeeting({...newMeeting, startTime: e.target.value})}
                            />
                            
                            <input 
                                type="time" 
                                className="md:col-span-1 rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={newMeeting.endTime}
                                onChange={e => setNewMeeting({...newMeeting, endTime: e.target.value})}
                            />
                            
                            <input 
                                type="text" 
                                placeholder="Location (e.g. C-101)"
                                className="md:col-span-1 rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={newMeeting.location}
                                onChange={e => setNewMeeting({...newMeeting, location: e.target.value})}
                            />
                            
                            <button 
                                onClick={handleAddMeeting}
                                disabled={!newMeeting.startTime || !newMeeting.endTime}
                                className="md:col-span-1 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
