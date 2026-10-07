import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { CHAINS } from "../data/mockData";
import { Terminal, Send, Trash2, CornerDownLeft } from "lucide-react-native";

interface LogEntry {
  type: "system" | "input" | "output" | "agent" | "error";
  text: string;
}

export const TerminalScreen: React.FC = () => {
  const { selectedChain, usdcBalance, agents } = useApp();
  const scrollViewRef = useRef<ScrollView>(null);

  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      type: "system",
      text: "=== CIRCUITS PROTOCOL AGENT RUNTIME v2.4 ===",
    },
    {
      type: "system",
      text: `Connected to ${CHAINS[selectedChain].name} (ID: ${CHAINS[selectedChain].chainId})`,
    },
    {
      type: "system",
      text: "Type 'help' for available on-chain commands or 'agents' to inspect fleet.",
    },
  ]);

  const presets = ["help", "status", "agents", "balance", "x402", "clear"];

  const handleCommand = (cmdText: string) => {
    const raw = cmdText.trim();
    if (!raw) return;

    const lower = raw.toLowerCase();
    const newLogs: LogEntry[] = [...logs, { type: "input", text: `$ ${raw}` }];

    if (lower === "clear") {
      setLogs([
        {
          type: "system",
          text: "Terminal cleared. Ready for next command.",
        },
      ]);
      setInput("");
      return;
    }

    if (lower === "help") {
      newLogs.push({
        type: "output",
        text: `Available Commands:
  • agents      - List all registered autonomous agents on-chain
  • status      - Query Arc Mainnet contracts health & sync status
  • balance     - Display current wallet USDC & portfolio valuation
  • x402        - Test X402Facilitator endpoint & payer velocity
  • exec <name> - Run prompt against specific autonomous agent
  • clear       - Clear terminal output`,
      });
    } else if (lower === "status") {
      newLogs.push({
        type: "output",
        text: `[Arc Mainnet Verification (5042)]
  CircuitsCore: 0xcB30D334c9fb9F7c0e753ef413f5233ACFBC3fAd (OK)
  AgentWalletRegistry: 0xE17a676753e9fC58101F6cb8050309c73238a30e (OK)
  X402Facilitator: 0xb4bCEa7BFF3Bf5787d5bfa780d603D5fa76E4B17 (OK)
  Native USDC: 0x3600000000000000000000000000000000000000 (OK)
  Block Time: 420ms | Idempotency Replay: ENABLED`,
      });
    } else if (lower === "agents") {
      const list = agents
        .map(
          (a) =>
            `  • [${a.ticker}] ${a.displayName} (${a.foundationModel}) - $${a.hourlyRateUsdc}/hr [Rep: ${(a.reputationBps / 100).toFixed(1)}%]`
        )
        .join("\n");
      newLogs.push({
        type: "output",
        text: `Active Agents Fleet (${agents.length}):\n${list}`,
      });
    } else if (lower === "balance") {
      newLogs.push({
        type: "output",
        text: `Wallet Balances:
  • Native USDC: $${usdcBalance.toFixed(2)}
  • Gas Token: 12.8 ARC
  • Active Positions: 2
  • Staked in Evaluator Pool: 250.00 USDC`,
      });
    } else if (lower === "x402") {
      newLogs.push({
        type: "output",
        text: `[X402Facilitator Check]
  Payer Velocity Limit: 50.00 USDC / hour
  Current Velocity Used: 0.18 USDC
  CAIP-2 Identifier: eip155:5042
  Attestation Service: Circle Gateway Live
  Status: NOMINAL (200 OK)`,
      });
    } else if (lower.startsWith("exec")) {
      newLogs.push({
        type: "agent",
        text: `[Agent Response from @arc-sentinel]
Autonomous bytecode verification complete. No malicious delegatecalls or unverified proxies found in the target specification. Verified ready for escrow.`,
      });
    } else {
      newLogs.push({
        type: "error",
        text: `Unknown command: '${raw}'. Type 'help' for available commands.`,
      });
    }

    setLogs(newLogs);
    setInput("");
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [logs]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Terminal size={18} color={Colors.accent.orange} />
          <Text style={styles.headerTitle}>Circuits Agent Terminal</Text>
        </View>
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => handleCommand("clear")}
        >
          <Trash2 size={15} color={Colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Preset Pills */}
      <View style={styles.presetsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsList}>
          {presets.map((p) => (
            <TouchableOpacity
              key={p}
              style={styles.presetPill}
              onPress={() => handleCommand(p)}
            >
              <Text style={styles.presetText}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Terminal Screen / Logs Window */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.terminalBox}
        contentContainerStyle={styles.terminalContent}
      >
        {logs.map((log, index) => {
          let color = Colors.text.primary;
          if (log.type === "system") color = Colors.accent.cyan;
          if (log.type === "input") color = Colors.accent.orange;
          if (log.type === "agent") color = Colors.state.emerald;
          if (log.type === "error") color = Colors.state.red;

          return (
            <Text key={index} style={[styles.logText, { color }]}>
              {log.text}
            </Text>
          );
        })}
      </ScrollView>

      {/* Bottom Command Input */}
      <View style={styles.inputBar}>
        <Text style={styles.promptPrefix}>&gt;</Text>
        <TextInput
          style={styles.cmdInput}
          placeholder="Enter command (e.g. status, agents, balance)..."
          placeholderTextColor={Colors.text.tertiary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleCommand(input)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => handleCommand(input)}
        >
          <CornerDownLeft size={16} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05060A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: "monospace",
  },
  clearBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: Colors.background.elevated,
    alignItems: "center",
    justifyContent: "center",
  },
  presetsWrap: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  presetsList: {
    paddingHorizontal: 16,
    gap: 6,
  },
  presetPill: {
    backgroundColor: Colors.background.elevated,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  presetText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: Colors.accent.orange,
    fontWeight: "700",
  },
  terminalBox: {
    flex: 1,
  },
  terminalContent: {
    padding: 14,
    gap: 6,
  },
  logText: {
    fontSize: 11.5,
    fontFamily: "monospace",
    lineHeight: 17,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0C12",
    borderTopWidth: 1,
    borderTopColor: Colors.border.strong,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  promptPrefix: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.accent.orange,
    fontFamily: "monospace",
  },
  cmdInput: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: "monospace",
    fontSize: 12.5,
    paddingVertical: 6,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.accent.orange,
    alignItems: "center",
    justifyContent: "center",
  },
});
