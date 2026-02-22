import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, HelperText, Surface } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import { applicationSchema, BRANCHES, SECTIONS, YEARS, TECHNICAL_DOMAINS, NON_TECHNICAL_DOMAINS } from '../../../utils/validation';
import apiClient from '../../../services/api';

type FormData = {
  name: string;
  email: string;
  phone: string;
  rollNo: string;
  branch: string;
  section: string;
  yearOfStudy: string;
  cgpa: string;
  backlogs: string;
  joinReason: string;
  aboutClub: string;
  technicalDomain: string;
  nonTechnicalDomain: string;
  linkedin?: string;
  anythingElse?: string;
};

export default function ApplyScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [resumeFile, setResumeFile] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(applicationSchema),
    mode: 'onBlur',
  });

  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (file.size && file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'Resume file must be under 5MB');
          return;
        }
        setResumeFile(file);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const nextStep = async () => {
    // Validate current step fields before proceeding
    let fieldsToValidate: (keyof FormData)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ['name', 'email', 'phone', 'rollNo'];
        break;
      case 1:
        fieldsToValidate = ['branch', 'section', 'yearOfStudy', 'cgpa', 'backlogs'];
        break;
      case 2:
        fieldsToValidate = ['joinReason', 'aboutClub'];
        break;
      case 3:
        fieldsToValidate = ['technicalDomain', 'nonTechnicalDomain'];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });

      // Add resume if selected
      if (resumeFile) {
        formData.append('resume', {
          uri: resumeFile.uri,
          type: 'application/pdf',
          name: resumeFile.name,
        } as any);
      }

      const response = await apiClient.submitApplication(formData);

      if (response.success && response.data?.referenceId) {
        setReferenceId(response.data.referenceId);
        setSubmitSuccess(true);
        Alert.alert(
          'Success!',
          `Application submitted successfully!\n\nYour Reference ID: ${response.data.referenceId}\n\nPlease save this for future reference.`
        );
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <View style={styles.successContainer}>
        <Text variant="headlineLarge" style={styles.successTitle}>
          ✓ Application Submitted!
        </Text>
        <Surface style={styles.refIdCard} elevation={2}>
          <Text variant="titleMedium" style={styles.refIdLabel}>
            Your Reference ID:
          </Text>
          <Text variant="headlineSmall" style={styles.refId}>
            {referenceId}
          </Text>
          <Text variant="bodyMedium" style={styles.refIdNote}>
            Please save this ID to track your application status
          </Text>
        </Surface>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.stepIndicator}>
          <Text variant="bodyLarge" style={styles.stepText}>
            Step {currentStep + 1} of 5
          </Text>
        </View>

        {/* Step 0: Personal Info */}
        {currentStep === 0 && (
          <View style={styles.stepContainer}>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Personal Information
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Full Name *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.name}
                  />
                  {errors.name && <HelperText type="error">{errors.name.message}</HelperText>}
                </>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Email Address *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    error={!!errors.email}
                  />
                  {errors.email && <HelperText type="error">{errors.email.message}</HelperText>}
                </>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Phone Number *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    keyboardType="phone-pad"
                    style={styles.input}
                    error={!!errors.phone}
                  />
                  {errors.phone && <HelperText type="error">{errors.phone.message}</HelperText>}
                </>
              )}
            />

            <Controller
              control={control}
              name="rollNo"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Roll Number *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    style={styles.input}
                    error={!!errors.rollNo}
                  />
                  {errors.rollNo && <HelperText type="error">{errors.rollNo.message}</HelperText>}
                </>
              )}
            />
          </View>
        )}

        {/* Step 1: Academic Info */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Academic Information
            </Text>

            <Controller
              control={control}
              name="branch"
              render={({ field: { onChange, value } }) => (
                <>
                  <Text variant="bodyMedium" style={styles.fieldLabel}>
                    Branch *
                  </Text>
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    buttons={BRANCHES.map((branch) => ({ value: branch, label: branch }))}
                    style={styles.segmentedButtons}
                  />
                  {errors.branch && <HelperText type="error">{errors.branch.message}</HelperText>}
                </>
              )}
            />

            <Controller
              control={control}
              name="section"
              render={({ field: { onChange, value } }) => (
                <>
                  <Text variant="bodyMedium" style={styles.fieldLabel}>
                    Section *
                  </Text>
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    buttons={SECTIONS.map((section) => ({ value: section, label: section }))}
                    style={styles.segmentedButtons}
                  />
                  {errors.section && <HelperText type="error">{errors.section.message}</HelperText>}
                </>
              )}
            />

            <Controller
              control={control}
              name="yearOfStudy"
              render={({ field: { onChange, value } }) => (
                <>
                  <Text variant="bodyMedium" style={styles.fieldLabel}>
                    Year of Study *
                  </Text>
                  <SegmentedButtons
                    value={value}
                    onValueChange={onChange}
                    buttons={YEARS.map((year) => ({ value: year, label: year }))}
                    style={styles.segmentedButtons}
                  />
                  {errors.yearOfStudy && (
                    <HelperText type="error">{errors.yearOfStudy.message}</HelperText>
                  )}
                </>
              )}
            />

            <Controller
              control={control}
              name="cgpa"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="CGPA *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    keyboardType="decimal-pad"
                    style={styles.input}
                    error={!!errors.cgpa}
                  />
                  {errors.cgpa && <HelperText type="error">{errors.cgpa.message}</HelperText>}
                </>
              )}
            />

            <Controller
              control={control}
              name="backlogs"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Number of Backlogs *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    keyboardType="number-pad"
                    style={styles.input}
                    error={!!errors.backlogs}
                  />
                  {errors.backlogs && <HelperText type="error">{errors.backlogs.message}</HelperText>}
                </>
              )}
            />
          </View>
        )}

        {/* Step 2: Motivational Questions */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Tell Us About Yourself
            </Text>

            <Controller
              control={control}
              name="joinReason"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="Why do you want to join MLSC? *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                    error={!!errors.joinReason}
                  />
                  {errors.joinReason && (
                    <HelperText type="error">{errors.joinReason.message}</HelperText>
                  )}
                </>
              )}
            />

            <Controller
              control={control}
              name="aboutClub"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="What do you know about MLSC? *"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                    error={!!errors.aboutClub}
                  />
                  {errors.aboutClub && (
                    <HelperText type="error">{errors.aboutClub.message}</HelperText>
                  )}
                </>
              )}
            />
          </View>
        )}

        {/* Step 3: Domain Selection */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Domain Selection
            </Text>

            <Controller
              control={control}
              name="technicalDomain"
              render={({ field: { onChange, value } }) => (
                <>
                  <Text variant="bodyMedium" style={styles.fieldLabel}>
                    Technical Domain *
                  </Text>
                  {TECHNICAL_DOMAINS.map((domain) => (
                    <Button
                      key={domain.id}
                      mode={value === domain.id ? 'contained' : 'outlined'}
                      onPress={() => onChange(domain.id)}
                      style={styles.domainButton}
                    >
                      {domain.label}
                    </Button>
                  ))}
                  {errors.technicalDomain && (
                    <HelperText type="error">{errors.technicalDomain.message}</HelperText>
                  )}
                </>
              )}
            />

            <Controller
              control={control}
              name="nonTechnicalDomain"
              render={({ field: { onChange, value } }) => (
                <>
                  <Text variant="bodyMedium" style={styles.fieldLabel}>
                    Non-Technical Domain *
                  </Text>
                  {NON_TECHNICAL_DOMAINS.map((domain) => (
                    <Button
                      key={domain.id}
                      mode={value === domain.id ? 'contained' : 'outlined'}
                      onPress={() => onChange(domain.id)}
                      style={styles.domainButton}
                    >
                      {domain.label}
                    </Button>
                  ))}
                  {errors.nonTechnicalDomain && (
                    <HelperText type="error">{errors.nonTechnicalDomain.message}</HelperText>
                  )}
                </>
              )}
            />
          </View>
        )}

        {/* Step 4: Additional Info */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text variant="headlineSmall" style={styles.stepTitle}>
              Additional Information
            </Text>

            <Button
              mode={resumeFile ? 'contained-tonal' : 'outlined'}
              onPress={pickResume}
              icon="file-document"
              style={styles.input}
            >
              {resumeFile ? `Resume: ${resumeFile.name}` : 'Upload Resume (Optional)'}
            </Button>

            <Controller
              control={control}
              name="linkedin"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    label="LinkedIn Profile (Optional)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    mode="outlined"
                    autoCapitalize="none"
                    style={styles.input}
                    error={!!errors.linkedin}
                  />
                  {errors.linkedin && (
                    <HelperText type="error">{errors.linkedin.message}</HelperText>
                  )}
                </>
              )}
            />

            <Controller
              control={control}
              name="anythingElse"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Anything else you'd like to share? (Optional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                />
              )}
            />
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <Button mode="outlined" onPress={prevStep} style={styles.navButton}>
              Previous
            </Button>
          )}
          {currentStep < 4 ? (
            <Button mode="contained" onPress={nextStep} style={styles.navButton}>
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.navButton}
            >
              Submit Application
            </Button>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  stepIndicator: {
    marginBottom: 16,
  },
  stepText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  stepContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  fieldLabel: {
    marginBottom: 8,
    marginTop: 12,
    fontWeight: '600',
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  domainButton: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successTitle: {
    color: '#4CAF50',
    marginBottom: 32,
    textAlign: 'center',
  },
  refIdCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  refIdLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  refId: {
    fontWeight: 'bold',
    color: '#0078D4',
    marginBottom: 16,
  },
  refIdNote: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
