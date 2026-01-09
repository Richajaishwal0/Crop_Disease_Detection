'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  AlertTriangle,
  LogOut,
  UserCheck,
  User,
  Settings,
  Mail,
  Phone,
  MapPin,
  Edit,
  Bell
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getPendingDiagnoses, updateDiagnosisStatus, getNotifications } from '@/app/actions/expert-review';
import { SubmissionMessaging } from '@/components/messaging/submission-messaging';
import { ExpertMessages } from '@/components/messaging/expert-messages';
import { testSubmissionFlow } from '@/app/actions/test-flow';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function ExpertDashboard() {
  const [expert, setExpert] = useState<any>(null);
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('reviews');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    location: ''
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const expertData = localStorage.getItem('expertAuth');
      if (!expertData) {
        router.push('/login');
        return;
      }
      
      try {
        const parsedExpert = JSON.parse(expertData);
        if (!parsedExpert.role || parsedExpert.role !== 'expert') {
          localStorage.removeItem('expertAuth');
          router.push('/login');
          return;
        }
        
        setExpert(parsedExpert);
        setFormData({
          name: parsedExpert.name || '',
          email: parsedExpert.email || '',
          phone: parsedExpert.phone || '',
          specialization: parsedExpert.specialization || '',
          location: parsedExpert.location || ''
        });
        loadDiagnoses();
        loadNotifications();
      } catch (error) {
        console.error('Invalid expert auth data:', error);
        localStorage.removeItem('expertAuth');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (expert) {
      const interval = setInterval(() => {
        loadDiagnoses();
        loadNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [expert]);

  const loadDiagnoses = async () => {
    try {
      const allDiagnoses = await getPendingDiagnoses();
      setDiagnoses(allDiagnoses);
      
      const pending = allDiagnoses.filter(d => d.status === 'pending').length;
      const approved = allDiagnoses.filter(d => d.status === 'approved').length;
      const rejected = allDiagnoses.filter(d => d.status === 'rejected').length;
      
      setStats({ pending, approved, rejected, total: allDiagnoses.length });
    } catch (error) {
      console.error('Error loading diagnoses:', error);
    }
  };

  const loadNotifications = async () => {
    if (expert) {
      try {
        const expertNotifications = await getNotifications(expert.id, 'expert');
        setNotifications(expertNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  };

  const handleApprove = async (diagnosisId: string) => {
    const { success } = await updateDiagnosisStatus(diagnosisId, 'approved');
    if (success) {
      toast({
        title: 'Diagnosis Approved',
        description: 'The AI diagnosis has been approved and farmer notified.',
      });
      loadDiagnoses();
      loadNotifications();
    }
  };

  const handleReject = async (diagnosisId: string) => {
    const { success } = await updateDiagnosisStatus(diagnosisId, 'rejected');
    if (success) {
      toast({
        title: 'Diagnosis Rejected',
        description: 'The AI diagnosis has been rejected.',
      });
      loadDiagnoses();
      loadNotifications();
    }
  };

  const handleSaveProfile = () => {
    const updatedExpert = { ...expert, ...formData };
    localStorage.setItem('expertAuth', JSON.stringify(updatedExpert));
    setExpert(updatedExpert);
    setIsEditing(false);
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('expertAuth');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/expert/login');
  };

  if (!expert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading expert dashboard...</p>
        </div>
      </div>
    );
  }

  const allDiagnoses = diagnoses;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/expert-avatar.jpg" alt={expert.name} />
              <AvatarFallback>
                {expert.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Expert Dashboard</h1>
              <p className="text-muted-foreground">{expert.name} • {expert.specialization}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                {notifications.length === 0 ? (
                  <DropdownMenuItem disabled>
                    No notifications
                  </DropdownMenuItem>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex-col items-start p-3">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground">{notification.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.timestamp).toLocaleString()}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Reviews ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                      <p className="text-sm text-muted-foreground">Pending Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.approved}</p>
                      <p className="text-sm text-muted-foreground">Approved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.rejected}</p>
                      <p className="text-sm text-muted-foreground">Rejected</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-sm text-muted-foreground">Total Reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Reviews */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Pending AI Diagnosis Reviews ({stats.pending})
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { loadDiagnoses(); loadNotifications(); }}
                  >
                    Refresh
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={async () => {
                      const result = await testSubmissionFlow();
                      console.log('Test result:', result);
                      toast({
                        title: 'Test Complete',
                        description: `Submissions: ${result.pendingCount}, Notifications: ${result.notificationCount}`,
                      });
                      loadDiagnoses();
                      loadNotifications();
                    }}
                  >
                    Test Flow
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {allDiagnoses.length > 0 ? (
                  allDiagnoses.map((diagnosis) => (
                    <Card key={diagnosis.id} className="border-l-4 border-l-orange-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              AI Diagnosis: {diagnosis.diagnosis.diseaseName}
                              <Badge variant={diagnosis.diagnosis.affectedSeverity === 'High' ? 'destructive' : 'secondary'}>
                                {diagnosis.diagnosis.affectedSeverity}
                              </Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Submitted by {diagnosis.farmerName} • {new Date(diagnosis.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {(diagnosis.diagnosis.confidence * 100).toFixed(0)}% Confident
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-6">
                          <div className="w-48 h-48 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {diagnosis.imageData ? (
                              <img 
                                src={diagnosis.imageData} 
                                alt="Crop with disease" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-sm text-gray-500">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold text-sm text-gray-600 mb-1">Disease Detected</h4>
                                <p className="font-medium">{diagnosis.diagnosis.diseaseName}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-gray-600 mb-1">Severity Level</h4>
                                <Badge variant={diagnosis.diagnosis.affectedSeverity === 'High' ? 'destructive' : diagnosis.diagnosis.affectedSeverity === 'Medium' ? 'secondary' : 'default'}>
                                  {diagnosis.diagnosis.affectedSeverity}
                                </Badge>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-gray-600 mb-1">AI Confidence</h4>
                                <p className="font-medium">{(diagnosis.diagnosis.confidence * 100).toFixed(1)}%</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-gray-600 mb-1">Model Used</h4>
                                <p className="text-sm">{diagnosis.diagnosis.modelUsed || 'ResNet AI'}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-gray-600 mb-2">Immediate Treatment</h4>
                              <p className="text-sm bg-red-50 p-3 rounded border-l-4 border-red-400">
                                {diagnosis.diagnosis.immediateSteps}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-gray-600 mb-2">Follow-up Care</h4>
                              <p className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                                {diagnosis.diagnosis.followUpSteps}
                              </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                              {diagnosis.status === 'pending' ? (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleApprove(diagnosis.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleReject(diagnosis.id)}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <Badge variant={diagnosis.status === 'approved' ? 'default' : 'destructive'}>
                                  {diagnosis.status.charAt(0).toUpperCase() + diagnosis.status.slice(1)}
                                </Badge>
                              )}
                              <SubmissionMessaging
                                submissionId={diagnosis.id}
                                farmerName={diagnosis.farmerName}
                                farmerId={diagnosis.farmerId}
                                expertId={expert.id}
                                expertName={expert.name}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground">No pending diagnoses to review.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpertMessages expert={expert} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Profile Information</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{expert.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{expert.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{expert.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    {isEditing ? (
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span>{expert.specialization}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{expert.location || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Account Status</h3>
                      <p className="text-sm text-muted-foreground">Your expert account is active</p>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Active
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Notifications</h3>
                      <p className="text-sm text-muted-foreground">Manage notification preferences</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}