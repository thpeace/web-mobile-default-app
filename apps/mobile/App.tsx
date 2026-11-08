import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { createApiClient } from '@app/api-client';
import { User, RequestItem, AdminStats, EmployeeStats, ClientStats } from '@app/types';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = createApiClient({
  baseURL: API_URL,
});

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'profile'>('dashboard');

  // Login form
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data states
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats | null>(null);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // New Request Modal (Client)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const handleLogin = async (customEmail?: string, customPassword?: string) => {
    const loginEmail = customEmail || email;
    const loginPass = customPassword || password;

    try {
      setIsAuthenticating(true);
      setLoginError(null);
      const res = await api.login({ email: loginEmail, password: loginPass });
      setToken(res.token);
      setUser(res.user);
    } catch (err: any) {
      setLoginError(err.response?.data?.error || err.message || 'Login failed. Check server.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
  };

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setIsLoadingData(true);
      if (user.role === 'ADMIN') {
        const stats = await api.getAdminStats();
        setAdminStats(stats);
      } else if (user.role === 'EMPLOYEE') {
        const [stats, reqs] = await Promise.all([
          api.getEmployeeStats(),
          api.getRequests(),
        ]);
        setEmployeeStats(stats);
        setRequests(reqs);
      } else if (user.role === 'CLIENT') {
        const [stats, reqs] = await Promise.all([
          api.getClientStats(),
          api.getRequests(),
        ]);
        setClientStats(stats);
        setRequests(reqs);
      }
    } catch (err) {
      console.error('Failed to load mobile dashboard data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleCreateRequest = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Please enter a request title');
      return;
    }
    try {
      setIsSubmittingRequest(true);
      await api.createRequest({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      });
      setNewTitle('');
      setNewDescription('');
      setIsCreateModalOpen(false);
      loadDashboardData();
      Alert.alert('Success', 'Request created successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit request');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'IN_PROGRESS' | 'RESOLVED') => {
    try {
      await api.updateRequestStatus(id, { status });
      loadDashboardData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update status');
    }
  };

  // --- Render Login Screen (Centered Card Layout) ---
  if (!user) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authCard}>
            <View style={styles.brandBadge}>
              <Ionicons name="layers" size={28} color="#2563EB" />
            </View>
            <Text style={styles.authTitle}>CrossPlatform</Text>
            <Text style={styles.authSubtitle}>Mobile Companion App (iOS & Android)</Text>

            {loginError && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#B91C1C" />
                <Text style={styles.errorText}>{loginError}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="name@example.com"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="password123"
              />
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleLogin()}
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In to App</Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo Fast Fills */}
            <Text style={styles.demoHeader}>Quick Demo Logins</Text>
            <View style={styles.demoRow}>
              <TouchableOpacity
                style={[styles.demoPill, { borderColor: '#DDD6FE' }]}
                onPress={() => {
                  setEmail('admin@example.com');
                  setPassword('password123');
                  handleLogin('admin@example.com', 'password123');
                }}
              >
                <Text style={[styles.demoPillText, { color: '#6B21A8' }]}>Admin</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoPill, { borderColor: '#C7D2FE' }]}
                onPress={() => {
                  setEmail('employee@example.com');
                  setPassword('password123');
                  handleLogin('employee@example.com', 'password123');
                }}
              >
                <Text style={[styles.demoPillText, { color: '#3730A3' }]}>Employee</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoPill, { borderColor: '#A7F3D0' }]}
                onPress={() => {
                  setEmail('client@example.com');
                  setPassword('password123');
                  handleLogin('client@example.com', 'password123');
                }}
              >
                <Text style={[styles.demoPillText, { color: '#065F46' }]}>Client</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Main App Shell (with Bottom Tab Navigation) ---
  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CrossPlatform</Text>
          <Text style={styles.headerRole}>
            Logged in as <Text style={{ fontWeight: '700' }}>{user.name}</Text> ({user.role})
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadDashboardData}>
          <Ionicons name="reload" size={18} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView contentContainerStyle={styles.contentScroll}>
        {isLoadingData && (
          <ActivityIndicator style={{ marginVertical: 12 }} color="#2563EB" />
        )}

        {/* 1. ADMIN Mobile View */}
        {user.role === 'ADMIN' && adminStats && (
          <View style={styles.roleSection}>
            <Text style={styles.sectionTitle}>Executive Overview</Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Active Clients</Text>
                <Text style={styles.metricValue}>{adminStats.totalActiveClients}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Pending Unassigned</Text>
                <Text style={[styles.metricValue, { color: '#D97706' }]}>
                  {adminStats.unassignedPendingRequests}
                </Text>
              </View>
            </View>

            <View style={styles.singleMetricCard}>
              <Text style={styles.metricLabel}>Average Resolution Time (KPI)</Text>
              <Text style={[styles.metricValue, { color: '#2563EB' }]}>
                {adminStats.averageResolutionTimeMinutes} min
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Recent Enterprise Activity</Text>
            {adminStats.recentActivity.map((item) => (
              <View key={item.id} style={styles.requestCard}>
                <View style={styles.requestCardHeader}>
                  <Text style={styles.requestTitle}>{item.title}</Text>
                  <View style={[styles.statusTag, getStatusTagStyle(item.status)]}>
                    <Text style={styles.statusTagText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.requestMeta}>
                  Client: {item.client?.name || item.clientId} • Assigned:{' '}
                  {item.employee?.name || 'Unassigned'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 2. EMPLOYEE Mobile View */}
        {user.role === 'EMPLOYEE' && employeeStats && (
          <View style={styles.roleSection}>
            <Text style={styles.sectionTitle}>My Task Queue</Text>

            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Assigned Tasks</Text>
                <Text style={styles.metricValue}>{employeeStats.assignedTasksCount}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Open Tasks</Text>
                <Text style={[styles.metricValue, { color: '#D97706' }]}>
                  {employeeStats.openTasksCount}
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Resolved Today</Text>
                <Text style={[styles.metricValue, { color: '#059669' }]}>
                  {employeeStats.tasksResolvedToday}
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Assigned Requests</Text>
            {requests.map((item) => (
              <View key={item.id} style={styles.requestCard}>
                <View style={styles.requestCardHeader}>
                  <Text style={styles.requestTitle}>{item.title}</Text>
                  <View style={[styles.statusTag, getStatusTagStyle(item.status)]}>
                    <Text style={styles.statusTagText}>{item.status}</Text>
                  </View>
                </View>
                {item.description ? (
                  <Text style={styles.requestDesc}>{item.description}</Text>
                ) : null}

                <View style={styles.actionRow}>
                  {item.status !== 'IN_PROGRESS' && item.status !== 'RESOLVED' && (
                    <TouchableOpacity
                      style={styles.actionButtonBlue}
                      onPress={() => handleUpdateStatus(item.id, 'IN_PROGRESS')}
                    >
                      <Text style={styles.actionButtonText}>Start Task</Text>
                    </TouchableOpacity>
                  )}
                  {item.status !== 'RESOLVED' && (
                    <TouchableOpacity
                      style={styles.actionButtonGreen}
                      onPress={() => handleUpdateStatus(item.id, 'RESOLVED')}
                    >
                      <Text style={styles.actionButtonText}>Mark Resolved</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 3. CLIENT Mobile View */}
        {user.role === 'CLIENT' && clientStats && (
          <View style={styles.roleSection}>
            <View style={styles.clientHeaderRow}>
              <Text style={styles.sectionTitle}>Service Portal</Text>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => setIsCreateModalOpen(true)}
              >
                <Ionicons name="add-circle" size={18} color="#FFFFFF" />
                <Text style={styles.createBtnText}>New Request</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Open Requests</Text>
                <Text style={[styles.metricValue, { color: '#059669' }]}>
                  {clientStats.openRequestsCount}
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Historical Total</Text>
                <Text style={styles.metricValue}>{clientStats.totalHistoricalRequestsCount}</Text>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>My Submitted Tickets</Text>
            {requests.map((item) => (
              <View key={item.id} style={styles.requestCard}>
                <View style={styles.requestCardHeader}>
                  <Text style={styles.requestTitle}>{item.title}</Text>
                  <View style={[styles.statusTag, getStatusTagStyle(item.status)]}>
                    <Text style={styles.statusTagText}>{item.status}</Text>
                  </View>
                </View>
                {item.description ? (
                  <Text style={styles.requestDesc}>{item.description}</Text>
                ) : null}
                <Text style={styles.requestMeta}>
                  Status: {item.status} • Specialist:{' '}
                  {item.employee ? item.employee.name : 'In Queue'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Profile Card Tab Content */}
        {activeTab === 'profile' && (
          <View style={[styles.roleSection, { marginTop: 20 }]}>
            <View style={styles.profileCard}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>{user.name.charAt(0)}</Text>
              </View>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={[styles.statusTag, { backgroundColor: '#EEF2FF', marginTop: 8 }]}>
                <Text style={{ color: '#4F46E5', fontWeight: '700' }}>{user.role}</Text>
              </View>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={18} color="#DC2626" />
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('dashboard')}
        >
          <Ionicons
            name={activeTab === 'dashboard' ? 'grid' : 'grid-outline'}
            size={22}
            color={activeTab === 'dashboard' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[
              styles.navItemText,
              activeTab === 'dashboard' && styles.navItemTextActive,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        {user.role === 'CLIENT' && (
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setIsCreateModalOpen(true)}
          >
            <Ionicons name="add-circle" size={26} color="#059669" />
            <Text style={[styles.navItemText, { color: '#059669', fontWeight: '700' }]}>
              Create
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'profile' ? '#2563EB' : '#64748B'}
          />
          <Text
            style={[
              styles.navItemText,
              activeTab === 'profile' && styles.navItemTextActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal: Client Create Request */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Service Request</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Subject / Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Account permission update"
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, { height: 90, textAlignVertical: 'top' }]}
                placeholder="Explain requirements..."
                multiline
                value={newDescription}
                onChangeText={setNewDescription}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#059669' }]}
              onPress={handleCreateRequest}
              disabled={isSubmittingRequest}
            >
              {isSubmittingRequest ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Submit Ticket</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getStatusTagStyle(status: string) {
  switch (status) {
    case 'PENDING':
      return { backgroundColor: '#FEF3C7' };
    case 'IN_PROGRESS':
      return { backgroundColor: '#DBEAFE' };
    case 'RESOLVED':
      return { backgroundColor: '#D1FAE5' };
    default:
      return { backgroundColor: '#F1F5F9' };
  }
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  brandBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  authSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#B91C1C',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  demoHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerRole: {
    fontSize: 12,
    color: '#64748B',
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  contentScroll: {
    padding: 16,
    paddingBottom: 80,
  },
  roleSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  singleMetricCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  requestCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  requestDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  requestMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  actionButtonBlue: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButtonGreen: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  clientHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4338CA',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
  },
  navItemText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  navItemTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
});
