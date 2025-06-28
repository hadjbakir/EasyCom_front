// src/app/[lang]/(dashboard)/(private)/apps/explore/skills/page.jsx
import dynamic from 'next/dynamic';

import { getProfileData } from '@/app/server/actions';

// Dynamically import ConnectionsTab
const ConnectionsTab = dynamic(() => import('@/views/apps/explore/skills'));

const ProfilePage = async () => {
  // Fetch data
  const data = await getProfileData();

  // Validate connections data
  const connectionsData = Array.isArray(data?.users?.connections)
    ? data.users.connections
    : [];


  return <ConnectionsTab data={connectionsData} />;
};

export default ProfilePage;
