import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Users, Clock, ChevronDown, ChevronUp, User, Mail, Upload, X, DollarSign, Video } from 'lucide-react';
import { getUpcomingWorkshops, getOngoingWorkshops, getCompletedWorkshops, addWorkshop } from '../data/workshopsData';
import type { Workshop, WorkshopMember } from '../data/workshopsData';
import clsx from 'clsx';

export function WorkshopsPage() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'completed'>('upcoming');
  const [expandedWorkshop, setExpandedWorkshop] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const upcomingWorkshops = getUpcomingWorkshops();
  const ongoingWorkshops = getOngoingWorkshops();
  const completedWorkshops = getCompletedWorkshops();

  const currentWorkshops = 
    activeTab === 'upcoming' ? upcomingWorkshops :
    activeTab === 'ongoing' ? ongoingWorkshops :
    completedWorkshops;

  const toggleExpanded = (id: string) => {
    setExpandedWorkshop(expandedWorkshop === id ? null : id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-header font-bold text-text-primary bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">Workshops</h1>
          <p className="text-text-secondary mt-2 font-medium">Manage and track workshop registrations</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all shadow-md font-semibold"
        >
          <Plus size={20} />
          <span>Create Workshop</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl border border-blue-100 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">Total Workshops</p>
              <motion.p 
                className="text-4xl font-bold text-text-primary mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
              >
                {upcomingWorkshops.length + ongoingWorkshops.length + completedWorkshops.length}
              </motion.p>
            </div>
            <motion.div 
              className="w-14 h-14 bg-gradient-to-br from-primary to-primary-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Calendar className="text-white" size={28} strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-gradient-to-br from-white to-amber-50 p-6 rounded-2xl border border-amber-100 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">Ongoing Workshops</p>
              <motion.p 
                className="text-4xl font-bold text-text-primary mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                {ongoingWorkshops.length}
              </motion.p>
            </div>
            <motion.div 
              className="w-14 h-14 bg-gradient-to-br from-warning to-amber-500 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Clock className="text-white" size={28} strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-gradient-to-br from-white to-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-xs font-semibold uppercase tracking-wide">Total Enrollments</p>
              <motion.p 
                className="text-4xl font-bold text-text-primary mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
              >
                {currentWorkshops.reduce((acc, w) => acc + w.enrolledCount, 0)}
              </motion.p>
            </div>
            <motion.div 
              className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Users className="text-white" size={28} strokeWidth={2.5} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-border bg-surface/50 rounded-t-xl p-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('upcoming')}
          className={clsx(
            'px-5 py-3 font-semibold transition-all relative rounded-lg',
            activeTab === 'upcoming'
              ? 'text-white bg-gradient-to-r from-primary to-primary-600 shadow-lg'
              : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
          )}
        >
          Upcoming ({upcomingWorkshops.length})
          {activeTab === 'upcoming' && (
            <motion.div
              layoutId="activeWorkshopTab"
              className="absolute inset-0 bg-gradient-to-r from-primary to-primary-600 rounded-lg -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('ongoing')}
          className={clsx(
            'px-5 py-3 font-semibold transition-all relative rounded-lg',
            activeTab === 'ongoing'
              ? 'text-white bg-gradient-to-r from-primary to-primary-600 shadow-lg'
              : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
          )}
        >
          Ongoing ({ongoingWorkshops.length})
          {activeTab === 'ongoing' && (
            <motion.div
              layoutId="activeWorkshopTab"
              className="absolute inset-0 bg-gradient-to-r from-primary to-primary-600 rounded-lg -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('completed')}
          className={clsx(
            'px-5 py-3 font-semibold transition-all relative rounded-lg',
            activeTab === 'completed'
              ? 'text-white bg-gradient-to-r from-primary to-primary-600 shadow-lg'
              : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
          )}
        >
          Completed ({completedWorkshops.length})
          {activeTab === 'completed' && (
            <motion.div
              layoutId="activeWorkshopTab"
              className="absolute inset-0 bg-gradient-to-r from-primary to-primary-600 rounded-lg -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </motion.button>
      </div>

      {/* Workshops List */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {currentWorkshops.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 bg-surface rounded-xl border border-border"
            >
              <Calendar className="mx-auto text-text-tertiary mb-4" size={48} />
              <p className="text-text-secondary">No {activeTab} workshops found</p>
            </motion.div>
          ) : (
            currentWorkshops.map((workshop, index) => (
              <WorkshopCard
                key={workshop.id}
                workshop={workshop}
                index={index}
                isExpanded={expandedWorkshop === workshop.id}
                onToggle={() => toggleExpanded(workshop.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Workshop Modal */}
      <AddWorkshopModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

interface WorkshopCardProps {
  workshop: Workshop;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

function WorkshopCard({ workshop, index, isExpanded, onToggle }: WorkshopCardProps) {
  const enrollmentPercentage = (workshop.enrolledCount / workshop.totalSeats) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
    >
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Workshop Image */}
          <div className="lg:w-64 h-48 lg:h-auto rounded-lg overflow-hidden shrink-0">
            <img
              src={workshop.image}
              alt={workshop.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Workshop Details */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-xl font-bold text-text-primary">{workshop.title}</h3>
                <div className="flex gap-2 shrink-0">
                  {workshop.isFree ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success-light text-success">
                      Free
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary">
                      ${workshop.price}
                    </span>
                  )}
                  <span className={clsx(
                    'px-3 py-1 rounded-full text-xs font-semibold',
                    workshop.status === 'upcoming' ? 'bg-blue-100 text-blue-600' :
                    workshop.status === 'ongoing' ? 'bg-warning-light text-warning' :
                    'bg-gray-100 text-gray-600'
                  )}>
                    {workshop.status.charAt(0).toUpperCase() + workshop.status.slice(1)}
                  </span>
                </div>
              </div>
              <p className="text-text-secondary line-clamp-2">{workshop.description}</p>
            </div>

            {/* Workshop Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-text-tertiary" />
                <div>
                  <p className="text-text-tertiary text-xs">Start Date</p>
                  <p className="text-text-primary font-medium">
                    {new Date(workshop.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-text-tertiary" />
                <div>
                  <p className="text-text-tertiary text-xs">Duration</p>
                  <p className="text-text-primary font-medium">{workshop.duration}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User size={16} className="text-text-tertiary" />
                <div>
                  <p className="text-text-tertiary text-xs">Instructor</p>
                  <p className="text-text-primary font-medium">{workshop.instructor}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Video size={16} className="text-text-tertiary" />
                <div>
                  <p className="text-text-tertiary text-xs">Platform</p>
                  <p className="text-text-primary font-medium">{workshop.platform}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-text-tertiary" />
                <div>
                  <p className="text-text-tertiary text-xs">Enrollment</p>
                  <p className="text-text-primary font-medium">
                    {workshop.enrolledCount} / {workshop.totalSeats}
                  </p>
                </div>
              </div>
            </div>

            {/* Enrollment Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Enrollment Progress</span>
                <span className="text-text-primary font-medium">{enrollmentPercentage.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${enrollmentPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={clsx(
                    'h-full rounded-full',
                    enrollmentPercentage >= 90 ? 'bg-error' :
                    enrollmentPercentage >= 70 ? 'bg-warning' :
                    'bg-success'
                  )}
                />
              </div>
            </div>

            {/* View Members Button */}
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggle}
              className="flex items-center gap-2 text-primary hover:text-primary-600 transition-all font-semibold text-sm px-4 py-2 rounded-lg hover:bg-primary/10"
            >
              <span>
                {isExpanded ? 'Hide' : 'View'} Registered Members ({workshop.members.length})
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Expanded Members List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6 border-t border-border overflow-hidden"
            >
              <h4 className="font-semibold text-text-primary mb-4">Registered Members</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workshop.members.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
              
              {/* Guest Speakers */}
              {workshop.guests && workshop.guests.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-semibold text-text-primary mb-3">Guest Speakers</h4>
                  <div className="flex flex-wrap gap-2">
                    {workshop.guests.map((guest, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-primary-light text-primary rounded-lg text-sm font-medium">
                        {guest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface MemberCardProps {
  member: WorkshopMember;
}

function MemberCard({ member }: MemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, y: -2 }}
      className="bg-gradient-to-br from-background-secondary to-white p-4 rounded-xl border-2 border-transparent hover:border-primary transition-all shadow-sm hover:shadow-lg"
    >
      <div className="flex items-center gap-3">
        <motion.div 
          className="w-12 h-12 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md"
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {member.name.charAt(0).toUpperCase()}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary truncate">{member.name}</p>
          <div className="flex items-center gap-1 text-xs text-text-tertiary mt-0.5">
            <Mail size={12} />
            <span className="truncate">{member.email}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-text-tertiary font-medium">
          Registered: {new Date(member.registeredAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>
    </motion.div>
  );
}

// Add Workshop Modal Component
interface AddWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddWorkshopModal({ isOpen, onClose }: AddWorkshopModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    startDate: '',
    endDate: '',
    instructor: '',
    category: '',
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed',
    totalSeats: 30,
    platform: 'Zoom',
    isFree: true,
    price: 0,
    guests: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const guestsArray = formData.guests
      .split(',')
      .map(g => g.trim())
      .filter(g => g.length > 0);

    const newWorkshop: Workshop = {
      id: `ws-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      image: formData.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration: calculateDuration(formData.startDate, formData.endDate),
      instructor: formData.instructor,
      category: formData.category,
      status: formData.status,
      totalSeats: formData.totalSeats,
      enrolledCount: 0,
      members: [],
      isFree: formData.isFree,
      price: formData.isFree ? undefined : formData.price,
      platform: formData.platform,
      guests: guestsArray.length > 0 ? guestsArray : undefined,
    };

    addWorkshop(newWorkshop);
    onClose();
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      image: '',
      startDate: '',
      endDate: '',
      instructor: '',
      category: '',
      status: 'upcoming',
      totalSeats: 30,
      platform: 'Zoom',
      isFree: true,
      price: 0,
      guests: '',
    });
    setImagePreview('');
    
    // Reload page to show new workshop
    window.location.reload();
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-surface rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-surface border-b border-border p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-text-primary">Create New Workshop</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Workshop Image
              </label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({ ...formData, image: '' });
                      }}
                      className="absolute top-2 right-2 bg-error text-white p-2 rounded-full hover:bg-error-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto text-text-tertiary mb-2" size={32} />
                    <p className="text-text-secondary mb-2">Click to upload or drag and drop</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary-600"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Workshop Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Advanced React Patterns"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your workshop..."
              />
            </div>

            {/* Row 1: Instructor, Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Instructor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Sarah Johnson"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Frontend Development"
                />
              </div>
            </div>

            {/* Row 2: Start Date, End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Row 3: Platform, Status, Total Seats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Platform *
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Zoom">Zoom</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="Discord">Discord</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Total Seats *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Pricing */}
            <div>
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.isFree}
                    onChange={() => setFormData({ ...formData, isFree: true, price: 0 })}
                    className="text-primary"
                  />
                  <span className="text-sm font-medium text-text-primary">Free Workshop</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.isFree}
                    onChange={() => setFormData({ ...formData, isFree: false })}
                    className="text-primary"
                  />
                  <span className="text-sm font-medium text-text-primary">Paid Workshop</span>
                </label>
              </div>
              {!formData.isFree && (
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-text-tertiary" />
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter price"
                  />
                </div>
              )}
            </div>

            {/* Guest Speakers */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Guest Speakers (comma-separated)
              </label>
              <input
                type="text"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., John Smith - React Expert, Jane Doe - Frontend Developer"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-text-primary hover:bg-background-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                Create Workshop
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
