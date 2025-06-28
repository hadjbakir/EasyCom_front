'use client'

import React from 'react';

import { Box, Typography, Divider } from '@mui/material';
import { Globe, MessageSquare } from 'lucide-react';

const AboutTab = ({ profile }) => {
  return (
    <div>
      {/* About section */}
      <Typography variant="h6" className="font-medium mb-3">
        About
      </Typography>
      <Typography variant="body1" className="mb-6 whitespace-pre-line">
        {profile.about || 'No description provided'}
      </Typography>

      <Divider className="my-6" />

      {/* Additional Info section */}
      <Typography variant="h6" className="font-medium mb-4">
        Additional Information
      </Typography>

      <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <Box>
          <Typography variant="subtitle2" className="text-textSecondary mb-1">
            Member Since
          </Typography>
          <Typography variant="body1">{profile.memberSince}</Typography>
        </Box>
        <Box className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
          <Box className="flex items-center gap-2">
            <Globe size={20} className="text-primary" />
            <Typography variant="body2">Available for freelance work</Typography>
          </Box>
          
        </Box>
      </Box>
    </div>
  );
};

export default AboutTab;
