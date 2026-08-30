export const goBackToAdminDashboard = (navigation: any) => {
  if (navigation?.canGoBack?.()) {
    navigation.goBack();
    return;
  }

  navigation?.navigate?.('AdminDashboardScreen');
};
