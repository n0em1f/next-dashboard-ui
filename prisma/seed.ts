// import { Day, PrismaClient, UserSex } from '@prisma/client';
// const prisma = new PrismaClient();

// async function main() {
//   await prisma.attendance.deleteMany();
//   await prisma.result.deleteMany();
//   await prisma.exam.deleteMany();
//   await prisma.assignment.deleteMany();
//   await prisma.lesson.deleteMany();
//   await prisma.student.deleteMany();
//   await prisma.parent.deleteMany();
//   await prisma.teacher.deleteMany();
//   await prisma.class.deleteMany();
//   await prisma.subject.deleteMany();
//   await prisma.grade.deleteMany();
//   await prisma.admin.deleteMany();
//   // ADMIN

//   await prisma.admin.create({
//     data: {
//       id: 'admin1',
//       username: 'admin1',
//     },
//   });
//   await prisma.admin.create({
//     data: {
//       id: 'admin2',
//       username: 'admin2',
//     },
//   });

//   // GRADE
//   for (let i = 1; i <= 6; i++) {
//     await prisma.grade.create({
//       data: {
//         level: i,
//       },
//     });
//   }

//   // CLASS
//   for (let i = 1; i <= 6; i++) {
//     await prisma.class.create({
//       data: {
//         name: `${i}A`,
//         gradeId: i,
//         capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
//       },
//     });
//   }

//   // SUBJECT
//   const subjectData = [
//     { name: 'Mathematics' },
//     { name: 'Science' },
//     { name: 'English' },
//     { name: 'History' },
//     { name: 'Geography' },
//     { name: 'Physics' },
//     { name: 'Chemistry' },
//     { name: 'Biology' },
//     { name: 'Computer Science' },
//     { name: 'Art' },
//   ];

//   for (const subject of subjectData) {
//     await prisma.subject.create({ data: subject });
//   }

//   // TEACHER
//   for (let i = 1; i <= 15; i++) {
//     await prisma.teacher.create({
//       data: {
//         id: `teacher${i}`, // Unique ID for the teacher
//         username: `teacher${i}`,
//         name: `TName${i}`,
//         surname: `TSurname${i}`,
//         email: `teacher${i}@example.com`,
//         phone: `123-456-789${i}`,
//         address: `Address${i}`,
//         bloodType: 'A+',
//         sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
//         subjects: { connect: [{ id: (i % 10) + 1 }] },
//         classes: { connect: [{ id: (i % 6) + 1 }] },
//         birthday: new Date(
//           new Date().setFullYear(new Date().getFullYear() - 30),
//         ),
//       },
//     });
//   }

//   // LESSON
//   for (let i = 1; i <= 30; i++) {
//     await prisma.lesson.create({
//       data: {
//         name: `Lesson${i}`,
//         day: Day[
//           Object.keys(Day)[
//             Math.floor(Math.random() * Object.keys(Day).length)
//           ] as keyof typeof Day
//         ],
//         startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
//         endTime: new Date(new Date().setHours(new Date().getHours() + 3)),
//         subjectId: (i % 10) + 1,
//         classId: (i % 6) + 1,
//         teacherId: `teacher${(i % 15) + 1}`,
//       },
//     });
//   }

//   // PARENT
//   for (let i = 1; i <= 25; i++) {
//     await prisma.parent.create({
//       data: {
//         id: `parentId${i}`,
//         username: `parentId${i}`,
//         name: `PName ${i}`,
//         surname: `PSurname ${i}`,
//         email: `parent${i}@example.com`,
//         phone: `123-456-789${i}`,
//         address: `Address${i}`,
//       },
//     });
//   }

//   // STUDENT
//   for (let i = 1; i <= 50; i++) {
//     await prisma.student.create({
//       data: {
//         id: `student${i}`,
//         username: `student${i}`,
//         name: `SName${i}`,
//         surname: `SSurname ${i}`,
//         email: `student${i}@example.com`,
//         phone: `987-654-321${i}`,
//         address: `Address${i}`,
//         bloodType: 'O-',
//         sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
//         parentId: `parentId${Math.ceil(i / 2) % 25 || 25}`,
//         gradeId: (i % 6) + 1,
//         classId: (i % 6) + 1,
//         birthday: new Date(
//           new Date().setFullYear(new Date().getFullYear() - 10),
//         ),
//       },
//     });
//   }

//   // EXAM
//   for (let i = 1; i <= 10; i++) {
//     await prisma.exam.create({
//       data: {
//         title: `Exam ${i}`,
//         startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
//         endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
//         lessonId: (i % 30) + 1,
//       },
//     });
//   }

//   // ASSIGNMENT
//   for (let i = 1; i <= 10; i++) {
//     await prisma.assignment.create({
//       data: {
//         title: `Assignment ${i}`,
//         startDate: new Date(new Date().setHours(new Date().getHours() + 1)),
//         dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
//         lessonId: (i % 30) + 1,
//       },
//     });
//   }

//   // RESULT
//   for (let i = 1; i <= 10; i++) {
//     await prisma.result.create({
//       data: {
//         score: 90,
//         studentId: `student${i}`,
//         ...(i <= 5 ? { examId: i } : { assignmentId: i - 5 }),
//       },
//     });
//   }

//   // ATTENDANCE
//   for (let i = 1; i <= 10; i++) {
//     await prisma.attendance.create({
//       data: {
//         date: new Date(),
//         present: true,
//         studentId: `student${i}`,
//         lessonId: (i % 30) + 1,
//       },
//     });
//   }

//   // EVENT
//   for (let i = 1; i <= 5; i++) {
//     await prisma.event.create({
//       data: {
//         title: `Event ${i}`,
//         description: `Description for Event ${i}`,
//         startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
//         endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
//         classId: (i % 5) + 1,
//       },
//     });
//   }

//   // ANNOUNCEMENT
//   for (let i = 1; i <= 5; i++) {
//     await prisma.announcement.create({
//       data: {
//         title: `Announcement ${i}`,
//         description: `Description for Announcement ${i}`,
//         date: new Date(),
//         classId: (i % 5) + 1,
//       },
//     });
//   }

//   console.log('Seeding completed successfully.');
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

import { Day, PrismaClient, UserSex } from '@prisma/client';
const prisma = new PrismaClient();

const specializations = [
  {
    name: 'Computer Science',
    prefix: 'CS',
    subjects: [
      'Algorithms',
      'Data Structures',
      'Operating Systems',
      'Computer Networks',
      'Database Systems',
      'Software Engineering',
      'Artificial Intelligence',
      'Web Development',
      'Cybersecurity',
      'Machine Learning',
    ],
  },
  {
    name: 'Engineering',
    prefix: 'ENG',
    subjects: [
      'Mechanics',
      'Thermodynamics',
      'Electrical Circuits',
      'Materials Science',
      'Fluid Dynamics',
      'Control Systems',
      'Signal Processing',
      'Robotics',
      'CAD Design',
      'Industrial Engineering',
    ],
  },
  {
    name: 'Accounting',
    prefix: 'ACC',
    subjects: [
      'Financial Accounting',
      'Managerial Accounting',
      'Auditing',
      'Tax Law',
      'Corporate Finance',
      'Cost Accounting',
      'Business Law',
      'Business Statistics',
      'Macroeconomics',
      'Financial Reporting',
    ],
  },
  {
    name: 'Sports Science',
    prefix: 'SPT',
    subjects: [
      'Human Anatomy',
      'Exercise Physiology',
      'Sports Psychology',
      'Sports Nutrition',
      'Biomechanics',
      'Athletic Training',
      'Sports Medicine',
      'Physical Education Theory',
      'Coaching Methods',
      'Sports Management',
    ],
  },
  {
    name: 'Pedagogy',
    prefix: 'PED',
    subjects: [
      'Educational Psychology',
      'Curriculum Design',
      'Classroom Management',
      'Child Development',
      'Special Education',
      'Assessment Methods',
      'Learning Theories',
      'Educational Technology',
      'Early Childhood Education',
      'Inclusive Education',
    ],
  },
  {
    name: 'Psychology',
    prefix: 'PSY',
    subjects: [
      'General Psychology',
      'Cognitive Psychology',
      'Social Psychology',
      'Developmental Psychology',
      'Clinical Psychology',
      'Neuropsychology',
      'Psychological Research Methods',
      'Abnormal Psychology',
      'Counseling Techniques',
      'Behavioral Therapy',
    ],
  },
];

const yearNames = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
const days: Day[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

// 60 unique teacher names
const teacherNames: [string, string][] = [
  ['James', 'Smith'],
  ['Emma', 'Johnson'],
  ['Oliver', 'Williams'],
  ['Sophia', 'Brown'],
  ['William', 'Jones'],
  ['Isabella', 'Garcia'],
  ['Benjamin', 'Miller'],
  ['Mia', 'Davis'],
  ['Lucas', 'Rodriguez'],
  ['Charlotte', 'Martinez'],
  ['Henry', 'Hernandez'],
  ['Amelia', 'Lopez'],
  ['Alexander', 'Wilson'],
  ['Harper', 'Anderson'],
  ['Michael', 'Taylor'],
  ['Evelyn', 'Thomas'],
  ['Daniel', 'White'],
  ['Abigail', 'Harris'],
  ['Matthew', 'Martin'],
  ['Emily', 'Thompson'],
  ['Joseph', 'Moore'],
  ['Elizabeth', 'Jackson'],
  ['Samuel', 'Lee'],
  ['Sofia', 'Perez'],
  ['David', 'Hall'],
  ['Avery', 'Young'],
  ['Andrew', 'Allen'],
  ['Ella', 'Sanchez'],
  ['Ryan', 'Wright'],
  ['Scarlett', 'King'],
  ['Nathan', 'Scott'],
  ['Chloe', 'Green'],
  ['Christopher', 'Baker'],
  ['Penelope', 'Adams'],
  ['Joshua', 'Nelson'],
  ['Layla', 'Hill'],
  ['Ethan', 'Ramirez'],
  ['Zoey', 'Campbell'],
  ['Sebastian', 'Mitchell'],
  ['Nora', 'Roberts'],
  ['Owen', 'Carter'],
  ['Lily', 'Phillips'],
  ['Caleb', 'Evans'],
  ['Eleanor', 'Turner'],
  ['Liam', 'Torres'],
  ['Hannah', 'Parker'],
  ['Mason', 'Collins'],
  ['Lillian', 'Edwards'],
  ['Logan', 'Stewart'],
  ['Addison', 'Flores'],
  ['Elijah', 'Morris'],
  ['Aubrey', 'Nguyen'],
  ['Carter', 'Murphy'],
  ['Ellie', 'Rivera'],
  ['Luke', 'Cook'],
  ['Stella', 'Rogers'],
  ['Dylan', 'Morgan'],
  ['Natalie', 'Peterson'],
  ['Jack', 'Cooper'],
  ['Grace', 'Reed'],
];

const studentFirstNames = [
  'Adam',
  'Alice',
  'Aaron',
  'Anna',
  'Blake',
  'Brianna',
  'Brandon',
  'Beth',
  'Cameron',
  'Claire',
  'Colin',
  'Cora',
  'Derek',
  'Diana',
  'Drew',
  'Daisy',
  'Evan',
  'Elena',
  'Felix',
  'Fiona',
  'George',
  'Gwen',
  'Harry',
  'Helen',
  'Hugo',
  'Holly',
  'Ian',
  'Iris',
  'Jake',
  'Julia',
  'Joel',
  'Jenny',
  'Kyle',
  'Karen',
  'Kevin',
  'Kate',
  'Leo',
  'Laura',
  'Mark',
  'Maya',
  'Max',
  'Megan',
  'Neil',
  'Nina',
  'Noah',
  'Nancy',
  'Oscar',
  'Olivia',
  'Patrick',
  'Paula',
  'Peter',
  'Paige',
  'Ross',
  'Rachel',
  'Sean',
  'Sara',
  'Tyler',
  'Tara',
  'Victor',
  'Vera',
  'Wade',
  'Wendy',
  'Xavier',
  'Xena',
  'Yusuf',
  'Yana',
  'Zack',
  'Zoe',
];

const studentLastNames = [
  'Abbott',
  'Barnes',
  'Carson',
  'Dixon',
  'Ellis',
  'Fisher',
  'Grant',
  'Hayes',
  'Ingram',
  'Jensen',
  'Klein',
  'Lambert',
  'Mason',
  'Nash',
  'Owen',
  'Price',
  'Quinn',
  'Reed',
  'Stone',
  'Turner',
  'Underwood',
  'Vance',
  'Walsh',
  'York',
  'Zhang',
];

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const publicationTitles = [
  'Advanced Topics in Modern Research',
  'Foundations of Contemporary Theory',
  'Practical Applications in the Field',
  'A Comprehensive Study Guide',
  'Introduction to Core Concepts',
  'Research Methodology and Practice',
  'Emerging Trends and Future Directions',
  'Case Studies and Real-World Applications',
  'Theoretical Framework for Analysis',
  'Innovations in Teaching and Learning',
];

const publicationTypes = [
  'Book',
  'Article',
  'Research Paper',
  'Thesis',
  'Conference Paper',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBirthday(minAge: number, maxAge: number): Date {
  const now = new Date();
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  return new Date(
    now.getFullYear() - age,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1,
  );
}

async function main() {
  console.log('Clearing existing data...');
  await prisma.attendance.deleteMany();
  await prisma.result.deleteMany();
  await prisma.publication.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.admin.deleteMany();

  console.log('Creating admin...');
  await prisma.admin.create({ data: { id: 'admin1', username: 'admin' } });

  console.log('Creating grades...');
  const gradeIds: number[] = [];
  for (let i = 1; i <= 4; i++) {
    const grade = await prisma.grade.create({ data: { level: i } });
    gradeIds.push(grade.id);
  }

  console.log('Creating subjects...');
  // subjectIds[prefix] = [id0, id1, ..., id9]
  const subjectIds: Record<string, number[]> = {};
  for (const spec of specializations) {
    subjectIds[spec.prefix] = [];
    for (const subjectName of spec.subjects) {
      const subject = await prisma.subject.create({
        data: { name: subjectName },
      });
      subjectIds[spec.prefix].push(subject.id);
    }
  }

  console.log('Creating classes...');
  // classIds[prefix] = [[yearAId, yearBId], [yearAId, yearBId], ...]  (4 years x 2 groups)
  const classIds: Record<string, number[][]> = {};
  for (const spec of specializations) {
    classIds[spec.prefix] = [];
    for (let year = 0; year < 4; year++) {
      const yearGroup: number[] = [];
      for (const group of ['A', 'B']) {
        const cls = await prisma.class.create({
          data: {
            name: `${spec.prefix} - ${yearNames[year]} ${group}`,
            capacity: 25,
            gradeId: gradeIds[year],
          },
        });
        yearGroup.push(cls.id);
      }
      classIds[spec.prefix].push(yearGroup);
    }
  }

  console.log('Creating teachers...');
  // 6 specializations x 10 teachers = 60 teachers
  // Each teacher teaches 1-2 subjects from their specialization
  // Each subject is taught to specific year groups
  const teacherIds: Record<string, string[]> = {};
  let teacherCount = 0;

  for (const spec of specializations) {
    teacherIds[spec.prefix] = [];

    // 10 teachers per specialization
    // Teacher 0-1: subjects 0,1 → Years 1,2
    // Teacher 2-3: subjects 2,3 → Years 1,2
    // Teacher 4-5: subjects 4,5 → Years 3,4
    // Teacher 6-7: subjects 6,7 → Years 3,4
    // Teacher 8:   subjects 8,9 → Years 1,2,3,4
    // Teacher 9:   subjects 8,9 → Years 1,2,3,4

    const teacherSubjectMap: number[][] = [
      [0, 1], // teacher 0
      [0, 1], // teacher 1
      [2, 3], // teacher 2
      [2, 3], // teacher 3
      [4, 5], // teacher 4
      [4, 5], // teacher 5
      [6, 7], // teacher 6
      [6, 7], // teacher 7
      [8, 9], // teacher 8
      [8, 9], // teacher 9
    ];

    const teacherYearMap: number[][] = [
      [0, 1], // teacher 0 → year 1,2
      [0, 1], // teacher 1 → year 1,2
      [0, 1], // teacher 2 → year 1,2
      [0, 1], // teacher 3 → year 1,2
      [2, 3], // teacher 4 → year 3,4
      [2, 3], // teacher 5 → year 3,4
      [2, 3], // teacher 6 → year 3,4
      [2, 3], // teacher 7 → year 3,4
      [0, 1, 2, 3], // teacher 8 → all years
      [0, 1, 2, 3], // teacher 9 → all years
    ];

    for (let i = 0; i < 10; i++) {
      const [firstName, lastName] = teacherNames[teacherCount];
      const teacherId = `teacher_${spec.prefix.toLowerCase()}_${i + 1}`;
      const subjectIndices = teacherSubjectMap[i];
      const connectedSubjectIds = subjectIndices.map((idx) => ({
        id: subjectIds[spec.prefix][idx],
      }));

      const teacher = await prisma.teacher.create({
        data: {
          id: teacherId,
          username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
          name: firstName,
          surname: lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@academos.com`,
          phone: `+1-555-${String(teacherCount + 1).padStart(3, '0')}-${String((i + 1) * 100).padStart(4, '0')}`,
          address: `${(teacherCount + 1) * 10} University Ave`,
          bloodType: randomFrom(bloodTypes),
          sex: teacherCount % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
          birthday: randomBirthday(30, 60),
          description: `Professor of ${spec.name} specializing in ${spec.subjects[subjectIndices[0]]}.`,
          subjects: { connect: connectedSubjectIds },
        },
      });

      teacherIds[spec.prefix].push(teacher.id);
      teacherCount++;

      // Publications
      const numPublications = Math.floor(Math.random() * 4) + 1;
      for (let p = 0; p < numPublications; p++) {
        await prisma.publication.create({
          data: {
            title: `${publicationTitles[p % publicationTitles.length]} in ${spec.subjects[subjectIndices[0]]}`,
            type: randomFrom(publicationTypes),
            year: 2015 + Math.floor(Math.random() * 10),
            url:
              Math.random() > 0.5
                ? `https://doi.org/10.1000/${teacherCount}${p}`
                : null,
            teacherId: teacher.id,
          },
        });
      }

      // Create lessons — each subject taught by this teacher to their assigned year groups
      let lessonHour = 8;
      for (const subjectIdx of subjectIndices) {
        const subjectId = subjectIds[spec.prefix][subjectIdx];
        const years = teacherYearMap[i];
        for (const yearIdx of years) {
          for (const classId of classIds[spec.prefix][yearIdx]) {
            const day = days[(teacherCount + yearIdx) % 5];
            const startTime = new Date();
            startTime.setHours((lessonHour % 10) + 8, 0, 0, 0);
            const endTime = new Date();
            endTime.setHours((lessonHour % 10) + 10, 0, 0, 0);
            lessonHour++;

            await prisma.lesson.create({
              data: {
                name: `${spec.subjects[subjectIdx]} - Lecture`,
                day,
                startTime,
                endTime,
                subjectId,
                classId,
                teacherId: teacher.id,
              },
            });
          }
        }
      }
    }
  }

  console.log('Creating parents and students...');
  let studentCount = 0;
  let parentCount = 0;

  for (const spec of specializations) {
    for (let yearIdx = 0; yearIdx < 4; yearIdx++) {
      for (const classId of classIds[spec.prefix][yearIdx]) {
        for (let s = 0; s < 25; s++) {
          studentCount++;
          parentCount++;

          const parentId = `parent_${parentCount}`;
          const pFirstIdx = (parentCount * 3) % studentFirstNames.length;
          const pLastIdx = (parentCount * 7) % studentLastNames.length;
          const pFirst = studentFirstNames[pFirstIdx];
          const pLast = studentLastNames[pLastIdx];

          await prisma.parent.create({
            data: {
              id: parentId,
              username: `parent_${parentCount}`,
              name: pFirst,
              surname: pLast,
              email: `parent.${parentCount}@academos.com`,
              phone: `+1-444-${String(parentCount).padStart(7, '0')}`,
              address: `${parentCount * 5} Parent Street`,
            },
          });

          const sFirstIdx = (studentCount * 5) % studentFirstNames.length;
          const sLastIdx = (studentCount * 11) % studentLastNames.length;
          const sFirst = studentFirstNames[sFirstIdx];
          const sLast = studentLastNames[sLastIdx];

          await prisma.student.create({
            data: {
              id: `student_${studentCount}`,
              username: `${sFirst.toLowerCase()}.${sLast.toLowerCase()}.${studentCount}`,
              name: sFirst,
              surname: sLast,
              email: `${sFirst.toLowerCase()}.${sLast.toLowerCase()}.${studentCount}@academos.com`,
              phone: `+1-333-${String(studentCount).padStart(7, '0')}`,
              address: `${studentCount * 3} Student Ave`,
              bloodType: randomFrom(bloodTypes),
              sex: studentCount % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
              birthday: randomBirthday(18 + yearIdx, 24 + yearIdx),
              gradeId: gradeIds[yearIdx],
              classId: classId,
              parentId: parentId,
            },
          });
        }
      }
    }
  }

  console.log('Creating exams and assignments...');
  const lessons = await prisma.lesson.findMany({ take: 60 });
  for (let i = 0; i < lessons.length; i++) {
    const startTime = new Date();
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date();
    endTime.setHours(12, 0, 0, 0);
    await prisma.exam.create({
      data: {
        title: `Midterm Exam - ${i + 1}`,
        startTime,
        endTime,
        lessonId: lessons[i].id,
      },
    });
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    await prisma.assignment.create({
      data: {
        title: `Research Assignment ${i + 1}`,
        startDate: new Date(),
        dueDate,
        lessonId: lessons[i].id,
      },
    });
  }

  console.log('Creating events...');
  const eventData = [
    {
      title: 'University Open Day',
      description:
        'Join us for our annual Open Day! Prospective students and their families are welcome to explore our campuses, meet faculty members, attend presentations about our programs, and experience student life firsthand. Representatives from all six faculties will be available to answer questions.',
      img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=80',
    },
    {
      title: 'Research Conference 2026',
      description:
        'The International Research Conference 2026 brings together leading academics, researchers, and industry professionals from around the world. This years theme is Innovation and Technology in the 21st Century. Keynote speakers, panel discussions, and poster sessions will be featured throughout the day.',
      img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    },
    {
      title: 'Sports Championship',
      description:
        'The annual Inter-Faculty Sports Championship is back! Compete in football, basketball, volleyball, tennis, and athletics. All students are encouraged to participate or cheer for their faculty team. Prizes and trophies will be awarded to the top performers in each category.',
      img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80',
    },
    {
      title: 'Career Fair 2026',
      description:
        'Connect with over 50 top employers at our annual Career Fair. Bring your CV and be ready to discuss internship and full-time opportunities. Companies from technology, finance, healthcare, education, and engineering sectors will be present. Professional attire is recommended.',
      img: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&q=80',
    },
    {
      title: 'Graduation Ceremony',
      description:
        'We are proud to celebrate the achievements of our graduating class of 2026. The ceremony will be held in the universitys main auditorium. Graduates are requested to arrive 30 minutes early for robe collection. Family members and friends are warmly welcomed to attend this special occasion.',
      img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80',
    },
  ];
  for (let i = 0; i < eventData.length; i++) {
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + (i + 1) * 7);
    startTime.setHours(10, 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(16, 0, 0, 0);
    await prisma.event.create({
      data: {
        title: eventData[i].title,
        description: eventData[i].description,
        img: eventData[i].img,
        startTime,
        endTime,
      },
    });
  }

  console.log('Creating announcements...');
  const announcementData = [
    {
      title: 'Exam Schedule Published',
      description:
        'The final exam schedule for all faculties has been published on the university portal. Students are advised to check their personal schedules and plan accordingly. Any conflicts should be reported to the academic office no later than one week before the exam period begins.',
      img: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=1200&q=80',
    },
    {
      title: 'Library Extended Hours',
      description:
        'The university library will be open until midnight during the exam period starting next week. Additional study rooms have been reserved and can be booked online. Silent study zones will be strictly enforced. Librarians will be available for research assistance until 10 PM.',
      img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80',
    },
    {
      title: 'Scholarship Applications Open',
      description:
        'Applications for merit-based scholarships for the academic year 2026-2027 are now open. Eligible students must have a GPA of 3.5 or above and demonstrate financial need. Applications must be submitted through the student portal along with supporting documents. Deadline is end of this month.',
      img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80',
    },
    {
      title: 'Campus Maintenance Notice',
      description:
        'Scheduled maintenance work will affect Building C this Saturday from 8 AM to 6 PM. All classes scheduled in Building C have been relocated. Please check your updated timetable on the student portal. The cafeteria and library will remain open. We apologize for any inconvenience.',
      img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
    },
    {
      title: 'New Course Registrations',
      description:
        'Course registration for the next semester opens next Monday at 9:00 AM. Students are advised to review the available courses on the portal in advance. Priority registration will be given to final-year students. Please ensure all outstanding fees are settled before registration opens.',
      img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&q=80',
    },
  ];
  for (const ann of announcementData) {
    await prisma.announcement.create({
      data: {
        title: ann.title,
        description: ann.description,
        img: ann.img,
        date: new Date(),
      },
    });
  }

  console.log(
    `✅ Done! ${studentCount} students, 60 teachers, lessons linked correctly.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
