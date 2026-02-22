import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Card,
  Text,
  Chip,
  ActivityIndicator,
  Searchbar,
  Menu,
  Button,
  IconButton,
} from 'react-native-paper';
import { useApplicationStore } from '../../../store/applicationStore';
import { Application } from '../../../types';
import { APPLICATION_STATUSES, BRANCHES, YEARS, TECHNICAL_DOMAINS } from '../../../utils/validation';

export default function ApplicationsListScreen() {
  const {
    applications,
    isLoading,
    hasNextPage,
    filters,
    fetchApplications,
    setFilters,
    clearFilters,
    refreshApplications,
  } = useApplicationStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [domainMenuVisible, setDomainMenuVisible] = useState(false);

  useEffect(() => {
    fetchApplications(1);
  }, [filters]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshApplications().finally(() => setRefreshing(false));
  }, []);

  const loadMore = () => {
    if (!isLoading && hasNextPage) {
      fetchApplications(useApplicationStore.getState().currentPage + 1);
    }
  };

  const handleSearch = () => {
    setFilters({ search: searchQuery });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Received: '#E3F2FD',
      'Under Processing': '#FFF3E0',
      Interviewing: '#F3E5F5',
      Recommended: '#E8F5E9',
      Hired: '#C8E6C9',
      Rejected: '#FFEBEE',
    };
    return colors[status] || '#F5F5F5';
  };

  const renderApplicationCard = ({ item }: { item: Application }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Title
        title={item.name}
        subtitle={`${item.rollNo} • ${item.branch} ${item.section}`}
        right={(props) => (
          <View style={styles.cardRight}>
            {item.interviewAttended && (
              <Chip icon="check" compact style={styles.attendedChip}>
                Attended
              </Chip>
            )}
          </View>
        )}
      />
      <Card.Content>
        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>
            Email:
          </Text>
          <Text variant="bodySmall">{item.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>
            Year:
          </Text>
          <Text variant="bodySmall">{item.yearOfStudy}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" style={styles.label}>
            Domain:
          </Text>
          <Text variant="bodySmall">
            {TECHNICAL_DOMAINS.find((d) => d.id === item.technicalDomain)?.label}
          </Text>
        </View>

        {item.ratings && item.ratings.overall > 0 && (
          <View style={styles.infoRow}>
            <Text variant="bodySmall" style={styles.label}>
              Rating:
            </Text>
            <Text variant="bodySmall">⭐ {item.ratings.overall.toFixed(1)}/5</Text>
          </View>
        )}

        <Chip
          style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
          compact
        >
          {item.status}
        </Chip>
      </Card.Content>
      <Card.Actions>
        {/* TODO: Navigate to detail screen */}
        {/* <Button onPress={() => {}}>View Details</Button> */}
      </Card.Actions>
    </Card>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Menu
        visible={statusMenuVisible}
        onDismiss={() => setStatusMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setStatusMenuVisible(true)}
            icon="filter"
            compact
          >
            Status: {filters.status || 'All'}
          </Button>
        }
      >
        <Menu.Item
          onPress={() => {
            setFilters({ status: undefined });
            setStatusMenuVisible(false);
          }}
          title="All"
        />
        {APPLICATION_STATUSES.map((status) => (
          <Menu.Item
            key={status}
            onPress={() => {
              setFilters({ status });
              setStatusMenuVisible(false);
            }}
            title={status}
          />
        ))}
      </Menu>

      <Menu
        visible={domainMenuVisible}
        onDismiss={() => setDomainMenuVisible(false)}
        anchor={
          <Button
            mode="outlined"
            onPress={() => setDomainMenuVisible(true)}
            icon="domain"
            compact
            style={styles.filterButton}
          >
            Domain: {TECHNICAL_DOMAINS.find((d) => d.id === filters.domain)?.label || 'All'}
          </Button>
        }
      >
        <Menu.Item
          onPress={() => {
            setFilters({ domain: undefined });
            setDomainMenuVisible(false);
          }}
          title="All"
        />
        {TECHNICAL_DOMAINS.map((domain) => (
          <Menu.Item
            key={domain.id}
            onPress={() => {
              setFilters({ domain: domain.id });
              setDomainMenuVisible(false);
            }}
            title={domain.label}
          />
        ))}
      </Menu>

      {Object.keys(filters).length > 0 && (
        <IconButton icon="close" onPress={clearFilters} />
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator color="#0078D4" />
      </View>
    );
  };

  if (isLoading && applications.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0078D4" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading applications...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by roll number or name"
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
      />

      {renderFilters()}

      <FlatList
        data={applications}
        renderItem={renderApplicationCard}
        keyExtractor={(item) => item.firestoreId}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="headlineSmall">No Applications Found</Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Try adjusting your filters
            </Text>
          </View>
        }
      />
    </View>
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
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    marginLeft: 8,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardRight: {
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: '600',
    marginRight: 8,
    width: 60,
  },
  statusChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  attendedChip: {
    backgroundColor: '#E8F5E9',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    opacity: 0.7,
  },
});
