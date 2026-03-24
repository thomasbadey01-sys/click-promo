import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { token, functionsVersion, appBaseUrl } = appParams;

export const base44 = createClient({
  appId: "69c2445e8fd2e553ddca7de2",
  token,
  functionsVersion,
  requiresAuth: false,
  appBaseUrl
});
