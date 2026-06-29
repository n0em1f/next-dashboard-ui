/**
 * add-login-users.ts
 *
 * Run this AFTER your main seed (seed.ts).
 * It adds a small set of teachers and students that have REAL Clerk accounts,
 * so you can actually log in as them for the demo.
 *
 * - 6 teachers (one per specialization), each given lessons in classes
 *   that already contain students, so "My Students" shows results.
 * - 6 students placed in groups across different specializations.
 *
 * Everything else from your seed (the ~60 teachers and ~1200 students with
 * fake IDs) stays untouched — those remain as "name only" filler.
 *
 * Run with:  npx tsx prisma/add-login-users.ts
 */

import { PrismaClient, Day, UserSex } from '../src/generated/prisma';
import { createClerkClient } from '@clerk/backend';

const prisma = new PrismaClient();

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const days: Day[] = [
  Day.MONDAY,
  Day.TUESDAY,
  Day.WEDNESDAY,
  Day.THURSDAY,
  Day.FRIDAY,
];

// ---------------------------------------------------------------------------
// Helper: create a Clerk account, skipping (reusing) if the username exists.
// ---------------------------------------------------------------------------
async function createClerkUser(opts: {
  username: string;
  name: string;
  surname: string;
  role: 'teacher' | 'student';
  password: string;
}): Promise<string> {
  const existing = await clerkClient.users.getUserList({
    username: [opts.username],
  });

  if (existing.data.length > 0) {
    console.log(
      `  (already exists) ${opts.username} -> ${existing.data[0].id}`,
    );
    return existing.data[0].id;
  }

  const user = await clerkClient.users.createUser({
    username: opts.username,
    password: opts.password,
    firstName: opts.name,
    lastName: opts.surname,
    publicMetadata: { role: opts.role },
  });

  console.log(
    `  created ${opts.role}: ${opts.username} -> ${user.id}  (password: ${opts.password})`,
  );
  return user.id;
}

// ---------------------------------------------------------------------------
// The 6 login teachers — one per specialization, with real names.
// Each gets its own password: Academos1#, Academos2#, ...
// `subjectName` must be one of the subjects that exists in that specialization
// (see your seed.ts specializations list).
// ---------------------------------------------------------------------------
const LOGIN_TEACHERS = [
  {
    name: 'Daniel',
    surname: 'Hayes',
    prefix: 'CS',
    subjectName: 'Algorithms',
    password: 'Academos1#',
  },
  {
    name: 'Laura',
    surname: 'Bennett',
    prefix: 'ENG',
    subjectName: 'Mechanics',
    password: 'Academos2#',
  },
  {
    name: 'Marcus',
    surname: 'Reid',
    prefix: 'ACC',
    subjectName: 'Financial Accounting',
    password: 'Academos3#',
  },
  {
    name: 'Sophie',
    surname: 'Lane',
    prefix: 'SPT',
    subjectName: 'Human Anatomy',
    password: 'Academos4#',
  },
  {
    name: 'Thomas',
    surname: 'Ward',
    prefix: 'PED',
    subjectName: 'Educational Psychology',
    password: 'Academos5#',
  },
  {
    name: 'Rachel',
    surname: 'Cole',
    prefix: 'PSY',
    subjectName: 'General Psychology',
    password: 'Academos6#',
  },
].map((t) => ({
  ...t,
  username: `${t.name.toLowerCase()}${t.surname.toLowerCase()}`,
}));

// ---------------------------------------------------------------------------
// The 6 login students — real names, placed in groups across different
// specializations. Each gets its own password: Academos7#, Academos8#, ...
// ---------------------------------------------------------------------------
const LOGIN_STUDENTS = [
  {
    name: 'Oliver',
    surname: 'Frost',
    className: 'CS - First Year A',
    sex: UserSex.MALE,
    password: 'Academos7#',
  },
  {
    name: 'Hannah',
    surname: 'Webb',
    className: 'ENG - Second Year B',
    sex: UserSex.FEMALE,
    password: 'Academos8#',
  },
  {
    name: 'Nathan',
    surname: 'Page',
    className: 'ACC - Third Year A',
    sex: UserSex.MALE,
    password: 'Academos9#',
  },
  {
    name: 'Grace',
    surname: 'Hunt',
    className: 'SPT - First Year B',
    sex: UserSex.FEMALE,
    password: 'Academos10#',
  },
  {
    name: 'Adam',
    surname: 'Shaw',
    className: 'PED - Fourth Year A',
    sex: UserSex.MALE,
    password: 'Academos11#',
  },
  {
    name: 'Chloe',
    surname: 'Barnes',
    className: 'PSY - Second Year A',
    sex: UserSex.FEMALE,
    password: 'Academos12#',
  },
].map((s) => ({
  ...s,
  username: `${s.name.toLowerCase()}${s.surname.toLowerCase()}`,
}));

async function main() {
  console.log('=== LOGIN TEACHERS ===');

  for (const t of LOGIN_TEACHERS) {
    // 1. find the subject this teacher will teach
    const subject = await prisma.subject.findFirst({
      where: { name: t.subjectName },
      select: { id: true },
    });

    if (!subject) {
      console.log(
        `  ! Subject "${t.subjectName}" not found — did the seed run? Skipping ${t.username}.`,
      );
      continue;
    }

    // 2. find classes of this specialization that already have students
    //    (class names look like "CS - First Year A")
    const classes = await prisma.class.findMany({
      where: {
        name: { startsWith: `${t.prefix} - ` },
        students: { some: {} },
      },
      select: { id: true, name: true, gradeId: true },
      orderBy: { name: 'asc' },
      take: 2, // give the teacher lessons in 2 classes
    });

    if (classes.length === 0) {
      console.log(
        `  ! No ${t.prefix} classes with students found. Skipping ${t.username}.`,
      );
      continue;
    }

    // 3. create the Clerk account + teacher record
    const clerkId = await createClerkUser({
      username: t.username,
      name: t.name,
      surname: t.surname,
      role: 'teacher',
      password: t.password,
    });

    await prisma.teacher.upsert({
      where: { id: clerkId },
      update: {},
      create: {
        id: clerkId,
        username: t.username,
        name: t.name,
        surname: t.surname,
        email: `${t.username}@academos.com`,
        phone: null,
        address: '1 University Ave',
        bloodType: 'A+',
        sex: UserSex.MALE,
        birthday: new Date('1980-01-01'),
        description: `Professor specializing in ${t.subjectName}.`,
        subjects: { connect: [{ id: subject.id }] },
      },
    });

    // 4. create a lesson in each chosen class so the teacher has students
    let hour = 8;
    for (const cls of classes) {
      const start = new Date();
      start.setHours(hour, 0, 0, 0);
      const end = new Date();
      end.setHours(hour + 2, 0, 0, 0);
      hour += 2;

      await prisma.lesson.create({
        data: {
          name: `${t.subjectName} - Lecture`,
          day: days[hour % 5],
          startTime: start,
          endTime: end,
          subjectId: subject.id,
          classId: cls.id,
          teacherId: clerkId,
        },
      });
    }

    console.log(
      `  -> ${t.username} teaches in: ${classes.map((c) => c.name).join(', ')}`,
    );
  }

  console.log('\n=== LOGIN STUDENTS ===');

  for (const s of LOGIN_STUDENTS) {
    // find the target class by name
    const cls = await prisma.class.findFirst({
      where: { name: s.className },
      select: { id: true, gradeId: true, name: true },
    });

    if (!cls) {
      console.log(
        `  ! Class "${s.className}" not found — skipping ${s.username}.`,
      );
      continue;
    }

    const clerkId = await createClerkUser({
      username: s.username,
      name: s.name,
      surname: s.surname,
      role: 'student',
      password: s.password,
    });

    await prisma.student.upsert({
      where: { id: clerkId },
      update: {},
      create: {
        id: clerkId,
        username: s.username,
        name: s.name,
        surname: s.surname,
        email: `${s.username}@academos.com`,
        phone: null,
        address: '2 Student Ave',
        bloodType: 'O+',
        sex: s.sex,
        birthday: new Date('2004-06-15'),
        gradeId: cls.gradeId,
        classId: cls.id,
      },
    });

    console.log(`  -> ${s.username} placed in: ${cls.name}`);
  }

  console.log('\n=== DONE ===');
  console.log('Login teachers:');
  for (const t of LOGIN_TEACHERS) {
    console.log(`  ${t.username}  ->  ${t.password}`);
  }
  console.log('Login students:');
  for (const s of LOGIN_STUDENTS) {
    console.log(`  ${s.username}  ->  ${s.password}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('ERROR:', e);
    prisma.$disconnect();
    process.exit(1);
  });
