import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  ExternalLink,
  Shield,
  Banknote,
  Droplets,
  Sprout,
  Wrench,
  FileText,
  TrendingUp,
  Award
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Scheme {
  id: string;
  name: string;
  ministry: string;
  category: 'Subsidy' | 'Loan' | 'Insurance' | 'Equipment' | 'Irrigation' | 'Seed Support';
  description: string;
  benefits: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  officialLink: string;
  eligibilityStatus: 'eligible' | 'partially-eligible' | 'not-eligible';
  eligibilityScore: number; // 0-100
}

const GovernmentSchemesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [scenario, setScenario] = useState('normal');

  // Mock farmer profile for eligibility checking
  const farmerProfile = {
    landSize: 5.5, // acres
    income: 'low', // low, medium, high
    casteCategory: 'General', // General, OBC, SC, ST
    state: 'Maharashtra',
    irrigationType: 'Drip',
    hasBankAccount: true,
  };

  // Real Government Schemes Data
  const schemes: Scheme[] = [
    {
      id: '1',
      name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Subsidy',
      description: 'Direct income support scheme providing financial assistance to all landholding farmer families across the country. The amount is transferred directly to bank accounts in three equal installments.',
      benefits: '₹6,000 per year (₹2,000 per installment in 4-monthly intervals)',
      eligibilityCriteria: [
        'All landholding farmer families',
        'Must have cultivable land in their name',
        'Valid bank account linked with Aadhaar',
        'Excludes institutional landholders, serving/retired government employees, income tax payers'
      ],
      requiredDocuments: [
        'Aadhaar Card',
        'Bank Account Details (Aadhaar linked)',
        'Land Ownership Documents (7/12, 8-A, or equivalent)',
        'PM-KISAN Registration Form',
        'Mobile Number'
      ],
      officialLink: 'https://pmkisan.gov.in',
      eligibilityStatus: 'eligible',
      eligibilityScore: 100
    },
    {
      id: '2',
      name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Insurance',
      description: 'Comprehensive crop insurance scheme providing financial support to farmers in case of crop loss due to natural calamities, pests, and diseases. Covers pre-sowing to post-harvest losses.',
      benefits: 'Premium subsidy: 90% for small & marginal farmers, 80% for others. Maximum premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticultural crops',
      eligibilityCriteria: [
        'All farmers growing notified crops in notified areas',
        'Compulsory for loanee farmers, voluntary for non-loanee',
        'Valid bank account',
        'Crop must be sown in notified area during notified season'
      ],
      requiredDocuments: [
        'Aadhaar Card',
        'Bank Account Details',
        'Land Documents (7/12, 8-A)',
        'Sowing Certificate from Revenue Officer',
        'Crop Insurance Application Form',
        'Previous year crop yield data (if available)'
      ],
      officialLink: 'https://pmfby.gov.in',
      eligibilityStatus: 'eligible',
      eligibilityScore: 95
    },
    {
      id: '3',
      name: 'Kisan Credit Card (KCC)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Loan',
      description: 'Credit facility providing adequate and timely credit support to farmers for their cultivation needs, purchase of inputs, and other short-term requirements. Extended to animal husbandry and fisheries.',
      benefits: 'Concessional interest rate of 4% per annum (with interest subvention). Credit limit up to ₹3 lakh for short-term loans. Coverage for crop loans, working capital, and consumption needs',
      eligibilityCriteria: [
        'Farmers with cultivable land',
        'Age: 18-75 years',
        'Valid bank account',
        'Land documents proving ownership/tenancy',
        'Good credit history preferred'
      ],
      requiredDocuments: [
        'Aadhaar Card',
        'Land Documents (7/12, 8-A, or lease agreement)',
        'Bank Account Details',
        'Recent passport size photographs (2)',
        'Identity Proof (Voter ID/PAN Card)',
        'Address Proof',
        'Income Certificate (if required)'
      ],
      officialLink: 'https://www.india.gov.in/kisan-credit-card-kcc',
      eligibilityStatus: 'eligible',
      eligibilityScore: 90
    },
    {
      id: '4',
      name: 'PMKSY - Per Drop More Crop (Micro Irrigation)',
      ministry: 'Ministry of Jal Shakti',
      category: 'Irrigation',
      description: 'Centrally sponsored scheme promoting micro irrigation (drip and sprinkler) to increase water use efficiency and crop productivity. Part of Pradhan Mantri Krishi Sinchayee Yojana (PMKSY).',
      benefits: 'Subsidy: 55% for small & marginal farmers, 45% for other farmers. Maximum subsidy: ₹50,000 per hectare for drip, ₹40,000 per hectare for sprinkler',
      eligibilityCriteria: [
        'Farmers with cultivable land',
        'Preference to small and marginal farmers',
        'Land should be suitable for micro irrigation',
        'Valid bank account',
        'No previous subsidy availed for same land'
      ],
      requiredDocuments: [
        'Aadhaar Card',
        'Land Documents (7/12, 8-A)',
        'Bank Account Details',
        'Application Form (Form-A)',
        'Quotation from approved dealer',
        'Land map/sketch',
        'Caste Certificate (for SC/ST/OBC)'
      ],
      officialLink: 'https://pmksy.gov.in',
      eligibilityStatus: 'eligible',
      eligibilityScore: 100
    },
    {
      id: '5',
      name: 'Soil Health Card Scheme',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Seed Support',
      description: 'Scheme providing soil health cards to farmers with crop-wise recommendations of nutrients and fertilizers. Cards are issued every 2 years to help farmers improve soil health and productivity.',
      benefits: 'Free soil testing, nutrient status report, and fertilizer recommendations. Helps optimize fertilizer use and reduce input costs',
      eligibilityCriteria: [
        'All farmers with cultivable land',
        'Land ownership/tenancy required',
        'No income or landholding restrictions'
      ],
      requiredDocuments: [
        'Aadhaar Card',
        'Land Documents (7/12, 8-A)',
        'Application Form (available at Krishi Vigyan Kendras or Agriculture Department)',
        'Mobile Number'
      ],
      officialLink: 'https://soilhealth.dac.gov.in',
      eligibilityStatus: 'eligible',
      eligibilityScore: 100
    },
    {
      id: '6',
      name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Equipment',
      description: 'Scheme promoting agricultural mechanization by providing financial assistance for purchase of agricultural machinery and equipment. Supports individual farmers, FPOs, and Custom Hiring Centers.',
      benefits: 'Subsidy: 25-40% for individual farmers, 40% for FPOs, 50% for Custom Hiring Centers. Maximum subsidy: ₹1.25 lakh for tractors, varies for other equipment',
      eligibilityCriteria: [
        'Individual farmers, FPOs, Custom Hiring Centers',
        'Minimum landholding: 0.5 hectares (varies by state)',
        'Valid bank account',
        'No previous subsidy for same equipment',
        'Age: 18-65 years for individual farmers'
      ],
      requiredDocuments: [
        'Aadhaar Card',
        'Land Documents',
        'Bank Account Details',
        'Quotation from authorized dealer',
        'Application Form',
        'Identity Proof',
        'Caste Certificate (for SC/ST/OBC)',
        'FPO Registration Certificate (for FPOs)'
      ],
      officialLink: 'https://agriculture.gov.in',
      eligibilityStatus: 'partially-eligible',
      eligibilityScore: 75
    },
    {
      id: '7',
      name: 'National Food Security Mission (NFSM)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Seed Support',
      description: 'Mission to increase production of rice, wheat, pulses, coarse cereals, and nutri-cereals through area expansion and productivity enhancement. Provides support for seeds, fertilizers, and other inputs.',
      benefits: 'Subsidy on certified seeds (50-75%), micro-nutrients, bio-fertilizers, and plant protection chemicals. Support for demonstrations, trainings, and capacity building',
      eligibilityCriteria: [
        'Farmers in notified districts',
        'Growing target crops (rice, wheat, pulses, coarse cereals)',
        'Minimum landholding: 0.5 hectares',
        'Valid bank account',
        'Must follow recommended package of practices'
      ],
      requiredDocuments: [
        'Aadhaar Card',
        'Land Documents',
        'Crop Sowing Certificate',
        'Bank Account Details',
        'Application Form',
        'Seed purchase receipt (for seed subsidy)'
      ],
      officialLink: 'https://nfsm.gov.in',
      eligibilityStatus: 'partially-eligible',
      eligibilityScore: 70
    },
    {
      id: '8',
      name: 'PM-Kisan Maandhan Yojana (PM-KMY)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Subsidy',
      description: 'Pension scheme for small and marginal farmers providing monthly pension of ₹3,000 after attaining 60 years of age. Voluntary and contributory scheme.',
      benefits: 'Monthly pension of ₹3,000 after age 60. Government contributes equal amount. Total contribution: ₹100-200 per month based on entry age',
      eligibilityCriteria: [
        'Small and marginal farmers (landholding up to 2 hectares)',
        'Age: 18-40 years',
        'Must be enrolled in PM-KISAN',
        'Not covered under any other pension scheme',
        'Valid bank account'
      ],
      requiredDocuments: [
        'Aadhaar Card',
        'Bank Account Details',
        'Land Documents (proving landholding ≤ 2 hectares)',
        'PM-KISAN Registration Number',
        'Mobile Number',
        'Passport size photograph'
      ],
      officialLink: 'https://pmkmy.gov.in',
      eligibilityStatus: 'eligible',
      eligibilityScore: 85
    },
    {
      id: '9',
      name: 'Pradhan Mantri Kisan Urja Suraksha evem Utthan Mahabhiyan (PM-KUSUM)',
      ministry: 'Ministry of New and Renewable Energy',
      category: 'Equipment',
      description: 'Scheme promoting solar energy in agriculture by providing solar pumps for irrigation and solar power plants on barren/fallow land. Reduces dependence on grid electricity and diesel.',
      benefits: 'Subsidy: 30% from central government, 30% from state government, 40% through bank loan. For standalone solar pumps: 60% subsidy (30% central + 30% state)',
      eligibilityCriteria: [
        'Farmers with agricultural land',
        'Preference to small and marginal farmers',
        'Land should be suitable for solar installation',
        'Valid bank account',
        'No grid connection or unreliable power supply'
      ],
      requiredDocuments: [
        'Aadhaar Card',
        'Land Documents',
        'Bank Account Details',
        'Application Form',
        'Quotation from approved vendor',
        'Caste Certificate (for SC/ST/OBC)',
        'Electricity bill (if applicable)'
      ],
      officialLink: 'https://pmkusum.mnre.gov.in',
      eligibilityStatus: 'partially-eligible',
      eligibilityScore: 80
    },
    {
      id: '10',
      name: 'Rashtriya Krishi Vikas Yojana - Remunerative Approaches for Agriculture and Allied Sector Rejuvenation (RKVY-RAFTAAR)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Subsidy',
      description: 'Centrally sponsored scheme providing flexibility to states for planning and implementing agriculture development programs. Focus on increasing investment in agriculture and allied sectors.',
      benefits: 'State-specific benefits including infrastructure development, value addition, market linkages, and capacity building. Grants vary by project',
      eligibilityCriteria: [
        'State-specific criteria (varies by state)',
        'Farmers, FPOs, cooperatives, and agri-entrepreneurs',
        'Projects aligned with state agriculture plans',
        'Valid documentation as per state guidelines'
      ],
      requiredDocuments: [
        'Aadhaar Card',
        'Land Documents',
        'Project Proposal (for infrastructure projects)',
        'State-specific documents',
        'Bank Account Details',
        'Registration Certificate (for FPOs/Cooperatives)'
      ],
      officialLink: 'https://rkvy.nic.in',
      eligibilityStatus: 'partially-eligible',
      eligibilityScore: 60
    },
    {
      id: '11',
      name: 'Mission for Integrated Development of Horticulture (MIDH)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Seed Support',
      description: 'Centrally sponsored scheme for holistic development of horticulture sector covering fruits, vegetables, flowers, spices, and plantation crops. Provides support for production, post-harvest management, and marketing.',
      benefits: 'Subsidy on planting material (40-50%), protected cultivation (50-60%), post-harvest infrastructure (35-50%), and marketing infrastructure. Varies by component and category',
      eligibilityCriteria: [
        'Farmers growing horticultural crops',
        'FPOs, cooperatives, and entrepreneurs',
        'Minimum area: 0.1 hectares (varies by component)',
        'Valid bank account',
        'Must follow recommended practices'
      ],
      requiredDocuments: [
        'Aadhaar Card',
        'Land Documents',
        'Bank Account Details',
        'Application Form',
        'Crop details and area',
        'Quotation from approved supplier',
        'Caste Certificate (for SC/ST/OBC)'
      ],
      officialLink: 'https://midh.gov.in',
      eligibilityStatus: 'partially-eligible',
      eligibilityScore: 70
    },
    {
      id: '12',
      name: 'National Mission on Oilseeds and Oil Palm (NMOOP)',
      ministry: 'Ministry of Agriculture & Farmers Welfare',
      category: 'Seed Support',
      description: 'Mission to increase production and productivity of oilseeds and oil palm. Provides support for quality seeds, inputs, and area expansion.',
      benefits: 'Subsidy on certified seeds (50-75%), micro-irrigation, plant protection, and capacity building. Support for oil palm cultivation and processing',
      eligibilityCriteria: [
        'Farmers growing oilseeds or oil palm',
        'In notified districts',
        'Minimum area: 0.5 hectares',
        'Valid bank account',
        'Must follow recommended package of practices'
      ],
      requiredDocuments: [
        'Aadhaar Card',
        'Land Documents',
        'Bank Account Details',
        'Crop Sowing Certificate',
        'Seed purchase receipt',
        'Application Form'
      ],
      officialLink: 'https://agriculture.gov.in',
      eligibilityStatus: 'partially-eligible',
      eligibilityScore: 65
    },
  ];

  // Filter schemes based on search and category
  const filteredSchemes = useMemo(() => {
    return schemes.filter(scheme => {
      const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Calculate eligibility statistics
  const eligibilityStats = useMemo(() => {
    const eligible = filteredSchemes.filter(s => s.eligibilityStatus === 'eligible').length;
    const partiallyEligible = filteredSchemes.filter(s => s.eligibilityStatus === 'partially-eligible').length;
    const notEligible = filteredSchemes.filter(s => s.eligibilityStatus === 'not-eligible').length;
    const total = filteredSchemes.length;
    const eligiblePercentage = total > 0 ? Math.round((eligible / total) * 100) : 0;

    return { eligible, partiallyEligible, notEligible, total, eligiblePercentage };
  }, [filteredSchemes]);

  const getEligibilityIcon = (status: string) => {
    switch (status) {
      case 'eligible':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'partially-eligible':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'not-eligible':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getEligibilityBadge = (status: string) => {
    switch (status) {
      case 'eligible':
        return <Badge variant="success" className="text-sm px-3 py-1">Eligible</Badge>;
      case 'partially-eligible':
        return <Badge variant="warning" className="text-sm px-3 py-1">Partially Eligible</Badge>;
      case 'not-eligible':
        return <Badge variant="destructive" className="text-sm px-3 py-1">Not Eligible</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Subsidy':
        return <Banknote className="h-4 w-4" />;
      case 'Loan':
        return <TrendingUp className="h-4 w-4" />;
      case 'Insurance':
        return <Shield className="h-4 w-4" />;
      case 'Equipment':
        return <Wrench className="h-4 w-4" />;
      case 'Irrigation':
        return <Droplets className="h-4 w-4" />;
      case 'Seed Support':
        return <Sprout className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleDownloadReport = async () => {
    try {
      const reportContent = document.getElementById('eligibility-report');
      if (reportContent) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const html2pdf = (await import('html2pdf.js')).default;
        html2pdf().from(reportContent).save(`Eligibility_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        toast({
          title: "Report Downloaded",
          description: "Your eligibility report has been downloaded as PDF",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download eligibility report",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header scenario={scenario} onScenarioChange={setScenario} />
      
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Government Schemes & Eligibility
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">
                Check your eligibility for various government agricultural schemes
              </p>
            </div>
            <Button onClick={handleDownloadReport} variant="outline" size="lg" className="text-base">
              <Download className="h-5 w-5 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Eligibility Score Card */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  Your Eligibility Score
                </h2>
                <p className="text-muted-foreground mb-4">
                  You are eligible for <strong className="text-foreground">{eligibilityStats.eligible}</strong> out of{' '}
                  <strong className="text-foreground">{eligibilityStats.total}</strong> schemes available in your district.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Overall Eligibility</span>
                    <span className="font-semibold">{eligibilityStats.eligiblePercentage}%</span>
                  </div>
                  <Progress value={eligibilityStats.eligiblePercentage} className="h-3" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-success">{eligibilityStats.eligible}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Eligible</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-warning">{eligibilityStats.partiallyEligible}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Partial</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-destructive">{eligibilityStats.notEligible}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">Not Eligible</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter & Search Section */}
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by scheme name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 text-base"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-[250px] h-11">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Subsidy">Subsidy</SelectItem>
                  <SelectItem value="Loan">Loan</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Irrigation">Irrigation</SelectItem>
                  <SelectItem value="Seed Support">Seed Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Featured National Schemes */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Featured National Schemes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemes.filter(s => ['1', '2', '3', '4', '5'].includes(s.id)).map((scheme) => (
              <Card key={scheme.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{scheme.name}</CardTitle>
                      <CardDescription className="text-xs">{scheme.ministry}</CardDescription>
                    </div>
                    {getEligibilityIcon(scheme.eligibilityStatus)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{scheme.description}</p>
                  <div className="flex items-center justify-between">
                    {getEligibilityBadge(scheme.eligibilityStatus)}
                    <Button size="sm" variant="ghost" asChild>
                      <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Schemes */}
        <div id="eligibility-report">
          <h2 className="text-xl md:text-2xl font-bold mb-4">All Available Schemes</h2>
          <div className="space-y-4">
            {filteredSchemes.map((scheme) => (
              <Card key={scheme.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(scheme.category)}
                        <Badge variant="outline" className="text-xs">
                          {scheme.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl md:text-2xl mb-1">{scheme.name}</CardTitle>
                      <CardDescription className="text-sm">{scheme.ministry}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getEligibilityIcon(scheme.eligibilityStatus)}
                      {getEligibilityBadge(scheme.eligibilityStatus)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="description" className="text-xs">Description</TabsTrigger>
                      <TabsTrigger value="benefits" className="text-xs">Benefits</TabsTrigger>
                      <TabsTrigger value="eligibility" className="text-xs">Eligibility</TabsTrigger>
                      <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className="mt-4">
                      <p className="text-sm text-muted-foreground">{scheme.description}</p>
                    </TabsContent>
                    <TabsContent value="benefits" className="mt-4">
                      <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                        <p className="text-base font-semibold text-success mb-1">Benefits Provided</p>
                        <p className="text-sm">{scheme.benefits}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="eligibility" className="mt-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold mb-2">Eligibility Criteria:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {scheme.eligibilityCriteria.map((criteria, idx) => (
                            <li key={idx}>{criteria}</li>
                          ))}
                        </ul>
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">Eligibility Score</span>
                            <span className="text-sm font-bold">{scheme.eligibilityScore}%</span>
                          </div>
                          <Progress value={scheme.eligibilityScore} className="h-2" />
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="documents" className="mt-4">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold mb-2">Required Documents:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {scheme.requiredDocuments.map((doc, idx) => (
                            <li key={idx}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                  <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => window.open(scheme.officialLink, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply Now / Official Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredSchemes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No schemes found matching your search criteria.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default GovernmentSchemesPage;
