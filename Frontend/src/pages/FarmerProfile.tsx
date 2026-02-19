import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import {
  User,
  MapPin,
  Phone,
  CreditCard,
  Droplets,
  Sprout,
  Calendar,
  Edit,
  Download,
  Bell,
  Languages,
  Shield,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LandPlot,
  Wheat,
  Banknote,
  ShieldCheck,
  Save,
  X
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FarmerProfile {
  id: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  aadhaarId: string;
  mobileNumber: string;
  bankAccountLinked: boolean;
  landOwnershipType: 'Owner' | 'Tenant' | 'Shared';
  village: string;
  district: string;
  state: string;
  totalLandArea: number;
  landUnit: 'acres' | 'hectares';
  irrigationType: 'Rainfed' | 'Borewell' | 'Canal' | 'Drip';
  soilType: 'Loamy' | 'Clay' | 'Sandy';
  cropsCurrentlyGrown: string[];
  sowingDate: string;
  cropSeason: 'Kharif' | 'Rabi' | 'Zaid';
  loanStatus: 'Active' | 'None';
  insuranceStatus: 'PMFBY Enrolled' | 'Not Enrolled';
  subsidyStatus: 'Active' | 'Pending' | 'None';
  profilePhoto?: string;
}

const FarmerProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { lang, setLang, t } = useI18n();
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scenario, setScenario] = useState('normal');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<FarmerProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [cropInput, setCropInput] = useState('');

  // Fetch farmer profile from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          // Map database fields (snake_case) to component fields (camelCase)
          setProfile({
            id: data.id,
            fullName: data.full_name || user.email?.split('@')[0] || 'Farmer Name',
            age: data.age || 0,
            gender: (data.gender as 'Male' | 'Female' | 'Other') || 'Male',
            aadhaarId: data.aadhaar_id || '',
            mobileNumber: data.mobile_number || '',
            bankAccountLinked: data.bank_account_linked || false,
            landOwnershipType: (data.land_ownership_type as 'Owner' | 'Tenant' | 'Shared') || 'Owner',
            village: data.village || '',
            district: data.district || '',
            state: data.state || '',
            totalLandArea: data.total_land_area ? parseFloat(data.total_land_area.toString()) : 0,
            landUnit: (data.land_unit as 'acres' | 'hectares') || 'acres',
            irrigationType: (data.irrigation_type as 'Rainfed' | 'Borewell' | 'Canal' | 'Drip') || 'Rainfed',
            soilType: (data.soil_type as 'Loamy' | 'Clay' | 'Sandy') || 'Loamy',
            cropsCurrentlyGrown: Array.isArray(data.crops_currently_grown) ? data.crops_currently_grown : [],
            sowingDate: data.sowing_date || '',
            cropSeason: (data.crop_season as 'Kharif' | 'Rabi' | 'Zaid') || 'Kharif',
            loanStatus: (data.loan_status as 'Active' | 'None') || 'None',
            insuranceStatus: (data.insurance_status as 'PMFBY Enrolled' | 'Not Enrolled') || 'Not Enrolled',
            subsidyStatus: (data.subsidy_status as 'Active' | 'Pending' | 'None') || 'None',
            profilePhoto: data.profile_photo || undefined,
          });
        } else {
          // No profile found, create default profile
          setProfile({
            id: user.id,
            fullName: user.email?.split('@')[0] || 'Farmer Name',
            age: 0,
            gender: 'Male',
            aadhaarId: '',
            mobileNumber: '',
            bankAccountLinked: false,
            landOwnershipType: 'Owner',
            village: '',
            district: '',
            state: '',
            totalLandArea: 0,
            landUnit: 'acres',
            irrigationType: 'Rainfed',
            soilType: 'Loamy',
            cropsCurrentlyGrown: [],
            sowingDate: '',
            cropSeason: 'Kharif',
            loanStatus: 'None',
            insuranceStatus: 'Not Enrolled',
            subsidyStatus: 'None',
          });
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error Loading Profile",
          description: error?.message || "Could not load profile data",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleDownloadPDF = async () => {
    try {
      const input = document.getElementById('farmer-profile-content');
      if (input) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const html2pdf = (await import('html2pdf.js')).default;
        html2pdf().from(input).save(`Farmer_Profile_${profile?.fullName}_${new Date().toISOString().split('T')[0]}.pdf`);
        toast({
          title: "Profile Downloaded",
          description: "Your profile has been downloaded as PDF",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download profile PDF",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const maskAadhaar = (aadhaar: string) => {
    return aadhaar.replace(/\d(?=\d{4})/g, 'X');
  };

  const handleEditClick = () => {
    if (profile) {
      setEditFormData({ ...profile });
      setIsEditDialogOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile || !editFormData) return;

    setIsSaving(true);
    try {
      // Validate required fields
      if (!editFormData.fullName || !editFormData.mobileNumber || !editFormData.village || !editFormData.district || !editFormData.state) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
          duration: 3000,
        });
        setIsSaving(false);
        return;
      }

      // Validate age
      if (editFormData.age && (editFormData.age < 18 || editFormData.age > 100)) {
        toast({
          title: "Validation Error",
          description: "Age must be between 18 and 100",
          variant: "destructive",
          duration: 3000,
        });
        setIsSaving(false);
        return;
      }

      // Validate land area
      if (editFormData.totalLandArea && editFormData.totalLandArea <= 0) {
        toast({
          title: "Validation Error",
          description: "Land area must be greater than 0",
          variant: "destructive",
          duration: 3000,
        });
        setIsSaving(false);
        return;
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Map component fields (camelCase) to database fields (snake_case)
      const profileData = {
        user_id: user.id,
        full_name: editFormData.fullName,
        email: user.email,
        age: editFormData.age,
        gender: editFormData.gender,
        aadhaar_id: editFormData.aadhaarId,
        mobile_number: editFormData.mobileNumber,
        bank_account_linked: editFormData.bankAccountLinked || false,
        land_ownership_type: editFormData.landOwnershipType,
        village: editFormData.village,
        district: editFormData.district,
        state: editFormData.state,
        total_land_area: editFormData.totalLandArea,
        land_unit: editFormData.landUnit,
        irrigation_type: editFormData.irrigationType,
        soil_type: editFormData.soilType,
        crops_currently_grown: editFormData.cropsCurrentlyGrown || [],
        sowing_date: editFormData.sowingDate || null,
        crop_season: editFormData.cropSeason,
        loan_status: editFormData.loanStatus,
        insurance_status: editFormData.insuranceStatus,
        subsidy_status: editFormData.subsidyStatus,
        profile_photo: editFormData.profilePhoto,
      };

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Insert new profile
        result = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      // Update local state with saved data
      const savedData = result.data;
      const updatedProfile: FarmerProfile = {
        id: savedData.id,
        fullName: savedData.full_name || '',
        age: savedData.age || 0,
        gender: (savedData.gender as 'Male' | 'Female' | 'Other') || 'Male',
        aadhaarId: savedData.aadhaar_id || '',
        mobileNumber: savedData.mobile_number || '',
        bankAccountLinked: savedData.bank_account_linked || false,
        landOwnershipType: (savedData.land_ownership_type as 'Owner' | 'Tenant' | 'Shared') || 'Owner',
        village: savedData.village || '',
        district: savedData.district || '',
        state: savedData.state || '',
        totalLandArea: savedData.total_land_area ? parseFloat(savedData.total_land_area.toString()) : 0,
        landUnit: (savedData.land_unit as 'acres' | 'hectares') || 'acres',
        irrigationType: (savedData.irrigation_type as 'Rainfed' | 'Borewell' | 'Canal' | 'Drip') || 'Rainfed',
        soilType: (savedData.soil_type as 'Loamy' | 'Clay' | 'Sandy') || 'Loamy',
        cropsCurrentlyGrown: Array.isArray(savedData.crops_currently_grown) ? savedData.crops_currently_grown : [],
        sowingDate: savedData.sowing_date || '',
        cropSeason: (savedData.crop_season as 'Kharif' | 'Rabi' | 'Zaid') || 'Kharif',
        loanStatus: (savedData.loan_status as 'Active' | 'None') || 'None',
        insuranceStatus: (savedData.insurance_status as 'PMFBY Enrolled' | 'Not Enrolled') || 'Not Enrolled',
        subsidyStatus: (savedData.subsidy_status as 'Active' | 'Pending' | 'None') || 'None',
        profilePhoto: savedData.profile_photo || undefined,
      };

      setProfile(updatedProfile);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully saved to the database",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save Failed",
        description: error?.message || "Could not save profile changes",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCrop = () => {
    if (cropInput.trim() && editFormData.cropsCurrentlyGrown) {
      if (!editFormData.cropsCurrentlyGrown.includes(cropInput.trim())) {
        setEditFormData({
          ...editFormData,
          cropsCurrentlyGrown: [...editFormData.cropsCurrentlyGrown, cropInput.trim()],
        });
        setCropInput('');
      }
    }
  };

  const handleRemoveCrop = (cropToRemove: string) => {
    if (editFormData.cropsCurrentlyGrown) {
      setEditFormData({
        ...editFormData,
        cropsCurrentlyGrown: editFormData.cropsCurrentlyGrown.filter(crop => crop !== cropToRemove),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header scenario={scenario} onScenarioChange={setScenario} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header scenario={scenario} onScenarioChange={setScenario} />
      
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-primary/20">
                    <AvatarImage src={profile?.profilePhoto} alt={profile?.fullName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {profile?.fullName?.charAt(0).toUpperCase() || 'F'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                      {profile?.fullName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm md:text-base text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile?.village}, {profile?.district}, {profile?.state}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={lang} onValueChange={(v) => setLang(v as any)}>
                    <SelectTrigger className="w-[120px]">
                      <Languages className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">हिन्दी</SelectItem>
                      <SelectItem value="mr">मराठी</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-destructive rounded-full"></span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div id="farmer-profile-content" className="space-y-6">
          {/* Farmer Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <User className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="text-lg font-semibold">{profile?.age} years</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="text-lg font-semibold">{profile?.gender}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Aadhaar/ID</p>
                  <p className="text-lg font-semibold font-mono">{maskAadhaar(profile?.aadhaarId || '')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Mobile Number
                  </p>
                  <p className="text-lg font-semibold">{profile?.mobileNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    Bank Account
                  </p>
                  <Badge variant={profile?.bankAccountLinked ? "default" : "outline"} className="mt-1">
                    {profile?.bankAccountLinked ? (
                      <><CheckCircle2 className="h-3 w-3 mr-1" /> Linked</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Not Linked</>
                    )}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Land Ownership</p>
                  <Badge variant="secondary" className="mt-1">
                    {profile?.landOwnershipType}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farm Details Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Sprout className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                Farm Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <LandPlot className="h-4 w-4" />
                    Total Land Area
                  </p>
                  <p className="text-lg font-semibold">{profile?.totalLandArea} {profile?.landUnit}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Droplets className="h-4 w-4" />
                    Irrigation Type
                  </p>
                  <Badge variant="water" className="mt-1">{profile?.irrigationType}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Soil Type</p>
                  <Badge variant="earth" className="mt-1">{profile?.soilType}</Badge>
                </div>
                <div className="space-y-1 md:col-span-2 lg:col-span-3">
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <Wheat className="h-4 w-4" />
                    Crops Currently Grown
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile?.cropsCurrentlyGrown.map((crop, idx) => (
                      <Badge key={idx} variant="outline" className="text-base px-3 py-1">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Sowing Date
                  </p>
                  <p className="text-lg font-semibold">{profile?.sowingDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Crop Season</p>
                  <Badge variant="success" className="mt-1">{profile?.cropSeason}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial & Support Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                <Banknote className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                Financial & Support Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2 p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">Loan Status</p>
                  <div className="flex items-center gap-2">
                    {profile?.loanStatus === 'Active' ? (
                      <Badge variant="warning" className="text-base px-3 py-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {profile.loanStatus}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-base px-3 py-1">
                        {profile?.loanStatus}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2 p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4" />
                    Insurance Status
                  </p>
                  <Badge 
                    variant={profile?.insuranceStatus === 'PMFBY Enrolled' ? "success" : "outline"} 
                    className="text-base px-3 py-1"
                  >
                    {profile?.insuranceStatus === 'PMFBY Enrolled' ? (
                      <><CheckCircle2 className="h-4 w-4 mr-1" /> {profile.insuranceStatus}</>
                    ) : (
                      profile?.insuranceStatus
                    )}
                  </Badge>
                </div>
                <div className="space-y-2 p-4 rounded-lg border bg-card">
                  <p className="text-sm text-muted-foreground">Subsidy Status</p>
                  <Badge 
                    variant={profile?.subsidyStatus === 'Active' ? "success" : profile?.subsidyStatus === 'Pending' ? "warning" : "outline"} 
                    className="text-base px-3 py-1"
                  >
                    {profile?.subsidyStatus === 'Active' && <CheckCircle2 className="h-4 w-4 mr-1" />}
                    {profile?.subsidyStatus === 'Pending' && <AlertCircle className="h-4 w-4 mr-1" />}
                    {profile?.subsidyStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleEditClick} 
              className="flex-1 text-base py-6"
              size="lg"
            >
              <Edit className="h-5 w-5 mr-2" />
              Edit Profile
            </Button>
            <Button 
              onClick={handleDownloadPDF} 
              variant="outline" 
              className="flex-1 text-base py-6"
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Profile PDF
            </Button>
          </div>
        </div>
      </main>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Edit className="h-6 w-6" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your profile information. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={editFormData.fullName || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={editFormData.age || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, age: parseInt(e.target.value) || 0 })}
                    placeholder="Enter your age"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={editFormData.gender || ''}
                    onValueChange={(value) => setEditFormData({ ...editFormData, gender: value as 'Male' | 'Female' | 'Other' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input
                    id="mobileNumber"
                    value={editFormData.mobileNumber || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarId">Aadhaar/ID</Label>
                  <Input
                    id="aadhaarId"
                    value={editFormData.aadhaarId || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, aadhaarId: e.target.value })}
                    placeholder="XXXX-XXXX-1234"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landOwnershipType">Land Ownership Type *</Label>
                  <Select
                    value={editFormData.landOwnershipType || ''}
                    onValueChange={(value) => setEditFormData({ ...editFormData, landOwnershipType: value as 'Owner' | 'Tenant' | 'Shared' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ownership type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Owner">Owner</SelectItem>
                      <SelectItem value="Tenant">Tenant</SelectItem>
                      <SelectItem value="Shared">Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex items-center gap-2 pt-6">
                  <Checkbox
                    id="bankAccountLinked"
                    checked={editFormData.bankAccountLinked || false}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, bankAccountLinked: checked as boolean })}
                  />
                  <Label htmlFor="bankAccountLinked" className="cursor-pointer">
                    Bank Account Linked
                  </Label>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="village">Village *</Label>
                  <Input
                    id="village"
                    value={editFormData.village || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, village: e.target.value })}
                    placeholder="Enter village name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    value={editFormData.district || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                    placeholder="Enter district name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={editFormData.state || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    placeholder="Enter state name"
                  />
                </div>
              </div>
            </div>

            {/* Farm Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary" />
                Farm Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalLandArea">Total Land Area *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="totalLandArea"
                      type="number"
                      step="0.1"
                      min="0"
                      value={editFormData.totalLandArea || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, totalLandArea: parseFloat(e.target.value) || 0 })}
                      placeholder="5.5"
                      className="flex-1"
                    />
                    <Select
                      value={editFormData.landUnit || 'acres'}
                      onValueChange={(value) => setEditFormData({ ...editFormData, landUnit: value as 'acres' | 'hectares' })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acres">Acres</SelectItem>
                        <SelectItem value="hectares">Hectares</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="irrigationType">Irrigation Type *</Label>
                  <Select
                    value={editFormData.irrigationType || ''}
                    onValueChange={(value) => setEditFormData({ ...editFormData, irrigationType: value as 'Rainfed' | 'Borewell' | 'Canal' | 'Drip' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select irrigation type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rainfed">Rainfed</SelectItem>
                      <SelectItem value="Borewell">Borewell</SelectItem>
                      <SelectItem value="Canal">Canal</SelectItem>
                      <SelectItem value="Drip">Drip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type *</Label>
                  <Select
                    value={editFormData.soilType || ''}
                    onValueChange={(value) => setEditFormData({ ...editFormData, soilType: value as 'Loamy' | 'Clay' | 'Sandy' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Loamy">Loamy</SelectItem>
                      <SelectItem value="Clay">Clay</SelectItem>
                      <SelectItem value="Sandy">Sandy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cropSeason">Crop Season *</Label>
                  <Select
                    value={editFormData.cropSeason || ''}
                    onValueChange={(value) => setEditFormData({ ...editFormData, cropSeason: value as 'Kharif' | 'Rabi' | 'Zaid' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kharif">Kharif</SelectItem>
                      <SelectItem value="Rabi">Rabi</SelectItem>
                      <SelectItem value="Zaid">Zaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sowingDate">Sowing Date *</Label>
                  <Input
                    id="sowingDate"
                    type="date"
                    value={editFormData.sowingDate || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, sowingDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="crops">Crops Currently Grown</Label>
                <div className="flex gap-2">
                  <Input
                    id="crops"
                    value={cropInput}
                    onChange={(e) => setCropInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCrop();
                      }
                    }}
                    placeholder="Enter crop name and press Enter"
                  />
                  <Button type="button" onClick={handleAddCrop} variant="outline">
                    Add
                  </Button>
                </div>
                {editFormData.cropsCurrentlyGrown && editFormData.cropsCurrentlyGrown.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editFormData.cropsCurrentlyGrown.map((crop, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm px-3 py-1">
                        {crop}
                        <button
                          type="button"
                          onClick={() => handleRemoveCrop(crop)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Financial Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Financial & Support Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanStatus">Loan Status</Label>
                  <Select
                    value={editFormData.loanStatus || ''}
                    onValueChange={(value) => setEditFormData({ ...editFormData, loanStatus: value as 'Active' | 'None' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceStatus">Insurance Status</Label>
                  <Select
                    value={editFormData.insuranceStatus || ''}
                    onValueChange={(value) => setEditFormData({ ...editFormData, insuranceStatus: value as 'PMFBY Enrolled' | 'Not Enrolled' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select insurance status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PMFBY Enrolled">PMFBY Enrolled</SelectItem>
                      <SelectItem value="Not Enrolled">Not Enrolled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subsidyStatus">Subsidy Status</Label>
                  <Select
                    value={editFormData.subsidyStatus || ''}
                    onValueChange={(value) => setEditFormData({ ...editFormData, subsidyStatus: value as 'Active' | 'Pending' | 'None' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subsidy status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerProfilePage;
