
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import Layout from "@/components/Layout";
import { UsageLimitService } from "@/utils/usageLimitService";
import { Profile } from "@/types/profiles";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Activity, Check, X } from "lucide-react";

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
    } else if (!loading && isAdmin) {
      loadData();
    }
  }, [isAdmin, loading, navigate]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch pending requests
      const pendingRequests = await UsageLimitService.getPendingRequests();
      setPendingRequests(pendingRequests);
      
      // Fetch all users (in a real app, add pagination)
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(100);
        
      if (error) throw error;
      setAllUsers(users);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await UsageLimitService.approveUnlimitedAccess(userId);
      toast.success("User approved for unlimited access");
      loadData();
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    }
  };

  const handleDeny = async (userId: string) => {
    try {
      await UsageLimitService.denyUnlimitedAccess(userId);
      toast.success("Request denied");
      loadData();
    } catch (error) {
      console.error("Error denying request:", error);
      toast.error("Failed to deny request");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-purple-100 p-3 rounded-full">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500">Manage user access and requests</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Pending Requests</span>
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>All Users</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Unlimited Access Requests</CardTitle>
                <CardDescription>
                  Review and approve user requests for unlimited QRIS generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending requests at the moment
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRequests.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <div className="font-medium">{profile.full_name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{profile.username}</div>
                          </TableCell>
                          <TableCell>{formatDate(profile.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(profile.id)}
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeny(profile.id)}
                                className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                                Deny
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  View and manage all registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : allUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No users found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <div className="font-medium">{profile.full_name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{profile.username}</div>
                          </TableCell>
                          <TableCell>{formatDate(profile.created_at)}</TableCell>
                          <TableCell>
                            {profile.preferences?.isAdmin ? (
                              <Badge className="bg-purple-600">Admin</Badge>
                            ) : profile.preferences?.isUnlimited ? (
                              <Badge className="bg-green-600">Unlimited</Badge>
                            ) : profile.preferences?.pendingUnlimitedRequest ? (
                              <Badge variant="outline" className="text-amber-600 border-amber-300">Pending</Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-600 border-gray-300">Limited</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {!profile.preferences?.isAdmin && !profile.preferences?.isUnlimited && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(profile.id)}
                                className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                              >
                                Grant Unlimited
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
