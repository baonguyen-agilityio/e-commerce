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
import { StatsCard } from "@/components/admin/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Leaf,
  Sprout
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; icon: React.ReactNode; color: string }
> = {
  [UserRole.CUSTOMER]: {
    label: "Customer",
    icon: <Leaf className="h-4 w-4" />,
    color: "bg-secondary text-foreground border-border",
  },
  [UserRole.STAFF]: {
    label: "Staff",
    icon: <Sprout className="h-4 w-4" />,
    color: "bg-blue-100/50 text-blue-700 border-blue-200",
  },
  [UserRole.ADMIN]: {
    label: "Admin",
    icon: <ShieldCheck className="h-4 w-4" />,
    color: "bg-amber-100/50 text-amber-700 border-amber-200",
  },
  [UserRole.SUPER_ADMIN]: {
    label: "Super Admin",
    icon: <Crown className="h-4 w-4" />,
    color: "bg-purple-100/50 text-purple-700 border-purple-200",
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
  const superAdminCount = users.filter(
    (u) => u.role === UserRole.SUPER_ADMIN,
  ).length;
  const adminCount = users.filter((u) => u.role === UserRole.ADMIN).length;
  const staffCount = users.filter((u) => u.role === UserRole.STAFF).length;
  const customerCount = users.filter(
    (u) => u.role === UserRole.CUSTOMER,
  ).length;

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
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${role === UserRole.SUPER_ADMIN
                ? "bg-purple-100/50"
                : role === UserRole.ADMIN
                  ? "bg-amber-100/50"
                  : role === UserRole.STAFF
                    ? "bg-blue-100/50"
                    : "bg-secondary"
                }`}
            >
              {role === UserRole.SUPER_ADMIN ? (
                <Crown className="h-5 w-5 text-purple-600" />
              ) : role === UserRole.ADMIN ? (
                <ShieldCheck className="h-5 w-5 text-amber-600" />
              ) : role === UserRole.STAFF ? (
                <Sprout className="h-5 w-5 text-blue-600" />
              ) : (
                <Leaf className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-bold text-foreground capitalize">
                {row.original.name || "Unnamed User"}
              </p>
              <p className="text-xs text-muted-foreground font-mono font-medium">
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
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span className="text-sm font-medium">{row.original.email}</span>
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
            <span className="ml-1 font-bold">{config.label}</span>
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
              ? "bg-red-100/50 text-red-700 border-red-200"
              : row.original.isLocked
                ? "bg-orange-100/50 text-orange-700 border-orange-200"
                : "bg-green-100/50 text-green-700 border-green-200"
          }
        >
          {row.original.isBanned
            ? "Banned"
            : row.original.isLocked
              ? "Locked"
              : "Active"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer hover:bg-secondary hover:text-foreground rounded-lg"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-card border-border rounded-xl shadow-lg">
              {isCurrentUser ? (
                <DropdownMenuItem
                  disabled
                  className="cursor-not-allowed opacity-50"
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  This is you
                </DropdownMenuItem>
              ) : user.role === UserRole.SUPER_ADMIN ? (
                <DropdownMenuItem
                  disabled
                  className="cursor-not-allowed opacity-50"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Protected account
                </DropdownMenuItem>
              ) : canManage ? (
                <>
                  {/* Change Role Submenu */}
                  {availableRoles.length > 0 && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="cursor-pointer focus:bg-secondary focus:text-foreground rounded-lg">
                        <Shield className="h-4 w-4 mr-2" />
                        Change Role
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="bg-card border-border rounded-xl">
                        {availableRoles.map((role) => {
                          const config = ROLE_CONFIG[role];
                          return (
                            <DropdownMenuItem
                              key={role}
                              onClick={() =>
                                handleChangeRole(user.clerkId, role)
                              }
                              className="cursor-pointer focus:bg-secondary focus:text-foreground rounded-lg"
                            >
                              {config.icon}
                              <span className="ml-2">{config.label}</span>
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}

                  <DropdownMenuSeparator className="bg-border" />

                  {/* Ban/Unban */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Ban User
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading">Ban User</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Are you sure you want to ban {user.name || user.email}
                          ? This will prevent the user from signing in to your
                          application. This action can be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleToggleBan(user.clerkId)}
                          className="bg-red-600 hover:bg-red-700 rounded-xl"
                        >
                          Ban
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Lock/Unlock */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer text-orange-600 focus:text-orange-700 focus:bg-orange-50 rounded-lg"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Lock User
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading">Lock User</AlertDialogTitle>
                        <AlertDialogDescription className="capitalize text-muted-foreground">
                          Are you sure you want to lock <strong>{user.name || user.email}</strong>? This will prevent the user
                          from signing in to your application. This action can be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleToggleLock(user.clerkId)}
                          className="bg-orange-600 hover:bg-orange-700 rounded-xl"
                        >
                          Lock
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <DropdownMenuSeparator className="bg-border" />

                  {/* Delete */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-heading">Delete User</AlertDialogTitle>
                        <AlertDialogDescription className="capitalize text-muted-foreground">
                          Are you sure you want to delete <strong>{user.name || user.email}</strong>? This
                          action cannot be undone and will permanently remove
                          the user account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(user.clerkId)}
                          className="bg-red-600 hover:bg-red-700 rounded-xl"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <DropdownMenuItem
                  disabled
                  className="cursor-not-allowed opacity-50"
                >
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
            <Skeleton key={i} className="h-28 bg-secondary/50 rounded-[2rem]" />
          ))}
        </div>
        <Skeleton className="h-[400px] bg-secondary/50 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats - 4 cards now */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Super Admins"
          value={superAdminCount}
          icon={Crown}
          description="System owners"
          iconClassName="bg-purple-100/50 text-purple-600"
        />
        <StatsCard
          title="Admins"
          value={adminCount}
          icon={ShieldCheck}
          description="Administrators"
          iconClassName="bg-amber-100/50 text-amber-600"
        />
        <StatsCard
          title="Staff"
          value={staffCount}
          icon={UserCog}
          description="Support staff"
          iconClassName="bg-blue-100/50 text-blue-600"
        />
        <StatsCard
          title="Customers"
          value={customerCount}
          icon={Users}
          description="Registered users"
          iconClassName="bg-secondary/30 text-muted-foreground"
        />
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
