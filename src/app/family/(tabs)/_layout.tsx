/**
 * Family tab bar: Home · Settings (approved in the mockups).
 */
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tabBarOptions, tabIcon } from '../../../components/tabOptions';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function FamilyTabs() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={tabBarOptions(insets)}>
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen
        name="settings"
        options={{ title: t('tabs.settings'), tabBarIcon: tabIcon('settings') }}
      />
    </Tabs>
  );
}
