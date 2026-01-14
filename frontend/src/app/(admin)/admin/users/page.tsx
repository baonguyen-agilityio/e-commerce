"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useSetAdmin } from "@/hooks/use-user";
import { User, UserRole } from "@/types";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const setAdmin = useSetAdmin();
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getToken();
        api.setToken(token);
        const me = await api.getMe();
        setUsers([me]);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [getToken]);

  const handlePromoteToAdmin = async (clerkId: string) => {
    try {
      await setAdmin.mutateAsync(clerkId);
      const token = await getToken();
      api.setToken(token);
      const me = await api.getMe();
      setUsers([me]);
    } catch (error) {
      // Error handled in hook
    }
  };

  const adminCount = users.filter((u) => u.role === UserRole.ADMIN).length;
  const customerCount = users.filter((u) => u.role === UserRole.CUSTOMER).length;

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            {row.original.role === UserRole.ADMIN ? (
              <Crown className="h-5 w-5 text-amber-600" />
            ) : (
              <UserCircle className="h-5 w-5 text-slate-500" />
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {row.original.name || "Unnamed User"}
            </p>
            <p className="text-xs text-slate-500 font-mono">ID: {row.original.id}</p>
          </div>
        </div>
      ),
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
      cell: ({ row }) => (
        <Badge
          className={
            row.original.role === UserRole.ADMIN
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }
        >
          {row.original.role === UserRole.ADMIN && (
            <ShieldCheck className="h-3 w-3 mr-1" />
          )}
          {row.original.role}
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
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {row.original.role !== UserRole.ADMIN ? (
              <DropdownMenuItem
                onClick={() => handlePromoteToAdmin(row.original.clerkId)}
                className="cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 mr-2 text-amber-600" />
                Promote to Admin
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Already Admin
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-24 bg-slate-100" />
          ))}
        </div>
        <Skeleton className="h-[400px] bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
              <Crown className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-900">
                {adminCount}
              </p>
              <p className="text-sm text-slate-500">Administrators</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <Users className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-slate-900">
                {customerCount}
              </p>
              <p className="text-sm text-slate-500">Customers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Note */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-amber-800">
            <Info className="h-4 w-4" />
            Limited View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-amber-700/80">
            This page shows the current logged-in user. To view all users, add a
            getAllUsers endpoint to your backend API.
          </CardDescription>
        </CardContent>
      </Card>

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
