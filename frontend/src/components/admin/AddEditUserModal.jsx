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
import useAuthStore from "../../state/authStore";
import { toast } from "react-toastify";

// ---------- ZOD VALIDATION ----------
const userFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6).optional(),
  role: z.enum(["student", "teacher"]),
  uniqueId: z.string().min(1),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  profileImage: z.string().optional().or(z.literal("")),
  classId: z.string().optional().or(z.literal("")),
  rollNumber: z.string().optional().or(z.literal("")),
  assignedClasses: z.array(z.string()).optional(),
});

const AddEditUserModal = ({
  onClose,
  onUserAddedOrUpdated,
  user,
  role,
}) => {
  const { token } = useAuthStore();
  const isEditing = !!user;

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
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
      profileImage: user?.profileImage || "",
      classId: user?.classId?._id || "",
      rollNumber: user?.rollNumber || "",
      assignedClasses: user?.assignedClasses?.map((cls) => cls._id) || [],
    },
  });

  const currentRole = watch("role");

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await adminService.getClasses(token);
        setClasses(res);
      } catch (error) {
        toast.error("Failed to load classes.");
      }
    };

    if (token) fetchClasses();
  }, [token]);

  // Handle role update
  useEffect(() => {
    if (!isEditing && role) setValue("role", role);
  }, [role]);

  const onSubmit = async (data) => {
    setLoading(true);

    if (!isEditing && !data.password) {
      toast.error("Password is required.");
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await adminService.updateUser(user._id, data, token);
        toast.success("User updated!");
      } else {
        await adminService.addUser(data, token);
        toast.success("User added!");
      }

      onUserAddedOrUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-full max-w-lg">
      <h2 className="text-xl font-bold mb-4">
        {isEditing ? "Edit User" : `Add ${role}`}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Name" {...register("name")} error={errors.name?.message} />

        <Input
          label="Email"
          type="email"
          {...register("email")}
          error={errors.email?.message}
        />

        {!isEditing && (
          <Input
            label="Password"
            type="password"
            {...register("password")}
            error={errors.password?.message}
          />
        )}

        <Input
          label="Unique ID"
          {...register("uniqueId")}
          disabled={isEditing}
          error={errors.uniqueId?.message}
        />

        <Input label="Phone" {...register("phone")} />

        <Input label="Address" {...register("address")} />

        {currentRole === "student" && (
          <>
            <Select label="Class" {...register("classId")}>
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Input label="Roll Number" {...register("rollNumber")} />
          </>
        )}

        {currentRole === "teacher" && (
          <div>
            <label className="text-sm font-medium">Assigned Classes</label>

            {classes.map((cls) => (
              <div key={cls._id} className="flex items-center">
                <input
                  type="checkbox"
                  value={cls._id}
                  {...register("assignedClasses")}
                  defaultChecked={user?.assignedClasses?.some(
                    (ac) => ac._id === cls._id
                  )}
                />
                <span className="ml-2">{cls.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : isEditing ? "Update" : "Add"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEditUserModal;
