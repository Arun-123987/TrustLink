import React, {
  useCallback,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
} from "expo-router";

import api from "@/src/services/api";

type Skill = {
  category?: string;
  name?: string;
};

type Worker = {
  _id: string;
  fullName: string;
  phone?: string;
  experience?: number;
  bio?: string;
  skills?: Skill[];
  hourlyRate?: {
    min?: number;
    max?: number;
  };
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type Action = "verify" | "reject";

type RenderWorkerProps = {
  item: Worker;
};

export default function AdminWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const loadWorkers = async () => {
    try {
      const response = await api.get(
        "/admin/workers/pending"
      );

      setWorkers(
        response.data?.workers || []
      );
    } catch (error) {
      const err = error as ApiError;

      console.log(
        "Pending workers error:",
        err.response?.data || error
      );

      Alert.alert(
        "Error",
        err.response?.data?.message ||
          "Unable to load pending workers."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkers();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkers();
  };

  const updateWorker = async (
    workerId: string,
    action: Action
  ) => {
    try {
      setProcessingId(workerId);

      const endpoint =
        action === "verify"
          ? `/admin/workers/${workerId}/verify`
          : `/admin/workers/${workerId}/reject`;

      const response = await api.patch(endpoint);

      if (response.data?.success) {
        setWorkers((current) =>
          current.filter(
            (worker) =>
              worker._id !== workerId
          )
        );

        Alert.alert(
          action === "verify"
            ? "Worker Verified"
            : "Worker Rejected",
          action === "verify"
            ? "Worker is now verified."
            : "Worker verification rejected."
        );
      }
    } catch (error) {
      const err = error as ApiError;

      console.log(
        "Worker verification error:",
        err.response?.data || error
      );

      Alert.alert(
        "Error",
        err.response?.data?.message ||
          "Action failed."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const confirmAction = (
    worker: Worker,
    action: Action
  ) => {
    const verify = action === "verify";

    Alert.alert(
      verify
        ? "Verify Worker?"
        : "Reject Worker?",
      verify
        ? `Approve ${worker.fullName}?`
        : `Reject ${worker.fullName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: verify
            ? "Verify"
            : "Reject",
          style: verify
            ? "default"
            : "destructive",
          onPress: () =>
            updateWorker(
              worker._id,
              action
            ),
        },
      ]
    );
  };

  const renderWorker = ({
    item,
  }: RenderWorkerProps) => {
    const processing =
      processingId === item._id;

    return (
      <View style={styles.card}>
        <Text style={styles.name}>
          {item.fullName}
        </Text>

        <Text style={styles.phone}>
          {item.phone || "No phone"}
        </Text>

        <Text style={styles.info}>
          Experience:{" "}
          {item.experience || 0} years
        </Text>

        <Text style={styles.info}>
          Skills:{" "}
          {item.skills
            ?.map(
              (skill: Skill) =>
                skill.category ||
                skill.name ||
                ""
            )
            .filter(Boolean)
            .join(", ") ||
            "Not specified"}
        </Text>

        <Text style={styles.info}>
          Rate: ₹
          {item.hourlyRate?.min || 0}
          {" - "}
          ₹
          {item.hourlyRate?.max || 0}
        </Text>

        {item.bio ? (
          <Text style={styles.bio}>
            {item.bio}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.reject,
            ]}
            disabled={processing}
            onPress={() =>
              confirmAction(
                item,
                "reject"
              )
            }
          >
            <Text style={styles.buttonText}>
              Reject
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.verify,
            ]}
            disabled={processing}
            onPress={() =>
              confirmAction(
                item,
                "verify"
              )
            }
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Verify
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
      >
        <Text style={styles.back}>
          ← Back
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Pending Workers
      </Text>

      <FlatList
        data={workers}
        keyExtractor={(item) => item._id}
        renderItem={renderWorker}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={
          workers.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No workers waiting for
            verification.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  back: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 2,
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
  },

  phone: {
    color: "#666",
    marginTop: 4,
  },

  info: {
    marginTop: 8,
    color: "#444",
  },

  bio: {
    marginTop: 10,
    color: "#666",
    lineHeight: 19,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  button: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
  },

  verify: {
    backgroundColor: "#28A745",
  },

  reject: {
    backgroundColor: "#DC3545",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },

  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    color: "#777",
    textAlign: "center",
  },
});