import { atom } from 'recoil';
import { TabKind } from '../variables/tabs';

export const selectedTab = atom({
  key: 'selectedTab',
  default: TabKind.DASHBOARD,
});
