import React, { useEffect } from 'react';
import { View, StyleSheet, SectionList, RefreshControl, Linking } from 'react-native';
import { Card, Text, Avatar, ActivityIndicator, IconButton } from 'react-native-paper';
import { useTeamStore } from '../../../store/teamStore';
import { TeamMember } from '../../../types';

export default function TeamScreen() {
  const { teamMembers, categories, isLoading, subscribeToTeamMembers, fetchCategories } =
    useTeamStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToTeamMembers();
    fetchCategories();
    return () => unsubscribe();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchCategories();
    const unsubscribe = subscribeToTeamMembers();
    setTimeout(() => {
      setRefreshing(false);
      unsubscribe();
    }, 1000);
  }, []);

  const handleLinkedInPress = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  // Group members by category
  const sections = categories.map((category) => ({
    title: category.name,
    subDomain: category.subDomain,
    data: teamMembers.filter((member) => member.categoryId === category.id),
  }));

  const renderMemberCard = ({ item }: { item: TeamMember }) => (
    <Card style={styles.memberCard} mode="elevated">
      <Card.Content style={styles.memberContent}>
        <Avatar.Image
          size={60}
          source={{
            uri: item.image || 'https://via.placeholder.com/60',
          }}
        />
        <View style={styles.memberInfo}>
          <Text variant="titleMedium" style={styles.memberName}>
            {item.name}
          </Text>
          <Text variant="bodyMedium" style={styles.memberRole}>
            {item.role}
          </Text>
        </View>
        {item.linkedin && (
          <IconButton
            icon="linkedin"
            size={24}
            onPress={() => handleLinkedInPress(item.linkedin)}
          />
        )}
      </Card.Content>
    </Card>
  );

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text variant="headlineSmall" style={styles.sectionTitle}>
        {section.title}
      </Text>
      {section.subDomain && (
        <Text variant="bodyMedium" style={styles.sectionSubtitle}>
          {section.subDomain}
        </Text>
      )}
    </View>
  );

  if (isLoading && teamMembers.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0078D4" />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading team members...
        </Text>
      </View>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall">No Team Members Yet</Text>
        <Text variant="bodyMedium" style={styles.emptyText}>
          Team information will appear here
        </Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      renderItem={renderMemberCard}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      stickySectionHeadersEnabled={false}
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
  sectionHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  memberCard: {
    marginBottom: 12,
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
  },
  memberName: {
    fontWeight: '600',
  },
  memberRole: {
    opacity: 0.7,
    marginTop: 2,
  },
});
