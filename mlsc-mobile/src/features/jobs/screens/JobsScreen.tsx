import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Linking } from 'react-native';
import { Card, Text, Chip, Button, ActivityIndicator } from 'react-native-paper';
import apiClient from '../../../services/api';
import { Job } from '../../../types';

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.getJobs();
      if (response.success && response.data?.jobs) {
        setJobs(response.data.jobs);
      } else {
        setError(response.data?.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchJobs().finally(() => setRefreshing(false));
  }, []);

  const handleApplyPress = (url: string) => {
    Linking.openURL(url);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Recently';
    }
  };

  const renderJobCard = ({ item }: { item: Job }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Title title={item.title} subtitle={item.company} />
      <Card.Content>
        <View style={styles.metaContainer}>
          <Chip icon="map-marker" compact>
            {item.location}
          </Chip>
          <Chip icon="briefcase" compact style={styles.typeChip}>
            {item.type}
          </Chip>
          <Chip icon="clock" compact>
            {formatDate(item.posted_on)}
          </Chip>
        </View>

        <Text variant="bodyMedium" numberOfLines={4} style={styles.description}>
          {item.description.replace(/<[^>]*>/g, '')}
        </Text>

        {item.skills && item.skills.length > 0 && (
          <View style={styles.skillsContainer}>
            {item.skills.slice(0, 5).map((skill, index) => (
              <Chip key={index} compact style={styles.skillChip}>
                {skill}
              </Chip>
            ))}
          </View>
        )}
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => handleApplyPress(item.apply_link)}>
          Apply Now
        </Button>
      </Card.Actions>
    </Card>
  );

  if (isLoading && jobs.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0078D4" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading job listings...
        </Text>
      </View>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall">Unable to Load Jobs</Text>
        <Text variant="bodyMedium" style={styles.errorText}>
          {error}
        </Text>
        <Button mode="contained" onPress={fetchJobs} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall">No Jobs Available</Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Check back later for new opportunities
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={jobs}
      renderItem={renderJobCard}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
}

const styles = StyleSheet.create({
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
  emptyText: {
    marginTop: 8,
    opacity: 0.7,
  },
  retryButton: {
    marginTop: 16,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  typeChip: {
    marginLeft: 4,
  },
  description: {
    marginTop: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  skillChip: {
    backgroundColor: '#E3F2FD',
  },
});
