import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, ShieldCheck, CheckCircle2, AlertOctagon, RefreshCw, Key, Power, Trash2, 
  Edit, Eye, UserPlus, Search, Filter, Plus, Settings, BarChart3, Clock, 
  HelpCircle, Volume2, CreditCard, DollarSign, Activity, Lock, Check, ChevronLeft, 
  ChevronRight, User, MoreVertical, X, CheckSquare, Square, ClipboardList, Info,
  ArrowLeft, LayoutGrid, List, Building2, Phone, Mail, Calendar, FileText, Camera, Upload
} from 'lucide-react';
import { User as UserType } from '../types';

interface EmployeeAdminsModuleProps {
  currentUser: UserType | null;
  onNavigateToTab: (tab: any) => void;
  users: UserType[];
  onRefreshData: () => void;
}

// Predefined Roles
const PREDEFINED_ROLES = [
  {
    name: 'Content Moderator',
    description: 'Review and moderate platform listings, spam, and safety reports.',
    permissions: [
      'Review Listings',
      'Approve Listings',
      'Reject Listings',
      'Remove Spam',
      'Handle Reports',
      'Moderate Reviews'
    ],
    tabs: ['listings', 'reports', 'support']
  },
  {
    name: 'Customer Support',
    description: 'Reply to user inquiries, assist recovery, and manage support tickets.',
    permissions: [
      'Reply to Users',
      'Manage Support Tickets',
      'Resolve Complaints',
      'Assist Account Recovery',
      'Help Listing Owners'
    ],
    tabs: ['support', 'reports']
  },
  {
    name: 'Verification Officer',
    description: 'Review official verification documentation and approve badges.',
    permissions: [
      'Verify Users',
      'Verify Businesses',
      'Verify Property Ownership',
      'Review Documents',
      'Approve Verification',
      'Reject Verification'
    ],
    tabs: ['verification', 'users', 'listings']
  },
  {
    name: 'Advertisement Manager',
    description: 'Publish dynamic banner campaigns and sponsored listing deals.',
    permissions: [
      'Create Banner Ads',
      'Manage Banner Ads',
      'Manage Featured Listings',
      'Manage Sponsored Ads',
      'Advertisement Reports'
    ],
    tabs: ['ads', 'listings']
  },
  {
    name: 'Finance Manager',
    description: 'Verify payment receipts, handle refund claims, and view logs.',
    permissions: [
      'Review Payments',
      'Verify Manual Payments',
      'View Transactions',
      'Process Refund Requests',
      'Financial Reports'
    ],
    tabs: ['payments', 'analytics']
  },
  {
    name: 'Analytics Manager',
    description: 'Read-only access to dashboard statistics and performance analytics.',
    permissions: [
      'Dashboard Statistics',
      'Revenue Analytics',
      'User Analytics',
      'Listing Analytics',
      'Generate Reports',
      'Export Reports'
    ],
    tabs: ['overview', 'analytics']
  }
];

// All possible permissions for Custom Role
const ALL_AVAILABLE_PERMISSIONS = [
  'Review Listings',
  'Approve Listings',
  'Reject Listings',
  'Remove Spam',
  'Handle Reports',
  'Moderate Reviews',
  'Reply to Users',
  'Manage Support Tickets',
  'Resolve Complaints',
  'Assist Account Recovery',
  'Help Listing Owners',
  'Verify Users',
  'Verify Businesses',
  'Verify Property Ownership',
  'Review Documents',
  'Approve Verification',
  'Reject Verification',
  'Create Banner Ads',
  'Manage Banner Ads',
  'Manage Featured Listings',
  'Manage Sponsored Ads',
  'Advertisement Reports',
  'Review Payments',
  'Verify Manual Payments',
  'View Transactions',
  'Process Refund Requests',
  'Financial Reports',
  'Dashboard Statistics',
  'Revenue Analytics',
  'User Analytics',
  'Listing Analytics',
  'Generate Reports',
  'Export Reports'
];

export const EmployeeAdminsModule: React.FC<EmployeeAdminsModuleProps> = ({
  currentUser,
  onNavigateToTab,
  users,
  onRefreshData
}) => {
  // Navigation Tabs for Employee Admins Module
  const [subTab, setSubTab] = useState<'dashboard' | 'staff_management' | 'roles_permissions' | 'login_history' | 'activity_logs' | 'settings'>('dashboard');

  // Employee list derived from users where isEmployee is true
  const employees = useMemo(() => {
    return users.filter(u => u.isEmployee === true);
  }, [users]);

  // Roles & Custom Roles state
  const [predefinedRoles, setPredefinedRoles] = useState<any[]>(() => {
    const saved = localStorage.getItem('sof_umer_predefined_roles');
    return saved ? JSON.parse(saved) : PREDEFINED_ROLES;
  });

  const [editingRole, setEditingRole] = useState<{ name: string; description: string; permissions: string[]; isPredefined?: boolean } | null>(null);

  const [accessPolicies, setAccessPolicies] = useState<any>(() => {
    const saved = localStorage.getItem('sof_umer_employee_access_policies');
    return saved ? JSON.parse(saved) : {
      inactivityTimeout: '15m',
      auditLogging: true,
      blockPasswordReuse: true,
      maxLoginAttempts: '5',
      ipWhitelist: ''
    };
  });

  const [customRoles, setCustomRoles] = useState<any[]>([]);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);

  // Logs & History State
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Form States for Creating/Editing Employees
  const [showAddEmployeeForm, setShowAddEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<UserType | null>(null);
  
  const [photoUrl, setPhotoUrl] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [username, setUsername] = useState('');
  const [tempPassword, setTempPassword] = useState('SofUmer@2026'); // Valid defaults
  const [confirmPassword, setConfirmPassword] = useState('SofUmer@2026');
  const [department, setDepartment] = useState('');
  const [employeeRole, setEmployeeRole] = useState('Content Moderator');
  const [employeeStatus, setEmployeeStatus] = useState<'active' | 'suspended' | 'disabled'>('active');
  const [notes, setNotes] = useState('');

  // Selected Employee for Detailed Profile view
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<UserType | null>(null);
  const [dashboardViewMode, setDashboardViewMode] = useState<'table' | 'grid'>('table');

  const activeProfileEmployee = useMemo(() => {
    if (!selectedProfileEmployee) return null;
    return users.find(u => u.id === selectedProfileEmployee.id) || selectedProfileEmployee;
  }, [selectedProfileEmployee, users]);

  const [profileRole, setProfileRole] = useState('');
  const [profileStatus, setProfileStatus] = useState<'active' | 'suspended' | 'disabled'>('active');
  const [profileDept, setProfileDept] = useState('');
  const [profileNotes, setProfileNotes] = useState('');
  const [profileUpdating, setProfileUpdating] = useState(false);

  useEffect(() => {
    if (activeProfileEmployee) {
      setProfileRole(activeProfileEmployee.employeeRole || 'Content Moderator');
      setProfileStatus((activeProfileEmployee.status as any) || 'active');
      setProfileDept(activeProfileEmployee.department || '');
      setProfileNotes(activeProfileEmployee.notes || '');
    }
  }, [activeProfileEmployee]);

  // UI Search, filters & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Notification Banner State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Fetch Custom Roles, Activity Logs & Login History
  const fetchEmployeeData = async () => {
    setLogsLoading(true);
    try {
      const [rolesRes, logsRes, histRes] = await Promise.all([
        fetch('/api/employee/custom-roles'),
        fetch('/api/employee/activity-logs'),
        fetch('/api/employee/login-history')
      ]);

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setCustomRoles(rolesData);
      }
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setActivityLogs(logsData);
      }
      if (histRes.ok) {
        const histData = await histRes.json();
        setLoginHistory(histData);
      }
    } catch (e) {
      console.error("Error loading employee dashboard data:", e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [users]);

  // Add Action Helper
  const logEmployeeAction = async (fullName: string, action: string, module: string, status: string = 'success') => {
    try {
      await fetch('/api/employee/activity-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, action, module, status })
      });
      fetchEmployeeData();
    } catch (e) {
      console.error(e);
    }
  };

  // Determine permissions of a role
  const getPermissionsForRole = (roleName: string) => {
    const pred = predefinedRoles.find(r => r.name === roleName);
    if (pred) return pred.permissions;
    const cust = customRoles.find(r => r.name === roleName);
    if (cust) return cust.permissions;
    return [];
  };

  // Form validation & submission
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !username) {
      triggerNotification('Please fill in all required fields.', 'error');
      return;
    }

    if (!editingEmployee && tempPassword !== confirmPassword) {
      triggerNotification('Passwords do not match.', 'error');
      return;
    }

    const assignedPermissions = getPermissionsForRole(employeeRole);

    try {
      if (editingEmployee) {
        // Edit flow
        const updatePayload = {
          fullName,
          phone,
          username,
          employeeId: employeeId || undefined,
          department,
          employeeRole,
          status: employeeStatus,
          permissions: assignedPermissions,
          notes,
          photoUrl
        };

        const res = await fetch(`/api/users/${editingEmployee.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
          },
          body: JSON.stringify(updatePayload)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to update employee.');
        }

        await logEmployeeAction(
          currentUser?.fullName || 'Super Admin',
          `Updated employee profile for "${fullName}"`,
          'Employee Management'
        );

        triggerNotification(`Employee "${fullName}" updated successfully!`);
      } else {
        // Create flow using /api/auth/register
        const registerPayload = {
          email,
          fullName,
          username,
          password: tempPassword,
          role: 'admin'
        };

        // Register the standard admin account
        const registerRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerPayload)
        });

        if (!registerRes.ok) {
          const err = await registerRes.json();
          throw new Error(err.error || 'Failed to create employee admin account.');
        }

        const registeredData = await registerRes.json();
        
        // Retrieve standard ID of the created user from backend response
        const createdId = registeredData.userId || users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase())?.id || ('usr-' + Date.now()); // fallback if sync is delayed

        const updatePayload = {
          isEmployee: true,
          employeeId: employeeId || 'EMP-' + Math.floor(100000 + Math.random() * 900000),
          phone,
          username,
          department,
          employeeRole,
          status: employeeStatus,
          permissions: assignedPermissions,
          notes,
          photoUrl,
          temporaryPassword: tempPassword,
          isVerified: true,
          verificationStatus: 'verified'
        };

        // Now save the employee details
        await fetch(`/api/users/${createdId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
          },
          body: JSON.stringify(updatePayload)
        });

        await logEmployeeAction(
          currentUser?.fullName || 'Super Admin',
          `Created new employee "${fullName}" as ${employeeRole}`,
          'Employee Management'
        );

        triggerNotification(`Employee "${fullName}" created successfully! Temporary Password: ${tempPassword}`);
      }

      setShowAddEmployeeForm(false);
      setEditingEmployee(null);
      resetEmployeeForm();
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message || 'An error occurred.', 'error');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (base64String) {
        setPhotoUrl(base64String);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input to allow re-upload of same file
  };

  const resetEmployeeForm = () => {
    setPhotoUrl('');
    setFullName('');
    setEmail('');
    setPhone('');
    setEmployeeId('');
    setUsername('');
    setTempPassword('SofUmer@2026');
    setConfirmPassword('SofUmer@2026');
    setDepartment('');
    setEmployeeRole('Content Moderator');
    setEmployeeStatus('active');
    setNotes('');
  };

  const handleEditClick = (emp: UserType) => {
    setEditingEmployee(emp);
    setPhotoUrl(emp.photoUrl || '');
    setFullName(emp.fullName || '');
    setEmail(emp.email || '');
    setPhone(emp.phone || '');
    setEmployeeId(emp.employeeId || '');
    setUsername(emp.username || '');
    setDepartment(emp.department || '');
    setEmployeeRole(emp.employeeRole || 'Content Moderator');
    setEmployeeStatus(emp.status as any || 'active');
    setNotes(emp.notes || '');
    setShowAddEmployeeForm(true);
    setSubTab('staff_management');
  };

  const handleStatusChange = async (emp: UserType, nextStatus: 'active' | 'suspended' | 'disabled') => {
    try {
      const res = await fetch(`/api/users/${emp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (!res.ok) throw new Error('Failed to update employee status.');

      await logEmployeeAction(
        currentUser?.fullName || 'Super Admin',
        `Changed status of employee "${emp.fullName}" to ${nextStatus.toUpperCase()}`,
        'Employee Management'
      );

      triggerNotification(`Employee status changed to ${nextStatus.toUpperCase()}`);
      onRefreshData();
    } catch (e: any) {
      triggerNotification(e.message, 'error');
    }
  };

  const handleUpdateProfileDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfileEmployee) return;

    setProfileUpdating(true);
    try {
      const updatedPermissions = getPermissionsForRole(profileRole);
      const res = await fetch(`/api/users/${activeProfileEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify({
          employeeRole: profileRole,
          status: profileStatus,
          department: profileDept,
          notes: profileNotes,
          permissions: updatedPermissions
        })
      });

      if (!res.ok) throw new Error('Failed to update employee details.');

      await logEmployeeAction(
        currentUser?.fullName || 'Super Admin',
        `Updated employee details for "${activeProfileEmployee.fullName}": Role="${profileRole}", Status="${profileStatus}", Department="${profileDept}"`,
        'Employee Management'
      );

      triggerNotification(`Employee details for "${activeProfileEmployee.fullName}" saved successfully!`);
      onRefreshData();
    } catch (err: any) {
      triggerNotification(err.message, 'error');
    } finally {
      setProfileUpdating(false);
    }
  };

  const handleResetPassword = async (emp: UserType) => {
    const newPass = 'SofUmer@' + Math.floor(2026 + Math.random() * 100);
    try {
      const res = await fetch(`/api/users/${emp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify({ password: newPass, temporaryPassword: newPass })
      });

      if (!res.ok) throw new Error('Failed to reset password.');

      await logEmployeeAction(
        currentUser?.fullName || 'Super Admin',
        `Reset password for employee "${emp.fullName}"`,
        'Security'
      );

      triggerNotification(`Password reset successfully! New Temp Password: ${newPass}`);
      onRefreshData();
    } catch (e: any) {
      triggerNotification(e.message, 'error');
    }
  };

  const handleDeleteEmployee = async (emp: UserType) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete employee "${emp.fullName}"?`)) return;

    try {
      // In the server, deleting users is done by status update or deleting record
      // Let's mark as deleted or delete standard record
      const res = await fetch(`/api/users/${emp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sof_umer_token')}`
        },
        body: JSON.stringify({ isEmployee: false, status: 'suspended', role: 'user' }) // Demote and disable
      });

      if (!res.ok) throw new Error('Failed to delete employee.');

      await logEmployeeAction(
        currentUser?.fullName || 'Super Admin',
        `Deleted/Deactivated employee "${emp.fullName}" from the staff module`,
        'Employee Management'
      );

      triggerNotification(`Employee "${emp.fullName}" removed from staff module.`);
      onRefreshData();
    } catch (e: any) {
      triggerNotification(e.message, 'error');
    }
  };

  // Start Edit role (predefined or custom)
  const handleStartEditRole = (role: any, isPredefined: boolean = false) => {
    setEditingRole({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
      isPredefined
    });
    setNewRoleName(role.name);
    setNewRoleDesc(role.description || '');
    setNewRolePerms(role.permissions || []);
    setShowAddRoleModal(true);
  };

  // Add/Save Custom or Predefined Role submission
  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) {
      triggerNotification('Role name is required.', 'error');
      return;
    }

    try {
      if (editingRole?.isPredefined) {
        // Save to predefined roles overrides state and localStorage
        const updated = predefinedRoles.map(r => {
          if (r.name === editingRole.name) {
            return {
              ...r,
              description: newRoleDesc,
              permissions: newRolePerms
            };
          }
          return r;
        });
        setPredefinedRoles(updated);
        localStorage.setItem('sof_umer_predefined_roles', JSON.stringify(updated));

        await logEmployeeAction(
          currentUser?.fullName || 'Super Admin',
          `Modified predefined role permissions for "${editingRole.name}" (Edition)`,
          'Employee Settings'
        );

        triggerNotification(`Predefined Role "${editingRole.name}" updated successfully!`);
      } else {
        // Create/Update Custom Role
        const payload = {
          name: newRoleName,
          description: newRoleDesc,
          permissions: newRolePerms
        };

        const res = await fetch('/api/employee/custom-roles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to save custom role.');

        await logEmployeeAction(
          currentUser?.fullName || 'Super Admin',
          editingRole ? `Updated custom role "${newRoleName}"` : `Created custom role "${newRoleName}"`,
          'Employee Settings'
        );

        triggerNotification(`Custom Role "${newRoleName}" saved successfully!`);
      }

      setShowAddRoleModal(false);
      setEditingRole(null);
      setNewRoleName('');
      setNewRoleDesc('');
      setNewRolePerms([]);
      fetchEmployeeData();
      onRefreshData();
    } catch (e: any) {
      triggerNotification(e.message, 'error');
    }
  };

  const handleDeleteCustomRole = async (roleName: string) => {
    if (!window.confirm(`Delete custom role "${roleName}"?`)) return;

    try {
      const res = await fetch(`/api/employee/custom-roles/${roleName}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete custom role.');

      triggerNotification(`Custom role "${roleName}" deleted.`);
      fetchEmployeeData();
    } catch (e: any) {
      triggerNotification(e.message, 'error');
    }
  };

  const handleSaveAccessPolicies = async () => {
    try {
      localStorage.setItem('sof_umer_employee_access_policies', JSON.stringify(accessPolicies));
      await logEmployeeAction(
        currentUser?.fullName || 'Super Admin',
        `Updated administrative access policies: Timeout=${accessPolicies.inactivityTimeout}, AuditLog=${accessPolicies.auditLogging ? 'Active' : 'Disabled'}, BlockReuse=${accessPolicies.blockPasswordReuse ? 'Enforced' : 'Disabled'}, MaxAttempts=${accessPolicies.maxLoginAttempts}`,
        'Employee Settings'
      );
      triggerNotification('Access policies updated and saved successfully!');
    } catch (e: any) {
      triggerNotification(e.message, 'error');
    }
  };

  const togglePermission = (perm: string) => {
    setNewRolePerms(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  // Filters & Search logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const searchLower = (searchTerm || '').toLowerCase();
      const matchesSearch = 
        (emp.fullName || '').toLowerCase().includes(searchLower) ||
        (emp.email || '').toLowerCase().includes(searchLower) ||
        (emp.employeeId || '').toLowerCase().includes(searchLower) ||
        (emp.username || '').toLowerCase().includes(searchLower);
      
      const matchesRole = roleFilter === 'All' || emp.employeeRole === roleFilter;
      const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, searchTerm, roleFilter, statusFilter]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(start, start + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;

  // Overview Counts
  const stats = useMemo(() => {
    return {
      total: employees.length,
      active: employees.filter(e => e.status === 'active').length,
      suspended: employees.filter(e => e.status === 'suspended').length,
      disabled: employees.filter(e => e.status === 'disabled').length,
      roles: new Set(employees.map(e => e.employeeRole).filter(Boolean)).size
    };
  }, [employees]);

  return (
    <div className="space-y-6">
      {/* Dynamic Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 transition-all duration-300 ${
          notification.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertOctagon className="w-5 h-5 shrink-0" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Material Design 3 Tabs for Employee Admins Module */}
      <div className="bg-[#0d0d12]/90 border border-white/5 p-2 rounded-3xl flex flex-wrap gap-1 backdrop-blur-md">
        <button
          onClick={() => { setSubTab('dashboard'); setSelectedProfileEmployee(null); }}
          className={`px-4 py-2 rounded-2xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
            subTab === 'dashboard' ? 'bg-amber-500 text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => { setSubTab('staff_management'); setSelectedProfileEmployee(null); }}
          className={`px-4 py-2 rounded-2xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
            subTab === 'staff_management' ? 'bg-amber-500 text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Staff Management</span>
        </button>

        <button
          onClick={() => { setSubTab('roles_permissions'); setSelectedProfileEmployee(null); }}
          className={`px-4 py-2 rounded-2xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
            subTab === 'roles_permissions' ? 'bg-amber-500 text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Roles & Permissions</span>
        </button>

        <button
          onClick={() => { setSubTab('login_history'); setSelectedProfileEmployee(null); }}
          className={`px-4 py-2 rounded-2xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
            subTab === 'login_history' ? 'bg-amber-500 text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Login History</span>
        </button>

        <button
          onClick={() => { setSubTab('activity_logs'); setSelectedProfileEmployee(null); }}
          className={`px-4 py-2 rounded-2xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
            subTab === 'activity_logs' ? 'bg-amber-500 text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity Logs</span>
        </button>

        <button
          onClick={() => { setSubTab('settings'); setSelectedProfileEmployee(null); }}
          className={`px-4 py-2 rounded-2xl text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
            subTab === 'settings' ? 'bg-amber-500 text-black shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* ----------------- SUB-TAB: DASHBOARD ----------------- */}
      {subTab === 'dashboard' && !selectedProfileEmployee && (
        <div className="space-y-6">
          {/* Md3 Stats Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-[#0d0d12]/90 border border-white/5 p-4 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
              <div className="flex justify-between items-start">
                <p className="text-[10px] uppercase font-extrabold text-white/40 tracking-wider">Total Employees</p>
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-white mt-3">{stats.total}</p>
            </div>

            <div className="bg-[#0d0d12]/90 border border-white/5 p-4 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
              <div className="flex justify-between items-start">
                <p className="text-[10px] uppercase font-extrabold text-white/40 tracking-wider">Active</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-400 mt-3">{stats.active}</p>
            </div>

            <div className="bg-[#0d0d12]/90 border border-white/5 p-4 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
              <div className="flex justify-between items-start">
                <p className="text-[10px] uppercase font-extrabold text-white/40 tracking-wider">Suspended</p>
                <AlertOctagon className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-extrabold text-rose-400 mt-3">{stats.suspended}</p>
            </div>

            <div className="bg-[#0d0d12]/90 border border-white/5 p-4 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
              <div className="flex justify-between items-start">
                <p className="text-[10px] uppercase font-extrabold text-white/40 tracking-wider">Disabled</p>
                <Power className="w-4 h-4 text-white/60" />
              </div>
              <p className="text-2xl font-extrabold text-white/60 mt-3">{stats.disabled}</p>
            </div>

            <div className="bg-[#0d0d12]/90 border border-white/5 p-4 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
              <div className="flex justify-between items-start">
                <p className="text-[10px] uppercase font-extrabold text-white/40 tracking-wider">Employee Roles</p>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-extrabold text-amber-400 mt-3">{stats.roles}</p>
            </div>
          </div>

          {/* Quick List and Predefined Role Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-[#0d0d12]/90 border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-white text-base">Employee Directory</h3>
                  <p className="text-[11px] text-white/40">Search, filter, and view detailed metrics for administrative staff.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* View Mode Toggle */}
                  <div className="bg-[#12121a] border border-white/5 rounded-2xl p-1 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDashboardViewMode('table')}
                      title="Table View"
                      className={`p-1.5 rounded-xl transition cursor-pointer ${dashboardViewMode === 'table' ? 'bg-amber-500 text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDashboardViewMode('grid')}
                      title="Grid Bento View"
                      className={`p-1.5 rounded-xl transition cursor-pointer ${dashboardViewMode === 'grid' ? 'bg-amber-500 text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => { setSubTab('staff_management'); setShowAddEmployeeForm(true); }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Employee</span>
                  </button>
                </div>
              </div>

              {/* Filters panel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-white/30" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search ID, name, email, dept..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-4 w-4 text-white/30" />
                  </span>
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500/50 appearance-none"
                  >
                    <option value="All">All Roles</option>
                    {predefinedRoles.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                    {customRoles.map(r => <option key={r.name} value={r.name}>{r.name} (Custom)</option>)}
                  </select>
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Activity className="h-4 w-4 text-white/30" />
                  </span>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500/50 appearance-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              {/* Employee table/list based on viewMode */}
              {dashboardViewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paginatedEmployees.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-[#12121a]/30 border border-white/5 rounded-2xl text-white/30">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-xs">No employees match filters.</p>
                    </div>
                  ) : (
                    paginatedEmployees.map(emp => {
                      const empLogs = loginHistory.filter(h => (h.email || '').toLowerCase() === (emp.email || '').toLowerCase());
                      const lastLoginLog = empLogs.length > 0 ? empLogs[0] : null;
                      const lastActiveStr = lastLoginLog 
                        ? new Date(lastLoginLog.loginTime).toLocaleString() 
                        : 'Never logged in';
                      return (
                        <div
                          key={emp.id}
                          onClick={() => setSelectedProfileEmployee(emp)}
                          className="bg-[#12121a]/30 border border-white/5 p-4 rounded-2xl hover:border-amber-500/30 hover:bg-[#12121a]/50 transition cursor-pointer flex flex-col justify-between space-y-3 shadow-sm group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={emp.photoUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80`}
                                alt={emp.fullName}
                                referrerPolicy="no-referrer"
                                className="w-11 h-11 rounded-full border border-white/10 shrink-0 object-cover"
                              />
                              <div>
                                <p className="font-extrabold text-white text-xs group-hover:text-amber-400 transition">{emp.fullName}</p>
                                <p className="text-[10px] text-white/40">@{emp.username || 'username'}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase ${
                              emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                              emp.status === 'suspended' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white/5 text-white/40 border border-white/10'
                            }`}>
                              {emp.status}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[11px] text-white/60">
                            <div className="flex items-center gap-2">
                              <Lock className="w-3.5 h-3.5 text-amber-500/60 shrink-0" />
                              <span className="text-[10px] font-bold text-amber-400">{emp.employeeRole}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-emerald-500/60 shrink-0" />
                              <span>{emp.department || 'Operations'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-white/30 shrink-0" />
                              <span className="truncate">{emp.email}</span>
                            </div>
                            {emp.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-white/30 shrink-0" />
                                <span>{emp.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-white/30 font-medium">
                            <span>Last Active:</span>
                            <span className="text-white/60 font-mono text-[9px]">{lastActiveStr}</span>
                          </div>

                          <div className="flex justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              title="View Detailed Profile"
                              onClick={(e) => { e.stopPropagation(); setSelectedProfileEmployee(emp); }}
                              className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              title="Edit Details"
                              onClick={(e) => { e.stopPropagation(); handleEditClick(emp); }}
                              className="p-1.5 bg-amber-500/5 hover:bg-amber-500/10 text-amber-500 hover:text-amber-400 rounded-xl transition cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#12121a]/30">
                  <table className="w-full text-left text-xs text-white/60">
                    <thead className="bg-[#12121a]/95 text-[10px] uppercase font-bold text-white/40 tracking-wider border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3">Profile / Name</th>
                        <th className="px-4 py-3">Employee ID & Dept</th>
                        <th className="px-4 py-3">Contact Details</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Last Active</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-white/30">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-xs">No employees match filters.</p>
                          </td>
                        </tr>
                      ) : (
                        paginatedEmployees.map(emp => {
                          const empLogs = loginHistory.filter(h => (h.email || '').toLowerCase() === (emp.email || '').toLowerCase());
                          const lastLoginLog = empLogs.length > 0 ? empLogs[0] : null;
                          const lastActiveStr = lastLoginLog 
                            ? new Date(lastLoginLog.loginTime).toLocaleDateString() + ' ' + new Date(lastLoginLog.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                            : 'Never';
                          return (
                            <tr
                              key={emp.id}
                              onClick={() => setSelectedProfileEmployee(emp)}
                              className="hover:bg-white/[0.03] transition cursor-pointer group"
                            >
                              <td className="px-4 py-3 flex items-center gap-2.5">
                                <img
                                  src={emp.photoUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80`}
                                  alt={emp.fullName}
                                  referrerPolicy="no-referrer"
                                  className="w-8 h-8 rounded-full border border-white/10 shrink-0 object-cover"
                                />
                                <div>
                                  <p className="font-bold text-white text-xs group-hover:text-amber-400 transition">{emp.fullName}</p>
                                  <p className="text-[10px] text-white/30">@{emp.username || 'username'}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-mono text-[10px] text-white/80">{emp.employeeId || 'N/A'}</p>
                                <p className="text-[10px] text-emerald-400 font-medium">{emp.department || 'Operations'}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="text-white/80">{emp.email}</p>
                                <p className="text-[10px] text-white/30">{emp.phone || 'No Phone'}</p>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[9px] uppercase tracking-wider">
                                  {emp.employeeRole}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-[10px] text-white/50">{lastActiveStr}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase ${
                                  emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                  emp.status === 'suspended' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-white/5 text-white/40 border border-white/10'
                                }`}>
                                  {emp.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                  <button
                                    title="View Detailed Profile"
                                    onClick={() => setSelectedProfileEmployee(emp)}
                                    className="p-1 text-white/40 hover:text-white hover:bg-white/5 rounded transition cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    title="Edit Details"
                                    onClick={() => handleEditClick(emp)}
                                    className="p-1 text-amber-500/70 hover:text-amber-400 hover:bg-amber-500/10 rounded transition cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    title="Suspend Account"
                                    onClick={() => handleStatusChange(emp, emp.status === 'suspended' ? 'active' : 'suspended')}
                                    className="p-1 text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
                                  >
                                    <Power className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-white/40">Showing page {currentPage} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 bg-[#12121a] border border-white/5 rounded-xl text-white/60 disabled:opacity-20 hover:text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 bg-[#12121a] border border-white/5 rounded-xl text-white/60 disabled:opacity-20 hover:text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Predefined role definitions cards */}
            <div className="lg:col-span-4 bg-[#0d0d12]/90 border border-white/5 rounded-3xl p-6 space-y-4">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>RBAC Quick Guide</span>
              </h4>
              <p className="text-[11px] text-white/40">Employee roles specify dynamic access permissions on Sof Umer.</p>
              
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {predefinedRoles.map(role => (
                  <div key={role.name} className="bg-[#12121a] border border-white/5 p-3.5 rounded-2xl space-y-1.5 hover:border-white/10 transition">
                    <p className="text-xs font-bold text-white">{role.name}</p>
                    <p className="text-[10px] text-white/50 leading-relaxed">{role.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {role.permissions.slice(0, 3).map(p => (
                        <span key={p} className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/5 text-amber-500 border border-amber-500/10 font-bold">
                          {p}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: STAFF MANAGEMENT (CREATE & EDIT) ----------------- */}
      {subTab === 'staff_management' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-white text-base">
                {editingEmployee ? `Edit Employee: ${editingEmployee.fullName}` : 'Staff Management'}
              </h3>
              <p className="text-[11px] text-white/40">Create, reset, modify, and monitor active employee accounts.</p>
            </div>
            {!showAddEmployeeForm && (
              <button
                onClick={() => { resetEmployeeForm(); setShowAddEmployeeForm(true); }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            )}
          </div>

          {showAddEmployeeForm ? (
            <div className="bg-[#0d0d12]/90 border border-white/5 rounded-3xl p-6">
              <form onSubmit={handleSaveEmployee} className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {editingEmployee ? 'Update Profile Details' : 'Register New Employee Admin'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowAddEmployeeForm(false); setEditingEmployee(null); resetEmployeeForm(); }}
                    className="p-1 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Core Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-white/40 tracking-wider mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="e.g. Kedir Ahmed"
                        className="w-full px-3.5 py-2.5 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-white/40 tracking-wider mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        disabled={!!editingEmployee}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="employee@sofumer.com"
                        className="w-full px-3.5 py-2.5 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white disabled:opacity-50 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-white/40 tracking-wider mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+251911000000"
                        className="w-full px-3.5 py-2.5 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-white/40 tracking-wider mb-1">Employee ID (e.g. CBE-EMP-01)</label>
                      <input
                        type="text"
                        value={employeeId}
                        onChange={e => setEmployeeId(e.target.value)}
                        placeholder="e.g. EMP-918239 or CBE-EMP-01"
                        className="w-full px-3.5 py-2.5 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Column 2: Authentication Credentials */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-white/40 tracking-wider mb-1">Username *</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="e.g. kedir_support"
                        className="w-full px-3.5 py-2.5 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {!editingEmployee && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-extrabold text-white/40 tracking-wider mb-1">Temporary Password</label>
                          <input
                            type="password"
                            required
                            value={tempPassword}
                            onChange={e => setTempPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-extrabold text-white/40 tracking-wider mb-1">Confirm Password</label>
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-white/40 tracking-wider mb-2">Profile Photo (File or Phone Capture)</label>
                      
                      {photoUrl ? (
                        <div className="flex items-center gap-4 p-3 bg-[#12121a] border border-white/5 rounded-2xl">
                          <img
                            src={photoUrl}
                            alt="Profile Preview"
                            className="w-12 h-12 rounded-full object-cover border border-amber-500/30"
                          />
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-white/60 font-medium">Image selected</span>
                            <div className="flex gap-2">
                              <label className="text-[9px] font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                                <Camera className="w-3 h-3" />
                                <span>Change Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handlePhotoUpload}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setPhotoUrl('')}
                                className="text-[9px] font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20"
                              >
                                <X className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label className="group flex flex-col items-center justify-center p-6 bg-[#12121a] hover:bg-[#12121a]/80 border border-dashed border-white/10 hover:border-amber-500/30 rounded-2xl cursor-pointer transition text-center min-h-[110px]">
                          <div className="p-2.5 bg-white/5 group-hover:bg-amber-500/10 rounded-full text-white/40 group-hover:text-amber-400 transition mb-2">
                            <Camera className="w-4.5 h-4.5" />
                          </div>
                          <span className="text-[11px] font-bold text-white/70 group-hover:text-white transition">Select Profile Photo</span>
                          <span className="text-[9px] text-white/30 group-hover:text-white/40 mt-0.5">Supports PNG, JPG (taken from file, phone or camera)</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Column 3: Department, Role & Status */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-white/40 tracking-wider mb-1">Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        placeholder="Operations, Trust & Safety..."
                        className="w-full px-3.5 py-2.5 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-extrabold text-white/40 tracking-wider mb-1">Role *</label>
                        <select
                          value={employeeRole}
                          onChange={e => setEmployeeRole(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500 appearance-none"
                        >
                          {predefinedRoles.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                          {customRoles.map(r => <option key={r.name} value={r.name}>{r.name} (Custom)</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-extrabold text-white/40 tracking-wider mb-1">Status *</label>
                        <select
                          value={employeeStatus}
                          onChange={e => setEmployeeStatus(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500 appearance-none"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-extrabold text-white/40 tracking-wider mb-1">Administrative Notes</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Internal guidelines, contract references..."
                        className="w-full px-3.5 py-2.5 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAddEmployeeForm(false); setEditingEmployee(null); resetEmployeeForm(); }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-2xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition cursor-pointer"
                  >
                    Save Employee Record
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-[#0d0d12]/90 border border-white/5 rounded-3xl p-6 space-y-4">
              <h4 className="font-extrabold text-white text-sm">Active Staff Members ({employees.length})</h4>
              <p className="text-[11px] text-white/40">These admin accounts are mapped to custom limited permissions based on RBAC.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map(emp => (
                  <div key={emp.id} className="bg-[#12121a]/50 border border-white/5 rounded-2xl p-4 space-y-3 hover:border-white/10 transition relative group">
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(emp)}
                        className="p-1.5 text-white/70 hover:text-white bg-black/45 hover:bg-black/60 rounded-xl transition"
                        title="Edit Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(emp)}
                        className="p-1.5 text-amber-500 hover:text-amber-400 bg-black/45 hover:bg-black/60 rounded-xl transition"
                        title="Reset Temp Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp)}
                        className="p-1.5 text-rose-500 hover:text-rose-400 bg-black/45 hover:bg-black/60 rounded-xl transition"
                        title="Permanently Delete Employee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={emp.photoUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80`}
                        alt={emp.fullName}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <p className="font-bold text-white text-xs leading-none">{emp.fullName}</p>
                        <p className="text-[10px] text-white/40 mt-1">ID: {emp.employeeId || 'N/A'}</p>
                        <p className="text-[10px] text-emerald-400 mt-0.5">{emp.department || 'General Administration'}</p>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-2 space-y-1.5 text-[11px] text-white/60">
                      <div className="flex justify-between">
                        <span>Role:</span>
                        <span className="font-bold text-amber-400">{emp.employeeRole}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-bold text-white">{emp.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Username:</span>
                        <span>@{emp.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span className="text-white/40 truncate max-w-[150px]">{emp.email}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {employees.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-[#12121a]/20 rounded-2xl border border-white/5 text-white/30">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-bold text-white">No Employees Registered</p>
                    <p className="text-xs text-white/40 mt-1">Click "+ Add Employee" above to provision new RBAC admin keys.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- SUB-TAB: ROLES & PERMISSIONS ----------------- */}
      {subTab === 'roles_permissions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-white text-base">Roles & Access Permissions</h3>
              <p className="text-[11px] text-white/40">Audit standard predefined roles or create custom permission models.</p>
            </div>
            <button
              onClick={() => { setNewRolePerms([]); setShowAddRoleModal(true); }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Role</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Predefined */}
            <div className="bg-[#0d0d12]/90 border border-white/5 rounded-3xl p-6 space-y-4">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Predefined RBAC Profiles</span>
              </h4>
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {predefinedRoles.map(role => (
                  <div key={role.name} className="bg-[#12121a]/50 border border-white/5 p-4 rounded-2xl space-y-2.5">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-white">{role.name}</p>
                      <button
                        onClick={() => handleStartEditRole(role, true)}
                        className="text-[10px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        title="Edit Predefined Role (Edition)"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edition</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed">{role.description}</p>
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-wider font-extrabold text-white/30">Assigned Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map(p => (
                          <span key={p} className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/5">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Roles Created by Super Admin */}
            <div className="bg-[#0d0d12]/90 border border-white/5 rounded-3xl p-6 space-y-4">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Plus className="w-4 h-4 text-amber-500" />
                <span>Custom Administrative Roles</span>
              </h4>

              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {customRoles.map(role => (
                  <div key={role.name} className="bg-[#12121a]/50 border border-amber-500/10 p-4 rounded-2xl space-y-2.5 relative group">
                    <button
                      onClick={() => handleDeleteCustomRole(role.name)}
                      className="absolute top-4 right-16 p-1.5 text-rose-500 hover:text-rose-450 hover:bg-rose-500/10 rounded-xl transition"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-amber-400">{role.name}</p>
                      <button
                        onClick={() => handleStartEditRole(role, false)}
                        className="text-[10px] font-bold text-amber-500 hover:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        title="Edit Custom Role (Edition)"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edition</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed">{role.description || 'No description provided.'}</p>
                    
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase tracking-wider font-extrabold text-white/30">Selectable Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((p: string) => (
                          <span key={p} className="text-[9px] px-2 py-0.5 rounded bg-amber-500/5 text-amber-400 border border-amber-500/10 font-medium">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {customRoles.length === 0 && (
                  <div className="text-center py-12 bg-[#12121a]/20 rounded-2xl border border-white/5 text-white/30">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-xs font-medium">No custom roles created yet.</p>
                    <p className="text-[10px] text-white/40 mt-1">Super Admins can build custom role profiles with specialized permissions dynamically.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ADD ROLE MODAL */}
          {showAddRoleModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-[#0d0d12] border border-white/10 p-6 rounded-3xl w-full max-w-lg space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h4 className="font-extrabold text-white text-sm">
                    {editingRole
                      ? editingRole.isPredefined
                        ? `Edit Predefined Role: ${editingRole.name} (Edition)`
                        : `Edit Custom Role: ${editingRole.name} (Edition)`
                      : 'Create New Custom Role Profile'}
                  </h4>
                  <button onClick={() => { setShowAddRoleModal(false); setEditingRole(null); }} className="text-white/40 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateCustomRole} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-white/40 mb-1">Role Name *</label>
                    <input
                      type="text"
                      required
                      disabled={editingRole?.isPredefined}
                      placeholder="e.g. Legal Compliance Director"
                      value={newRoleName}
                      onChange={e => setNewRoleName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                    />
                    {editingRole?.isPredefined && (
                      <p className="text-[10px] text-amber-500/80 mt-1">Predefined role name cannot be renamed, but you can change descriptions and permissions below.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-white/40 mb-1">Description</label>
                    <textarea
                      placeholder="Detail role authority..."
                      value={newRoleDesc}
                      onChange={e => setNewRoleDesc(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#12121a] border border-white/5 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500 h-16"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-extrabold text-white/40 mb-1">Selectable Permissions ({newRolePerms.length})</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-white/5 p-3 rounded-2xl bg-black/30">
                      {ALL_AVAILABLE_PERMISSIONS.map(perm => {
                        const isChecked = newRolePerms.includes(perm);
                        return (
                          <button
                            type="button"
                            key={perm}
                            onClick={() => togglePermission(perm)}
                            className="flex items-center gap-2 text-left text-[10px] text-white/70 hover:text-white cursor-pointer"
                          >
                            {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <Square className="w-3.5 h-3.5 text-white/20 shrink-0" />}
                            <span>{perm}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowAddRoleModal(false); setEditingRole(null); }}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-2xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs rounded-2xl shadow-lg cursor-pointer"
                    >
                      {editingRole ? 'Save Changes (Apply Edition)' : 'Save Custom Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- SUB-TAB: LOGIN HISTORY ----------------- */}
      {subTab === 'login_history' && (
        <div className="bg-[#0d0d12]/90 border border-white/5 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-white text-base">Employee Login History Audit</h3>
            <p className="text-[11px] text-white/40">Track successful and blocked login sessions, devices, and remote IP addresses.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#12121a]/30">
            <table className="w-full text-left text-xs text-white/60">
              <thead className="bg-[#12121a]/95 text-[10px] uppercase font-bold text-white/40 tracking-wider border-b border-white/5">
                <tr>
                  <th className="px-4 py-3">Employee Name / Email</th>
                  <th className="px-4 py-3">Login Time</th>
                  <th className="px-4 py-3">Logout Time</th>
                  <th className="px-4 py-3">Device / Browser</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loginHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-white/30">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-xs">No logins recorded yet.</p>
                    </td>
                  </tr>
                ) : (
                  loginHistory.map(hist => (
                    <tr key={hist.id} className="hover:bg-white/[0.01]">
                      <td className="px-4 py-3">
                        <p className="font-bold text-white">{hist.fullName}</p>
                        <p className="text-[10px] text-white/30">{hist.email}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-white/80">
                        {hist.loginTime ? new Date(hist.loginTime).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-white/80">
                        {hist.logoutTime ? new Date(hist.logoutTime).toLocaleString() : <span className="text-amber-400 text-[10px]">Active Session</span>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white/80 text-[11px]">{hist.device}</p>
                        <p className="text-[9px] text-white/30 truncate max-w-[150px]" title={hist.browser}>{hist.browser}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-white/70">{hist.ip}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-extrabold ${
                          hist.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {hist.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: ACTIVITY LOGS ----------------- */}
      {subTab === 'activity_logs' && (
        <div className="bg-[#0d0d12]/90 border border-white/5 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-white text-base">Employee Activity Logs</h3>
            <p className="text-[11px] text-white/40">Audit every administrative edit, verification change, status adjustment, and login/logout.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#12121a]/30">
            <table className="w-full text-left text-xs text-white/60">
              <thead className="bg-[#12121a]/95 text-[10px] uppercase font-bold text-white/40 tracking-wider border-b border-white/5">
                <tr>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Action Details</th>
                  <th className="px-4 py-3">Affected Module</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-white/30">
                      <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-xs">No activity logs recorded yet.</p>
                    </td>
                  </tr>
                ) : (
                  activityLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.01]">
                      <td className="px-4 py-3 font-bold text-white">{log.fullName}</td>
                      <td className="px-4 py-3 text-white/90 text-xs">{log.action}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-amber-500/5 text-amber-500 border border-amber-500/10 text-[9px] uppercase font-bold">
                          {log.module}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-white/80">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-extrabold uppercase rounded border border-emerald-500/20">
                          {log.status || 'success'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: SETTINGS ----------------- */}
      {subTab === 'settings' && (
        <div className="bg-[#0d0d12]/90 border border-white/5 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base">Employee System Settings</h3>
              <p className="text-[11px] text-white/40">Configure baseline policies and security restrictions for all limited administrative employee credentials.</p>
            </div>
            <button
              onClick={handleSaveAccessPolicies}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow-lg shadow-amber-500/10 hover:opacity-90 transition cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save Access Policies</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-[#12121a]/50 p-5 rounded-2xl border border-white/5">
              <h4 className="text-xs font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/5">
                <Settings className="w-4 h-4 text-amber-500" />
                <span>Interactive Access Policies</span>
              </h4>
              
              <div className="space-y-4 text-xs">
                {/* Policy 1: Inactivity Timeout */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">Require Inactivity Timeout</p>
                      <p className="text-[10px] text-white/40">Logs out idle employee admins automatically.</p>
                    </div>
                  </div>
                  <select
                    value={accessPolicies.inactivityTimeout}
                    onChange={e => setAccessPolicies({ ...accessPolicies, inactivityTimeout: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d0d12] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 appearance-none"
                  >
                    <option value="5m">5 Minutes</option>
                    <option value="15m">15 Minutes</option>
                    <option value="30m">30 Minutes</option>
                    <option value="60m">60 Minutes</option>
                    <option value="disabled">Disabled (Not Recommended)</option>
                  </select>
                </div>

                {/* Policy 2: Audit Logging */}
                <div className="flex items-center justify-between py-2 border-t border-white/5">
                  <div className="max-w-[80%]">
                    <p className="font-bold text-white">Central Security Audit Logging</p>
                    <p className="text-[10px] text-white/40">Keeps detailed immutable records of all staff activities in the logs tab.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAccessPolicies({ ...accessPolicies, auditLogging: !accessPolicies.auditLogging })}
                    className="focus:outline-none cursor-pointer"
                  >
                    {accessPolicies.auditLogging ? (
                      <CheckSquare className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Square className="w-5 h-5 text-white/20" />
                    )}
                  </button>
                </div>

                {/* Policy 3: Block Password Reuse */}
                <div className="flex items-center justify-between py-2 border-t border-white/5">
                  <div className="max-w-[80%]">
                    <p className="font-bold text-white">Block Password Reuse</p>
                    <p className="text-[10px] text-white/40">Forces unique administrative passcodes upon updates.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAccessPolicies({ ...accessPolicies, blockPasswordReuse: !accessPolicies.blockPasswordReuse })}
                    className="focus:outline-none cursor-pointer"
                  >
                    {accessPolicies.blockPasswordReuse ? (
                      <CheckSquare className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Square className="w-5 h-5 text-white/20" />
                    )}
                  </button>
                </div>

                {/* Policy 4: Max Login Attempts */}
                <div className="space-y-1.5 border-t border-white/5 pt-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">Maximum Login Attempts</p>
                      <p className="text-[10px] text-white/40">Suspends administrative accounts temporarily after consecutive failures.</p>
                    </div>
                  </div>
                  <select
                    value={accessPolicies.maxLoginAttempts}
                    onChange={e => setAccessPolicies({ ...accessPolicies, maxLoginAttempts: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d0d12] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 appearance-none"
                  >
                    <option value="3">3 Attempts</option>
                    <option value="5">5 Attempts</option>
                    <option value="10">10 Attempts</option>
                    <option value="unlimited">Unlimited (Dangerous)</option>
                  </select>
                </div>

                {/* Policy 5: IP Access Whitelist */}
                <div className="space-y-1.5 border-t border-white/5 pt-2">
                  <div>
                    <p className="font-bold text-white">IP Access Whitelist</p>
                    <p className="text-[10px] text-white/40">Restrict employee logins to specific IP addresses (comma-separated).</p>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 192.168.1.1, 10.0.0.0/24 (leave blank for any IP)"
                    value={accessPolicies.ipWhitelist || ''}
                    onChange={e => setAccessPolicies({ ...accessPolicies, ipWhitelist: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d0d12] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 placeholder-white/20"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveAccessPolicies}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Apply Access Policies</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 bg-[#12121a]/50 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Super Admin Override Mode</span>
                </h4>
                <p className="text-[11px] text-white/50 leading-relaxed">
                  As the primary system owner, only you have authority to bypass access scopes, view every activity log, modify roles dynamically, and reset temporary passwords. Employee admins are blocked automatically from altering any critical platform parameters.
                </p>
                <div className="p-3.5 bg-[#0d0d12] border border-white/5 rounded-xl space-y-2 text-[10px] text-white/40">
                  <p className="font-bold text-amber-400/80">Active Configuration Summary:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Inactivity Timeout limit: <span className="text-white font-mono">{accessPolicies.inactivityTimeout}</span></li>
                    <li>Security log tracking: <span className="text-white font-mono">{accessPolicies.auditLogging ? 'ENABLED' : 'DISABLED'}</span></li>
                    <li>Password reuse blocks: <span className="text-white font-mono">{accessPolicies.blockPasswordReuse ? 'ACTIVE' : 'INACTIVE'}</span></li>
                    <li>Login lockout limit: <span className="text-white font-mono">{accessPolicies.maxLoginAttempts} tries</span></li>
                    <li>IP Whitelisting: <span className="text-white font-mono">{accessPolicies.ipWhitelist ? accessPolicies.ipWhitelist : 'No restrictions'}</span></li>
                  </ul>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <Info className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-[9px] text-emerald-400 font-bold uppercase leading-none">Security policies dynamically synchronized</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- INDIVIDUAL PROFILE DETAIL VIEW ----------------- */}
      {activeProfileEmployee && (
        <div className="bg-[#0d0d12]/95 border border-white/5 rounded-3xl p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <button
              onClick={() => setSelectedProfileEmployee(null)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/60 hover:text-white rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Directory</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider bg-amber-500/5 border border-amber-500/10 px-2.5 py-1 rounded-xl">
                Staff Profile Detail View
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Visual Profile Card */}
            <div className="lg:col-span-4 bg-[#12121a]/50 border border-white/5 rounded-3xl p-6 text-center space-y-4">
              <div className="relative inline-block mx-auto">
                <img
                  src={activeProfileEmployee.photoUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=100&h=100&q=80`}
                  alt={activeProfileEmployee.fullName}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-full mx-auto border-2 border-amber-500/40 object-cover shadow-xl"
                />
                <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#0d0d12] ${
                  activeProfileEmployee.status === 'active' ? 'bg-emerald-500' :
                  activeProfileEmployee.status === 'suspended' ? 'bg-rose-500' : 'bg-gray-500'
                }`} />
              </div>

              <div>
                <h4 className="font-extrabold text-white text-lg">{activeProfileEmployee.fullName}</h4>
                <p className="text-xs text-white/40">@{activeProfileEmployee.username || 'username'}</p>
                <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 text-[9px] uppercase font-bold tracking-wider">
                    {activeProfileEmployee.employeeRole}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[9px] uppercase font-bold tracking-wider">
                    {activeProfileEmployee.department || 'Operations'}
                  </span>
                </div>
              </div>

              {/* Immutable Baseline Metadata */}
              <div className="border-t border-white/5 pt-4 space-y-3 text-left text-xs text-white/70">
                <div className="flex justify-between py-1 border-b border-white/[0.02]">
                  <span className="text-white/40 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> ID:</span>
                  <span className="font-mono text-white font-bold">{activeProfileEmployee.employeeId || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.02]">
                  <span className="text-white/40 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email:</span>
                  <span className="text-white truncate max-w-[150px]" title={activeProfileEmployee.email}>{activeProfileEmployee.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.02]">
                  <span className="text-white/40 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone:</span>
                  <span className="text-white">{activeProfileEmployee.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.02]">
                  <span className="text-white/40 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Joined Date:</span>
                  <span className="text-white">{new Date(activeProfileEmployee.createdAt).toLocaleDateString()}</span>
                </div>
                {activeProfileEmployee.temporaryPassword && (
                  <div className="p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10 space-y-1 mt-2">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Key className="w-3.5 h-3.5" />
                      <span>Temporary Passcode</span>
                    </p>
                    <p className="font-mono text-xs text-white select-all bg-[#0d0d12] px-2 py-1 rounded border border-white/5">
                      {activeProfileEmployee.temporaryPassword}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Dynamic Administration Panel (Tabs & Form) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Form to update role/permissions/status directly */}
              <form onSubmit={handleUpdateProfileDetails} className="bg-[#12121a]/40 border border-white/5 rounded-3xl p-6 space-y-5">
                <h4 className="text-xs font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5 pb-2 border-b border-white/5">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Administrative Role Elevation & Profile Adjustments</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select employee role: increase / decrease role */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-white/50 uppercase tracking-wider">
                      Employee Assignment Role
                    </label>
                    <select
                      value={profileRole}
                      onChange={e => setProfileRole(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0d0d12] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <optgroup label="System Roles">
                        {predefinedRoles.map(r => (
                          <option key={r.name} value={r.name}>{r.name}</option>
                        ))}
                      </optgroup>
                      {customRoles.length > 0 && (
                        <optgroup label="Custom Configured Roles">
                          {customRoles.map(r => (
                            <option key={r.name} value={r.name}>{r.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <p className="text-[9px] text-white/30">
                      Selecting a role instantly inherits its configured security permissions.
                    </p>
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-white/50 uppercase tracking-wider">
                      Administrative Status
                    </label>
                    <select
                      value={profileStatus}
                      onChange={e => setProfileStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#0d0d12] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="active">Active (Access Granted)</option>
                      <option value="suspended">Suspended (Temporary Lockout)</option>
                      <option value="disabled">Disabled (Complete Revocation)</option>
                    </select>
                  </div>

                  {/* Department Update */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-extrabold text-white/50 uppercase tracking-wider">
                      Department / Office Branch
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Operations, Legal, Content, Support"
                      value={profileDept}
                      onChange={e => setProfileDept(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0d0d12] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 placeholder-white/20"
                    />
                  </div>

                  {/* Reset Password Button */}
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={() => handleResetPassword(activeProfileEmployee)}
                      className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Key className="w-4 h-4" />
                      <span>Issue New Temporary Passcode</span>
                    </button>
                  </div>
                </div>

                {/* Notes update */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-white/50 uppercase tracking-wider">
                    Internal System / HR Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter private review metrics, notes or restrictions about this admin..."
                    value={profileNotes}
                    onChange={e => setProfileNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d0d12] border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 placeholder-white/20 resize-none"
                  />
                </div>

                {/* Form Submit Button */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProfileEmployee(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileUpdating}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/10 hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {profileUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Save Role & Profile Settings</span>
                  </button>
                </div>
              </form>

              {/* View Inherited Permissions */}
              <div className="bg-[#12121a]/40 border border-white/5 rounded-3xl p-6 space-y-4">
                <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-amber-500" />
                  <span>Effective System Access Scope ({profileRole})</span>
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(getPermissionsForRole(profileRole) || []).map(perm => (
                    <span key={perm} className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#0d0d12]/80 text-amber-400/90 border border-amber-500/10">
                      {perm}
                    </span>
                  ))}
                  {(getPermissionsForRole(profileRole) || []).length === 0 && (
                    <p className="text-xs text-white/30">This role does not possess any explicit system permission scopes yet.</p>
                  )}
                </div>
              </div>

              {/* Activity Logs & Login audit for this employee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Specific Activity Logs */}
                <div className="bg-[#12121a]/40 border border-white/5 rounded-3xl p-6 space-y-4">
                  <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span>Administrative Action Audit</span>
                  </h4>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {activityLogs
                      .filter(log => (log.fullName || '').toLowerCase() === (activeProfileEmployee.fullName || '').toLowerCase() || (log.fullName || '').toLowerCase() === (activeProfileEmployee.username || '').toLowerCase())
                      .map(log => (
                        <div key={log.id} className="text-[11px] border-b border-white/5 pb-2.5 space-y-1">
                          <p className="text-white/90 leading-tight">{log.action}</p>
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-white/30">{new Date(log.timestamp).toLocaleString()}</span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/5 text-amber-400 border border-amber-500/10 font-bold uppercase shrink-0">
                              {log.module}
                            </span>
                          </div>
                        </div>
                      ))}

                    {activityLogs.filter(log => (log.fullName || '').toLowerCase() === (activeProfileEmployee.fullName || '').toLowerCase() || (log.fullName || '').toLowerCase() === (activeProfileEmployee.username || '').toLowerCase()).length === 0 && (
                      <div className="py-8 text-center text-white/30 text-xs">
                        No recent action audits found.
                      </div>
                    )}
                  </div>
                </div>

                {/* Specific Login History & Sessions */}
                <div className="bg-[#12121a]/40 border border-white/5 rounded-3xl p-6 space-y-4">
                  <h4 className="font-extrabold text-white text-xs uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Login Sessions ({loginHistory.filter(h => (h.email || '').toLowerCase() === (activeProfileEmployee.email || '').toLowerCase()).length})</span>
                  </h4>
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {loginHistory
                      .filter(h => (h.email || '').toLowerCase() === (activeProfileEmployee.email || '').toLowerCase())
                      .map((h, i) => (
                        <div key={i} className="text-[11px] border-b border-white/5 pb-2.5 space-y-1">
                          <div className="flex justify-between items-center text-white/90">
                            <span className="font-bold flex items-center gap-1 text-emerald-400">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              <span>Login</span>
                            </span>
                            <span className="font-mono text-[10px] text-white/70">{new Date(h.loginTime).toLocaleString()}</span>
                          </div>
                          {h.logoutTime ? (
                            <div className="flex justify-between items-center text-white/40">
                              <span>Logout</span>
                              <span className="font-mono text-[9px]">{new Date(h.logoutTime).toLocaleString()}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center text-amber-400">
                              <span>Active Session</span>
                              <span className="text-[9px] font-bold uppercase tracking-wider">Online Now</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[9px] text-white/30 pt-0.5 font-mono">
                            <span>IP: {h.ipAddress || '127.0.0.1'}</span>
                            <span>{h.device || 'Admin Client'}</span>
                          </div>
                        </div>
                      ))}

                    {loginHistory.filter(h => (h.email || '').toLowerCase() === (activeProfileEmployee.email || '').toLowerCase()).length === 0 && (
                      <div className="py-8 text-center text-white/30 text-xs">
                        No login sessions recorded.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
