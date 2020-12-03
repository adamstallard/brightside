import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import NotificationsScreen from '@/components/Notifications/NotificationsScreen';
import BackupScreen from '@/components/Recovery/BackupScreen';
import { headerOptions, NavHome } from './helpers';

const Stack = createStackNavigator();

const topOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
};

const Notifications = () => {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={topOptions}
      />

      <Stack.Screen
        name="Backup"
        component={BackupScreen}
        options={{
          ...headerOptions,
          title: t('backup.header.backup')
        }}
      />
    </>
  )
};

export default Notifications;
