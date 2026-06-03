'use server';

import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from './formValidationsSchemas';
import prisma from './prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';

type CurrentState = { success: boolean; error: boolean; message?: string };

// SUBJECT

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema,
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema,
) => {
  try {
    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get('id') as string;
  try {
    await prisma.subject.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

// CLASS

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema,
) => {
  try {
    await prisma.class.create({ data });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema,
) => {
  try {
    await prisma.class.update({ where: { id: data.id }, data });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get('id') as string;
  try {
    await prisma.class.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

// TEACHER

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema,
) => {
  try {
    const client = await clerkClient();
    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: 'teacher' },
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        img: data.img,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        description: data.description,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    const message =
      err?.errors?.[0]?.longMessage || err?.message || 'Something went wrong';
    return { success: false, error: true, message };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema,
) => {
  if (!data.id)
    return { success: false, error: true, message: 'ID is missing' };
  try {
    const client = await clerkClient();
    await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== '' && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: 'teacher' },
    });

    await prisma.teacher.update({
      where: { id: data.id },
      data: {
        ...(data.password !== '' && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        img: data.img,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        description: data.description,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    const message =
      err?.errors?.[0]?.longMessage || err?.message || 'Something went wrong';
    return { success: false, error: true, message };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get('id') as string;
  try {
    const client = await clerkClient();
    try {
      await client.users.deleteUser(id);
    } catch {}
    await prisma.teacher.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

// STUDENT

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema,
) => {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true, message: 'Class is full!' };
    }

    const client = await clerkClient();
    const user = await client.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: 'student' },
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        img: data.img,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
        description: data.description,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    const message =
      err?.errors?.[0]?.longMessage || err?.message || 'Something went wrong';
    return { success: false, error: true, message };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema,
) => {
  if (!data.id)
    return { success: false, error: true, message: 'ID is missing' };
  try {
    const client = await clerkClient();
    await client.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== '' && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: 'student' },
    });

    await prisma.student.update({
      where: { id: data.id },
      data: {
        ...(data.password !== '' && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email,
        phone: data.phone,
        address: data.address,
        img: data.img,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
        description: data.description,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    const message =
      err?.errors?.[0]?.longMessage || err?.message || 'Something went wrong';
    return { success: false, error: true, message };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get('id') as string;
  try {
    const client = await clerkClient();
    try {
      await client.users.deleteUser(id);
    } catch {}
    await prisma.student.delete({ where: { id } });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

// EXAM

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema,
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    if (role === 'teacher') {
      const teacherLesson = await prisma.lesson.findFirst({
        where: { teacherId: userId!, id: data.lessonId },
      });
      if (!teacherLesson)
        return {
          success: false,
          error: true,
          message: 'You are not authorized for this lesson',
        };
    }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema,
) => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    if (role === 'teacher') {
      const teacherLesson = await prisma.lesson.findFirst({
        where: { teacherId: userId!, id: data.lessonId },
      });
      if (!teacherLesson)
        return {
          success: false,
          error: true,
          message: 'You are not authorized for this lesson',
        };
    }

    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get('id') as string;
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        ...(role === 'teacher' ? { lesson: { teacherId: userId! } } : {}),
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

// LESSON

export const createLesson = async (currentState: CurrentState, data: any) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
        ...(data.fileUrl && { fileUrl: data.fileUrl }),
        ...(data.fileName && { fileName: data.fileName }),
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const updateLesson = async (currentState: CurrentState, data: any) => {
  try {
    await prisma.lesson.update({
      where: { id: data.id },
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get('id') as string;
  try {
    await prisma.lesson.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

// ASSIGNMENT

export const createAssignment = async (
  currentState: CurrentState,
  data: any,
) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: any,
) => {
  try {
    await prisma.assignment.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get('id') as string;
  try {
    await prisma.assignment.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

// RESULT

export const createResult = async (currentState: CurrentState, data: any) => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        studentId: data.studentId,
        ...(data.examId && { examId: data.examId }),
        ...(data.assignmentId && { assignmentId: data.assignmentId }),
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const updateResult = async (currentState: CurrentState, data: any) => {
  try {
    await prisma.result.update({
      where: { id: data.id },
      data: {
        score: data.score,
        studentId: data.studentId,
        ...(data.examId && { examId: data.examId }),
        ...(data.assignmentId && { assignmentId: data.assignmentId }),
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get('id') as string;
  try {
    await prisma.result.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

// ATTENDANCE

export const createAttendance = async (
  currentState: CurrentState,
  data: any,
) => {
  try {
    await prisma.attendance.create({
      data: {
        date: data.date,
        present: data.present === 'true' || data.present === true,
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: any,
) => {
  try {
    await prisma.attendance.update({
      where: { id: data.id },
      data: {
        date: data.date,
        present: data.present === 'true' || data.present === true,
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get('id') as string;
  try {
    await prisma.attendance.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

// EVENT

export const createEvent = async (currentState: CurrentState, data: any) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.classId && { classId: data.classId }),
        img: data.img || null,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const updateEvent = async (currentState: CurrentState, data: any) => {
  try {
    await prisma.event.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.classId && { classId: data.classId }),
        img: data.img || null,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get('id') as string;
  try {
    await prisma.event.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

// ANNOUNCEMENT

export const createAnnouncement = async (
  currentState: CurrentState,
  data: any,
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        ...(data.classId && { classId: data.classId }),
        img: data.img || null,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: any,
) => {
  try {
    await prisma.announcement.update({
      where: { id: data.id },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        ...(data.classId && { classId: data.classId }),
        img: data.img || null,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get('id') as string;
  try {
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

// PARENT

// export const createParent = async (currentState: CurrentState, data: any) => {
//   try {
//     const client = await clerkClient();
//     const user = await client.users.createUser({
//       username: data.username,
//       password: data.password,
//       firstName: data.name,
//       lastName: data.surname,
//       publicMetadata: { role: 'parent' },
//     });

//     await prisma.parent.create({
//       data: {
//         id: user.id,
//         username: data.username,
//         name: data.name,
//         surname: data.surname,
//         email: data.email,
//         phone: data.phone,
//         address: data.address,
//       },
//     });
//     return { success: true, error: false };
//   } catch (err: any) {
//     console.log(err);
//     const message =
//       err?.errors?.[0]?.longMessage || err?.message || 'Something went wrong';
//     return { success: false, error: true, message };
//   }
// };

// export const updateParent = async (currentState: CurrentState, data: any) => {
//   if (!data.id)
//     return { success: false, error: true, message: 'ID is missing' };
//   try {
//     const client = await clerkClient();
//     await client.users.updateUser(data.id, {
//       username: data.username,
//       ...(data.password !== '' && { password: data.password }),
//       firstName: data.name,
//       lastName: data.surname,
//       publicMetadata: { role: 'parent' },
//     });

//     await prisma.parent.update({
//       where: { id: data.id },
//       data: {
//         username: data.username,
//         name: data.name,
//         surname: data.surname,
//         email: data.email,
//         phone: data.phone,
//         address: data.address,
//       },
//     });
//     return { success: true, error: false };
//   } catch (err: any) {
//     console.log(err);
//     const message =
//       err?.errors?.[0]?.longMessage || err?.message || 'Something went wrong';
//     return { success: false, error: true, message };
//   }
// };

// export const deleteParent = async (
//   currentState: CurrentState,
//   data: FormData,
// ) => {
//   const id = data.get('id') as string;
//   try {
//     const client = await clerkClient();
//     try {
//       await client.users.deleteUser(id);
//     } catch {}
//     await prisma.parent.delete({ where: { id } });
//     return { success: true, error: false };
//   } catch (err: any) {
//     console.log(err);
//     return {
//       success: false,
//       error: true,
//       message: err?.message || 'Something went wrong',
//     };
//   }
// };

// PUBLICATION

export const createPublication = async (
  currentState: CurrentState,
  data: any,
) => {
  try {
    await prisma.publication.create({
      data: {
        title: data.title,
        type: data.type,
        year: parseInt(data.year),
        url: data.url || null,
        teacherId: data.teacherId,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const updatePublication = async (
  currentState: CurrentState,
  data: any,
) => {
  try {
    await prisma.publication.update({
      where: { id: data.id },
      data: {
        title: data.title,
        type: data.type,
        year: parseInt(data.year),
        url: data.url || null,
      },
    });
    return { success: true, error: false };
  } catch (err: any) {
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};

export const deletePublication = async (
  currentState: CurrentState,
  data: FormData,
) => {
  const id = data.get('id') as string;
  try {
    await prisma.publication.delete({ where: { id: parseInt(id) } });
    return { success: true, error: false };
  } catch (err: any) {
    return {
      success: false,
      error: true,
      message: err?.message || 'Something went wrong',
    };
  }
};
