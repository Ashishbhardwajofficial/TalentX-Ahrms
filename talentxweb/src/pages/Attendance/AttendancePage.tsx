import React, { useState, useEffect } from 'react';
import attendanceApi, {
  AttendanceRecordDTO,
  AttendanceSearchParams,
  AttendanceSummaryDTO,
  AttendanceCheckInDTO,
  AttendanceCheckOutDTO
} from '../../api/attendanceApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import { AttendanceStatus } from '../../types';
import { useAuthContext } from '../../context/AuthContext';
import {
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowRight,
  LogOut,
  LogIn,
  Navigation,
  PartyPopper,
  Home,
  Timer,
  Gift,
  Search,
  Filter as FilterIcon,
  Activity,
  BadgeCheck
} from 'lucide-react';

const AttendancePage: React.FC = () => {
  // Auth context
  const { user } = useAuthContext();

  // State management
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordDTO[]>([]);
  const [summary, setSummary] = useState<AttendanceSummaryDTO | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecordDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<AttendanceSearchParams>(() => {
    const startDate = new Date(new Date().setDate(1)).toISOString().substring(0, 10);
    const endDate = new Date().toISOString().substring(0, 10);

    const initialFilters: AttendanceSearchParams = {
      page: 0,
      size: 10
    };

    if (startDate) initialFilters.startDate = startDate;
    if (endDate) initialFilters.endDate = endDate;

    return initialFilters;
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // View mode state
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

  // Load attendance data and summary when filters change
  useEffect(() => {
    loadAttendanceData();
    loadSummary();
  }, [filters]);

  // Load today's attendance only when user changes (not on every filter change)
  useEffect(() => {
    if (user) {
      loadTodayAttendance();
    }
  }, [user?.id]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceApi.getAttendanceRecords(filters);
      setAttendanceRecords(response.content);
      setPagination({
        page: response.number + 1,
        size: response.size,
        total: response.totalElements
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance records');
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const summaryData = await attendanceApi.getAttendanceSummary(
        filters.startDate,
        filters.endDate
      );
      setSummary(summaryData);
    } catch (err: any) {
      console.error('Error loading summary:', err);
    }
  };

  const loadTodayAttendance = async () => {
    if (!user) return;
    try {
      const attendance = await attendanceApi.getTodayAttendance(user.id);
      setTodayAttendance(attendance); // null means no check-in yet today — that's fine
    } catch (err: any) {
      // Only log unexpected errors (getTodayAttendance already handles 404 → null)
      console.error('Unexpected error loading today attendance:', err);
    }
  };

  // Check-in handler
  const handleCheckIn = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setCheckInLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Get current location if available
      let location: string | undefined;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          location = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        } catch (geoError) {
          console.warn('Could not get location:', geoError);
        }
      }

      const checkInData: AttendanceCheckInDTO = {
        employeeId: user.id,
        checkInTime: new Date().toISOString(),
        checkInLocation: location
      };

      const result = await attendanceApi.checkIn(checkInData);
      setTodayAttendance(result);
      setSuccessMessage('Strategic entry verified. Welcome back.');

      // Reload data to reflect changes
      loadAttendanceData();
      loadSummary();
    } catch (err: any) {
      setError(err.message || 'Failed to check in');
      console.error('Check-in error:', err);
    } finally {
      setCheckInLoading(false);
    }
  };

  // Check-out handler
  const handleCheckOut = async () => {
    if (!user || !todayAttendance) {
      setError('No active tactical session found');
      return;
    }

    try {
      setCheckOutLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Get current location if available
      let location: string | undefined;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });
          location = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        } catch (geoError) {
          console.warn('Could not get location:', geoError);
        }
      }

      const checkOutData: AttendanceCheckOutDTO = {
        employeeId: todayAttendance.employeeId,
        attendanceRecordId: todayAttendance.id,
        checkOutTime: new Date().toISOString(),
        checkOutLocation: location
      };

      const result = await attendanceApi.checkOut(checkOutData);
      setTodayAttendance(result);
      setSuccessMessage('Operational cycle complete. Safe exit confirmed.');

      // Reload data to reflect changes
      loadAttendanceData();
      loadSummary();
    } catch (err: any) {
      setError(err.message || 'Failed to check out');
      console.error('Check-out error:', err);
    } finally {
      setCheckOutLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field: keyof AttendanceSearchParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 0 // Reset to first page on filter change
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page: page - 1 }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters(prev => ({ ...prev, size, page: 0 }));
  };

  // Format time for display
  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get status badge configuration
  const getStatusConfig = (status: AttendanceStatus) => {
    const config: Record<AttendanceStatus, { color: string, icon: React.ReactNode, label: string }> = {
      [AttendanceStatus.PRESENT]: { color: 'text-success-500 bg-success-500/10 border-success-500/20', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Present' },
      [AttendanceStatus.ABSENT]: { color: 'text-danger-500 bg-danger-500/10 border-danger-500/20', icon: <XCircle className="w-3 h-3" />, label: 'Absent' },
      [AttendanceStatus.LATE]: { color: 'text-warning-500 bg-warning-500/10 border-warning-500/20', icon: <Clock className="w-3 h-3" />, label: 'Late' },
      [AttendanceStatus.HALF_DAY]: { color: 'text-primary-500 bg-primary-500/10 border-primary-500/20', icon: <Timer className="w-3 h-3" />, label: 'Half Day' },
      [AttendanceStatus.ON_LEAVE]: { color: 'text-info-500 bg-info-500/10 border-info-500/20', icon: <Calendar className="w-3 h-3" />, label: 'On Leave' },
      [AttendanceStatus.HOLIDAY]: { color: 'text-secondary-400 bg-secondary-400/10 border-secondary-400/20', icon: <PartyPopper className="w-3 h-3" />, label: 'Holiday' },
      [AttendanceStatus.WEEKEND]: { color: 'text-secondary-500 bg-secondary-500/10 border-secondary-500/20', icon: <Calendar className="w-3 h-3" />, label: 'Weekend' },
      [AttendanceStatus.WORK_FROM_HOME]: { color: 'text-info-500 bg-info-500/10 border-info-500/20', icon: <Home className="w-3 h-3" />, label: 'WFH' },
      [AttendanceStatus.OVERTIME]: { color: 'text-warning-500 bg-warning-500/10 border-warning-500/20', icon: <TrendingUp className="w-3 h-3" />, label: 'Overtime' },
      [AttendanceStatus.COMP_OFF]: { color: 'text-success-500 bg-success-500/10 border-success-500/20', icon: <Gift className="w-3 h-3" />, label: 'Comp Off' }
    };
    return config[status] || { color: 'text-secondary-400 bg-secondary-400/10 border-secondary-400/20', icon: <AlertCircle className="w-3 h-3" />, label: status };
  };

  // Table columns definition
  const columns: ColumnDefinition<AttendanceRecordDTO>[] = [
    {
      key: 'attendanceDate',
      header: 'Tactical Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary-800 center border border-white/5">
            <Calendar className="w-4 h-4 text-primary-500" />
          </div>
          <span className="font-bold text-white tracking-tight">{formatDate(value)}</span>
        </div>
      )
    },
    {
      key: 'employeeName',
      header: 'Operational Asset',
      sortable: true,
      render: (value, record) => (
        <div className="flex flex-col">
          <span className="font-black italic uppercase tracking-wider text-xs text-white">
            {value || `Asset #${record.employeeId}`}
          </span>
          <span className="text-[10px] text-secondary-500 font-bold uppercase tracking-widest mt-0.5">Verified Identity</span>
        </div>
      )
    },
    {
      key: 'checkInTime',
      header: 'Entry Vector',
      render: (value) => (
        <div className="flex items-center gap-2 text-success-500 font-bold">
          <LogIn className="w-3.5 h-3.5" />
          {formatTime(value)}
        </div>
      )
    },
    {
      key: 'checkOutTime',
      header: 'Exit Vector',
      render: (value) => (
        <div className="flex items-center gap-2 text-danger-500 font-bold">
          <LogOut className="w-3.5 h-3.5" />
          {formatTime(value)}
        </div>
      )
    },
    {
      key: 'totalHours',
      header: 'Active Multiplier',
      render: (value) => value ? (
        <div className="px-2 py-0.5 rounded-md bg-primary-500/10 border border-primary-500/20 text-primary-400 font-black text-[10px]">
          {value.toFixed(2)}H OPS
        </div>
      ) : '-'
    },
    {
      key: 'status',
      header: 'Registry Status',
      sortable: true,
      render: (value: AttendanceStatus) => {
        const config = getStatusConfig(value);
        return (
          <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${config.color}`}>
            {config.icon}
            {config.label}
          </div>
        );
      }
    }
  ];

  // Calendar helper functions
  const getDaysInMonth = (year: number, month: number): Date[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(date);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i));
      }
    }

    return days;
  };

  const getAttendanceForDate = (date: Date): AttendanceRecordDTO | undefined => {
    const dateStr = date.toISOString().substring(0, 10);
    return attendanceRecords.find(record =>
      record.attendanceDate.split('T')[0] === dateStr
    );
  };

  const [calendarDate, setCalendarDate] = useState(new Date());
  const calendarDays = getDaysInMonth(calendarDate.getFullYear(), calendarDate.getMonth());

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="space-y-8 animate-fade-in p-0 lg:p-4">
      {/* Tactical Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 center shadow-glow transform rotate-3">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">Attendance Registry</h1>
              <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest mt-1">Operational lifecycle & session logs</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {user && (
            <div className="flex items-center p-1 bg-secondary-900 border border-white/5 rounded-2xl shadow-premium">
              {!todayAttendance || !todayAttendance.checkInTime ? (
                <Button
                  variant="primary"
                  onClick={handleCheckIn}
                  disabled={checkInLoading}
                  size="sm"
                  icon={<LogIn className="w-4 h-4" />}
                  className="shadow-glow-primary border-primary-400/50"
                >
                  {checkInLoading ? 'INITIATING...' : 'TACTICAL ENTRY'}
                </Button>
              ) : !todayAttendance.checkOutTime ? (
                <Button
                  variant="danger"
                  onClick={handleCheckOut}
                  disabled={checkOutLoading}
                  size="sm"
                  icon={<LogOut className="w-4 h-4" />}
                  className="shadow-glow-danger border-danger-400/50"
                >
                  {checkOutLoading ? 'TERMINATING...' : 'SECURE EXIT'}
                </Button>
              ) : (
                <div className="px-4 py-2 flex items-center gap-2 text-success-500 font-black text-[10px] uppercase tracking-widest">
                  <BadgeCheck className="w-4 h-4" /> CYCLE COMPLETE
                </div>
              )}
            </div>
          )}

          <div className="flex items-center bg-white/5 border border-white/10 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-primary-600 text-white shadow-lg' : 'text-secondary-400 hover:text-white hover:bg-white/5'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-primary-600 text-white shadow-lg' : 'text-secondary-400 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Status Card */}
      {todayAttendance && (
        <div className="relative overflow-hidden rounded-[32px] bg-secondary-900 border border-white/10 p-8 shadow-premium group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-success-500/5 blur-[80px] rounded-full" />

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500">Global Entry Time</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success-500/10 border border-success-500/20 center text-success-500">
                  <LogIn className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-white italic tracking-tighter uppercase">{formatTime(todayAttendance.checkInTime)}</span>
              </div>
              {todayAttendance.checkInLocation && (
                <span className="text-[10px] text-secondary-500 font-bold mt-1 flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-primary-500" /> {todayAttendance.checkInLocation}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500">Security Exit Confirmation</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-danger-500/10 border border-danger-500/20 center text-danger-500">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-white italic tracking-tighter uppercase">
                  {todayAttendance.checkOutTime ? formatTime(todayAttendance.checkOutTime) : 'PENDING'}
                </span>
              </div>
              {todayAttendance.checkOutLocation && (
                <span className="text-[10px] text-secondary-500 font-bold mt-1 flex items-center gap-1.5">
                  <Navigation className="w-3 h-3 text-primary-500" /> {todayAttendance.checkOutLocation}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500">Operational Multiplier</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 center text-primary-500">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-white italic tracking-tighter uppercase">
                  {todayAttendance.totalHours !== undefined ? `${todayAttendance.totalHours.toFixed(2)}h` : 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary-500">Registry Integrity</span>
              <div className="flex items-center gap-3">
                {(() => {
                  const config = getStatusConfig(todayAttendance.status);
                  return (
                    <>
                      <div className={`w-10 h-10 rounded-xl border center ${config.color.split(' ')[0]} ${config.color.split(' ').slice(1).join(' ')}`}>
                        {config.icon}
                      </div>
                      <span className="text-2xl font-black text-white italic tracking-tighter uppercase">
                        {config.label}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Registry Assets"
            value={summary.totalEmployees}
            icon={<Users className="w-5 h-5" />}
            color="primary"
          />
          <StatCard
            title="Operational"
            value={summary.presentToday}
            icon={<BadgeCheck className="w-5 h-5" />}
            color="success"
          />
          <StatCard
            title="Off Grid"
            value={summary.absentToday}
            icon={<XCircle className="w-5 h-5" />}
            color="danger"
          />
          <StatCard
            title="In Reserve"
            value={summary.onLeaveToday}
            icon={<Home className="w-5 h-5" />}
            color="info"
          />
          <StatCard
            title="Delayed"
            value={summary.lateToday}
            icon={<Clock className="w-5 h-5" />}
            color="warning"
          />
          <StatCard
            title="Fleet Index"
            value={`${summary.averageAttendanceRate.toFixed(1)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="primary"
          />
        </div>
      )}

      {/* Tactical Filters */}
      <div className="glass-card p-6 border-white/5 bg-white/5">
        <div className="flex items-center gap-3 mb-6">
          <FilterIcon className="w-4 h-4 text-primary-500" />
          <h3 className="text-xs font-black italic uppercase tracking-widest text-white">Registry Filter Protocols</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary-500 ml-1">Vector Start Date</label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-500 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full bg-secondary-900 border-2 border-white/5 rounded-xl py-2 pl-10 pr-4 text-white font-bold text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary-500 ml-1">Vector End Date</label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-500 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full bg-secondary-900 border-2 border-white/5 rounded-xl py-2 pl-10 pr-4 text-white font-bold text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary-500 ml-1">Integrity Status</label>
            <div className="relative group">
              <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-500 group-focus-within:text-primary-500 transition-colors" />
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                className="w-full bg-secondary-900 border-2 border-white/5 rounded-xl py-2 pl-10 pr-4 text-white font-bold text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none appearance-none"
              >
                <option value="">ALL VECTORS</option>
                {Object.values(AttendanceStatus).map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary-500 ml-1">Asset Search</label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-500 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Tactical search..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                className="w-full bg-secondary-900 border-2 border-white/5 rounded-xl py-2 pl-10 pr-4 text-white font-bold text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="p-4 bg-success-500/10 border border-success-500/20 rounded-[20px] flex items-center gap-3 text-success-500 font-bold text-sm animate-slide-down">
          <BadgeCheck className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-danger-500/10 border border-danger-500/20 rounded-[20px] flex items-center gap-3 text-danger-500 font-bold text-sm animate-slide-down">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <div className="glass-card overflow-hidden">
          <DataTable
            data={attendanceRecords}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      ) : (
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary-500/10 center text-primary-500 border border-primary-500/20 shadow-inner">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">
                  {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest mt-1">Calendar vector analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 center text-white hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 center text-white hover:bg-white/10 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 md:gap-3">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-black tracking-widest text-secondary-500 italic">
                {day}
              </div>
            ))}

            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === calendarDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const attendance = getAttendanceForDate(date);

              return (
                <div
                  key={index}
                  className={`min-h-[100px] md:min-h-[120px] p-2 md:p-3 rounded-2xl border transition-all ${!isCurrentMonth ? 'bg-transparent border-transparent opacity-20' :
                    isToday ? 'bg-primary-600/10 border-primary-500 shadow-glow-sm' :
                      'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                >
                  <div className={`text-xs font-black italic mb-2 ${isToday ? 'text-primary-400' : 'text-secondary-400'}`}>
                    {date.getDate()}
                  </div>
                  {attendance && (
                    <div className="flex flex-col gap-2">
                      <div className={`w-full py-1 rounded-lg center border text-[9px] font-black uppercase tracking-widest ${getStatusConfig(attendance.status).color}`}>
                        {attendance.status === AttendanceStatus.PRESENT ? 'PRES' :
                          attendance.status === AttendanceStatus.ABSENT ? 'ABS' :
                            attendance.status === AttendanceStatus.LATE ? 'LATE' :
                              attendance.status.substring(0, 4)}
                      </div>
                      {attendance.totalHours !== undefined && (
                        <div className="flex items-center justify-center gap-1 text-[9px] font-bold text-secondary-500">
                          <Timer className="w-3 h-3 text-primary-500" />
                          {attendance.totalHours.toFixed(1)}H
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-wrap gap-4 items-center justify-center p-6 rounded-[24px] bg-secondary-900/50 border border-white/5">
            <span className="text-[10px] font-black text-secondary-500 uppercase tracking-widest mr-4">Protocol Legend:</span>
            {Object.values(AttendanceStatus).slice(0, 6).map(status => {
              const config = getStatusConfig(status);
              const colorClass = config?.color ? config.color.split(' ')?.[0]?.replace('text-', 'bg-') : 'bg-secondary-500';
              return (
                <div key={status} className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/5">
                  <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">{config?.label || status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
