'use client'

import { useState, useEffect } from 'react';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Avatar,
  Rating,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Edit, Trash2, Star } from 'lucide-react';
import { useSession } from 'next-auth/react';

import SkillOrdersTab from './SkillOrdersTab';
import PortfolioTab from './PortfolioTab';
import ReviewsTab from './ReviewsTab'
import SkillEditDialog from './SkillEditDialog';
import NoSkillsPlaceholder from './NoSkillsPlaceholder';
import apiClient from '@/libs/api';

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

const MySkills = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [serviceProvider, setServiceProvider] = useState(null);
  const [skillDomain, setSkillDomain] = useState(null);
  const [providerId, setProviderId] = useState(null);
  const [designation, setDesignation] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const [createForm, setCreateForm] = useState({
    skill_domain_id: '',
    description: '',
    starting_price: '',
  });

  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated' || !session?.user?.id) {
        setLoading(false);

        return;
      }

      setError(null);
      setLoading(true);

      try {
        // Fetch skill domains
        const domainsResponse = await apiClient.get('/skill-domains');
        const domainsData = domainsResponse.data?.data || domainsResponse.data || [];

        const domainsMap = domainsData.reduce((acc, domain) => {
          acc[domain.id] = domain.name;

          return acc;
        }, {});

        setSkillDomain(domainsMap);

        if (process.env.NODE_ENV !== 'production') {
          console.log('Skill domains fetched:', domainsMap);
        }

        // Fetch service provider data
        const spRes = await apiClient.get(`/service-providers/by-user/${session.user.id}`);
        const provider = spRes.data?.data || null;

        setServiceProvider(provider);
        setProviderId(provider?.id || null);
        setDesignation(provider?.skill_domain?.name || '');

        console.log('Service provider:', provider);
      } catch (error) {
        // If it's a 404 or 500 error (no service provider found), treat it as normal state
        if (error.response?.status === 404 || error.response?.status === 500) {
          setServiceProvider(null);
          setProviderId(null);
          setDesignation(null);
        } else {
          // Only log actual errors to console
        console.error('Fetch error:', error);
        setError(error.response?.data?.message || 'Failed to load skill data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (status !== 'loading') fetchData();
  }, [session?.user?.id, status]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditClick = () => {
    setShowEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setShowEditDialog(false);
  };

  const handleCreateDialogOpen = () => {
    setShowCreateDialog(true);
  };

  const handleCreateDialogClose = () => {
    setShowCreateDialog(false);
    setCreateForm({ skill_domain_id: '', description: '', starting_price: '' });
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;

    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!createForm.skill_domain_id || !createForm.description) {
      setError('Skill domain and description are required');

      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post('/service-providers', {
        skill_domain_id: parseInt(createForm.skill_domain_id, 10),
        description: createForm.description,
        starting_price: createForm.starting_price ? parseFloat(createForm.starting_price) : null,
      });

      const provider = response.data.data;

      setServiceProvider(provider);
      setProviderId(provider.id);
      setDesignation(skillDomain[provider.skill_domain_id] || '');
      setSuccess('Service provider profile created successfully');
      handleCreateDialogClose();
    } catch (error) {
      console.error('Create error:', error);
      setError(error.response?.data?.message || 'Failed to create service provider profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setOpenConfirm(true);
  };

  const confirmDelete = async () => {
    setOpenConfirm(false);
    if (!providerId) return;

    try {
      setLoading(true);
      await apiClient.delete(`/service-providers/${providerId}`);
      setSuccess('Skill profile deleted successfully');
      setTimeout(() => {
        setSuccess(null);
        setServiceProvider(null);
        setProviderId(null);
        setDesignation(null);
      }, 1500);
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete skill profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDialogKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmDelete();
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-6">
          <CircularProgress />
          <Typography className="ml-2">Loading your skill data...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!serviceProvider && status === 'authenticated') {
    return (
      <Box>
        <NoSkillsPlaceholder />

        <Dialog open={showCreateDialog} onClose={handleCreateDialogClose}>
          <DialogTitle>Create Service Provider Profile</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleCreateSubmit} sx={{ mt: 2 }}>
              <FormControl fullWidth required sx={{ mb: 2 }}>
                <InputLabel>Skill Domain</InputLabel>
                <Select
                  name="skill_domain_id"
                  value={createForm.skill_domain_id}
                  onChange={handleCreateFormChange}
                  label="Skill Domain"
                >
                  {skillDomain &&
                    Object.entries(skillDomain).map(([id, name]) => (
                      <MenuItem key={id} value={id}>
                        {name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                required
                label="Description"
                name="description"
                value={createForm.description}
                onChange={handleCreateFormChange}
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Starting Price (optional)"
                name="starting_price"
                value={createForm.starting_price}
                onChange={handleCreateFormChange}
                type="number"
                InputProps={{ startAdornment: <InputAdornment position="start">DZ</InputAdornment> }}
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {success}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateDialogClose}>Cancel</Button>
            <Button onClick={handleCreateSubmit} variant="contained" color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Show error only for real errors when user is authenticated
  if (error && status === 'authenticated') {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const userSkill = {
    id: serviceProvider.id,
    name: session?.user?.fullName || 'User',
    designation: serviceProvider.skill_domain?.name || '',
    avatar: serviceProvider.user?.picture
      ? (() => {
          const picture = serviceProvider.user.picture;

          const normalizedPicture = picture.startsWith('/storage/')
            ? picture
            : `/storage/${picture.replace(/^\/+/, '')}`;

            return `${STORAGE_BASE_URL}${normalizedPicture}`;
        })()
      : '/images/avatars/1.png',
    rating: serviceProvider.reviews?.length > 0
      ? serviceProvider.reviews.reduce((acc, review) => acc + review.rating, 0) / serviceProvider.reviews.length
      : 0,
    reviewCount: serviceProvider.reviews?.length || 0,
    chips: serviceProvider.skills?.map((skill) => ({
      title: skill.name,
      color: 'primary',
    })) || [],
    startingPrice: serviceProvider.starting_price || 0,
    available: true,
    completedProjects: 0,
    pendingOrders: 0,
    totalEarnings: 0,
    responseRate: 100,
    description: serviceProvider.description || 'Professional service provider',
  };

  console.log('serviceProvider', serviceProvider);
  console.log('userSkill', userSkill);

  return (
    <Box>
      <Typography variant="h5" className="mb-6">
        My Skill
      </Typography>

      {success && (
        <Alert severity="success" className="mb-4">
          {success}
        </Alert>
      )}

      <Card className="mb-6">
        <CardContent>
          <Box className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <Box className="flex items-center gap-3 mb-4 md:mb-0">
              <Avatar
                src={userSkill.avatar}
                alt={userSkill.name}
                sx={{ width: 64, height: 64 }}
                onError={() => console.error(`Failed to load avatar: ${userSkill.avatar}`)}
              />
              <Box>
                <Typography variant="h5" className="font-semibold">
                  {userSkill.name}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {userSkill.designation}
                </Typography>
                <Box className="flex items-center gap-1 mt-1">
                  <Rating value={userSkill.rating} precision={0.1} size="small" readOnly />
                  <Typography variant="body2" color="textSecondary">
                    ({userSkill.reviewCount} reviews)
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box className="flex gap-3">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Edit size={18} />}
                onClick={handleEditClick}
              >
                Edit Skill
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={18} />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Box>
          </Box>

          <Box className="flex flex-wrap gap-2 mb-4">
            {userSkill.chips.map((chip, index) => (
              <Chip key={index} label={chip.title} color={chip.color} size="small" />
            ))}
             <Chip
              label={userSkill.available ? 'Available' : 'Unavailable'}
              color={userSkill.available ? 'success' : 'default'}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`From ${userSkill.startingPrice} DZ`}
              color="default"
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="skill tabs">
              <Tab label="Portfolio" value="portfolio" />
              <Tab label="Orders" value="orders" />
              <Tab label="Reviews" value="reviews" />

            </Tabs>
          </Box>
          <Box className="mt-4">
            {activeTab === 'portfolio' && <PortfolioTab skillId={userSkill.id} />}
            {activeTab === 'orders' && (
              <SkillOrdersTab profile={{ id: providerId }} skillId={null} />
            )}
            {activeTab === 'reviews' && <ReviewsTab skillId={userSkill.id} />}

          </Box>
        </CardContent>
      </Card>

      <SkillEditDialog
        open={showEditDialog}
        onClose={handleEditDialogClose}
        skill={userSkill}
        serviceProvider={serviceProvider}
        refreshData={() => window.location.reload()}
      />

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} onKeyDown={handleDialogKeyDown}>
        <DialogTitle>Confirm Skill Profile Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete your skill profile? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MySkills;
