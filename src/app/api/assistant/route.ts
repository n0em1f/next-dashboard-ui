import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (sessionClaims?.metadata as { role?: string })?.role || '';
  const { messages } = await req.json();
  const now = new Date();

  let contextData = '';
  let systemPrompt = '';

  // ===================== STUDENT =====================
  if (role === 'student') {
    const student = await prisma.student.findUnique({
      where: { id: userId },
      include: {
        class: { select: { name: true } },
        grade: { select: { level: true } },
      },
    });

    const lessons = await prisma.lesson.findMany({
      where: { classId: student?.classId },
      include: {
        subject: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
      },
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });

    const results = await prisma.result.findMany({
      where: { studentId: userId },
      include: {
        exam: {
          include: {
            lesson: { select: { subject: { select: { name: true } } } },
          },
        },
        assignment: {
          include: {
            lesson: { select: { subject: { select: { name: true } } } },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    const attendance = await prisma.attendance.findMany({
      where: { studentId: userId },
      include: { lesson: { select: { subject: { select: { name: true } } } } },
    });

    const exams = await prisma.exam.findMany({
      where: {
        startTime: { gte: now },
        lesson: { class: { students: { some: { id: userId } } } },
      },
      orderBy: { startTime: 'asc' },
      take: 10,
      include: { lesson: { select: { subject: { select: { name: true } } } } },
    });

    const assignments = await prisma.assignment.findMany({
      where: {
        dueDate: { gte: now },
        lesson: { class: { students: { some: { id: userId } } } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
      include: { lesson: { select: { subject: { select: { name: true } } } } },
    });

    const subjectStats: {
      [key: string]: { scores: number[]; present: number; total: number };
    } = {};
    results.forEach((r) => {
      const subject =
        r.exam?.lesson?.subject?.name ||
        r.assignment?.lesson?.subject?.name ||
        'Unknown';
      if (!subjectStats[subject])
        subjectStats[subject] = { scores: [], present: 0, total: 0 };
      subjectStats[subject].scores.push(r.score);
    });
    attendance.forEach((a) => {
      const subject = a.lesson?.subject?.name || 'Unknown';
      if (!subjectStats[subject])
        subjectStats[subject] = { scores: [], present: 0, total: 0 };
      subjectStats[subject].total++;
      if (a.present) subjectStats[subject].present++;
    });

    const totalPresent = attendance.filter((a) => a.present).length;
    const totalAttendance = attendance.length;

    contextData = `
STUDENT INFO:
- Name: ${student?.name} ${student?.surname}
- Class: ${student?.class?.name}
- Grade: ${student?.grade?.level}

SCHEDULE:
${lessons.map((l) => `- ${l.day}: ${l.subject.name} with ${l.teacher.name} ${l.teacher.surname} (${l.startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}-${l.endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })})`).join('\n') || 'No lessons'}

UPCOMING EXAMS:
${exams.map((e) => `- ${e.lesson.subject.name}: "${e.title}" on ${e.startTime.toLocaleDateString('en-GB')} at ${e.startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`).join('\n') || 'No upcoming exams'}

UPCOMING ASSIGNMENTS:
${assignments.map((a) => `- ${a.lesson.subject.name}: "${a.title}" due ${a.dueDate.toLocaleDateString('en-GB')}`).join('\n') || 'No upcoming assignments'}

ACADEMIC PERFORMANCE PER SUBJECT:
${
  Object.entries(subjectStats)
    .map(([subject, stats]) => {
      const avg =
        stats.scores.length > 0
          ? Math.round(
              stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length,
            )
          : null;
      const attendancePct =
        stats.total > 0
          ? Math.round((stats.present / stats.total) * 100)
          : null;
      return `- ${subject}: avg score ${avg !== null ? avg : 'N/A'}, attendance ${attendancePct !== null ? attendancePct + '%' : 'N/A'}`;
    })
    .join('\n') || 'No data'
}

OVERALL ATTENDANCE: ${totalPresent}/${totalAttendance} (${totalAttendance > 0 ? Math.round((totalPresent / totalAttendance) * 100) : 0}%)

ALL RESULTS:
${
  results
    .map((r) => {
      const subject =
        r.exam?.lesson?.subject?.name ||
        r.assignment?.lesson?.subject?.name ||
        'Unknown';
      const title = (r.exam || r.assignment)?.title || '-';
      return `- ${subject} - "${title}": ${r.score} points`;
    })
    .join('\n') || 'No results yet'
}`;

    systemPrompt = `You are an expert Academic Advisor AI for Academos school platform. You help students improve their academic performance.

${contextData}

Today: ${now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

YOUR CAPABILITIES FOR STUDENTS:
1. Academic analysis — analyze grades, identify weak subjects, suggest improvements
2. Study planning — create personalized study plans based on upcoming exams/assignments
3. Concept explanations — explain difficult academic concepts in simple terms
4. Quiz generation — generate practice questions (multiple choice with 4 options, mark correct answer)
5. Writing help — help with essays, reports, academic writing structure
6. Schedule advice — help manage time between subjects
7. Study tips — Pomodoro, spaced repetition, active recall techniques
8. Exam preparation — create revision plans and predict likely topics

GUIDELINES:
- Be encouraging and supportive, never discouraging
- Give specific actionable advice based on their actual data
- Respond in the same language the student uses`;
  }

  // ===================== TEACHER =====================
  else if (role === 'teacher') {
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId },
      include: {
        subjects: { select: { name: true } },
        classes: { select: { name: true } },
      },
    });

    const myLessons = await prisma.lesson.findMany({
      where: { teacherId: userId },
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true, id: true } },
      },
    });

    const classIds = Array.from(new Set(myLessons.map((l) => l.classId)));
    const studentStats = await prisma.student.findMany({
      where: { classId: { in: classIds } },
      include: {
        results: {
          include: {
            exam: { include: { lesson: { select: { teacherId: true } } } },
            assignment: {
              include: { lesson: { select: { teacherId: true } } },
            },
          },
        },
        attendance: {
          where: { lesson: { teacherId: userId } },
          select: { present: true },
        },
        class: { select: { name: true } },
      },
    });

    const upcomingExams = await prisma.exam.findMany({
      where: { lesson: { teacherId: userId }, startTime: { gte: now } },
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            class: { select: { name: true } },
          },
        },
      },
      orderBy: { startTime: 'asc' },
      take: 10,
    });

    contextData = `
TEACHER INFO:
- Name: ${teacher?.name} ${teacher?.surname}
- Subjects: ${teacher?.subjects.map((s) => s.name).join(', ')}
- Classes: ${teacher?.classes.map((c) => c.name).join(', ')}

SCHEDULE:
${myLessons.map((l) => `- ${l.day}: ${l.subject.name} for ${l.class.name} (${l.startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}-${l.endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })})`).join('\n')}

UPCOMING EXAMS:
${upcomingExams.map((e) => `- ${e.lesson.subject.name} (${e.lesson.class.name}): "${e.title}" on ${e.startTime.toLocaleDateString('en-GB')}`).join('\n') || 'None'}

STUDENT PERFORMANCE:
${
  studentStats
    .map((s) => {
      const myResults = s.results.filter(
        (r) =>
          r.exam?.lesson?.teacherId === userId ||
          r.assignment?.lesson?.teacherId === userId,
      );
      const scores = myResults.map((r) => r.score);
      const avg =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null;
      const present = s.attendance.filter((a) => a.present).length;
      const total = s.attendance.length;
      const pct = total > 0 ? Math.round((present / total) * 100) : null;
      return `- ${s.name} ${s.surname} (${s.class.name}): avg ${avg !== null ? avg : 'N/A'} pts, attendance ${pct !== null ? pct + '%' : 'N/A'}`;
    })
    .join('\n') || 'No data'
}`;

    systemPrompt = `You are an expert Academic Advisor AI for Academos school platform. You assist teachers.

${contextData}

Today: ${now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

YOUR CAPABILITIES FOR TEACHERS:
1. Exercise & exam generation — generate exercises and exam questions with answer keys
2. Rubric creation — create detailed grading rubrics with point breakdowns
3. Student progress analysis — identify struggling students, class averages
4. Lesson planning — suggest lesson structures and teaching activities
5. Feedback templates — generate constructive feedback for common mistakes
6. Assessment design — help design balanced, fair assessments
7. Frequent questions — predict what students might ask about a topic

GUIDELINES:
- Be professional and colleague-like
- Always include answer keys when generating exercises
- Highlight students who may need extra attention
- Respond in the same language the teacher uses`;
  }

  // ===================== ADMIN =====================
  else if (role === 'admin') {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      recentResults,
      attendanceStats,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.result.findMany({
        select: { score: true },
        take: 100,
        orderBy: { id: 'desc' },
      }),
      prisma.attendance.groupBy({ by: ['present'], _count: true }),
    ]);

    const avgScore =
      recentResults.length > 0
        ? Math.round(
            recentResults.reduce((a, b) => a + b.score, 0) /
              recentResults.length,
          )
        : 0;
    const presentCount = attendanceStats.find((a) => a.present)?._count || 0;
    const _absentCount = attendanceStats.find((a) => !a.present)?._count || 0;
    const totalAttendance = presentCount + _absentCount;

    const classStats = await prisma.class.findMany({
      include: {
        _count: { select: { students: true } },
        supervisor: { select: { name: true, surname: true } },
      },
      orderBy: { name: 'asc' },
    });

    contextData = `
SCHOOL OVERVIEW:
- Total students: ${totalStudents}
- Total teachers: ${totalTeachers}
- Total classes: ${totalClasses}
- Average score: ${avgScore} points
- Overall attendance: ${presentCount}/${totalAttendance} (${totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0}%)

CLASSES:
${classStats.map((c) => `- ${c.name}: ${c._count.students} students, supervisor: ${c.supervisor?.name} ${c.supervisor?.surname}`).join('\n')}`;

    systemPrompt = `You are an expert Academic Advisor AI for Academos school platform. You assist administrators.

${contextData}

Today: ${now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

YOUR CAPABILITIES FOR ADMINS:
1. School performance reports — analyze overall academic performance and trends
2. Attendance insights — identify patterns and classes with issues
3. Teacher workload analysis — help balance teaching loads
4. Policy recommendations — suggest academic policies based on data
5. Communication drafting — help draft announcements and letters to parents
6. Goal setting — help set measurable academic goals

GUIDELINES: Be professional, data-driven, respond in the same language the admin uses.`;
  }

  // ===================== PARENT =====================
  else if (role === 'parent') {
    const children = await prisma.student.findMany({
      where: { parentId: userId },
      include: {
        class: { select: { name: true } },
        grade: { select: { level: true } },
        results: {
          include: {
            exam: {
              include: {
                lesson: { select: { subject: { select: { name: true } } } },
              },
            },
            assignment: {
              include: {
                lesson: { select: { subject: { select: { name: true } } } },
              },
            },
          },
          orderBy: { id: 'desc' },
          take: 20,
        },
        attendance: { select: { present: true } },
      },
    });

    contextData = `
CHILDREN:
${children
  .map((c) => {
    const scores = c.results.map((r) => r.score);
    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;
    const present = c.attendance.filter((a) => a.present).length;
    const total = c.attendance.length;
    const pct = total > 0 ? Math.round((present / total) * 100) : null;
    const results = c.results
      .map((r) => {
        const subject =
          r.exam?.lesson?.subject?.name ||
          r.assignment?.lesson?.subject?.name ||
          'Unknown';
        return `  • ${subject}: ${r.score} pts`;
      })
      .join('\n');
    return `- ${c.name} ${c.surname} (Class ${c.class?.name}, Grade ${c.grade?.level}):
  Average: ${avg !== null ? avg : 'N/A'} pts, Attendance: ${pct !== null ? pct + '%' : 'N/A'}
  Results:\n${results || '  None yet'}`;
  })
  .join('\n\n')}`;

    systemPrompt = `You are an expert Academic Advisor AI for Academos. You help parents support their children.

${contextData}

Today: ${now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

YOUR CAPABILITIES FOR PARENTS:
1. Progress monitoring — explain grades and attendance in simple terms
2. Support strategies — suggest how to help at home
3. Concern identification — flag subjects needing extra help
4. Study environment tips — advice on good study conditions at home
5. Motivation strategies — age-appropriate ways to motivate children
6. Communication tips — how to talk to teachers about their child's progress

GUIDELINES: Be warm, supportive, explain academic terms simply, respond in the same language the parent uses.`;
  }

  // Convert messages for Gemini format
  // Gemini uses 'user' and 'model' instead of 'user' and 'assistant'
  const geminiMessages = messages.map(
    (m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }),
  );

  // Call Google Gemini API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiMessages,
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.7,
        },
      }),
    },
  );

  const data = await response.json();
  console.log('Gemini response:', JSON.stringify(data));
  const content =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    'Sorry, I could not get a response.';
  return NextResponse.json({ content });
}
