import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Card, Text, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import apiClient from '../../../services/api';

const screenWidth = Dimensions.get('window').width;

interface AnalyticsData {
  totalApplications: number;
  attendedCount: number;
  hiredCount: number;
  rejectedCount: number;
  techDomainData: Array<{ name: string; count: number }>;
  nonTechDomainData: Array<{ name: string; count: number }>;
  statusData: Array<{ name: string; count: number }>;
  branchData: Array<{ name: string; count: number }>;
  yearData: Array<{ name: string; count: number }>;
}

export default function AnalyticsScreen() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewOnly, setInterviewOnly] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getAnalytics(interviewOnly === 'interview');
      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [interviewOnly]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAnalytics().finally(() => setRefreshing(false));
  }, [interviewOnly]);

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) => `rgba(0, 120, 212, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const getRandomColor = (index: number) => {
    const colors = [
      '#0078D4',
      '#00B7C3',
      '#8764B8',
      '#E81123',
      '#00CC6A',
      '#FFB900',
      '#FF8C00',
      '#E74856',
    ];
    return colors[index % colors.length];
  };

  const formatPieData = (dataArray: Array<{ name: string; count: number }>) => {
    return dataArray.map((item, index) => ({
      name: item.name,
      population: item.count,
      color: getRandomColor(index),
      legendFontColor: '#333',
      legendFontSize: 12,
    }));
  };

  if (isLoading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0078D4" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading analytics...
        </Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall">Unable to Load Analytics</Text>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  if (!data) return null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={interviewOnly}
          onValueChange={setInterviewOnly}
          buttons={[
            { value: 'all', label: 'All Applications' },
            { value: 'interview', label: 'Interviewed Only' },
          ]}
        />
      </View>

      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard} mode="elevated">
          <Card.Content>
            <Text variant="headlineLarge" style={styles.statNumber}>
              {data.totalApplications}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>
              Total Applications
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard} mode="elevated">
          <Card.Content>
            <Text variant="headlineLarge" style={styles.statNumber}>
              {data.attendedCount}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>
              Interviews Attended
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard} mode="elevated">
          <Card.Content>
            <Text variant="headlineLarge" style={[styles.statNumber, { color: '#4CAF50' }]}>
              {data.hiredCount}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>
              Hired
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.statCard} mode="elevated">
          <Card.Content>
            <Text variant="headlineLarge" style={[styles.statNumber, { color: '#F44336' }]}>
              {data.rejectedCount}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>
              Rejected
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Status Distribution */}
      {data.statusData.length > 0 && (
        <Card style={styles.chartCard} mode="elevated">
          <Card.Title title="Status Distribution" />
          <Card.Content>
            <PieChart
              data={formatPieData(data.statusData)}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card.Content>
        </Card>
      )}

      {/* Technical Domain Distribution */}
      {data.techDomainData.length > 0 && (
        <Card style={styles.chartCard} mode="elevated">
          <Card.Title title="Technical Domain Distribution" />
          <Card.Content>
            <PieChart
              data={formatPieData(data.techDomainData)}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card.Content>
        </Card>
      )}

      {/* Branch Distribution */}
      {data.branchData.length > 0 && (
        <Card style={styles.chartCard} mode="elevated">
          <Card.Title title="Branch Distribution" />
          <Card.Content>
            <BarChart
              data={{
                labels: data.branchData.map((d) => d.name),
                datasets: [
                  {
                    data: data.branchData.map((d) => d.count),
                  },
                ],
              }}
              width={screenWidth - 64}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={30}
              fromZero
            />
          </Card.Content>
        </Card>
      )}

      {/* Year Distribution */}
      {data.yearData.length > 0 && (
        <Card style={styles.chartCard} mode="elevated">
          <Card.Title title="Year of Study Distribution" />
          <Card.Content>
            <BarChart
              data={{
                labels: data.yearData.map((d) => d.name),
                datasets: [
                  {
                    data: data.yearData.map((d) => d.count),
                  },
                ],
              }}
              width={screenWidth - 64}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              fromZero
            />
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
  },
  errorText: {
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  filterContainer: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statNumber: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.7,
  },
  chartCard: {
    margin: 16,
    marginTop: 8,
  },
});
