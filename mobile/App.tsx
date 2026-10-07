import React from "react";
import { StyleSheet, View, Text, StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppProvider, useApp } from "./src/context/AppContext";
import { Colors } from "./src/theme/colors";

// Layout Components
import { Header } from "./src/components/Header";
import { TabBar } from "./src/components/TabBar";

// Modals
import { ChainSelectorModal } from "./src/components/modals/ChainSelectorModal";
import { NotificationsModal } from "./src/components/modals/NotificationsModal";
import { QuickActionModal } from "./src/components/modals/QuickActionModal";

// Screens
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { AgentsScreen } from "./src/screens/AgentsScreen";
import { ExchangeScreen } from "./src/screens/ExchangeScreen";
import { LaunchpadScreen } from "./src/screens/LaunchpadScreen";
import { CommerceScreen } from "./src/screens/CommerceScreen";
import { DegenScreen } from "./src/screens/DegenScreen";
import { BuildScreen } from "./src/screens/BuildScreen";
import { TerminalScreen } from "./src/screens/TerminalScreen";
import { GovernanceScreen } from "./src/screens/GovernanceScreen";
import { RankingsScreen } from "./src/screens/RankingsScreen";
import { WalletScreen } from "./src/screens/WalletScreen";
import { SocialScreen } from "./src/screens/SocialScreen";

const MainAppContent: React.FC = () => {
  const { activeTab, toastMessage } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardScreen />;
      case "agents":
        return <AgentsScreen />;
      case "exchange":
        return <ExchangeScreen />;
      case "launchpad":
        return <LaunchpadScreen />;
      case "commerce":
        return <CommerceScreen />;
      case "degen":
        return <DegenScreen />;
      case "build":
        return <BuildScreen />;
      case "terminal":
        return <TerminalScreen />;
      case "governance":
        return <GovernanceScreen />;
      case "rankings":
        return <RankingsScreen />;
      case "wallet":
        return <WalletScreen />;
      case "social":
        return <SocialScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="light" />

      {/* Global Toast Alert Banner */}
      {toastMessage && (
        <View style={styles.toastWrap}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Sticky Header */}
      <Header />

      {/* Active Screen Body */}
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* Bottom Navigation */}
      <TabBar />

      {/* Global Modals */}
      <ChainSelectorModal />
      <NotificationsModal />
      <QuickActionModal />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  toastWrap: {
    position: "absolute",
    top: 54,
    left: 20,
    right: 20,
    zIndex: 9999,
    backgroundColor: "#181A24",
    borderWidth: 1,
    borderColor: Colors.accent.orange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
    textAlign: "center",
  },
});
