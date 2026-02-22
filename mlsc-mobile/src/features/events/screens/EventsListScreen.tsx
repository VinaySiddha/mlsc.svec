import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Chip, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useEventStore } from '../../../store/eventStore';
import { Event } from '../../../types';

export default function EventsListScreen() {
  const navigation = useNavigation();
  const { events, isLoading, subscribeToEvents } = useEventStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToEvents();
    return () => unsubscribe();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Re-subscribe will trigger a fresh fetch
    const unsubscribe = subscribeToEvents();
    setTimeout(() => {
      setRefreshing(false);
      unsubscribe();
    }, 1000);
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date TBA';
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Date TBA';
    }
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Cover
        source={{
          uri: item.listImage || item.bannerImage || 'https://via.placeholder.com/400x200',
        }}
      />
      <Card.Title
        title={item.title}
        subtitle={`${formatDate(item.date)} • ${item.time || 'Time TBA'}`}
      />
      <Card.Content>
        <Text variant="bodyMedium" numberOfLines={3}>
          {item.description}
        </Text>
        <View style={styles.chipContainer}>
          {item.registrationOpen ? (
            <Chip icon="check-circle" mode="flat" style={styles.openChip}>
              Registration Open
            </Chip>
          ) : (
            <Chip icon="close-circle" mode="flat" style={styles.closedChip}>
              Registration Closed
            </Chip>
          )}
        </View>
      </Card.Content>
      <Card.Actions>
        {/* TODO: Add navigation to event detail */}
        {/* <Button onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}>
          View Details
        </Button> */}
      </Card.Actions>
    </Card>
  );

  if (isLoading && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0078D4" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading events...
        </Text>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall">No Events Yet</Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Check back later for upcoming events
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      renderItem={renderEventCard}
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
  emptyText: {
    marginTop: 8,
    opacity: 0.7,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  chipContainer: {
    marginTop: 12,
    flexDirection: 'row',
  },
  openChip: {
    backgroundColor: '#E8F5E9',
  },
  closedChip: {
    backgroundColor: '#FFEBEE',
  },
});
