
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { UserService } from "@/utils/userService";
import { Profile } from "@/types/profiles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Shield, User, Zap, Clock, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

export default function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await UserService.getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    // Set up a refresh interval
    const interval = setInterval(loadUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGrantAccess = async (userId: string) => {
    setProcessingUsers(prev => ({ ...prev, [userId]: true }));
    try {
      const success = await UserService.grantUnlimitedAccess(userId);
      if (success) {
        toast.success("Unlimited access granted successfully");
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, unlimited_access: true } : u
          )
        );
      } else {
        toast.error("Failed to grant unlimited access");
      }
    } catch (error) {
      console.error("Error granting access:", error);
      toast.error("An error occurred while updating user access");
    } finally {
      setProcessingUsers(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    setProcessingUsers(prev => ({ ...prev, [userId]: true }));
    try {
      const success = await UserService.revokeUnlimitedAccess(userId);
      if (success) {
        toast.success("Unlimited access revoked");
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, unlimited_access: false } : u
          )
        );
      } else {
        toast.error("Failed to revoke unlimited access");
      }
    } catch (error) {
      console.error("Error revoking access:", error);
      toast.error("An error occurred while updating user access");
    } finally {
      setProcessingUsers(prev => ({ ...prev, [userId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout 
      title="Admin Dashboard" 
      subtitle="Manage users and access permissions" 
      showBackButton={true}
    >
      <div className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Admin Control Center</h2>
            <p className="opacity-90">Manage user permissions and monitor activity</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="w-full flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Registered Users</h3>
              <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {users.length} Users
              </Badge>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Daily Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((profile) => (
                  <TableRow key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                          <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium">{profile.full_name || 'Anonymous User'}</div>
                          <div className="text-sm text-gray-500">{profile.username || profile.id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDate(profile.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {profile.unlimited_access ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Unlimited
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Limited (5/day)
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {profile.daily_usage ? (
                          <>
                            <span className="font-medium">{profile.daily_usage.count}/5</span> used today
                          </>
                        ) : (
                          "0/5 used today"
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {profile.unlimited_access ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeAccess(profile.id)}
                          disabled={processingUsers[profile.id]}
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          {processingUsers[profile.id] ? "Processing..." : "Revoke Access"}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGrantAccess(profile.id)}
                          disabled={processingUsers[profile.id]}
                          className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {processingUsers[profile.id] ? "Processing..." : "Grant Unlimited"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </Layout>
  );
}
