// frontend/src/components/admin/AddEditUserModal.jsx

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../ui/Input";
import Button from "../ui/Button";
import Select from "../ui/Select";
import Spinner from "../ui/Spinner";
import adminService from "../../api/adminService";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";
import { User, Shield, GraduationCap, Mail, Phone, MapPin, Calendar, Hash, BookOpen, Fingerprint, Camera, X, Eye, EyeOff } from "lucide-react";

// ---------- ZOD VALIDATION ----------
const userFormSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be 6+ chars").optional().or(z.literal("")),
  role: z.enum(["student", "teacher"]),
  uniqueId: z.string().min(1, "ID is required"),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  classId: z.string().optional().or(z.literal("")),
  rollNumber: z.string().optional().or(z.literal("")),
  assignedClasses: z.array(z.string()).optional(),
  fatherName: z.string().optional().or(z.literal("")),
  motherName: z.string().optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  prevSchool: z.string().optional().or(z.literal("")),
  gender: z.enum(["Male", "Female", "Other"]).optional().or(z.literal("")),
  religion: z.string().optional().or(z.literal("")),
  category: z.string().optional().or(z.literal("")),
  aadharNumber: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
  qualification: z.string().optional().or(z.literal("")),
  experience: z.string().optional().or(z.literal("")),
  baseSalary: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  personalEmail: z.string().optional().or(z.literal("")),
  secondaryPhone: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  twitter: z.string().optional().or(z.literal("")),
});

const AddEditUserModal = ({
  onClose,
  onUserAddedOrUpdated,
  user,
  role,
  predefinedClassId,
}) => {
  const { token } = useAuthStore();
  const isEditing = !!(user && user._id); // Use _id to confirm we're updating an existing database record

  const [classes, setClasses] = useState([]);
  const [idSequence, setIdSequence] = useState(user?.uniqueId ? user.uniqueId.replace(/^(STU|TEC|ADM)/, "") : "");
  const [imagePreview, setImagePreview] = useState(user?.profileImage ? `http://localhost:5005/${user.profileImage}` : null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      role: user?.role || role,
      uniqueId: user?.uniqueId || "",
      phone: user?.phone || "",
      address: user?.address || "",
      classId: predefinedClassId || (user?.classId?._id || user?.classId || "").toString(),
      rollNumber: user?.rollNumber || "",
      assignedClasses: user?.assignedClasses?.map((cls) => (cls._id || cls).toString()) || [],
      fatherName: user?.fatherName || "",
      motherName: user?.motherName || "",
      dob: user?.dob || "",
      prevSchool: user?.prevSchool || "",
      gender: user?.gender || "",
      religion: user?.religion || "",
      category: user?.category || "",
      aadharNumber: user?.aadharNumber || "",
      emergencyContact: user?.emergencyContact || "",
      qualification: user?.qualification || "",
      experience: user?.experience || "",
      baseSalary: user?.baseSalary || "",
      bio: user?.bio || "",
      personalEmail: user?.personalEmail || "",
      secondaryPhone: user?.secondaryPhone || "",
      instagram: user?.socialLinks?.instagram || "",
      facebook: user?.socialLinks?.facebook || "",
      twitter: user?.socialLinks?.twitter || "",
    },
  });

  const currentRole = watch("role");
  const rolePrefix = currentRole === 'student' ? 'STU' : 'TEC';
  const fullUniqueId = idSequence.trim() !== "" ? `${rolePrefix}${idSequence.padStart(4, '0')}` : "";

  useEffect(() => {
    if (!isEditing) {
      setValue("uniqueId", fullUniqueId);
      if (fullUniqueId) trigger("uniqueId");
    } else {
      setValue("uniqueId", user.uniqueId);
    }
  }, [fullUniqueId, isEditing, setValue, user?.uniqueId, trigger]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await adminService.getClasses(token);
        setClasses(res || []);
      } catch (error) {
        toast.error("Failed to sync classes.");
      }
    };
    if (token) fetchClasses();
  }, [token]);

  // Sync class selection once classes and user data are ready
  useEffect(() => {
    if (classes.length > 0 && isEditing && currentRole === 'student') {
      const targetId = predefinedClassId || (user?.classId?._id || user?.classId || "").toString();
      if (targetId) {
        setValue("classId", targetId);
      }
    }
  }, [classes, isEditing, currentRole, predefinedClassId, user, setValue]);

  const onError = (errors) => {
    console.error("Form Validation Errors:", errors);
    if (!isEditing && idSequence.trim() === "") {
        toast.error("Institutional Sequence ID is required.");
        return;
    }
    const firstError = Object.values(errors)[0];
    if (firstError) {
      toast.error(`Validation Error: ${firstError.message}`);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Sanitize academic placements
      const sanitizedData = {
        ...data,
        uniqueId: idSequence.trim() !== "" ? fullUniqueId : (isEditing ? user.uniqueId : data.uniqueId),
        classId: data.classId && data.classId.trim() !== "" ? data.classId : undefined,
        admissionId: user?.admissionId || undefined,
        baseSalary: data.baseSalary ? Number(data.baseSalary) : 0,
        assignedClasses: data.assignedClasses && data.assignedClasses.length > 0
          ? data.assignedClasses.filter(c => c && c.trim() !== "")
          : []
      };

      // Wrap social links if present
      const finalSocialLinks = {
        instagram: data.instagram,
        facebook: data.facebook,
        twitter: data.twitter
      };

      const finalPayload = {
        ...sanitizedData,
        socialLinks: JSON.stringify(finalSocialLinks)
      };

      // Remove password if not provided (especially when editing)
      if (!finalPayload.password || finalPayload.password.trim() === "") {
        delete finalPayload.password;
      }

      const socialLinksData = {
        instagram: data.instagram || "",
        facebook: data.facebook || "",
        twitter: data.twitter || ""
      };

      const formData = new FormData();
      
      // Add general fields
      Object.keys(sanitizedData).forEach(key => {
        // Skip flat social fields as we bundle them
        if (['instagram', 'facebook', 'twitter'].includes(key)) return;
        
        if (Array.isArray(sanitizedData[key])) {
          sanitizedData[key].forEach(val => formData.append(`${key}[]`, val));
        } else if (sanitizedData[key] !== undefined && sanitizedData[key] !== null) {
          formData.append(key, sanitizedData[key]);
        }
      });

      // Bundled Social Links
      formData.append('socialLinks', JSON.stringify(socialLinksData));

      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      if (isEditing) {
        await adminService.updateUser(user._id, formData, token);
        toast.success("Record Modified.");
      } else {
        await adminService.addUser(formData, token);
        toast.success("Identity Instated.");
      }
      onUserAddedOrUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol Violation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-14">
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-12">
        {/* Profile Identity Group */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Personnel Identity</span>
            </div>

            {/* Profile Photo Upload */}
            <div className="relative group">
              <input
                type="file"
                id="profileImage"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
              <label 
                htmlFor="profileImage"
                className="relative block w-24 h-24 rounded-3xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 hover:border-accent-500 hover:bg-accent-50/30 transition-all cursor-pointer group"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-primary-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white" size={24} />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <Camera className="text-gray-300 group-hover:text-accent-500 transition-colors" size={24} />
                    <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400">Upload</span>
                  </div>
                )}
              </label>
              {imagePreview && (
                 <button 
                   type="button"
                   onClick={() => { setImagePreview(null); setSelectedFile(null); }}
                   className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                 >
                    <X size={12} />
                 </button>
              )}
            </div>
           </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <Input 
                 label="Full Name" 
                 placeholder="e.g. Aarav Sharma" 
                 {...register("name")} 
                 error={errors.name?.message} 
               />
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[9px] text-gray-400 ml-1 italic">
                    Institutional Record ID
                  </label>
                  <div className="relative group flex items-center">
                    {/* Prefix Badge */}
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-4 border-r border-gray-100">
                      <Fingerprint size={18} className="text-accent-500" />
                      <span className="text-sm font-black text-primary-950 tabular-nums uppercase tracking-tighter">
                        {isEditing ? (user?.uniqueId?.match(/^(STU|TEC|ADM)/)?.[0] || "USR") : rolePrefix}
                      </span>
                    </div>
                    {/* Sequence Input */}
                    <input 
                       className={`w-full pl-28 pr-12 py-5 bg-white rounded-2xl border border-gray-100 text-sm font-black tabular-nums text-primary-950 uppercase tracking-widest outline-none transition-all ${isEditing ? "bg-amber-50/50 border-amber-200" : "focus:ring-4 focus:ring-accent-50 focus:border-accent-200"}`}
                       placeholder={isEditing ? (user?.uniqueId?.replace(/^(STU|TEC|ADM)/, "") || "") : "e.g. 0001"}
                       value={idSequence}
                       onChange={(e) => setIdSequence(e.target.value.replace(/[^0-9A-Z]/g, "").slice(0, 10))}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                       <Shield size={14} className={idSequence.trim() !== "" ? "text-accent-500" : "text-gray-200"} />
                    </div>
                  </div>
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest ml-1 italic">
                    {isEditing ? "Registry ID is immutable once allocated." : `System will allocate: ${fullUniqueId || "PENDING_INPUT"}`}
                  </p>
               </div>
            </div>
        </div>

        {/* Digital Connectivity Group */}
        <div className="space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Connectivity & Security</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Input label="Email Address" type="email" placeholder="email@school.com" {...register("email")} error={errors.email?.message} />
              <div className="relative group/pass">
                <Input 
                   label={isEditing ? "Reset Password" : "Initial Password"} 
                   type={showPassword ? "text" : "password"} 
                   placeholder={isEditing ? "Leave blank to keep current" : "••••••••"} 
                   {...register("password")} 
                   error={errors.password?.message} 
                   className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[35px] text-gray-300 hover:text-accent-500 transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
           </div>
        </div>

        {/* Localized Data Group */}
        <div className="space-y-8">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Geographic & Logistics</span>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Input label="Contact Number" placeholder="+91 98765 43210" {...register("phone")} />
              <Input label="Residential Address" placeholder="Area, City, PIN" {...register("address")} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <Select label="Gender" {...register("gender")} error={errors.gender?.message}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
              <Input label="Religion" placeholder="e.g. Hindu" {...register("religion")} />
              <Input label="Category" placeholder="e.g. General" {...register("category")} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Input label="Aadhar identification" placeholder="12 Digit Number" {...register("aadharNumber")} />
              <Input label="Emergency Contact" placeholder="Parent/Guardian Contact" {...register("emergencyContact")} />
           </div>
        </div>

        {/* Role Specific Assignment (The "Big" part) */}
        {currentRole === "student" ? (
          <div className="space-y-8 p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Academic Placement</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {predefinedClassId ? (
                <div className="space-y-2 flex-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block ml-1 hover:cursor-default italic">Locked Academic Placement:</label>
                   <div className="px-8 py-5 bg-primary-950/5 border border-primary-950/20 rounded-2xl flex items-center gap-3">
                      <Shield size={16} className="text-accent-500" />
                      <span className="text-xs font-black text-primary-950 uppercase tracking-tighter">
                        {classes.find(c => c._id === predefinedClassId) ? `${classes.find(c => c._id === predefinedClassId).name}${classes.find(c => c._id === predefinedClassId).stream && classes.find(c => c._id === predefinedClassId).stream !== 'General' ? ` (${classes.find(c => c._id === predefinedClassId).stream})` : ''}` : "Target Node: Fixed"}
                      </span>
                   </div>
                   <input type="hidden" {...register("classId")} value={predefinedClassId} />
                </div>
              ) : (
                <Select label="Assign Class" {...register("classId")} error={errors.classId?.message}>
                  <option value="">Select Target Class</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}{c.stream !== 'General' ? ` (${c.stream})` : ''}</option>
                  ))}
                </Select>
              )}
              <Input label="Roll Identification" placeholder="e.g. 001" {...register("rollNumber")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
               <Input label="Father's Guardian Name" placeholder="Guardian Full Name" {...register("fatherName")} />
               <Input label="Mother's Guardian Name" placeholder="Guardian Full Name" {...register("motherName")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <Input label="Birth Date" type="date" {...register("dob")} />
               <Input label="Previous Institution" placeholder="Last School Attended" {...register("prevSchool")} />
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="space-y-8 p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Professional Profile</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <Input label="Qualification" placeholder="e.g. M.Sc Mathematics" {...register("qualification")} />
                  <Input label="Work Experience" placeholder="e.g. 5 Years" {...register("experience")} />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <Input label="Monthly Base Salary" type="number" placeholder="e.g. 25000" {...register("baseSalary")} />
                  <div />
               </div>
               <Input label="Professional Bio" placeholder="Short description for portal" {...register("bio")} />
            </div>

            <div className="space-y-8 p-10 bg-primary-950/5 rounded-[2.5rem] border border-primary-950/10">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Social & Personal Connectivity</span>
               </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <Input label="Personal Email" type="email" placeholder="personal@gmail.com" {...register("personalEmail")} />
                  <Input label="Emergency/Secondary Phone" placeholder="Alternate Number" {...register("secondaryPhone")} />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <Input label="Instagram Link" placeholder="https://instagram.com/username" {...register("instagram")} />
                  <Input label="Facebook Link" placeholder="https://facebook.com/profile" {...register("facebook")} />
                  <Input label="Twitter (X) Link" placeholder="https://x.com/username" {...register("twitter")} />
               </div>
            </div>
          </div>
        )}


        {/* Actions */}
        <div className="pt-12 border-t border-gray-100 flex gap-6">
          <Button variant="secondary" onClick={onClose} className="px-10 py-5">Cancel</Button>
          <Button type="submit" variant="accent" disabled={loading} className="flex-1 py-5">
            {loading ? <Spinner size="sm" /> : isEditing ? "Commit Changes" : `Add New ${currentRole === 'student' ? 'Student' : 'Teacher'}`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEditUserModal;
