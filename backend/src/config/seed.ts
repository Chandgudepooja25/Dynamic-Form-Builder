/**
 * Auto-seeds a fresh database with a demo admin, a demo user, and a sample
 * "Job Application" form that exercises conditional logic. Runs from the
 * server bootstrap once the DB is up.
 */

import * as usersRepo from '../repos/usersRepo';
import * as formsRepo from '../repos/formsRepo';
import { hashPassword } from '../utils/password';

const SAMPLE_FORM = {
  title: 'Job Application',
  description: 'A short example form demonstrating conditional logic.',
  isPublished: true,
  startQuestionId: 'q_name',
  questions: [
    {
      id: 'q_name',
      type: 'text' as const,
      title: "What's your full name?",
      placeholder: 'Jane Doe',
      validation: { required: true, minLength: 2, maxLength: 80 },
    },
    {
      id: 'q_email',
      type: 'email' as const,
      title: 'Your email address',
      placeholder: 'jane@example.com',
      validation: { required: true },
    },
    {
      id: 'q_role',
      type: 'radio' as const,
      title: 'Which role are you applying for?',
      options: [
        { id: 'o1', label: 'Frontend Engineer', value: 'frontend' },
        { id: 'o2', label: 'Backend Engineer', value: 'backend' },
        { id: 'o3', label: 'Full-stack Engineer', value: 'fullstack' },
        { id: 'o4', label: 'Something else', value: 'other' },
      ],
      validation: { required: true },
      logic: [{ operator: 'equals' as const, value: 'other', goTo: 'q_role_other' }],
      defaultNext: 'q_skills',
    },
    {
      id: 'q_role_other',
      type: 'text' as const,
      title: 'Tell us which role you have in mind',
      validation: { required: true, maxLength: 120 },
      defaultNext: 'q_skills',
    },
    {
      id: 'q_skills',
      type: 'checkbox' as const,
      title: 'Which languages do you know? (select all that apply)',
      options: [
        { id: 's1', label: 'JavaScript / TypeScript', value: 'js' },
        { id: 's2', label: 'Python', value: 'python' },
        { id: 's3', label: 'Go', value: 'go' },
        { id: 's4', label: 'Java', value: 'java' },
        { id: 's5', label: 'Rust', value: 'rust' },
      ],
      validation: { required: true },
      defaultNext: 'q_years',
    },
    {
      id: 'q_years',
      type: 'number' as const,
      title: 'Years of professional experience',
      validation: { required: true, minLength: 1, maxLength: 2 },
      logic: [{ operator: 'lt' as const, value: 2, goTo: 'q_portfolio' }],
      defaultNext: 'q_leadership',
    },
    {
      id: 'q_portfolio',
      type: 'text' as const,
      title: 'Share a link to a project or portfolio',
      placeholder: 'https://github.com/you/project',
      validation: {
        required: true,
        pattern: '^https?://.+',
        patternMessage: 'Please enter a valid URL',
      },
      defaultNext: 'q_availability',
    },
    {
      id: 'q_leadership',
      type: 'dropdown' as const,
      title: 'Have you led a team before?',
      options: [
        { id: 'l1', label: 'Yes, more than 3 years', value: 'senior' },
        { id: 'l2', label: 'Yes, 1-3 years', value: 'mid' },
        { id: 'l3', label: 'No, not yet', value: 'no' },
      ],
      validation: { required: true },
      defaultNext: 'q_availability',
    },
    {
      id: 'q_availability',
      type: 'textarea' as const,
      title: 'Anything else we should know?',
      placeholder: 'Optional notes about availability, notice period, etc.',
      validation: { required: false, maxLength: 500 },
      defaultNext: 'END',
    },
  ],
};

export async function seedIfEmpty() {
  const [userCount, formCount] = await Promise.all([
    usersRepo.countUsers(),
    formsRepo.countForms(),
  ]);

  if (userCount === 0 && formCount === 0) {
    console.log('[seed] empty database — seeding demo data');

    const admin = await usersRepo.createUser({
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash: await hashPassword('admin123'),
      role: 'admin',
    });

    await usersRepo.createUser({
      name: 'Regular User',
      email: 'user@example.com',
      passwordHash: await hashPassword('user123'),
      role: 'user',
    });

    await formsRepo.createForm({
      ...SAMPLE_FORM,
      createdBy: usersRepo.userToApi(admin).id,
    });
    console.log('[seed] created admin@example.com / user@example.com + sample form');
    return;
  }

  // Recover from partial seed (e.g. users created but sample form failed).
  if (userCount > 0 && formCount === 0) {
    const admin = await usersRepo.findUserByEmail('admin@example.com');
    if (admin) {
      console.log('[seed] no forms — adding sample Job Application form');
      await formsRepo.createForm({
        ...SAMPLE_FORM,
        createdBy: usersRepo.userToApi(admin).id,
      });
    }
  }
}
