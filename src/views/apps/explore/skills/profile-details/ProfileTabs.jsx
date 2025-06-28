
"use client";

import { useState } from "react";

import { Box, Tabs, Tab, Card, CardContent } from "@mui/material";

import AboutTab from "./tabs/AboutTab";
import PortfolioTab from "./tabs/PortfolioTab";
import Reviews from "./tabs/Reviews/index";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    "aria-controls": `profile-tabpanel-${index}`,
  };
}

const ProfileTabs = ({ profile, user, providerUserId }) => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Card className="mb-6">
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="profile tabs"
          className="px-4"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="About" {...a11yProps(0)} />
          <Tab label="Portfolio" {...a11yProps(1)} />
          <Tab label={`Reviews (${profile.reviewCount})`} {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CardContent>
        <TabPanel value={value} index={0}>
          <AboutTab profile={profile} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <PortfolioTab portfolioItems={profile.portfolio} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Reviews
            reviews={profile.reviews || []}
            rating={profile.rating}
            reviewCount={profile.reviewCount}
            user={user}
            serviceProviderId={profile.id}
            isOwner={profile.isOwner}
            providerUserId={providerUserId}
          />
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default ProfileTabs;

