
'use server';

import {config} from 'dotenv';
config();

import '@/ai/flows/summarize-resume';
import '@/ai/flows/evaluate-candidate';
import '@/ai/flows/send-confirmation-email';
