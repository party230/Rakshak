/**
 * Senior tab bar: Home · Check · Pay · Settings (approved in the mockups).
 */
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tabBarOptions, tabIcon } from '../../../components/tabOptions';
import { useLanguage } from '../../../i18n/LanguageContext';

export default function SeniorTabs() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={tabBarOptions(insets)}>
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen
        name="check"
        options={{ title: t('tabs.check'), tabBarIcon: tabIcon('search') }}
      />
      <Tabs.Screen name="pay" options={{ title: t('tabs.pay'), tabBarIcon: tabIcon('rupee') }} />
      <Tabs.Screen
        name="settings"
        options={{ title: t('tabs.settings'), tabBarIcon: tabIcon('settings') }}
      />
    </Tabs>
  );
}
