"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  useChangeRole,
  useCurrentUser,
  useDeleteUser,
  useToggleBan,
  useToggleLock,
  useUsers,
} from "@/hooks/use-user";
import { User, UserRole } from "@/types";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  ShieldCheck,
  UserCircle,
  Users,
  Crown,
  Calendar,
  Mail,
  Trash2,
  UserCheck,
  Ban,
  Unlock,
  Lock,
  Shield,
  Star,
  UserCog,
} from "lucide-react";

const ROLE_CONFIG: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
  [UserRole.CUSTOMER]: {
    label: "Customer",
    icon: <UserCircle className="h-4 w-4" />,
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  [UserRole.STAFF]: {
    label: "Staff",
    icon: <UserCog className="h-4 w-4" />,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  [UserRole.ADMIN]: {
    label: "Admin",
    icon: <ShieldCheck className="h-4 w-4" />,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  [UserRole.SUPER_ADMIN]: {
    label: "Super Admin",
    icon: <Crown className="h-4 w-4" />,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

const ROLE_LEVELS: Record<UserRole, number> = {
  [UserRole.CUSTOMER]: 0,
  [UserRole.STAFF]: 1,
  [UserRole.ADMIN]: 2,
  [UserRole.SUPER_ADMIN]: 3,
};

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useUsers();
  const { data: currentUser } = useCurrentUser();
  const { mutate: changeRole } = useChangeRole();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: toggleBan } = useToggleBan();
  const { mutate: toggleLock } = useToggleLock();

  const handleChangeRole = (clerkId: string, role: UserRole) => {
    changeRole({ clerkId, role });
  };

  const handleToggleBan = (clerkId: string) => {
    toggleBan(clerkId);
  };

  const handleToggleLock = (clerkId: string) => {
    toggleLock(clerkId);
  };

  const handleDeleteUser = (clerkId: string) => {
    deleteUser(clerkId);
  };

  // Stats
  const superAdminCount = users.filter((u) => u.role === UserRole.SUPER_ADMIN).length;
  const adminCount = users.filter((u) => u.role === UserRole.ADMIN).length;
  const staffCount = users.filter((u) => u.role === UserRole.STAFF).length;
  const customerCount = users.filter((u) => u.role === UserRole.CUSTOMER).length;

  // Helper to check if current user can manage target user
  const canManageUser = (targetUser: User): boolean => {
    if (!currentUser) return false;
    if (targetUser.clerkId === currentUser.clerkId) return false; // Can't manage yourself
    if (targetUser.role === UserRole.SUPER_ADMIN) return false; // Can't manage super admin
    return ROLE_LEVELS[currentUser.role] > ROLE_LEVELS[targetUser.role];
  };

  // Helper to get available roles for promotion/demotion
  const getAvailableRoles = (targetUser: User): UserRole[] => {
    if (!currentUser) return [];
    const currentLevel = ROLE_LEVELS[currentUser.role];
    
    return Object.values(UserRole).filter((role) => {
      if (role === targetUser.role) return false; // Skip current role
      if (role === UserRole.SUPER_ADMIN) return false; // Can't promote to super admin
      if (ROLE_LEVELS[role] >= currentLevel) return false; // Can't promote to your level or higher
      return true;
    });
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const role = row.original.role;
        const config = ROLE_CONFIG[role];
        return (
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              role === UserRole.SUPER_ADMIN ? "bg-purple-50" :
              role === UserRole.ADMIN ? "bg-amber-50" :
              role === UserRole.STAFF ? "bg-blue-50" : "bg-slate-100"
            }`}>
              {role === UserRole.SUPER_ADMIN ? <Crown className="h-5 w-5 text-purple-600" /> :
               role === UserRole.ADMIN ? <ShieldCheck className="h-5 w-5 text-amber-600" /> :
               role === UserRole.STAFF ? <UserCog className="h-5 w-5 text-blue-600" /> :
               <UserCircle className="h-5 w-5 text-slate-500" />}
            </div>
            <div>
              <p className="font-medium text-slate-900">
                {row.original.name || "Unnamed User"}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                ID: {row.original.id}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Mail className="h-4 w-4" />
          <span className="text-sm">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const config = ROLE_CONFIG[row.original.role];
        return (
          <Badge className={config.color}>
            {config.icon}
            <span className="ml-1">{config.label}</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.isBanned
              ? "bg-red-50 text-red-700 border-red-200"
              : row.original.isLocked
              ? "bg-orange-50 text-orange-700 border-orange-200"
              : "bg-green-50 text-green-700 border-green-200"
          }
        >
          {row.original.isBanned ? "Banned" : row.original.isLocked ? "Locked" : "Active"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            {new Date(row.original.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const isCurrentUser = currentUser?.clerkId === user.clerkId;
        const canManage = canManageUser(user);
        const availableRoles = getAvailableRoles(user);
        const isBanned = user.isBanned;
        const isLocked = user.isLocked;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {isCurrentUser ? (
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <UserCircle className="h-4 w-4 mr-2" />
                  This is you
                </DropdownMenuItem>
              ) : user.role === UserRole.SUPER_ADMIN ? (
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <Crown className="h-4 w-4 mr-2" />
                  Protected account
                </DropdownMenuItem>
              ) : canManage ? (
                <>
                  {/* Change Role Submenu */}
                  {availableRoles.length > 0 && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="cursor-pointer">
                        <Shield className="h-4 w-4 mr-2" />
                        Change Role
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {availableRoles.map((role) => {
                          const config = ROLE_CONFIG[role];
                          return (
                            <DropdownMenuItem
                              key={role}
                              onClick={() => handleChangeRole(user.clerkId, role)}
                              className="cursor-pointer"
                            >
                              {config.icon}
                              <span className="ml-2">{config.label}</span>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}

                  <DropdownMenuSeparator />

                  {/* Ban/Unban */}
                  <DropdownMenuItem
                    onClick={() => handleToggleBan(user.clerkId)}
                    className={`cursor-pointer ${isBanned ? "text-green-600" : "text-red-600"}`}
                  >
                    {isBanned ? <UserCheck className="h-4 w-4 mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
                    {isBanned ? "Unban User" : "Ban User"}
                  </DropdownMenuItem>

                  {/* Lock/Unlock */}
                  <DropdownMenuItem
                    onClick={() => handleToggleLock(user.clerkId)}
                    className={`cursor-pointer ${isLocked ? "text-green-600" : "text-orange-600"}`}
                  >
                    {isLocked ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                    {isLocked ? "Unlock User" : "Lock User"}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Delete */}
                  <DropdownMenuItem
                    onClick={() => handleDeleteUser(user.clerkId)}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete User
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <Shield className="h-4 w-4 mr-2" />
                  No permission
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 bg-slate-100" />
          ))}
        </div>
        <Skeleton className="h-[400px] bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats - 4 cards now */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-900">{superAdminCount}</p>
              <p className="text-sm text-slate-500">Super Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <ShieldCheck className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-900">{adminCount}</p>
              <p className="text-sm text-slate-500">Admins</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <UserCog className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-900">{staffCount}</p>
              <p className="text-sm text-slate-500">Staff</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Users className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-900">{customerCount}</p>
              <p className="text-sm text-slate-500">Customers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={users}
        searchKey="email"
        searchPlaceholder="Search by email..."
      />
    </div>
  );
}