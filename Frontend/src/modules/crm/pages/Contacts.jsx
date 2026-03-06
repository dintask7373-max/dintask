import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Plus, UserPlus, Phone, Mail, Building, History, Search } from 'lucide-react';
import useCRMStore from '@/store/crmStore';
import { cn } from '@/shared/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const Contacts = () => {
  const {
    leads,
  } = useCRMStore();

  // Mock contacts data
  const [contacts, setContacts] = useState([
    {
      id: 'CONTACT-001',
      name: 'John Doe',
      mobile: '+1234567890',
      email: 'john.doe@example.com',
      company: 'ABC Corp',
      position: 'CEO',
      convertedFrom: 'LEAD-001',
      convertedAt: new Date().toISOString(),
      owner: 'EMP-001',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOwner, setFilterOwner] = useState('all');
  const [open, setOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    company: '',
    position: '',
    notes: '',
  });

  // Contact history (mock data)
  const contactHistory = [
    {
      id: 'HIST-001',
      contactId: 'CONTACT-001',
      type: 'Call',
      description: 'Discussed project requirements',
      date: new Date().toISOString(),
      createdBy: 'EMP-001',
    },
    {
      id: 'HIST-002',
      contactId: 'CONTACT-001',
      type: 'Email',
      description: 'Sent project proposal',
      date: new Date().toISOString(),
      createdBy: 'EMP-001',
    },
  ];

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.mobile.includes(searchTerm);
      const matchesOwner = filterOwner === 'all' || contact.owner === filterOwner;
      return matchesSearch && matchesOwner;
    });
  }, [contacts, searchTerm, filterOwner]);

  const handleConvertLead = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      mobile: lead.mobile,
      email: lead.email,
      company: lead.company,
      position: '',
      notes: '',
    });
    setOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedLead) {
      const newContact = {
        id: `CONTACT-${Math.floor(1000 + Math.random() * 9000)}`,
        ...formData,
        convertedFrom: selectedLead.id,
        convertedAt: new Date().toISOString(),
        owner: selectedLead.owner,
      };
      setContacts([...contacts, newContact]);
      setOpen(false);
      setSelectedLead(null);
      // In a real implementation, we would update the lead status to 'Converted'
      console.log('Lead converted to contact:', newContact);
    }
  };

  const getContactHistory = (contactId) => {
    return contactHistory.filter(entry => entry.contactId === contactId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <div className="lg:hidden size-9 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
            <img src="/dintask-logo.png" alt="DinTask" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
              Contact <span className="text-primary-600">Assets</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest italic mt-1 leading-none">
              Network synchronization active
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-9 px-4 sm:px-6 shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest w-full sm:w-auto">
              <UserPlus className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Convert Lead</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Convert Lead to Contact</DialogTitle>
              <DialogDescription>
                Convert selected lead to a contact
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional information"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Convert to Contact
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Network Size', value: contacts.length, color: 'primary' },
          { label: 'Converted Core', value: contacts.length, color: 'emerald' },
          { label: 'Active Leads', value: leads.length, color: 'indigo' }
        ].map((stat, i) => (
          <Card key={i} className={cn(
            "border-2 shadow-xl bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-800/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1",
            stat.color === 'primary' ? 'border-primary-100 shadow-primary-200/50' :
              stat.color === 'emerald' ? 'border-emerald-100 shadow-emerald-200/50' :
                'border-indigo-100 shadow-indigo-200/50'
          )}>
            <CardContent className="p-3 sm:p-4">
              <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
              <p className={cn("text-lg sm:text-xl font-black leading-none",
                stat.color === 'primary' ? 'text-primary-600' : stat.color === 'emerald' ? 'text-emerald-600' : 'text-indigo-600'
              )}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Available Leads for Conversion - Tactical View */}
        <Card className="lg:col-span-5 border-2 border-indigo-100 shadow-xl shadow-indigo-100/30 bg-gradient-to-br from-white to-indigo-50/20 dark:from-slate-900 dark:to-indigo-900/10 rounded-3xl overflow-hidden h-fit">
          <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Conversion Queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {leads.map((lead, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={lead.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center text-[10px] font-black uppercase">
                      {lead.name.charAt(0)}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[12px] font-black text-slate-900 dark:text-white uppercase leading-tight tracking-tight">{lead.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">{lead.company}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleConvertLead(lead)}
                    className="h-8 px-4 rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-black text-[9px] uppercase tracking-[0.15em] border border-primary-100 dark:border-primary-900/30"
                  >
                    Deploy
                  </Button>
                </motion.div>
              ))}
              {leads.length === 0 && (
                <div className="p-10 text-center">
                  <div className="size-12 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserPlus size={18} className="text-slate-200 dark:text-slate-700" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repository Cleared</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contacts List - High Density */}
        <Card className="lg:col-span-7 border-2 border-primary-100 shadow-2xl shadow-primary-200/30 bg-gradient-to-br from-white to-primary-50/20 dark:from-slate-900 dark:to-primary-900/10 rounded-3xl overflow-hidden">
          <CardHeader className="py-4 px-6 border-b border-slate-50 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contact Repository</CardTitle>
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest rounded-lg h-6">Live Link</Badge>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search network assets..."
                  className="pl-11 h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black text-[10px] uppercase tracking-widest focus-visible:ring-1 focus-visible:ring-primary-500 shadow-inner shadow-slate-200/20 dark:shadow-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Desktop View */}
            <div className="overflow-x-auto hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-50 dark:border-slate-800">
                    <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Contact Node</TableHead>
                    <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Origin/Org</TableHead>
                    <TableHead className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id} className="group border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                              {contact.name.charAt(0)}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight">{contact.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 tracking-tight">{contact.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{contact.company}</p>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Level: {contact.position || 'N/A'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-primary-600 rounded-xl bg-slate-50/50 dark:bg-slate-800/30"
                            onClick={() => console.log('History:', getContactHistory(contact.id))}
                          >
                            <History size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {/* Mobile View */}
            <div className="sm:hidden space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredContacts.map((contact) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={contact.id}
                    className="p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[12px] font-black text-primary-600">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase leading-none tracking-tighter">{contact.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{contact.company}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 text-slate-400 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                      >
                        <History size={14} />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 px-1">
                      <div className="flex items-center gap-1.5">
                        <Phone size={10} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 tracking-tight">{contact.mobile}</span>
                      </div>
                      <div className="flex items-center gap-1.5 max-w-[150px]">
                        <Mail size={10} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 tracking-tight truncate">{contact.email}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredContacts.length === 0 && (
              <div className="text-center py-16">
                <div className="size-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <Search size={22} className="text-slate-200 dark:text-slate-700" />
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Isolated Repository</p>
                <p className="text-[9px] font-black text-slate-300 uppercase mt-1">Search vector mismatch</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contacts;
