'use server';

import prisma from './prisma';

// Student check-in — doar in primele 15 minute ale lectiei
export const checkInAttendance = async ({
  studentId,
  lessonId,
}: {
  studentId: string;
  lessonId: number;
}) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return { success: false, message: 'Lesson not found.' };
    }

    const now = new Date();
    const today = new Date();

    // Seteaza ora lectiei pe data de azi
    const lessonStart = new Date(lesson.startTime);
    lessonStart.setFullYear(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const deadline = new Date(lessonStart.getTime() + 15 * 60 * 1000);

    if (now < lessonStart) {
      return { success: false, message: 'Lesson has not started yet.' };
    }

    if (now > deadline) {
      return {
        success: false,
        message: 'Check-in window has closed (15 minutes after lesson start).',
      };
    }

    // Verifica daca a mai facut check-in azi
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    const existing = await prisma.attendance.findFirst({
      where: {
        studentId,
        lessonId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existing) {
      return {
        success: false,
        message: 'You have already checked in for this lesson.',
      };
    }

    await prisma.attendance.create({
      data: {
        studentId,
        lessonId,
        present: true,
        date: now,
      },
    });

    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false, message: 'Something went wrong.' };
  }
};

// Profesor/Admin marcheaza prezenta manual
export const markStudentAttendance = async ({
  studentId,
  lessonId,
  present,
}: {
  studentId: string;
  lessonId: number;
  present: boolean;
}) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    const existing = await prisma.attendance.findFirst({
      where: {
        studentId,
        lessonId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (existing) {
      await prisma.attendance.update({
        where: { id: existing.id },
        data: { present },
      });
    } else {
      await prisma.attendance.create({
        data: {
          studentId,
          lessonId,
          present,
          date: new Date(),
        },
      });
    }

    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false, message: 'Something went wrong.' };
  }
};
