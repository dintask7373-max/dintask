import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  ShieldCheck,
  Mail,
  Phone,
  Trash2,
  Edit2,
  Lock,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from '@/shared/components/ui/label';

import useSuperAdminStore from '@/store/superAdminStore';
import useAuthStore from '@/store/authStore';
import { cn } from '@/shared/utils/cn';
import { fadeInUp, staggerContainer, scaleOnTap } from '@/shared/utils/animations';
import { useNavigate } from 'react-router-dom';

const StaffManagement = () => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const {
    staffMembers,
    fetchStaff,
    staffPagination,
    addStaff,
    updateStaff,
    deleteStaff,
    loading
  } = useSuperAdminStore();

  const isEligible = role === 'superadmin' || role === 'superadmin_staff';

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (!isEligible) {
      toast.error("Unauthorized access");
      navigate('/superadmin');
      return;
    }
  }, [isEligible, navigate]);

  // Debounced search and pagination effect
  useEffect(() => {
    if (!isEligible) return;

    const handler = setTimeout(() => {
      fetchStaff({
        page: currentPage,
        limit: pageSize,
        search: searchQuery.trim()
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [isEligible, fetchStaff, currentPage, pageSize, searchQuery]);

  // Reset to page 1 when search or limit changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();

    // Client-side validation
    const { name, email, password } = formData;
    if (!name.trim()) return toast.error("Name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!password) return toast.error("Password is required");

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) return toast.error("Invalid email format");

    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    const success = await addStaff(formData);
    if (success) {
      toast.success("Staff member added successfully");
      setIsAddDialogOpen(false);
      setFormData({ name: '', email: '', password: '', phoneNumber: '' });
    } else {
      toast.error("Failed to add staff member");
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();

    // Client-side validation
    const { name, email, password } = formData;
    if (!name.trim()) return toast.error("Name cannot be empty");
    if (!email.trim()) return toast.error("Email cannot be empty");

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) return toast.error("Invalid email format");

    if (password && password.length < 6) return toast.error("Password must be at least 6 characters");

    const success = await updateStaff(selectedStaff._id, formData);
    if (success) {
      toast.success("Staff details updated");
      setIsEditDialogOpen(false);
      setSelectedStaff(null);
      setFormData({ name: '', email: '', password: '', phoneNumber: '' });
    } else {
      toast.error("Failed to update staff member");
    }
  };

  const handleDeleteStaff = async (id) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      const success = await deleteStaff(id);
      if (success) {
        toast.success("Staff member removed");
      } else {
        toast.error("Failed to remove staff member");
      }
    }
  };

  const openEditDialog = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      password: '', // Don't show password
      phoneNumber: staff.phoneNumber || ''
    });
    setIsEditDialogOpen(true);
  };

  // Filtered logic is now handled server-side
  const displayStaff = staffMembers || [];

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="space-y-6 pb-8 px-1 md:px-0"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            Staff Management <Badge className="bg-primary-50 text-primary-600 border-primary-100 uppercase text-[10px] font-black h-5">{role === 'superadmin_staff' ? 'Staff' : 'System Root'}</Badge>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Manage SuperAdmin employees and system access roles.</p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl md:rounded-2xl shadow-lg shadow-primary-900/20 px-6 h-12 flex items-center gap-2"
        >
          <Plus size={18} />
          Add Staff Member
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-100 shadow-lg shadow-blue-200/40 bg-white dark:bg-slate-900 rounded-[2rem] transition-all hover:-translate-y-1">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-900/10">
              <Users className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Staff</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">{staffPagination?.total || 0}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-emerald-100 shadow-lg shadow-emerald-200/40 bg-white dark:bg-slate-900 rounded-[2rem] transition-all hover:-translate-y-1">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10">
              <ShieldCheck className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">System Security</p>
              <h3 className="text-2xl font-black text-emerald-600 uppercase italic tracking-tighter">Active</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-amber-100 shadow-lg shadow-amber-200/40 bg-white dark:bg-slate-900 rounded-[2rem] transition-all hover:-translate-y-1">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/10">
              <Lock className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Access Protocol</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">RBAC 2.0</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Section */}
      <Card className="border-2 border-slate-100 shadow-xl shadow-slate-200/30 bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
        <CardHeader className="p-6 border-b border-slate-50 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-sm font-black uppercase tracking-widest italic opacity-70">Staff Registry</CardTitle>
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 py-1 border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                {staffPagination?.total || 0} Members
              </Badge>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Show</span>
                <Select value={pageSize.toString()} onValueChange={(val) => setPageSize(parseInt(val))}>
                  <SelectTrigger className="w-[80px] h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    {[5, 10, 20, 50].map(size => (
                      <SelectItem key={size} value={size.toString()} className="text-xs font-bold rounded-xl">{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800">
                <TableHead className="pl-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Staff Member</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Roles & Access</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-xs font-bold text-slate-400">Loading staff data...</TableCell>
                </TableRow>
              ) : displayStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 py-12">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full">
                        <Users size={48} className="text-slate-300 dark:text-slate-700" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                          {searchQuery ? `No matches for "${searchQuery}"` : "No staff found"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose max-w-[200px] mx-auto">
                          {searchQuery
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "Your staff registry is currently empty."}
                        </p>
                      </div>
                      {searchQuery && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                          className="rounded-xl border-slate-200 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest h-9"
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                displayStaff.map((staff) => (
                  <TableRow key={staff._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-slate-50 dark:border-slate-800">
                    <TableCell className="pl-8 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-900 shadow-sm">
                          <AvatarImage src={staff.profileImage} />
                          <AvatarFallback className="bg-primary-100 text-primary-600 font-black text-xs uppercase">{staff.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{staff.name}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined {format(new Date(staff.createdAt), 'MMM yyyy')}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck size={12} className="text-primary-600" />
                          <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter italic">Restricted Access</span>
                        </div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No Revenue Access</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <Mail size={12} className="opacity-50" /> {staff.email}
                        </div>
                        {staff.phoneNumber && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                            <Phone size={10} className="opacity-50" /> {staff.phoneNumber}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-none border-none">
                            <MoreVertical size={16} className="text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-none shadow-xl">
                          <DropdownMenuItem
                            onClick={() => openEditDialog(staff)}
                            className="rounded-xl flex items-center gap-2 py-2 cursor-pointer font-bold text-xs"
                          >
                            <Edit2 size={14} className="text-blue-500" /> Edit Staff
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteStaff(staff._id)}
                            className="rounded-xl flex items-center gap-2 py-2 cursor-pointer font-bold text-xs text-red-500"
                          >
                            <Trash2 size={14} /> Remove Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination UI - Matched with Inquiries.jsx */}
      {staffPagination.total > 0 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="rounded-xl border-slate-200 dark:border-slate-800"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {[...Array(staffPagination?.pages || 0)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  "w-9 h-9 p-0 rounded-xl",
                  currentPage === i + 1 ? "" : "border-slate-200 dark:border-slate-800"
                )}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === staffPagination?.pages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="rounded-xl border-slate-200 dark:border-slate-800"
          >
            Next
          </Button>
        </div>
      )}
      {/* Modals */}
      <AnimatePresence>
        {(isAddDialogOpen || isEditDialogOpen) && (
          <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
              setFormData({ name: '', email: '', password: '', phoneNumber: '' });
            }
          }}>
            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[2rem] p-0 overflow-hidden bg-white dark:bg-slate-900">
              <div className="p-6 md:p-8 space-y-6">
                <DialogHeader>
                  <div className="h-14 w-14 rounded-2xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center mb-4">
                    <Users className="text-primary-600" size={28} />
                  </div>
                  <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isAddDialogOpen ? 'Register New Staff' : 'Modify Staff Details'}
                  </DialogTitle>
                  <DialogDescription className="text-sm font-medium text-slate-500">
                    Provide employee information and system credentials below.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={isAddDialogOpen ? handleAddStaff : handleEditStaff} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. John Smith"
                        required
                        className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold px-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</Label>
                      <Input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold px-4"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">System Email</Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="staff@dintask.com"
                      required
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold px-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      {isAddDialogOpen ? 'Access Password' : 'Reset Password (optional)'}
                    </Label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        required={isAddDialogOpen}
                        className="h-12 pl-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setIsEditDialogOpen(false);
                      }}
                      variant="ghost"
                      className="flex-1 font-black uppercase text-[10px] tracking-widest h-12 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white font-black uppercase text-[10px] tracking-widest h-12 rounded-xl shadow-lg shadow-primary-900/20"
                    >
                      {isAddDialogOpen ? 'Create Staff Profile' : 'Apply Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StaffManagement;
